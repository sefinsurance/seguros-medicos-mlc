import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const WEBHOOK_URL = 'https://sms.obamacarelocal.com/mlcweb/webhook';
const RATE_LIMIT_MS = 4000; // 4 second delay between each SMS

// Allowed sending window: 8 AM – 6 PM Eastern Time
const SEND_START_HOUR_ET = 8;
const SEND_END_HOUR_ET = 18;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEasternHour() {
  const now = new Date();
  // Eastern Time offset: UTC-5 (EST) or UTC-4 (EDT)
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false });
  return parseInt(etString, 10);
}

function isWithinSendWindow() {
  const hour = getEasternHour();
  return hour >= SEND_START_HOUR_ET && hour < SEND_END_HOUR_ET;
}

function buildMessage(template, recipient) {
  let msg = template.replace(/\{@name\}/g, recipient.name || 'there');
  if (recipient.birthday) {
    const parts = recipient.birthday.split('/');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthName = parts[0] ? (months[parseInt(parts[0]) - 1] || parts[0]) : '';
    const day = parts[1] || '';
    msg = msg.replace(/\{@birthday\}/g, monthName && day ? `${monthName} ${day}` : recipient.birthday);
  }
  return msg;
}

async function sendSms(recipient, message, attachmentUrl) {
  const payload = {
    name: recipient.name || '',
    phone: recipient.phone || '',
    note: message,
    source: 'SMS Campaign',
  };
  if (attachmentUrl) payload.media_url = attachmentUrl;
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

async function getRecipients(base44, campaign) {
  const audience = campaign.audience;

  if (audience === 'csv_upload') {
    return JSON.parse(campaign.csv_recipients || '[]');
  }

  if (audience === 'birthday_campaign') {
    const all = JSON.parse(campaign.csv_recipients || '[]');
    const today = new Date();
    const todayMM = String(today.getMonth() + 1).padStart(2, '0');
    const todayDD = String(today.getDate()).padStart(2, '0');
    return all.filter(r => {
      if (!r.birthday) return false;
      const parts = r.birthday.split('/');
      const mm = String(parseInt(parts[0] || '0')).padStart(2, '0');
      const dd = String(parseInt(parts[1] || '0')).padStart(2, '0');
      return mm === todayMM && dd === todayDD;
    });
  }

  if (audience === 'all_leads') {
    const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 500);
    return leads.filter(l => l.phone).map(l => ({ name: l.full_name || '', phone: l.phone }));
  }

  if (audience === 'all_subscribers') {
    const subs = await base44.asServiceRole.entities.SmsSubscriber.filter({ status: 'opted_in' });
    return subs.map(s => ({ name: '', phone: s.phone }));
  }

  if (audience === 'leads_by_product') {
    const leads = await base44.asServiceRole.entities.Lead.filter({ product_type: campaign.audience_filter });
    return leads.filter(l => l.phone).map(l => ({ name: l.full_name || '', phone: l.phone }));
  }

  if (audience === 'leads_by_status') {
    const leads = await base44.asServiceRole.entities.Lead.filter({ status: campaign.audience_filter });
    return leads.filter(l => l.phone).map(l => ({ name: l.full_name || '', phone: l.phone }));
  }

  return [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { campaign_id, override_hours } = body;

    if (!campaign_id) {
      return Response.json({ error: 'campaign_id required' }, { status: 400 });
    }

    // Enforce send window: 8 AM – 6 PM ET (unless overridden by admin)
    if (!override_hours && !isWithinSendWindow()) {
      return Response.json({
        error: 'Outside sending window',
        message: 'Campaigns can only be sent between 8:00 AM and 6:00 PM Eastern Time.',
        current_et_hour: getEasternHour(),
      }, { status: 403 });
    }

    // Load campaign
    const campaign = await base44.asServiceRole.entities.SmsCampaign.get(campaign_id);
    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'sending') {
      return Response.json({ error: 'Campaign already sending' }, { status: 409 });
    }

    // Mark as sending
    await base44.asServiceRole.entities.SmsCampaign.update(campaign_id, {
      status: 'sending',
      sent_count: 0,
    });

    const rawRecipients = await getRecipients(base44, campaign);

    // Filter out opted-out subscribers
    const optedOut = await base44.asServiceRole.entities.SmsSubscriber.filter({ status: 'opted_out' });
    const optedOutPhones = new Set(optedOut.map(s => s.phone.replace(/\D/g, '')));
    const recipients = rawRecipients.filter(r => {
      const clean = (r.phone || '').replace(/\D/g, '');
      return clean && !optedOutPhones.has(clean);
    });

    if (recipients.length === 0) {
      await base44.asServiceRole.entities.SmsCampaign.update(campaign_id, {
        status: 'sent',
        sent_count: 0,
        recipient_count: 0,
        sent_at: new Date().toISOString(),
      });
      return Response.json({ success: true, sent: 0, message: 'No eligible recipients (all opted out or empty)' });
    }

    // Update recipient count
    await base44.asServiceRole.entities.SmsCampaign.update(campaign_id, {
      recipient_count: recipients.length,
    });

    let sentCount = 0;
    for (const recipient of recipients) {
      const message = buildMessage(campaign.message_template, recipient);
      const ok = await sendSms(recipient, message, campaign.attachment_url);
      if (ok) sentCount++;

      // Update progress every 10 messages
      if (sentCount % 10 === 0) {
        await base44.asServiceRole.entities.SmsCampaign.update(campaign_id, { sent_count: sentCount });
      }

      await sleep(RATE_LIMIT_MS); // 10 per second
    }

    // Final update
    await base44.asServiceRole.entities.SmsCampaign.update(campaign_id, {
      status: 'sent',
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    });

    return Response.json({ success: true, sent: sentCount, total: recipients.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});