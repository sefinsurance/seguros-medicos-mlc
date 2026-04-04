import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { X, Plus, Edit2, Trash2, Copy } from "lucide-react";

export default function SmsTemplateLibrary({ onSelectTemplate, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState({ name: "", message_template: "", description: "" });
  const [saving, setSaving]       = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSmsTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.message_template.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateSmsTemplate(editingId, formData);
      } else {
        await adminApi.createSmsTemplate(formData);
      }
      setFormData({ name: "", message_template: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      loadTemplates();
    } catch (err) {
      console.error("Failed to save template:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template) => {
    setFormData({
      name:             template.name,
      message_template: template.message_template,
      description:      template.description || "",
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await adminApi.deleteSmsTemplate(id);
      loadTemplates();
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1e3a5f]">SMS Template Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {!showForm ? (
            <div>
              <button
                onClick={() => setShowForm(true)}
                className="mb-4 flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#163059] transition-colors"
              >
                <Plus className="w-4 h-4" /> New Template
              </button>

              {loading ? (
                <div className="text-center py-12 text-gray-400 text-sm">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No templates yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map(t => (
                    <div key={t.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                        {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{t.message_template}</p>
                      </div>
                      <div className="flex gap-1 ml-3 flex-shrink-0">
                        <button onClick={() => onSelectTemplate(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Load template">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Template Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Open Enrollment Reminder"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <input
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional note about when to use this template"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-600">Message Template</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setFormData({ ...formData, message_template: formData.message_template + "{@name}" })} className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-medium">+ &#123;@name&#125;</button>
                    <button type="button" onClick={() => setFormData({ ...formData, message_template: formData.message_template + "{@birthday}" })} className="text-xs text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">+ &#123;@birthday&#125;</button>
                  </div>
                </div>
                <textarea
                  value={formData.message_template}
                  onChange={e => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder="Hi {@name}, this is MLC Insurance..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", message_template: "", description: "" }); }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.message_template}
                  className="px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#163059] disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : editingId ? "Update Template" : "Save Template"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
