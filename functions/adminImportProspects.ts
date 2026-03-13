import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { adminToken, prospects } = body;

    const expectedHash = Deno.env.get('ADMIN_PASSWORD_HASH') || '';
    if (!adminToken || adminToken !== expectedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      return Response.json({ error: 'No prospects to import' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const validProspects = [];
    for (const prospect of prospects) {
      if (!prospect.phone) continue;
      validProspects.push({
        full_name: prospect.full_name || '',
        phone: prospect.phone,
        phone2: prospect.phone2 || '',
        email: prospect.email || '',
        dob: prospect.dob || '',
        address: prospect.address || '',
        city: prospect.city || '',
        state: prospect.state || '',
        zipcode: prospect.zipcode || '',
        age: prospect.age || '',
        gender: prospect.gender || '',
        members: prospect.members || '',
        ssn_last4: prospect.ssn_last4 || '',
        plan: prospect.plan || '',
        premium: prospect.premium || '',
        insured: prospect.insured || '',
        salary: prospect.salary || '',
        language: prospect.language || '',
        notes: prospect.notes || '',
      });
    }

    const BATCH_SIZE = 25;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < validProspects.length; i += BATCH_SIZE) {
      const batch = validProspects.slice(i, i + BATCH_SIZE);
      try {
        const result = await base44.asServiceRole.entities.Prospect.bulkCreate(batch);
        imported += result.length || batch.length;
      } catch (err) {
        console.error(`Batch ${i}-${i + BATCH_SIZE} error:`, err.message);
        errors += batch.length;
      }
    }

    return Response.json({
      success: true,
      imported,
      skipped: prospects.length - validProspects.length,
      errors,
      total: prospects.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
