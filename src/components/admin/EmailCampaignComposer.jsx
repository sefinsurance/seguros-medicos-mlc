import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Users, Mail, Clock, ChevronDown, Paperclip, Image, Loader2, Download } from "lucide-react";

export default function EmailCampaignComposer({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleMode, setScheduleMode] = useState("now"); // "now" | "scheduled"
  const [scheduledAt, setScheduledAt] = useState("");
  const [campaignType, setCampaignType] = useState("regular"); // "regular" | "birthday"
  const [csvRecipients, setCsvRecipients] = useState([]); // [{name, email, birthday?}]
  const [csvFileName, setCsvFileName] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const attachmentRef = useRef();

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split("\n").filter(Boolean);
      const start = lines[0]?.toLowerCase().includes("name") ? 1 : 0;
      const parsed = lines.slice(start).map(line => {
        const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
        return { 
          name: cols[0] || "", 
          birthday: cols[1] || "", 
          phone: cols[2] || "", 
          email: cols[3] || "" 
        };
      }).filter(r => r.email || r.phone);
      setCsvRecipients(parsed);
    };
    reader.readAsText(file);
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAttachment(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAttachmentUrls(prev => [...prev, file_url]);
    setUploadingAttachment(false);
  };

  const removeAttachment = (url) => {
    setAttachmentUrls(prev => prev.filter(u => u !== url));
  };

  const handleSave = async (statusVal) => {
    if (!name.trim() || !subject.trim() || !body.trim() || csvRecipients.length === 0) return;
    setSaving(true);
    const { getAdminToken } = await import("./useAdminToken");
    const adminToken = await getAdminToken();
    await base44.functions.invoke("adminManageEmailCampaign", {
      adminToken,
      action: "create",
      data: {
        name: name.trim(),
        subject: subject.trim(),
        message_body: body,
        csv_recipients: JSON.stringify(csvRecipients),
        attachment_urls: JSON.stringify(attachmentUrls),
        status: statusVal,
        scheduled_at: scheduleMode === "scheduled" ? scheduledAt : "",
        recipient_count: csvRecipients.length,
        campaign_type: campaignType,
      }
    });
    setSaving(false);
    onSaved();
  };

  const sampleName = csvRecipients[0]?.name || "Maria";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#1e3a5f]" />
            <h2 className="text-base font-bold text-[#1e3a5f]">New Email Campaign</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Campaign Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Spring Promotion"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Campaign Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Campaign Type</label>
            <div className="flex gap-3">
              {[{ value: "regular", label: "Regular Campaign" }, { value: "birthday", label: "🎂 Birthday Campaign (Auto-Daily)" }].map(opt => (
                <label key={opt.value} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-colors ${campaignType === opt.value ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600"}`}>
                  <input
                    type="radio"
                    name="campaignType"
                    value={opt.value}
                    checked={campaignType === opt.value}
                    onChange={() => setCampaignType(opt.value)}
                    className="accent-amber-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Recipients CSV */}
          <div>
           <label className="block text-xs font-semibold text-gray-600 mb-1">Recipients</label>
           {campaignType === "birthday" && (
             <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed mb-3">
               <strong>🎂 Birthday Campaign</strong> — Runs automatically every day at 9 AM. Sends your message to everyone in the CSV whose birthday matches today's date (MM/DD). Use <code className="bg-amber-100 px-1 rounded">{"{@name}"}</code> for personalization.
             </div>
           )}
           <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs text-blue-800 mb-3 leading-relaxed">
             <strong>CSV Format:</strong> Name, Birthdate (MM/DD/YYYY), Phone, Email
           </div>
           <div className="flex gap-2">
             <a
               href="data:text/csv;charset=utf-8,Name,Birthdate,Phone,Email%0AJohn Doe,01/15/1980,+1234567890,john@example.com%0AJane Smith,05/20/1975,+0987654321,jane@example.com"
               download="sample-email.csv"
               className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-gray-50"
             >
               <Download className="w-3.5 h-3.5" />
               Sample CSV
             </a>
             <button
               type="button"
               onClick={() => fileRef.current.click()}
               className="flex-1 flex items-center gap-2 border border-dashed border-blue-300 rounded-lg px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors justify-center"
             >
               <Upload className="w-4 h-4" />
               {csvFileName || "Upload CSV"}
             </button>
           </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            {csvRecipients.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                <Users className="w-3.5 h-3.5" />
                {csvRecipients.length} recipients loaded
                <button onClick={() => setPreview(prev => prev ? null : "csv")} className="text-blue-500 underline ml-1">
                  {preview === "csv" ? "Hide" : "Preview"}
                </button>
              </div>
            )}
            {preview === "csv" && (
              <div className="mt-2 border rounded-lg overflow-auto max-h-36 text-xs">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Name</th>
                      <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Birthdate</th>
                      <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Phone</th>
                      <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRecipients.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-1.5 text-gray-700">{r.name}</td>
                        <td className="px-3 py-1.5 text-gray-400">{r.birthday || "—"}</td>
                        <td className="px-3 py-1.5 text-gray-700">{r.phone || "—"}</td>
                        <td className="px-3 py-1.5 text-gray-700">{r.email}</td>
                      </tr>
                    ))}
                    {csvRecipients.length > 20 && (
                      <tr><td colSpan={4} className="px-3 py-1.5 text-gray-400 text-center">...and {csvRecipients.length - 20} more</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Subject Line</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={campaignType === "birthday" ? "e.g. Happy Birthday {@name}! 🎉" : "e.g. Limited Time: Save 20% Today"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-600">Email Body</label>
              {campaignType === "birthday" && (
                <button type="button" onClick={() => setBody(b => b + "{@name}")} className="text-xs text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">+ &#123;@name&#125;</button>
              )}
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              placeholder={campaignType === "birthday" ? "Hi {@name}, wishing you a wonderful birthday! Enjoy your special day..." : "Write your email message here..."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Attachments <span className="font-normal text-gray-400">(optional)</span></label>
            {attachmentUrls.length > 0 ? (
              <div className="space-y-2 mb-2">
                {attachmentUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                    <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 flex-1 truncate">{url.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(url)}
                      className="text-gray-400 hover:text-red-500 ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => attachmentRef.current.click()}
              disabled={uploadingAttachment}
              className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors w-full justify-center disabled:opacity-60"
            >
              {uploadingAttachment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              {uploadingAttachment ? "Uploading..." : "Add attachment"}
            </button>
            <input ref={attachmentRef} type="file" className="hidden" onChange={handleAttachmentUpload} />
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Send Time</label>
            <div className="flex gap-3">
              {[{ value: "now", label: "Send Now (Save as Draft)" }, { value: "scheduled", label: "Schedule for Later" }].map(opt => (
                <label key={opt.value} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-colors ${scheduleMode === opt.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
                  <input
                    type="radio"
                    name="scheduleMode"
                    value={opt.value}
                    checked={scheduleMode === opt.value}
                    onChange={() => setScheduleMode(opt.value)}
                    className="accent-blue-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {scheduleMode === "scheduled" && (
              <div className="mt-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <div className="flex gap-2">
            <button
              onClick={() => handleSave("draft")}
              disabled={saving || !name || !subject || !body || csvRecipients.length === 0}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(scheduleMode === "scheduled" ? "scheduled" : "draft")}
              disabled={saving || !name || !subject || !body || csvRecipients.length === 0}
              className="px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#163059] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : scheduleMode === "scheduled" ? "Schedule Campaign" : "Save Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}