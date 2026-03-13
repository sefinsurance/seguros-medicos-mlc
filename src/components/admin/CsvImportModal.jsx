import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Loader2, Download } from "lucide-react";
import { normalizePhone, parseCsvText } from "@/utils/csv";

function extractRecipients(rows) {
  return rows
    .map((row) => {
      const lowered = Object.fromEntries(Object.entries(row).map(([key, value]) => [String(key).toLowerCase().trim(), value]));
      return {
        name: lowered.name || lowered.full_name || lowered.fullname || "",
        birthday: lowered.birthday || lowered.dob || lowered.date_of_birth || "",
        phone: lowered.phone || lowered.mobile || lowered.cell || "",
        email: lowered.email || lowered.email_address || "",
      };
    })
    .filter((recipient) => recipient.phone || recipient.email)
    .filter((recipient, index, list) => {
      const phoneKey = normalizePhone(recipient.phone);
      const emailKey = String(recipient.email || "").trim().toLowerCase();
      const key = phoneKey || emailKey;
      return key && list.findIndex((candidate) => (normalizePhone(candidate.phone) || String(candidate.email || "").trim().toLowerCase()) === key) === index;
    });
}

export default function CsvImportModal({ campaignId, onClose, onSaved }) {
  const [csvRecipients, setCsvRecipients] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCsvText(String(ev.target?.result || ""));
        setCsvRecipients(extractRecipients(rows));
      } catch (err) {
        setCsvRecipients([]);
        setError(`CSV error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (csvRecipients.length === 0) return;
    setSaving(true);
    await base44.entities.EmailCampaign.update(campaignId, {
      csv_recipients: JSON.stringify(csvRecipients),
      recipient_count: csvRecipients.length,
    });
    setSaving(false);
    onSaved(campaignId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Import CSV Recipients</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs text-blue-800">
            Use headers like <strong>name</strong>, <strong>phone</strong>, <strong>email</strong>, and <strong>birthday</strong>. Quoted commas are supported.
          </div>
          <a href="data:text/csv;charset=utf-8,name,birthday,phone,email%0AMaria Perez,1990-05-10,+1234567890,maria@example.com" download="sample-recipients.csv" className="inline-flex items-center gap-2 text-xs bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded font-medium hover:bg-blue-200 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Sample CSV
          </a>
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center">
            <Upload className="w-4 h-4" />
            {csvFileName || "Upload CSV File"}
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-800">{error}</div>}

          {csvRecipients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">{csvRecipients.length} recipients loaded</span>
                <button onClick={() => setPreview(!preview)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{preview ? "Hide" : "Preview"}</button>
              </div>
              {preview && (
                <div className="border rounded-lg overflow-auto max-h-64 text-xs">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr><th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th><th className="px-3 py-2 text-left text-gray-500 font-medium">Birthday</th><th className="px-3 py-2 text-left text-gray-500 font-medium">Phone</th><th className="px-3 py-2 text-left text-gray-500 font-medium">Email</th></tr></thead>
                    <tbody>
                      {csvRecipients.slice(0, 10).map((r, i) => <tr key={i} className="border-t border-gray-100"><td className="px-3 py-2 text-gray-700">{r.name || "—"}</td><td className="px-3 py-2 text-gray-700">{r.birthday || "—"}</td><td className="px-3 py-2 text-gray-700">{r.phone || "—"}</td><td className="px-3 py-2 text-gray-700">{r.email || "—"}</td></tr>)}
                      {csvRecipients.length > 10 && <tr><td colSpan={4} className="px-3 py-2 text-gray-400 text-center">...and {csvRecipients.length - 10} more</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={handleSave} disabled={saving || csvRecipients.length === 0} className="px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#163059] disabled:opacity-50 transition-colors flex items-center gap-2">
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {saving ? "Saving..." : "Save Recipients"}
          </button>
        </div>
      </div>
    </div>
  );
}
