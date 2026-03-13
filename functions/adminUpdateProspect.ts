import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { adminToken, prospectId, data } = body;

    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const tokenHash = await sha256(adminToken || '');

    if (tokenHash !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prospect = await base44.asServiceRole.entities.Prospect.update(prospectId, data);

    return Response.json({ success: true, prospect });
  } catch (error) {
    console.error('Error updating prospect:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});