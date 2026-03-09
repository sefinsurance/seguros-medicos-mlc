import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Users, MessageSquare, Clock, ChevronDown, Paperclip, Image, Loader2, Library } from "lucide-react";
import SmsTemplateLibrary from "./SmsTemplateLibrary";

const AUDIENCE_OPTIONS = [
  { value: "all_leads", label: "All Leads" },
  { value: "all_subscribers", label: "All SMS Subscribers" },
  { value: "leads_by_product", label: "Leads by Product" },
  { value: "leads_by_status", label: "Leads by Status" },
  { value: "csv_upload", label: "Upload CSV List" },
  { value: "birthday_campaign", label: "🎂 Birthday Campaign (Auto-Daily)" },
];

const PRODUCT_OPTIONS = ["ACA / Obamacare", "Medicare Advantage", "Life Insurance", "Dental & Vision"];
const STATUS_OPTIONS = ["partial_confirmed", "completed", "contacted", "closed", "archived"];

export default function SmsCampaignComposer({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all_leads");
  const [audienceFilter, setAudienceFilter] = useState("");
  const [scheduleMode, setScheduleMode] = useState("now"); // "now" | "scheduled"
  const [scheduledAt, setScheduledAt] = useState("");
  const [csvRecipients, setCsvRecipients] = useState([]); // [{name, phone}]
  const [csvFileName, setCsvFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const fileRef = useRef();
  const attachmentRef = useRef();

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  const insertTag = () => {
    setMessage(m => m + "{@name}");
  };

  const previewMessage = (recipientName) =>
    message.replace(/\{@name\}/g, recipientName || "there").replace(/\{@birthday\}/g, "March 7");

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split("\n").filter(Boolean);
      // Skip header row if it looks like a header
      const start = lines[0]?.toLowerCase().includes("name") ? 1 : 0;
      const parsed = lines.slice(start).map(line => {
        const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
        return { name: cols[0] || "", phone: cols[1] || "", birthday: cols[2] || "" };
      }).filter(r => r.phone);
      setCsvRecipients(parsed);
    };
    reader.readAsText(file);
  };

  const getRecipientCount = async () => {
    if (audience === "csv_upload" || audience === "birthday_campaign") return csvRecipients.length;
    if (audience === "all_leads") {
      const data = await base44.entities.Lead.list("-created_date", 500);
      return data.filter(l => l.phone).length;
    }
    if (audience === "all_subscribers") {
      const data = await base44.entities.SmsSubscriber.filter({ status: "opted_in" });
      return data.length;
    }
    if (audience === "leads_by_product") {
      const data = await base44.entities.Lead.filter({ product_type: audienceFilter });
      return data.filter(l => l.phone).length;
    }
    if (audience === "leads_by_status") {
      const data = await base44.entities.Lead.filter({ status: audienceFilter });
      return data.filter(l => l.phone).length;
    }
    return 0;
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAttachment(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAttachmentUrl(file_url);
    setUploadingAttachment(false);
  };

  const handleSave = async (statusVal) => {
    if (!name.trim() || !message.trim()) return;
    setSaving(true);
    const count = await getRecipientCount();
    await base44.entities.SmsCampaign.create({
      name: name.trim(),
      message_template: message,
      audience,
      audience_filter: audienceFilter,
      csv_recipients: (audience === "csv_upload" || audience === "birthday_campaign") ? JSON.stringify(csvRecipients) : "",
      status: statusVal,
      scheduled_at: scheduleMode === "scheduled" ? scheduledAt : "",
      recipient_count: count,
      attachment_url: attachmentUrl || "",
      notes: "",
    });
    setSaving(false);
    onSaved();
  };

  const sampleName = csvRecipients[0]?.name || "Maria";

  const handleLoadTemplate = (template) => {
    setMessage(template.message_template);
    setShowTemplateLibrary(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      {showTemplateLibrary && (
        <SmsTemplateLibrary
          onSelectTemplate={handleLoadTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1e3a5f]" />
            <h2 className="text-base font-bold text-[#1e3a5f]">New SMS Campaign</h2>
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
              placeholder="e.g. Open Enrollment Reminder March 2026"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Send To</label>
            <div className="relative">
              <select
                value={audience}
                onChange={e => { setAudience(e.target.value); setAudienceFilter(""); setCsvRecipients([]); }}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 pr-8"
              >
                {AUDIENCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {audience === "leads_by_product" && (
              <div className="mt-2 relative">
                <select
                  value={audienceFilter}
                  onChange={e => setAudienceFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                >
                  <option value="">Select product...</option>
                  {PRODUCT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            {audience === "leads_by_status" && (
              <div className="mt-2 relative">
                <select
                  value={audienceFilter}
                  onChange={e => setAudienceFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                >
                  <option value="">Select status...</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            {audience === "birthday_campaign" && (
              <div className="mt-2 space-y-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
                  <strong>🎂 Birthday Campaign</strong> — Runs automatically every day at 9 AM. Sends your message to everyone in the CSV whose birthday matches today's date (MM/DD). Use <code className="bg-amber-100 px-1 rounded">{"{@name}"}</code> for personalization. Make sure Column C has birthdays in <strong>MM/DD/YYYY</strong> or <strong>MM/DD</strong> format.
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 border border-dashed border-amber-400 rounded-lg px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors w-full justify-center"
                >
                  <Upload className="w-4 h-4" />
                  {csvFileName || "Upload Birthday CSV (A: Name, B: Phone, C: Birthday)"}
                </button>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                {csvRecipients.length > 0 && (
                  <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {csvRecipients.length} contacts loaded · {csvRecipients.filter(r => r.birthday).length} with birthdays
                  </div>
                )}
              </div>
            )}

            {audience === "csv_upload" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 border border-dashed border-blue-300 rounded-lg px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors w-full justify-center"
                >
                  <Upload className="w-4 h-4" />
                  {csvFileName || "Upload CSV (A: Name, B: Phone, C: Birthday MM/DD/YYYY)"}
                </button>
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
                          <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Phone</th>
                          <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Birthday</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRecipients.slice(0, 20).map((r, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-1.5 text-gray-700">{r.name}</td>
                            <td className="px-3 py-1.5 text-gray-700">{r.phone}</td>
                            <td className="px-3 py-1.5 text-gray-400">{r.birthday || "—"}</td>
                          </tr>
                        ))}
                        {csvRecipients.length > 20 && (
                          <tr><td colSpan={3} className="px-3 py-1.5 text-gray-400 text-center">...and {csvRecipients.length - 20} more</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">Message</label>
              <div className="flex gap-1">
                <button type="button" onClick={() => setShowTemplateLibrary(true)} className="text-xs text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-medium flex items-center gap-1"><Library className="w-3 h-3" /> Templates</button>
                <button type="button" onClick={() => setMessage(m => m + "{@name}")} className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-medium">+ &#123;@name&#125;</button>
                <button type="button" onClick={() => setMessage(m => m + "{@birthday}")} className="text-xs text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">+ &#123;@birthday&#125;</button>
              </div>
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Hi {@name}, this is MLC Insurance reminding you that open enrollment is now open! Call us at 877-458-2557."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
              <span>{charCount} characters · {smsCount} SMS segment{smsCount > 1 ? "s" : ""}</span>
              {(message.includes("{@name}") || message.includes("{@birthday}")) && (
                <span className="text-blue-500">✓ Personalized</span>
              )}
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Attachment <span className="font-normal text-gray-400">(optional — image/media for MMS)</span></label>
            {attachmentUrl ? (
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <img src={attachmentUrl} alt="attachment" className="w-14 h-14 object-cover rounded-md border border-gray-200" />
                <span className="text-xs text-gray-500 flex-1 truncate">{attachmentUrl.split('/').pop()}</span>
                <button type="button" onClick={() => setAttachmentUrl("")} className="text-gray-400 hover:text-red-500 ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => attachmentRef.current.click()}
                disabled={uploadingAttachment}
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors w-full justify-center disabled:opacity-60"
              >
                {uploadingAttachment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                {uploadingAttachment ? "Uploading..." : "Attach image or file"}
              </button>
            )}
            <input ref={attachmentRef} type="file" accept="image/*,video/*,.pdf" className="hidden" onChange={handleAttachmentUpload} />
          </div>

          {/* Live Preview */}
          {message && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">Preview (as "{sampleName}")</p>
              <div className="bg-[#1e3a5f] text-white text-sm rounded-2xl rounded-tl-none px-4 py-2.5 inline-block max-w-xs leading-relaxed">
                {attachmentUrl && (
                  <img src={attachmentUrl} alt="attachment preview" className="rounded-xl mb-2 max-w-full max-h-40 object-cover" />
                )}
                {previewMessage(sampleName)}
              </div>
            </div>
          )}

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
              disabled={saving || !name || !message}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(scheduleMode === "scheduled" ? "scheduled" : "draft")}
              disabled={saving || !name || !message || (audience === "csv_upload" && csvRecipients.length === 0)}
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