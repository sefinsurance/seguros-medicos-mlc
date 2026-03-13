import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { adminToken, applicationId, status } = body;

    if (!adminToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expectedHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    
    if (adminToken !== expectedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!applicationId || !status) {
      return Response.json({ error: 'Missing applicationId or status' }, { status: 400 });
    }

    // Admin authenticated - update broker application via service role
    const application = await base44.asServiceRole.entities.BrokerApplication.update(applicationId, { status });

    return Response.json({ application });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});