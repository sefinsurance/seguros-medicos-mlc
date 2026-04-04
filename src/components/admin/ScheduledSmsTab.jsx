import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { Plus, Trash2, X, Clock, CheckCircle2, AlertCircle, Ban, Search } from "lucide-react";
import { format, parseISO, addDays, startOfToday } from "date-fns";

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700",
  sent:      "bg-green-100 text-green-700",
  failed:    "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const STATUS_ICONS = {
  pending:   Clock,
  sent:      CheckCircle2,
  failed:    AlertCircle,
  cancelled: Ban,
};

const MAX_DAYS = 120;

export default function ScheduledSmsTab() {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({
    recipient_name: "", recipient_phone: "", message: "", scheduled_at: "", notes: "",
  });

  const today      = startOfToday();
  const maxDate    = addDays(today, MAX_DAYS);
  const minDateStr = format(today,   "yyyy-MM-dd'T'HH:mm");
  const maxDateStr = format(maxDate, "yyyy-MM-dd'T'HH:mm");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getScheduledSms();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load scheduled SMS:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.recipient_phone.trim() || !form.message.trim() || !form.scheduled_at) return;
    setSaving(true);
    try {
      await adminApi.createScheduledSms({
        recipient_name:  form.recipient_name,
        recipient_phone: form.recipient_phone,
        message:         form.message,
        scheduled_at:    new Date(form.scheduled_at).toISOString(),
        notes:           form.notes,
        status:          "pending",
      });
      setShowForm(false);
      setForm({ recipient_name: "", recipient_phone: "", message: "", scheduled_at: "", notes: "" });
      load();
    } catch (err) {
      console.error("Failed to schedule SMS:", err);
      alert("Failed to schedule SMS: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this scheduled SMS?")) return;
    try {
      await adminApi.updateScheduledSms(id, { status: "cancelled" });
      setMessages(m => m.map(x => x.id === id ? { ...x, status: "cancelled" } : x));
    } catch (err) {
      console.error("Failed to cancel SMS:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheduled SMS?")) return;
    try {
      await adminApi.deleteScheduledSms(id);
      setMessages(m => m.filter(x => x.id !== id));
    } catch (err) {
      console.error("Failed to delete SMS:", err);
    }
  };

  const filtered = messages.filter(m => {
    const matchSearch = !search ||
      (m.recipient_name  || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.recipient_phone || "").includes(search) ||
      (m.message         || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = messages.filter(m => m.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1e3a5f]">Scheduled SMS</h2>
          <p className="text-xs text-slate-500">{pendingCount} pending · Schedule up to {MAX_DAYS} days ahead</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#325a8b] hover:bg-[#243b55] text-white rounded-lg px-4 py-2 text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule SMS
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3d70ae]/30"
            placeholder="Search by name, phone, or message..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wide">Recipient</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wide hidden sm:table-cell">Message</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wide">Scheduled</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-400">No scheduled messages found.</td></tr>
            ) : filtered.map(msg => {
              const Icon = STATUS_ICONS[msg.status] || Clock;
              return (
                <tr key={msg.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{msg.recipient_name || "—"}</div>
                    <div className="text-xs text-slate-400">{msg.recipient_phone}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-slate-600 max-w-xs truncate">{msg.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-700 font-medium">
                      {msg.scheduled_at ? format(parseISO(msg.scheduled_at), "MMM d, yyyy") : "—"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {msg.scheduled_at ? format(parseISO(msg.scheduled_at), "h:mm a") + " ET" : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[msg.status] || "bg-slate-100 text-slate-500"}`}>
                      <Icon className="w-3 h-3" />
                      {msg.status}
                    </span>
                    {msg.sent_at && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Sent {format(parseISO(msg.sent_at), "MMM d h:mm a")}
                      </div>
                    )}
                    {msg.error_message && (
                      <div className="text-xs text-red-500 mt-0.5 max-w-[160px] truncate" title={msg.error_message}>
                        {msg.error_message}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {msg.status === "pending" && (
                        <button onClick={() => handleCancel(msg.id)} title="Cancel" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-orange-500 transition-colors">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(msg.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} of {messages.length} messages</p>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1e3a5f]">Schedule New SMS</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {[
              { label: "Recipient Name", key: "recipient_name", placeholder: "Full name (optional)", required: false },
              { label: "Phone Number",   key: "recipient_phone", placeholder: "+1 (555) 000-0000",   required: true  },
            ].map(({ label, key, placeholder, required }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  {label}{required && " *"}
                </label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d70ae]/40"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Message *</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d70ae]/40 resize-none h-24"
                placeholder="Type your message..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                maxLength={1600}
              />
              <p className="text-xs text-slate-400 text-right">{form.message.length}/1600</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Schedule Date & Time * <span className="font-normal text-slate-400">(up to {MAX_DAYS} days from today)</span>
              </label>
              <input
                type="datetime-local"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d70ae]/40"
                value={form.scheduled_at}
                min={minDateStr}
                max={maxDateStr}
                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes (internal)</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d70ae]/40"
                placeholder="Optional internal notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.recipient_phone.trim() || !form.message.trim() || !form.scheduled_at}
                className="flex-1 py-2 rounded-lg bg-[#325a8b] text-white text-xs font-semibold hover:bg-[#243b55] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Schedule SMS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
