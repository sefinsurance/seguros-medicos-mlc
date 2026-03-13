import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, RefreshCw, Upload, User, Calendar, Tag as TagIcon, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProspectsImportModal from "./ProspectsImportModal";

const TAG_STYLES = {
  "Active": "bg-green-100 text-green-700 border-green-300",
  "Inactive": "bg-gray-100 text-gray-700 border-gray-300",
  "Not interested": "bg-slate-100 text-slate-700 border-slate-300",
  "Wrong Number": "bg-red-100 text-red-700 border-red-300",
  "Disqualified": "bg-orange-100 text-orange-700 border-orange-300",
  "Pending": "bg-blue-100 text-blue-700 border-blue-300",
  "Future X-Date": "bg-purple-100 text-purple-700 border-purple-300",
  "Follow-up": "bg-amber-100 text-amber-700 border-amber-300",
};

function ProspectDetailPanel({ prospect, onClose, onUpdate }) {
  const [tag, setTag] = useState(prospect.tag || "");
  const [followUpDate, setFollowUpDate] = useState(prospect.follow_up_date || "");
  const [notes, setNotes] = useState(prospect.notes || "");
  const [saving, setSaving] = useState(false);

  const needsDate = tag === "Follow-up" || tag === "Future X-Date";

  const handleSave = async () => {
    setSaving(true);
    try {
      const { getAdminToken } = await import("./useAdminToken");
      const adminToken = await getAdminToken();
      const updateData = {
        tag: tag || null,
        follow_up_date: needsDate ? followUpDate : null,
        notes: notes.trim(),
      };

      const res = await base44.functions.invoke("adminUpdateProspect", {
        adminToken,
        prospectId: prospect.id,
        data: updateData,
      });

      if (res.data?.prospect) {
        onUpdate(res.data.prospect);
      }
    } catch (err) {
      alert("Session expired. Please log in again.");
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Prospect Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>

      <div className="p-5 space-y-5">
        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Contact Information
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            {prospect.full_name && <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{prospect.full_name}</span></div>}
            {prospect.phone && <div><span className="text-gray-500">Phone:</span> <a href={`tel:${prospect.phone}`} className="font-medium text-blue-600 hover:underline">{prospect.phone}</a></div>}
            {prospect.email && <div><span className="text-gray-500">Email:</span> <a href={`mailto:${prospect.email}`} className="font-medium text-blue-600 hover:underline">{prospect.email}</a></div>}
            {prospect.dob && <div><span className="text-gray-500">DOB:</span> <span className="font-medium text-gray-900">{prospect.dob}</span></div>}
            {prospect.language && <div><span className="text-gray-500">Language:</span> <span className="font-medium text-gray-900">{prospect.language}</span></div>}
          </div>
        </div>

        {/* Address */}
        {(prospect.address || prospect.city || prospect.state || prospect.zipcode) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Address</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900">
              {prospect.address && <div>{prospect.address}</div>}
              <div>
                {prospect.city && <span>{prospect.city}</span>}
                {prospect.state && <span>, {prospect.state}</span>}
                {prospect.zipcode && <span> {prospect.zipcode}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Household Info */}
        {(prospect.members || prospect.salary) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Household</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              {prospect.members && <div><span className="text-gray-500">Members:</span> <span className="font-medium text-gray-900">{prospect.members}</span></div>}
              {prospect.salary && <div><span className="text-gray-500">Income:</span> <span className="font-medium text-gray-900">{prospect.salary}</span></div>}
            </div>
          </div>
        )}

        {/* Tag Management */}
        <div className="space-y-3 border-t pt-5">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            Status Tag
          </h4>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tag..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No Tag</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Not interested">Not interested</SelectItem>
              <SelectItem value="Wrong Number">Wrong Number</SelectItem>
              <SelectItem value="Disqualified">Disqualified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Future X-Date">Future X-Date</SelectItem>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
            </SelectContent>
          </Select>

          {needsDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {tag === "Follow-up" ? "Follow-up Date" : "X-Date"}
              </label>
              <Input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">📱 Scheduled SMS will be sent on this date</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes..."
            rows={4}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || (needsDate && !followUpDate)}
          className="w-full bg-[#1e3a5f] text-white rounded-lg px-4 py-2.5 font-semibold hover:bg-[#163059] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Created {new Date(prospect.created_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function ProspectsTab() {
  const [prospects, setProspects] = useState([]);
  const [allProspects, setAllProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = async (searchTerm = "", tag = "all", searchOffset = 0) => {
    setLoading(true);
    try {
      const { getAdminToken } = await import("./useAdminToken");
      const adminToken = await getAdminToken();
      const res = await base44.functions.invoke("adminGetProspects", {
        adminToken,
        search: searchTerm,
        tagFilter: tag,
        offset: searchOffset
      });
      if (res.data?.error === 'Unauthorized' || !res.data?.prospects) {
        setProspects([]);
        setAllProspects([]);
        setLoading(false);
        return;
      }
      setProspects(res.data.prospects);
      setAllProspects(res.data.allProspects || []);
      setHasMore(res.data.hasMore);
      setOffset(searchOffset);
    } catch (error) {
      console.error('Failed to load prospects:', error);
      setProspects([]);
      setAllProspects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(search, tagFilter, 0);
  }, [search, tagFilter]);

  const handleLoadMore = () => {
    load(search, tagFilter, offset + 50);
  };

  const tagCounts = allProspects.reduce((acc, p) => {
    if (p.tag) acc[p.tag] = (acc[p.tag] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {showImport && (
        <ProspectsImportModal
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); load(); }}
        />
      )}

      {selectedProspect && (
        <ProspectDetailPanel
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onUpdate={updated => {
            setProspects(ps => ps.map(p => p.id === updated.id ? updated : p));
            setSelectedProspect(updated);
          }}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-800">Prospects</h2>
          <p className="text-xs text-gray-500 mt-0.5">Search and manage uploaded prospect data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href="data:text/csv;charset=utf-8,Full Name,Phone,Email,DOB,Address,City,State,Zipcode,Members,Salary,Language%0AJohn Doe,+1234567890,john@example.com,1980-01-15,123 Main St,New York,NY,10001,4,75000,English%0AJane Smith,+0987654321,jane@example.com,1975-05-20,456 Oak Ave,Los Angeles,CA,90001,2,85000,Spanish"
            download="sample-prospects.csv"
            className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Sample CSV
          </a>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#163059]"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Tag Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-5">
        {Object.entries(TAG_STYLES).map(([tag, style]) => (
          <div key={tag} className={`border rounded-md px-2 py-1 flex items-center justify-between ${style}`}>
            <p className="text-xs font-medium truncate">{tag}</p>
            <p className="text-lg font-bold ml-2">{tagCounts[tag] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Not interested">Not interested</SelectItem>
            <SelectItem value="Wrong Number">Wrong Number</SelectItem>
            <SelectItem value="Disqualified">Disqualified</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Future X-Date">Future X-Date</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
       <div className="text-center py-16 text-gray-400 text-sm">Loading prospects...</div>
      ) : prospects.length === 0 ? (
       <div className="text-center py-20 text-gray-400">
         <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
         <p className="text-sm font-medium">No prospects found</p>
         <p className="text-xs mt-1">Import a CSV to get started</p>
       </div>
      ) : (
       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead className="bg-gray-50 border-b border-gray-200">
               <tr>
                 <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Name</th>
                 <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Phone</th>
                 <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Email</th>
                 <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Location</th>
                 <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Tag</th>
                 <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Follow-up</th>
               </tr>
             </thead>
             <tbody>
               {prospects.map(p => (
                 <tr
                   key={p.id}
                   onClick={() => setSelectedProspect(p)}
                   className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                 >
                   <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.full_name || "—"}</td>
                   <td className="px-4 py-3 text-sm text-gray-700">{p.phone}</td>
                   <td className="px-4 py-3 text-sm text-gray-600">{p.email || "—"}</td>
                   <td className="px-4 py-3 text-xs text-gray-500">
                     {p.city && p.state ? `${p.city}, ${p.state}` : p.city || p.state || "—"}
                   </td>
                   <td className="px-4 py-3">
                     {p.tag ? (
                       <span className={`text-xs px-2 py-1 rounded-full border font-medium ${TAG_STYLES[p.tag]}`}>
                         {p.tag}
                       </span>
                     ) : (
                       <span className="text-xs text-gray-400">No tag</span>
                     )}
                   </td>
                   <td className="px-4 py-3 text-xs text-gray-500">
                     {p.follow_up_date ? (
                       <span className="flex items-center gap-1">
                         <Calendar className="w-3 h-3" />
                         {new Date(p.follow_up_date).toLocaleDateString()}
                       </span>
                     ) : "—"}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
      )}

      {hasMore && (
       <div className="text-center mt-4">
         <button onClick={handleLoadMore} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
           Load More
         </button>
       </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
       Showing {prospects.length} of {allProspects.length} prospects
      </p>
    </div>
  );
}