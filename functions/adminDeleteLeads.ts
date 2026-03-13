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
    const { adminToken, leadIds } = await req.json();

    // Verify admin token
    const expectedHash = await sha256(Deno.env.get('ADMIN_PASSWORD_HASH') || '');
    const providedHash = await sha256(adminToken || '');
    
    if (providedHash !== expectedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!leadIds || !Array.isArray(leadIds)) {
      return Response.json({ error: 'leadIds array required' }, { status: 400 });
    }

    // Delete leads using service role
    await Promise.all(leadIds.map(id => base44.asServiceRole.entities.Lead.delete(id)));

    return Response.json({ success: true, deleted: leadIds.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});