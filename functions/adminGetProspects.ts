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
    const { adminToken, search, tagFilter, offset = 0 } = body;

    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const tokenHash = await sha256(adminToken || '');

    if (tokenHash !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build filter query
    const filterQuery = {};
    if (tagFilter && tagFilter !== 'all') {
      filterQuery.tag = tagFilter;
    }

    // Fetch all prospects (filtered by tag if needed), then search on backend
    const prospects = await base44.asServiceRole.entities.Prospect.filter(
      filterQuery,
      '-created_date',
      1000
    );

    // Filter by search term (phone, name, email)
    let filtered = prospects;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = prospects.filter(p =>
        (p.full_name && p.full_name.toLowerCase().includes(searchLower)) ||
        (p.phone && p.phone.includes(search)) ||
        (p.email && p.email.toLowerCase().includes(searchLower))
      );
    }

    // Paginate
    const limit = 50;
    const paginatedResults = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < filtered.length;

    return Response.json({
      prospects: paginatedResults,
      offset,
      hasMore,
      total: filtered.length,
      allProspects: filtered
    });
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});