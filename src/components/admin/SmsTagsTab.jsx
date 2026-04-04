import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { Plus, Tag, Trash2, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TAG_STYLES = {
  "STOP":              "bg-red-100 text-red-700 border-red-300",
  "Active":            "bg-green-100 text-green-700 border-green-300",
  "Inactive":          "bg-gray-100 text-gray-700 border-gray-300",
  "Disqualified":      "bg-orange-100 text-orange-700 border-orange-300",
  "Pending Follow Up": "bg-blue-100 text-blue-700 border-blue-300",
  "Future X-Date":     "bg-purple-100 text-purple-700 border-purple-300",
};

function AddTagModal({ onClose, onSaved }) {
  const [phone, setPhone]   = useState("");
  const [tag, setTag]       = useState("");
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !tag) return;
    setSaving(true);
    try {
      await adminApi.createSmsTag({
        phone: phone.trim(),
        tag,
        notes: notes.trim(),
        tagged_date: new Date().toISOString(),
      });
      onSaved();
    } catch (err) {
      console.error("Failed to create tag:", err);
      alert("Failed to add tag. Please try again.");
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
              <SelectContent>
                {Object.keys(TAG_STYLES).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
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

export default function SmsTagsTab() {
  const [tags, setTags]         = useState([]);
  const [allTags, setAllTags]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch]     = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [offset, setOffset]     = useState(0);
  const [hasMore, setHasMore]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (newSearch = search, newFilter = tagFilter, newOffset = 0) => {
    if (newOffset === 0) setLoading(true);
    try {
      const data = await adminApi.getSmsTags({ search: newSearch, tagFilter: newFilter, offset: newOffset, limit: 50 });
      const items = Array.isArray(data) ? data : (data.tags || []);
      const more  = data.hasMore ?? false;
      if (newOffset === 0) {
        setTags(items);
        setAllTags(items);
      } else {
        setTags(prev => [...prev, ...items]);
        setAllTags(prev => [...prev, ...items]);
      }
      setHasMore(more);
      setOffset(newOffset);
    } catch (err) {
      console.error("Failed to load SMS tags:", err);
      if (newOffset === 0) setTags([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { load(search, tagFilter, 0); }, [search, tagFilter]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await load(search, tagFilter, offset + 50);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await adminApi.deleteSmsTag(id);
      setTags(t => t.filter(tag => tag.id !== id));
    } catch (err) {
      console.error("Failed to delete tag:", err);
    }
  };

  const tagCounts = allTags.reduce((acc, t) => { acc[t.tag] = (acc[t.tag] || 0) + 1; return acc; }, {});

  return (
    <div>
      {showAddModal && (
        <AddTagModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); load(); }}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-800">SMS Response Tags</h2>
          <p className="text-xs text-gray-500 mt-0.5">Tag numbers based on responses from your external system</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#163059]">
            <Plus className="w-4 h-4" />Add Tag
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {Object.entries(TAG_STYLES).map(([tag, style]) => (
          <div key={tag} className={`border rounded-lg px-3 py-1.5 ${style} flex items-center justify-between`}>
            <p className="text-xs font-medium">{tag}</p>
            <p className="text-lg font-bold">{tagCounts[tag] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by phone or notes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Tags" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {Object.keys(TAG_STYLES).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No tags found</p>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Tag</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Notes</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-600 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${TAG_STYLES[t.tag]}`}>{t.tag}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.notes || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(t.tagged_date || t.created_date || t.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
  );
}
