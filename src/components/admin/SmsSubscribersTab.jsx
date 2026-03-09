import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, UserCheck, UserX, RefreshCw, Download, Plus, Pencil, Trash2, X, Check, ChevronDown, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import CampaignTags from "./CampaignTags";
import CampaignEnrollmentModal from "./CampaignEnrollmentModal";

function AddEditModal({ subscriber, onSave, onClose }) {
  const [phone, setPhone] = useState(subscriber?.phone || "");
  const [status, setStatus] = useState(subscriber?.status || "opted_in");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!phone.trim()) return;
    setSaving(true);
    if (subscriber?.id) {
      const updated = await base44.entities.SmsSubscriber.update(subscriber.id, { phone, status });
      onSave(updated);
    } else {
      const created = await base44.entities.SmsSubscriber.create({ phone, status, source: "manual" });
      onSave(created);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-base font-bold text-[#1e3a5f] mb-4">{subscriber?.id ? "Edit Subscriber" : "Add Subscriber"}</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 305-555-1234" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus("opted_in")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${status === "opted_in" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
              >
                Opted In
              </button>
              <button
                onClick={() => setStatus("opted_out")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${status === "opted_out" ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
              >
                Opted Out
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !phone.trim()} className="flex-1 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#163059] transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SmsSubscribersTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_date"); // "created_date" | "phone"
  const [sortOrder, setSortOrder] = useState(-1); // 1 = asc, -1 = desc
  const [modal, setModal] = useState(null); // null | { subscriber?: object }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to delete
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SmsSubscriber.list("-created_date", 500);
    setSubscribers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = (saved) => {
    setSubscribers(prev => {
      const exists = prev.find(s => s.id === saved.id);
      return exists ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev];
    });
  };

  const handleDelete = async (id) => {
    await base44.entities.SmsSubscriber.delete(id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} subscriber(s)?`)) return;
    setBulkDeleting(true);
    await Promise.all([...selectedIds].map(id => base44.entities.SmsSubscriber.delete(id)));
    setSubscribers(prev => prev.filter(s => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  const filtered = filter === "all" ? subscribers : subscribers.filter(s => s.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    const aVal = sortBy === "phone" ? a.phone : (a.created_date || "");
    const bVal = sortBy === "phone" ? b.phone : (b.created_date || "");
    return aVal < bVal ? sortOrder : aVal > bVal ? -sortOrder : 0;
  });

  const optedIn = subscribers.filter(s => s.status !== "opted_out").length;
  const optedOut = subscribers.filter(s => s.status === "opted_out").length;

  const exportCSV = () => {
    const headers = ["Phone", "Status", "Source", "Opted Out At", "Created Date"];
    const rows = filtered.map(s => [s.phone, s.status, s.source, s.opted_out_at, s.created_date]
      .map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `sms-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      {modal && <AddEditModal subscriber={modal.subscriber} onSave={handleSave} onClose={() => setModal(null)} />}
      {showEnrollment && (
        <CampaignEnrollmentModal
          entityIds={Array.from(selectedIds)}
          entityType="sms_subscriber"
          onClose={() => setShowEnrollment(false)}
          onComplete={() => {
            setShowEnrollment(false);
            setSelectedIds(new Set());
          }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-[#1e3a5f]">{subscribers.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{optedIn}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><UserCheck className="w-3 h-3" /> Opted In</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{optedOut}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><UserX className="w-3 h-3" /> Opted Out</div>
        </div>
      </div>

      {/* Filter + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {["all", "opted_in", "opted_out"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setSelectedIds(new Set()); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#1e3a5f] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              {f === "all" ? "All" : f === "opted_in" ? "Opted In" : "Opted Out"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
           {selectedIds.size > 0 && (
             <>
               <button
                 onClick={() => setShowEnrollment(true)}
                 className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
               >
                 <Tag className="w-3.5 h-3.5" /> Campaigns
               </button>
               <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60">
                 <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.size}
               </button>
             </>
           )}
           <button onClick={() => setModal({ subscriber: null })} className="flex items-center gap-1.5 bg-[#1e3a5f] hover:bg-[#163059] text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
             <Plus className="w-3.5 h-3.5" /> Add Number
           </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={load} className="flex items-center gap-1.5 bg-white border text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortBy("created_date")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === "created_date" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
        >
          Date {sortBy === "created_date" && (sortOrder === -1 ? "↓" : "↑")}
        </button>
        <button
          onClick={() => setSortBy("phone")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === "phone" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
        >
          Phone {sortBy === "phone" && (sortOrder === -1 ? "↓" : "↑")}
        </button>
        {(sortBy === "phone" || sortBy === "created_date") && (
          <button
            onClick={() => setSortOrder(o => -o)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border bg-white hover:bg-gray-50"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 1 ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No subscribers found.</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-6">
                  <input type="checkbox" checked={selectedIds.size === sorted.length && sorted.length > 0} onChange={e => setSelectedIds(e.target.checked ? new Set(sorted.map(s => s.id)) : new Set())} className="w-4 h-4" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cellphone</th>
                 <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Opt-In</th>
                 <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Opt-Out</th>
                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Campaigns</th>
                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                 <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(s => (
                <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(s.id) ? "bg-blue-50" : ""}`}>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={selectedIds.has(s.id)} onChange={e => { const s2 = new Set(selectedIds); e.target.checked ? s2.add(s.id) : s2.delete(s.id); setSelectedIds(s2); }} className="w-4 h-4" />
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1e3a5f]">{s.phone}</td>
                  <td className="px-4 py-3 text-center">
                    {s.status !== "opted_out" ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-gray-200">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.status === "opted_out" ? <Check className="w-4 h-4 text-red-500 mx-auto" /> : <span className="text-gray-200">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <CampaignTags entityId={s.id} entityType="sms_subscriber" />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.created_date ? new Date(s.created_date).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal({ subscriber: s })} className="text-gray-400 hover:text-[#1e3a5f] transition-colors"><Pencil className="w-4 h-4" /></button>
                      {deleteConfirm === s.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 font-semibold hover:underline">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(s.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}