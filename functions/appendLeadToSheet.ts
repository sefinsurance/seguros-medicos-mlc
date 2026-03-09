import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SPREADSHEET_ID = "10xPnnf0vd7zftEtH-l2g0Bsuyo14gL5XC2mlHRNpC9M";
const SHEET_NAME = "Leads";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    const body = await req.json();
    const lead = body.data || body;

    const row = [
      lead.created_date ? new Date(lead.created_date).toLocaleString("en-US", { timeZone: "America/New_York" }) : "",
      lead.full_name || "",
      lead.date_of_birth || "",
      lead.phone || "",
      lead.email || "",
      lead.zip_code || "",
      lead.product_type || "",
      lead.status || "",
      lead.cta_source || "",
      lead.language_selected || "",
      lead.preferred_language || "",
      lead.household_size ?? "",
      lead.estimated_income ?? "",
      lead.best_time_to_call || "",
      lead.preferred_contact_method || "",
      lead.notes || "",
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: err }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ success: true, updatedRange: result.updates?.updatedRange });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});