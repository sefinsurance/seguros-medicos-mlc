import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { adminToken, campaignId } = await req.json();

    // Verify admin token
    const expectedHash = await sha256(Deno.env.get('ADMIN_PASSWORD_HASH') || '');
    const providedHash = await sha256(adminToken || '');
    
    if (providedHash !== expectedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!campaignId) {
      return Response.json({ error: 'campaignId required' }, { status: 400 });
    }

    // Get logs for this campaign, sorted by most recent first
    const logs = await base44.asServiceRole.entities.SmsLog.filter(
      { campaign_id: campaignId },
      '-created_date',
      1000
    );

    return Response.json({ logs });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});