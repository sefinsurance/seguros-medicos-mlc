async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { adminToken, prospects } = body;
    
    // Verify admin token from custom auth
    if (!adminToken) {
      return Response.json({ error: 'Unauthorized: Missing admin token' }, { status: 401 });
    }
    
    const storedHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    if (adminToken !== storedHash) {
      return Response.json({ error: 'Forbidden: Invalid admin token' }, { status: 403 });
    }

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      return Response.json({ error: 'No prospects to import' }, { status: 400 });
    }

    const baseUrl = Deno.env.get('LEADS_API_BASE_URL');
    const apiKey = Deno.env.get('LEADS_API_KEY');

    // Send prospects to Postgres API in batches
    const BATCH_SIZE = 500;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
      const batch = prospects.slice(i, i + BATCH_SIZE);
      
      try {
        const response = await fetch(`${baseUrl}/api/prospects/bulk`, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prospects: batch }),
        });

        if (response.ok) {
          const result = await response.json();
          imported += result.imported || batch.length;
        } else {
          console.error(`Batch ${i}-${i + BATCH_SIZE} failed:`, await response.text());
          errors += batch.length;
        }
      } catch (err) {
        console.error(`Batch ${i}-${i + BATCH_SIZE} error:`, err.message);
        errors += batch.length;
      }
    }

    return Response.json({
      success: true,
      imported,
      errors,
      total: prospects.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});