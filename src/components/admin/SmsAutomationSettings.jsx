import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { Plus, Trash2, Zap, ToggleLeft, ToggleRight, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_LABELS = {
  partial_confirmed: "Partial Confirmed",
  completed:         "Completed",
  contacted:         "Contacted",
  closed:            "Closed",
  archived:          "Archived",
};

const STATUS_COLORS = {
  partial_confirmed: "bg-yellow-100 text-yellow-800",
  completed:         "bg-blue-100 text-blue-800",
  contacted:         "bg-purple-100 text-purple-800",
  closed:            "bg-green-100 text-green-800",
  archived:          "bg-gray-100 text-gray-700",
};

export default function SmsAutomationSettings() {
  const [rules, setRules]         = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm]           = useState({ trigger_status: "", template_id: "", delay_minutes: 0 });
  const [formError, setFormError] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rulesData, templatesData] = await Promise.all([
        adminApi.getSmsAutomationRules(),
        adminApi.getSmsTemplates(),
      ]);
      setRules(Array.isArray(rulesData) ? rulesData : (rulesData.rules || []));
      setTemplates(Array.isArray(templatesData) ? templatesData : (templatesData.templates || []));
    } catch (err) {
      console.error("Failed to load automation rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setFormError("");
    if (!form.trigger_status) return setFormError("Please select a trigger status.");
    if (!form.template_id)    return setFormError("Please select an SMS template.");

    const existing = rules.find(r => r.trigger_status === form.trigger_status);
    if (existing) return setFormError(`A rule for "${STATUS_LABELS[form.trigger_status]}" already exists. Edit or delete it first.`);

    const tpl = templates.find(t => t.id === form.template_id);
    setSaving(true);
    try {
      await adminApi.createSmsAutomationRule({
        trigger_status:   form.trigger_status,
        template_id:      form.template_id,
        template_name:    tpl?.name || "",
        template_preview: (tpl?.message_template || "").slice(0, 120),
        delay_minutes:    Number(form.delay_minutes) || 0,
        is_active:        true,
      });
      setShowAddForm(false);
      setForm({ trigger_status: "", template_id: "", delay_minutes: 0 });
      loadAll();
    } catch (err) {
      console.error("Failed to create rule:", err);
      setFormError("Failed to save rule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule) => {
    try {
      await adminApi.updateSmsAutomationRule(rule.id, { is_active: !rule.is_active });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this automation rule?")) return;
    try {
      await adminApi.deleteSmsAutomationRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const usedStatuses     = new Set(rules.map(r => r.trigger_status));
  const availableStatuses = Object.keys(STATUS_LABELS).filter(s => !usedStatuses.has(s));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" />
          <div>
            <h2 className="text-base font-bold text-[#1e3a5f]">SMS Automation Rules</h2>
            <p className="text-xs text-slate-400">Automatically send an SMS when a lead's status changes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {availableStatuses.length > 0 && (
            <button onClick={() => { setShowAddForm(true); setFormError(""); }}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#243b55] text-white rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
        <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <span>When a lead's status is updated and saved, any active matching rule will trigger an SMS to that lead's phone number using the selected template. The backend execution will be wired separately.</span>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1e3a5f]">New Automation Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">When status changes to</label>
              <Select value={form.trigger_status} onValueChange={v => setForm(f => ({ ...f, trigger_status: v }))}>
                <SelectTrigger><SelectValue placeholder="Select status…" /></SelectTrigger>
                <SelectContent>
                  {availableStatuses.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Send SMS template</label>
              <Select value={form.template_id} onValueChange={v => setForm(f => ({ ...f, template_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select template…" /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Delay (minutes)</label>
              <input type="number" min={0} max={1440} value={form.delay_minutes}
                onChange={e => setForm(f => ({ ...f, delay_minutes: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d70ae]/30"
                placeholder="0 = immediately" />
            </div>
          </div>

          {form.template_id && (() => {
            const tpl = templates.find(t => t.id === form.template_id);
            return tpl ? (
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-600 border border-slate-200">
                <span className="font-semibold text-slate-500 block mb-1">Template preview:</span>
                {tpl.message_template}
              </div>
            ) : null;
          })()}

          {formError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formError}</p>}

          <div className="flex gap-2">
            <button onClick={() => setShowAddForm(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 py-2 rounded-lg bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#243b55] transition-colors flex items-center justify-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save Rule
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading rules…
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No automation rules yet. Click <strong>Add Rule</strong> to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className={`bg-white border rounded-2xl px-5 py-4 flex items-start gap-4 shadow-sm transition-opacity ${!rule.is_active ? "opacity-50" : ""}`}>
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[rule.trigger_status] || "bg-slate-100 text-slate-600"}`}>
                  {STATUS_LABELS[rule.trigger_status] || rule.trigger_status}
                </span>
                <Zap className="w-3.5 h-3.5 text-indigo-300 mt-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1e3a5f]">{rule.template_name || "Unknown template"}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    {rule.delay_minutes > 0 ? `After ${rule.delay_minutes}m` : "Immediately"}
                  </Badge>
                </div>
                {rule.template_preview && <p className="text-xs text-slate-400 truncate max-w-sm">{rule.template_preview}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(rule)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${rule.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {rule.is_active ? <><ToggleRight className="w-4 h-4" /> Active</> : <><ToggleLeft className="w-4 h-4" /> Paused</>}
                </button>
                <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
