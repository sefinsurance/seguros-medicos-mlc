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

    const limit = 50;
    const offset = body.offset || 0;
    const { search, statusFilter } = body;
    
    // Build filter query for status
    let filter = {};
    if (statusFilter && statusFilter !== 'all') {
      filter.status = statusFilter;
    }
    
    let subscribers = await base44.asServiceRole.entities.SmsSubscriber.list("-created_date", limit, offset);
    
    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      subscribers = subscribers.filter(s => s.status === statusFilter);
    }
    
    // Apply search filter for phone
    if (search) {
      subscribers = subscribers.filter(s => s.phone.includes(search));
    }

    return Response.json({ subscribers, hasMore: subscribers.length === limit });
  } catch (error) {
    console.error('adminGetSmsSubscribers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});