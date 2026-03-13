import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { adminToken, filterDirection, filterStatus, filterEventType, search, dateFrom, dateTo, view } = body;

    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const tokenHash = await sha256(adminToken || '');

    if (tokenHash !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build filter query
    const filterQuery = {};
    if (filterDirection && filterDirection !== 'all') {
      filterQuery.direction = filterDirection;
    }
    if (filterStatus && filterStatus !== 'all') {
      filterQuery.status = filterStatus;
    }
    if (filterEventType && filterEventType !== 'all') {
      filterQuery.event_type = filterEventType;
    }

    // Fetch events
    const allEvents = await base44.asServiceRole.entities.FaxEvent.filter(filterQuery, '-created_date', 1000);

    // Apply date filters
    let filtered = allEvents;
    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime();
      filtered = filtered.filter(e => new Date(e.created_date).getTime() >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo).getTime();
      filtered = filtered.filter(e => new Date(e.created_date).getTime() <= toDate);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(e =>
        (e.fax_id && e.fax_id.includes(search)) ||
        (e.from_number && e.from_number.includes(search)) ||
        (e.to_number && e.to_number.includes(search))
      );
    }

    // Group by fax_id and get latest event per fax
    const grouped = {};
    filtered.forEach(event => {
      if (!grouped[event.fax_id]) {
        grouped[event.fax_id] = event;
      } else {
        const existing = grouped[event.fax_id];
        if (new Date(event.created_date) > new Date(existing.created_date)) {
          grouped[event.fax_id] = event;
        }
      }
    });

    let summary = Object.values(grouped);

    // Apply view filter
    if (view === 'inbox') {
      summary = summary.filter(e => e.direction === 'inbound' && e.status === 'received');
    } else if (view === 'outbound') {
      summary = summary.filter(e => e.direction === 'outbound' && e.status !== 'failed');
    } else if (view === 'failed') {
      summary = summary.filter(e => e.status === 'failed');
    }

    return Response.json({
      allEvents: filtered,
      summary,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error fetching fax events:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});