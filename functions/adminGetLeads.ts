import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { adminToken } = body;

    const storedHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    if (!storedHash || adminToken !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 200);
    return Response.json({ success: true, leads });
  } catch (error) {
    console.error('Error in adminGetLeads:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});