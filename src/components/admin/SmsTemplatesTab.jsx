import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MessageSquare, Trash2, RefreshCw, Edit2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function TemplateModal({ template, onClose, onSaved }) {
  const [name, setName] = useState(template?.name || "");
  const [message, setMessage] = useState(template?.message_template || "");
  const [description, setDescription] = useState(template?.description || "");
  const [attachmentUrl, setAttachmentUrl] = useState(template?.attachment_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) return;

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        message_template: message.trim(),
        description: description.trim(),
        attachment_url: attachmentUrl || null,
      };
      
      if (template) {
        await base44.entities.SmsTemplate.update(template.id, data);
      } else {
        await base44.entities.SmsTemplate.create(data);
      }
      onSaved();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + variable + message.substring(end);
    setMessage(newMessage);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, GIF) or video (MP4, MPEG) file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachmentUrl(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {template ? "Edit Template" : "Create Template"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Follow-up Reminder"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of when to use this template"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => insertVariable('{{name}}')}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  + {'{{name}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{phone}}')}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  + {'{{phone}}'}
                </button>
              </div>
            </div>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hi {{name}}, this is a reminder about..."
              rows={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{{name}}'} and {'{{phone}}'} as placeholders. They'll be replaced with actual prospect data.
            </p>
          </div>
          
          {/* MMS Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MMS Attachment (Optional)
            </label>
            {attachmentUrl ? (
              <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setAttachmentUrl("")}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                {attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={attachmentUrl} alt="Attachment" className="max-h-40 rounded" />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ImageIcon className="w-5 h-5" />
                    <span className="truncate">{attachmentUrl.split('/').pop()}</span>
                  </div>
                )}
              </div>
            ) : (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/mpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload image or video'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, MP4 (Max 5MB)</p>
                </div>
              </label>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
            <p className="text-sm text-gray-600">
              {message.replace(/\{\{name\}\}/g, 'John Doe').replace(/\{\{phone\}\}/g, '+1 (234) 567-8900') || 'Your message will appear here...'}
            </p>
            {attachmentUrl && (
              <p className="text-xs text-blue-600 mt-2">📎 MMS attachment included</p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading || !name || !message}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#163059] disabled:opacity-50"
            >
              {saving ? "Saving..." : uploading ? "Uploading..." : template ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SmsTemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SmsTemplate.list('-created_date');
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await base44.entities.SmsTemplate.delete(id);
      setTemplates(t => t.filter(tpl => tpl.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleEdit = (tpl) => {
    setEditingTemplate(tpl);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  return (
    <div>
      {showModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={handleCloseModal}
          onSaved={() => { handleCloseModal(); load(); }}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-800">SMS Templates</h2>
          <p className="text-xs text-gray-500 mt-0.5">Create reusable message templates with variables</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#163059]"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No templates yet</p>
          <p className="text-xs mt-1">Create your first reusable message template</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
                  {tpl.description && (
                    <p className="text-xs text-gray-500 mt-1">{tpl.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(tpl)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{tpl.message_template}</p>
                {tpl.attachment_url && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {tpl.attachment_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img src={tpl.attachment_url} alt="MMS attachment" className="max-h-32 rounded" />
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <ImageIcon className="w-4 h-4" />
                        <span>MMS attachment included</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Created {new Date(tpl.created_date).toLocaleDateString()}
                {tpl.attachment_url && " • MMS"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}