import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { base44 } from "@/api/base44Client";
import { X, Upload, Loader2, Download } from "lucide-react";
import { getAdminToken } from "./useAdminToken";

const PROSPECT_FIELDS = [
  { label: "Full Name", key: "full_name" },
  { label: "Phone", key: "phone" },
  { label: "Phone 2", key: "phone2" },
  { label: "Email", key: "email" },
  { label: "DOB", key: "dob" },
  { label: "Address", key: "address" },
  { label: "City", key: "city" },
  { label: "State", key: "state" },
  { label: "Zip Code", key: "zipcode" },
  { label: "Age", key: "age" },
  { label: "Gender", key: "gender" },
  { label: "Household", key: "members" },
  { label: "Last 4 SSN", key: "ssn_last4" },
  { label: "Plan", key: "plan" },
  { label: "Premium", key: "premium" },
  { label: "Insured", key: "insured" },
  { label: "Language", key: "language" },
  { label: "Salary", key: "salary" },
  { label: "Notes", key: "notes" },
];

export default function ProspectsImportModal({ onClose, onImported }) {
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef();

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setError("");
    setSuccess("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\ufeff/, ""),
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          if (headers.length < 1 || !results.data?.length) {
            setCsvData([]);
            setError("CSV must contain header row and at least one data row");
            return;
          }

          const autoMapping = {};
          headers.forEach((header) => {
            const normalized = String(header).toLowerCase().trim();
            const match = PROSPECT_FIELDS.find(
              (field) => normalized.includes(field.label.toLowerCase()) || normalized.includes(field.key.toLowerCase())
            );
            if (match) autoMapping[header] = match.key;
          });

          const seen = new Set();
          const rows = (results.data || [])
            .map((raw) => {
              const record = {};
              headers.forEach((header) => {
                const key = autoMapping[header];
                const value = raw?.[header];
                if (key && value != null && String(value).trim() !== "") {
                  record[key] = String(value).trim();
                }
              });
              return record;
            })
            .filter((row) => {
              const normalizedPhone = (row.phone || "").replace(/\D/g, "");
              if (!row.phone && !row.email) return false;
              if (normalizedPhone) {
                if (seen.has(normalizedPhone)) return false;
                seen.add(normalizedPhone);
              }
              return true;
            });

          setCsvData(rows);
          if (!rows.length) {
            setError("No valid rows found. Each row must include at least a phone or email.");
          }
        } catch (err) {
          setCsvData([]);
          setError(`Error parsing CSV: ${err.message}`);
        }
      },
      error: (err) => {
        setCsvData([]);
        setError(`Error parsing CSV: ${err.message}`);
      },
    });
  };

  const handleSave = async () => {
    if (!csvData.length) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = await getAdminToken();
      const CHUNK_SIZE = 500;
      let totalImported = 0;

      for (let i = 0; i < csvData.length; i += CHUNK_SIZE) {
        const chunk = csvData.slice(i, i + CHUNK_SIZE);
        const response = await base44.functions.invoke("adminImportProspects", {
          adminToken,
          prospects: chunk,
        });
        totalImported += response.data?.imported || 0;
      }

      setSuccess(`Import complete: ${totalImported} prospects added`);
      setTimeout(() => onImported(), 1200);
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-gray-800">Import Prospects</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs text-blue-800">
            <strong>CSV Format:</strong> Full Name, DOB, Phone, Email, Address, City, State, Zip Code, Household Size, Salary, Language, and more. Quoted commas are supported.
          </div>

          <div className="flex gap-2">
            <a
              href="data:text/csv;charset=utf-8,name,dob,phone,phone2,email,address,city,state,zip code,age,gender,household,last 4 ssn,plan,premium,insured,language,salary,notes%0AJohn Doe,01/15/1980,+1234567890,,john@example.com,123 Main St,New York,NY,10001,44,M,4,1234,Medicare Advantage,150.00,Self,English,52000,Interested in follow-up"
              download="sample-prospects.csv"
              className="flex items-center gap-2 text-xs bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded font-medium hover:bg-blue-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Sample CSV
            </a>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            {csvFileName || "Upload CSV File"}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-800">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-xs text-green-800">{success}</div>}

          {csvData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">{csvData.length} prospects loaded</span>
                <button onClick={() => setPreview(!preview)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  {preview ? "Hide" : "Preview"}
                </button>
              </div>
              {preview && (
                <div className="border rounded-lg overflow-auto max-h-64 text-xs">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {Object.keys(csvData[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-gray-500 font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2 text-gray-700">{val || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || csvData.length === 0}
            className="px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#163059] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {saving ? "Importing..." : "Import Prospects"}
          </button>
        </div>
      </div>
    </div>
  );
}
