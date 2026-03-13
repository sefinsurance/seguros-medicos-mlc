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
    const { adminToken, action, data, tagId } = body;

    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const tokenHash = await sha256(adminToken || '');

    if (tokenHash !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'create') {
      const tag = await base44.asServiceRole.entities.SmsTag.create(data);
      return Response.json({ success: true, tag });
    }

    if (action === 'update') {
      const tag = await base44.asServiceRole.entities.SmsTag.update(tagId, data);
      return Response.json({ success: true, tag });
    }

    if (action === 'delete') {
      await base44.asServiceRole.entities.SmsTag.delete(tagId);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing SMS tag:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});