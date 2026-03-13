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
    const { adminToken, action, subscriberId, data } = body;

    if (!adminToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expectedHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    
    if (adminToken !== expectedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'create') {
      const subscriber = await base44.asServiceRole.entities.SmsSubscriber.create(data);
      return Response.json({ subscriber });
    } else if (action === 'update' && subscriberId) {
      const subscriber = await base44.asServiceRole.entities.SmsSubscriber.update(subscriberId, data);
      return Response.json({ subscriber });
    } else if (action === 'delete' && subscriberId) {
      await base44.asServiceRole.entities.SmsSubscriber.delete(subscriberId);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});