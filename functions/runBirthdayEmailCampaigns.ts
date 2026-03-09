import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function buildSubject(template, recipient) {
  return template.replace(/\{@name\}/g, recipient.name || 'there');
}

function buildBody(template, recipient) {
  return template.replace(/\{@name\}/g, recipient.name || 'there');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all active birthday campaigns
    const allCampaigns = await base44.asServiceRole.entities.EmailCampaign.list('-created_date', 500);
    const birthdayCampaigns = allCampaigns.filter(c => c.campaign_type === 'birthday' && c.status !== 'archived');

    if (birthdayCampaigns.length === 0) {
      return Response.json({ success: true, ran: 0, message: 'No active birthday campaigns' });
    }

    const today = new Date();
    const todayMM = String(today.getMonth() + 1).padStart(2, '0');
    const todayDD = String(today.getDate()).padStart(2, '0');

    let totalSent = 0;

    for (const campaign of birthdayCampaigns) {
      try {
        const recipients = JSON.parse(campaign.csv_recipients || '[]');
        const birthdayRecipients = recipients.filter(r => {
          if (!r.birthday) return false;
          const parts = r.birthday.split('/');
          const mm = String(parseInt(parts[0] || '0')).padStart(2, '0');
          const dd = String(parseInt(parts[1] || '0')).padStart(2, '0');
          return mm === todayMM && dd === todayDD;
        });

        if (birthdayRecipients.length === 0) continue;

        // Mark as sending
        await base44.asServiceRole.entities.EmailCampaign.update(campaign.id, {
          status: 'sending',
          sent_count: 0,
        });

        let sentCount = 0;
        for (const recipient of birthdayRecipients) {
          try {
            const subject = buildSubject(campaign.subject, recipient);
            const body = buildBody(campaign.message_body, recipient);
            await base44.integrations.Core.SendEmail({
              to: recipient.email,
              subject: subject,
              body: body,
            });
            sentCount++;

            if (sentCount % 10 === 0) {
              await base44.asServiceRole.entities.EmailCampaign.update(campaign.id, { sent_count: sentCount });
            }
          } catch (err) {
            console.error(`Failed to send birthday email to ${recipient.email}:`, err.message);
          }
        }

        // Final update
        await base44.asServiceRole.entities.EmailCampaign.update(campaign.id, {
          status: 'sent',
          sent_count: sentCount,
          sent_at: new Date().toISOString(),
        });

        totalSent += sentCount;
      } catch (err) {
        console.error(`Error processing birthday campaign ${campaign.id}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      ran: birthdayCampaigns.length,
      totalSent,
      message: `Processed ${birthdayCampaigns.length} birthday campaign(s), sent ${totalSent} emails`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});