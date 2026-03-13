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
    const { adminToken } = body;

    if (!adminToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expectedHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    
    if (adminToken !== expectedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [received, sent] = await Promise.all([
      base44.asServiceRole.entities.ReceivedFax.list("-received_at", 100),
      base44.asServiceRole.entities.SentFax.list("-sent_at", 100),
    ]);

    return Response.json({ received, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});