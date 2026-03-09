import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const WEBHOOK_URL = 'https://sms.obamacarelocal.com/mlcweb/webhook';
const RATE_LIMIT_MS = 4000; // 4 second delay between each SMS

const SEND_START_HOUR_ET = 8;
const SEND_END_HOUR_ET = 18;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEasternHour() {
  const now = new Date();
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

async function sendSms(recipient, message) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: recipient.name || '',
      phone: recipient.phone || '',
      note: message,
      source: 'Birthday Campaign',
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Enforce send window: 8 AM – 6 PM ET
    if (!isWithinSendWindow()) {
      return Response.json({
        skipped: true,
        reason: 'Outside sending window (8 AM – 6 PM ET)',
        current_et_hour: getEasternHour(),
      });
    }

    const campaigns = await base44.asServiceRole.entities.SmsCampaign.filter({ audience: 'birthday_campaign' });

    const today = new Date();
    const todayMM = String(today.getMonth() + 1).padStart(2, '0');
    const todayDD = String(today.getDate()).padStart(2, '0');

    // Load opted-out phones for filtering
    const optedOut = await base44.asServiceRole.entities.SmsSubscriber.filter({ status: 'opted_out' });
    const optedOutPhones = new Set(optedOut.map(s => s.phone.replace(/\D/g, '')));

    const results = [];

    for (const campaign of campaigns) {
      if (campaign.status === 'sending') {
        results.push({ id: campaign.id, name: campaign.name, skipped: 'already sending' });
        continue;
      }

      const allRecipients = JSON.parse(campaign.csv_recipients || '[]');

      // Filter today's birthdays and exclude opted-out
      const todaysBirthdays = allRecipients.filter(r => {
        if (!r.birthday) return false;
        const parts = r.birthday.split('/');
        const mm = String(parseInt(parts[0] || '0')).padStart(2, '0');
        const dd = String(parseInt(parts[1] || '0')).padStart(2, '0');
        if (mm !== todayMM || dd !== todayDD) return false;
        const cleanPhone = (r.phone || '').replace(/\D/g, '');
        return cleanPhone && !optedOutPhones.has(cleanPhone);
      });

      if (todaysBirthdays.length === 0) {
        results.push({ id: campaign.id, name: campaign.name, sent: 0, message: 'No birthdays today (or all opted out)' });
        continue;
      }

      await base44.asServiceRole.entities.SmsCampaign.update(campaign.id, {
        status: 'sending',
        sent_count: 0,
        recipient_count: todaysBirthdays.length,
      });

      let sentCount = 0;
      for (const recipient of todaysBirthdays) {
        const rawMessage = buildMessage(campaign.message_template, recipient);
        const message = rawMessage + '\n\nReply STOP to opt out.';
        const ok = await sendSms(recipient, message);
        if (ok) sentCount++;
        await sleep(RATE_LIMIT_MS);
      }

      await base44.asServiceRole.entities.SmsCampaign.update(campaign.id, {
        status: 'draft', // Reset to draft so it runs again tomorrow
        sent_count: sentCount,
        sent_at: new Date().toISOString(),
      });

      results.push({ id: campaign.id, name: campaign.name, sent: sentCount, total: todaysBirthdays.length });
    }

    return Response.json({ success: true, date: `${todayMM}/${todayDD}`, campaigns: results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});