import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { MessageSquare, UserCheck, UserX, RefreshCw, Download, Plus, Pencil, Trash2, X, Check, ChevronDown, Tag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CampaignTags from "./CampaignTags";
import CampaignEnrollmentModal from "./CampaignEnrollmentModal";

const TAG_STYLES = {
  "STOP":              "bg-red-100 text-red-700 border-red-300",
  "Active":            "bg-green-100 text-green-700 border-green-300",
  "Inactive":          "bg-gray-100 text-gray-700 border-gray-300",
  "Disqualified":      "bg-orange-100 text-orange-700 border-orange-300",
  "Pending Follow Up": "bg-blue-100 text-blue-700 border-blue-300",
  "Future X-Date":     "bg-purple-100 text-purple-700 border-purple-300",
};

function AddTagModal({ onSaved, onClose }) {
  const [phone, setPhone]   = useState("");
  const [tag, setTag]       = useState("");
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !tag) return;
    setSaving(true);
    try {
      await adminApi.createSmsTag({ phone: phone.trim(), tag, notes: notes.trim(), tagged_date: new Date().toISOString() });
      onSaved();
    } catch (err) {
      console.error("Failed to create tag:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add SMS Response Tag</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <Select value={tag} onValueChange={setTag} required>
              <SelectTrigger><SelectValue placeholder="Select tag..." /></SelectTrigger>
              <SelectContent>{Object.keys(TAG_STYLES).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional context..." rows={3} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving || !phone || !tag} className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#163059] disabled:opacity-50">
              {saving ? "Saving..." : "Add Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddEditModal({ subscriber, onSave, onClose }) {
  const [phone, setPhone]   = useState(subscriber?.phone || "");
  const [status, setStatus] = useState(subscriber?.status || "opted_in");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!phone.trim()) return;
    setSaving(true);
    try {
      let saved;
      if (subscriber?.id) {
        saved = await adminApi.updateSmsSubscriber(subscriber.id, { phone, status });
      } else {
        saved = await adminApi.createSmsSubscriber({ phone, status, source: "manual" });
      }
      onSave(saved?.subscriber || saved || { ...subscriber, phone, status });
    } catch (err) {
      console.error("Failed to save subscriber:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
      onClose();
    }
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
              {[{ id: "opted_in", label: "Opted In", active: "bg-green-600 text-white border-green-600" },
                { id: "opted_out", label: "Opted Out", active: "bg-red-500 text-white border-red-500" }].map(opt => (
                <button key={opt.id} onClick={() => setStatus(opt.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${status === opt.id ? opt.active : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                  {opt.label}
                </button>
              ))}
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
  const [subscribers, setSubscribers]   = useState([]);
  const [tags, setTags]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tagsLoading, setTagsLoading]   = useState(true);
  const [filter, setFilter]             = useState("all");
  const [sortBy, setSortBy]             = useState("created_date");
  const [sortOrder, setSortOrder]       = useState(-1);
  const [modal, setModal]               = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [activeView, setActiveView]     = useState("subscribers");
  const [search, setSearch]             = useState("");
  const [tagSearch, setTagSearch]       = useState("");
  const [offset, setOffset]             = useState(0);
  const [hasMore, setHasMore]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async (newSearch = search, newStatus = statusFilter, newOffset = 0) => {
    if (newOffset === 0) setLoading(true);
    try {
      const data = await adminApi.getSmsSubscribers({ search: newSearch, statusFilter: newStatus, offset: newOffset, limit: 50 });
      const items = Array.isArray(data) ? data : (data.subscribers || []);
      const more  = data.hasMore ?? false;
      if (newOffset === 0) setSubscribers(items);
      else setSubscribers(prev => [...prev, ...items]);
      setHasMore(more);
      setOffset(newOffset);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
      if (newOffset === 0) setSubscribers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await load(search, statusFilter, offset + 50);
  };

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const data = await adminApi.getSmsTags({ limit: 200 });
      setTags(Array.isArray(data) ? data : (data.tags || []));
    } catch (err) {
      console.error("Failed to load SMS tags:", err);
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await adminApi.deleteSmsTag(id);
      setTags(t => t.filter(tag => tag.id !== id));
    } catch (err) {
      console.error("Failed to delete tag:", err);
    }
  };

  useEffect(() => { load(); loadTags(); }, []);

  const handleSave = (saved) => {
    setSubscribers(prev => {
      const exists = prev.find(s => s.id === saved.id);
      return exists ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev];
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteSmsSubscriber(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} subscriber(s)?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map(id => adminApi.deleteSmsSubscriber(id)));
      setSubscribers(prev => prev.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const sorted = [...subscribers].sort((a, b) => {
    const aVal = sortBy === "phone" ? a.phone : (a.created_date || "");
    const bVal = sortBy === "phone" ? b.phone : (b.created_date || "");
    return aVal < bVal ? sortOrder : aVal > bVal ? -sortOrder : 0;
  });

  const filteredTags = tags.filter(t =>
    !tagSearch || t.phone?.includes(tagSearch) || t.notes?.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const optedIn  = subscribers.filter(s => s.status !== "opted_out").length;
  const optedOut = subscribers.filter(s => s.status === "opted_out").length;

  const tagCounts = tags.reduce((acc, t) => { acc[t.tag] = (acc[t.tag] || 0) + 1; return acc; }, {});

  const exportCSV = () => {
    const headers = ["Phone", "Status", "Source", "Opted Out At", "Created Date"];
    const rows = subscribers.map(s => [s.phone, s.status, s.source, s.opted_out_at, s.created_date]
      .map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `sms-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      {modal && <AddEditModal subscriber={modal.subscriber} onSave={handleSave} onClose={() => setModal(null)} />}
      {showTagModal && <AddTagModal onSaved={() => { setShowTagModal(false); loadTags(); }} onClose={() => setShowTagModal(false)} />}
      {showEnrollment && (
        <CampaignEnrollmentModal
          entityIds={Array.from(selectedIds)} entityType="sms_subscriber"
          onClose={() => setShowEnrollment(false)}
          onComplete={() => { setShowEnrollment(false); setSelectedIds(new Set()); }}
        />
      )}

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id: "subscribers", label: "SMS Subscribers" }, { id: "tags", label: "Response Tags" }].map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === v.id ? "bg-[#1e3a5f] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {v.label}
          </button>
        ))}
      </div>

      {activeView === "tags" ? (
        <div>
          {/* Tag Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
            {Object.entries(TAG_STYLES).map(([tag, style]) => (
              <div key={tag} className={`border rounded-lg px-3 py-2 ${style}`}>
                <p className="text-xs font-medium opacity-80">{tag}</p>
                <p className="text-xl font-bold mt-0.5">{tagCounts[tag] || 0}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by phone or notes..." value={tagSearch} onChange={e => setTagSearch(e.target.value)} className="pl-9" />
            </div>
            <button onClick={loadTags} className="flex items-center gap-1.5 bg-white border text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => setShowTagModal(true)} className="flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#163059]">
              <Plus className="w-4 h-4" /> Add Tag
            </button>
          </div>
          {tagsLoading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading tags...</div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-20 text-gray-400"><Tag className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No tags found</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Phone", "Tag", "Notes", "Date", "Actions"].map(h => (
                      <th key={h} className={`text-xs font-semibold text-gray-600 px-4 py-3 ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.phone}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full border font-medium ${TAG_STYLES[t.tag]}`}>{t.tag}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.notes || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(t.tagged_date || t.created_date || t.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteTag(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[{ label: "Total", val: subscribers.length, cls: "text-[#1e3a5f]" },
              { label: "Opted In", val: optedIn, cls: "text-green-600", icon: UserCheck },
              { label: "Opted Out", val: optedOut, cls: "text-red-500", icon: UserX }].map(s => (
              <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
                <div className={`text-2xl font-bold ${s.cls}`}>{s.val}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                  {s.icon && <s.icon className="w-3 h-3" />}{s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by phone number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {["all", "opted_in", "opted_out"].map(f => (
                <button key={f} onClick={() => { setStatusFilter(f); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? "bg-[#1e3a5f] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
                  {f === "all" ? "All" : f === "opted_in" ? "Opted In" : "Opted Out"}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div />
            <div className="flex gap-2 flex-wrap">
              {selectedIds.size > 0 && (
                <>
                  <button onClick={() => setShowEnrollment(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
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
              <button onClick={() => load(search, statusFilter, 0)} className="flex items-center gap-1.5 bg-white border text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2 mb-4">
            {[{ id: "created_date", label: "Date" }, { id: "phone", label: "Phone" }].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === s.id ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
                {s.label} {sortBy === s.id && (sortOrder === -1 ? "↓" : "↑")}
              </button>
            ))}
            <button onClick={() => setSortOrder(o => -o)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border bg-white hover:bg-gray-50">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 1 ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No subscribers found.</div>
          ) : (
            <div>
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-6">
                        <input type="checkbox" checked={selectedIds.size === subscribers.length && subscribers.length > 0}
                          onChange={e => setSelectedIds(e.target.checked ? new Set(subscribers.map(s => s.id)) : new Set())} className="w-4 h-4" />
                      </th>
                      {["Cellphone", "", "", "Campaigns", "Date", "Actions"].map((h, i) => (
                        <th key={i} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase ${i <= 2 ? (i === 0 ? "text-left" : "text-center") : "text-left"} ${i === 5 ? "text-right" : ""}`}>
                          {h || (i === 1 ? "Opt-In" : i === 2 ? "Opt-Out" : "")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sorted.map(s => (
                      <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(s.id) ? "bg-blue-50" : ""}`}>
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" checked={selectedIds.has(s.id)}
                            onChange={e => { const s2 = new Set(selectedIds); e.target.checked ? s2.add(s.id) : s2.delete(s.id); setSelectedIds(s2); }} className="w-4 h-4" />
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1e3a5f]">{s.phone}</td>
                        <td className="px-4 py-3 text-center">{s.status !== "opted_out" ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <span className="text-gray-200">—</span>}</td>
                        <td className="px-4 py-3 text-center">{s.status === "opted_out" ? <Check className="w-4 h-4 text-red-500 mx-auto" /> : <span className="text-gray-200">—</span>}</td>
                        <td className="px-4 py-3"><CampaignTags entityId={s.id} entityType="sms_subscriber" /></td>
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
              {hasMore && (
                <div className="text-center mt-4">
                  <button onClick={loadMore} disabled={loadingMore} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
