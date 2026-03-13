import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, FileText, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FaxSheetComposer({ onClose, onFaxSent }) {
  const [toNumber, setToNumber] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [attentionTo, setAttentionTo] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateFaceSheet = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 8.5in; margin: 0; padding: 40px; background: white; }
    
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #1e3a5f; padding-bottom: 25px; margin-bottom: 40px; }
    .header-left h1 { font-size: 32px; font-weight: 900; letter-spacing: 3px; color: #1e3a5f; margin-bottom: 5px; }
    .header-left p { font-size: 13px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px; }
    
    .header-right { text-align: right; }
    .header-right img { height: 60px; object-fit: contain; margin-bottom: 8px; }
    .header-right p { font-size: 12px; font-weight: 600; color: #1e3a5f; line-height: 1.4; }
    
    .section { margin-bottom: 30px; }
    .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #1e3a5f; letter-spacing: 1px; margin-bottom: 10px; }
    
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .fields.full { grid-template-columns: 1fr; }
    
    .field-group { }
    .field-label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
    .field-value { font-size: 14px; color: #1e3a5f; padding-bottom: 8px; border-bottom: 1px solid #333; min-height: 22px; font-weight: 500; }
    
    .notes-section { margin-top: 30px; }
    .notes-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #1e3a5f; letter-spacing: 1px; margin-bottom: 12px; }
    .notes-content { font-size: 13px; line-height: 1.6; color: #333; white-space: pre-wrap; }
    
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #999; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>FAX</h1>
      <p>Cover Sheet</p>
    </div>
    <div class="header-right">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ab1578c293524eeeb25c69/34f395594_logo.png" alt="MLC Insurance">
      <p>MLC Insurance</p>
      <p style="font-size: 11px; margin-top: 4px;">+1 (239) 488-1277</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">To:</div>
    <div class="fields">
      <div class="field-group">
        <div class="field-label">Company:</div>
        <div class="field-value">${toCompany || '&nbsp;'}</div>
      </div>
      <div class="field-group">
        <div class="field-label">Fax:</div>
        <div class="field-value">${toNumber || '&nbsp;'}</div>
      </div>
    </div>
    <div class="fields" style="margin-top: 12px;">
      <div class="field-group">
        <div class="field-label">Attention To:</div>
        <div class="field-value">${attentionTo || '&nbsp;'}</div>
      </div>
      <div class="field-group">
        <div class="field-label">Pages:</div>
        <div class="field-value">&nbsp;</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">From:</div>
    <div class="fields">
      <div class="field-group">
        <div class="field-label">Fax:</div>
        <div class="field-value">+1 (239) 488-1277</div>
      </div>
      <div class="field-group">
        <div class="field-label">Phone:</div>
        <div class="field-value">877-458-2557</div>
      </div>
    </div>
  </div>

  <hr style="border: none; border-top: 1px solid #333; margin: 25px 0;">

  <div class="section">
    <div class="section-title">Notes:</div>
    <div class="notes-content">${notes ? notes : '&nbsp;'}</div>
  </div>

  <div class="footer">
    <p>This is a confidential fax transmission from MLC Insurance. If you are not the intended recipient, please delete immediately and notify us.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    return blob;
  };

  const handleSendFax = async () => {
    if (!toNumber.trim()) {
      alert("Please enter a fax number");
      return;
    }

    setSending(true);
    try {
      const { getAdminToken } = await import("./useAdminToken");
      const adminToken = await getAdminToken();
      
      // Upload all attachments
      const attachmentUrls = [];
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) attachmentUrls.push(url);
      }

      // Always generate face sheet HTML
      const faceSheetBlob = generateFaceSheet();
      let faceSheetUrl = null;
      if (faceSheetBlob) {
        faceSheetUrl = await uploadFile(faceSheetBlob);
      }

      const res = await base44.functions.invoke("sendFaxWithTelnyx", {
        adminToken,
        toNumber: toNumber.trim(),
        attachmentUrls,
        faceSheetHtml: faceSheetUrl
      });

      if (res.data?.success) {
        alert(`Fax sent successfully to ${toNumber}`);
        onFaxSent?.();
        onClose?.();
      } else {
        alert(`Failed to send fax: ${res.data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending fax:', error);
      alert("Failed to send fax: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      return res.file_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Send Fax with Face Sheet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To Fax Number <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="(555) 123-4567 or 5551234567"
              value={toNumber}
              onChange={e => setToNumber(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-gray-500 mt-1">Enter 10 digits (the +1 is added automatically)</p>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company (optional)
            </label>
            <Input
              placeholder="e.g., Acme Insurance"
              value={toCompany}
              onChange={e => setToCompany(e.target.value)}
            />
          </div>

          {/* Attention To */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attention To (optional)
            </label>
            <Input
              placeholder="e.g., John Smith, Claims Department"
              value={attentionTo}
              onChange={e => setAttentionTo(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject Line (optional)
            </label>
            <Input
              placeholder="e.g., Policy Documents"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes / Message (optional)
            </label>
            <Textarea
              placeholder="Add any notes to include in the face sheet..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attach Files (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload files
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG, DOCX, TXT up to 20MB</p>
            </button>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-sm text-gray-700 truncate">{f.name}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Face Sheet Preview
            </p>
            <div className="bg-white rounded p-3 text-xs text-gray-700 space-y-2 max-h-40 overflow-y-auto">
              <div><strong>MLC Insurance</strong></div>
              <div>877-458-2557</div>
              <div>─────────────────</div>
              {toCompany && <div>To: {toCompany}</div>}
              {attentionTo && <div>Attn: {attentionTo}</div>}
              <div>Fax: {toNumber || '___________'}</div>
              <div>From: MLC Insurance Fax</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              {subject && <div>Subject: {subject}</div>}
              {notes && <div className="mt-2 whitespace-pre-wrap">{notes}</div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendFax}
              disabled={sending || !toNumber.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Fax"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}