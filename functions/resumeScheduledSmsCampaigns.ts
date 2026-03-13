import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function getEasternTime() {
  const now = new Date();
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false, weekday: 'short' });
  const parts = etString.split(', ');
  const dayOfWeek = parts[0];
  const hour = parseInt(parts[1], 10);
  return { hour, dayOfWeek, isWeekend: dayOfWeek === 'Sat' || dayOfWeek === 'Sun' };
}

function isWithinSendWindow() {
  const { hour, isWeekend } = getEasternTime();
  if (isWeekend) return false;
  return hour >= 9 && hour < 17;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only run during business hours
    if (!isWithinSendWindow()) {
      return Response.json({ success: true, message: 'Outside business hours' });
    }

    // Find all scheduled campaigns (paused due to daily limit or time window)
    const campaigns = await base44.asServiceRole.entities.SmsCampaign.filter({ status: 'scheduled' });

    let resumed = 0;
    for (const campaign of campaigns) {
      // Check if campaign has remaining recipients
      if (campaign.last_sent_index < campaign.recipient_count) {
        // Resume campaign
        await base44.asServiceRole.functions.invoke('sendSmsCampaign', {
          campaign_id: campaign.id,
          resume: true,
        });
        resumed++;
      }
    }

    return Response.json({ success: true, resumed });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});