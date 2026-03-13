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
    const { adminToken } = body;

    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const tokenHash = await sha256(adminToken || '');

    if (tokenHash !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search, tagFilter, offset = 0 } = body;
    
    // Build filter query
    let filter = {};
    if (tagFilter && tagFilter !== 'all') {
      filter.tag = tagFilter;
    }
    
    // For phone search, we still need to load and filter on backend
    // But we fetch limited records based on pagination
    const limit = 50;
    let tags = await base44.asServiceRole.entities.SmsTag.list('-tagged_date', limit, offset);
    
    // Apply phone/notes search filter at backend
    if (search) {
      const searchLower = search.toLowerCase();
      tags = tags.filter(t => 
        t.phone.includes(search) || 
        (t.notes && t.notes.toLowerCase().includes(searchLower))
      );
    }

    return Response.json({ tags, hasMore: tags.length === limit });
  } catch (error) {
    console.error('Error fetching SMS tags:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});