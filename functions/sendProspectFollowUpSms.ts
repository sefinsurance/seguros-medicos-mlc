import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TELNYX_API_URL = 'https://api.telnyx.com/v2/messages';
const TELNYX_FROM_NUMBER = '+18774584546';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all prospects with follow-up dates set for today that haven't been sent yet
    const today = new Date().toISOString().split('T')[0];
    const allProspects = await base44.asServiceRole.entities.Prospect.list();
    
    const dueProspects = allProspects.filter(p => 
      p.follow_up_date === today && 
      !p.follow_up_sms_sent &&
      (p.tag === 'Follow-up' || p.tag === 'Future X-Date') &&
      p.phone
    );

    if (dueProspects.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No follow-ups due today' });
    }

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not set');
    }

    let sentCount = 0;

    for (const prospect of dueProspects) {
      const message = `Hi ${prospect.full_name || 'there'}! This is a follow-up from MLC Insurance. We wanted to check in with you. Please reply or call us back when you get a chance. Thank you!`;

      try {
        const res = await fetch(TELNYX_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telnyxApiKey}`,
          },
          body: JSON.stringify({
            from: TELNYX_FROM_NUMBER,
            to: prospect.phone,
            text: message,
          }),
        });

        if (res.ok) {
          await base44.asServiceRole.entities.Prospect.update(prospect.id, {
            follow_up_sms_sent: true,
          });
          sentCount++;
        } else {
          console.error('Failed to send SMS to', prospect.phone, await res.text());
        }
      } catch (error) {
        console.error('Error sending SMS to', prospect.phone, error);
      }
    }

    return Response.json({ success: true, sent: sentCount, total: dueProspects.length });
  } catch (error) {
    console.error('Error sending prospect follow-up SMS:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});