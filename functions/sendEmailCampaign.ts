import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function getEasternHour() {
  const now = new Date();
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false });
  return parseInt(etString, 10);
}

async function sendEmail(recipient, subject, body) {
  // Send email via Core integration
  const { base44 } = await import('@/api/base44Client');
  await base44.integrations.Core.SendEmail({
    to: recipient.email,
    subject: subject.replace(/\{@name\}/g, recipient.name || 'there'),
    body: body.replace(/\{@name\}/g, recipient.name || 'there'),
  });
  return true;
}

function buildSubject(template, recipient) {
  return template.replace(/\{@name\}/g, recipient.name || 'there');
}

function buildBody(template, recipient) {
  return template.replace(/\{@name\}/g, recipient.name || 'there');
}

async function getRecipients(base44, campaign) {
  const audience = campaign.campaign_type;

  if (audience === 'birthday') {
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

  // Regular campaign uses all recipients from CSV
  return JSON.parse(campaign.csv_recipients || '[]');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { campaign_id } = body;

    if (!campaign_id) {
      return Response.json({ error: 'campaign_id required' }, { status: 400 });
    }

    // Load campaign
    const campaign = await base44.asServiceRole.entities.EmailCampaign.get(campaign_id);
    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'sending') {
      return Response.json({ error: 'Campaign already sending' }, { status: 409 });
    }

    // Mark as sending
    await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
      status: 'sending',
      sent_count: 0,
    });

    const recipients = await getRecipients(base44, campaign);

    if (recipients.length === 0) {
      await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
        status: 'sent',
        sent_count: 0,
        recipient_count: 0,
        sent_at: new Date().toISOString(),
      });
      return Response.json({ success: true, sent: 0, message: 'No eligible recipients' });
    }

    // Update recipient count
    await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
      recipient_count: recipients.length,
    });

    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        const subject = buildSubject(campaign.subject, recipient);
        const emailBody = buildBody(campaign.message_body, recipient);
        // Use the Core integration directly via base44
        await base44.integrations.Core.SendEmail({
          to: recipient.email,
          subject: subject,
          body: emailBody,
        });
        sentCount++;

        // Update progress every 10 emails
        if (sentCount % 10 === 0) {
          await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, { sent_count: sentCount });
        }
      } catch (err) {
        console.error(`Failed to send to ${recipient.email}:`, err.message);
      }
    }

    // Final update
    await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
      status: 'sent',
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    });

    return Response.json({ success: true, sent: sentCount, total: recipients.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});