import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Loader2, Download, Trash2, ChevronDown } from "lucide-react";
import LeadDetailPanel from "@/components/admin/LeadDetailPanel";
import StatsBar from "@/components/admin/StatsBar";
import LeadsTable from "@/components/admin/LeadsTable";
import AdminLoginGate from "@/components/admin/AdminLoginGate";
import SmsSubscribersTab from "@/components/admin/SmsSubscribersTab";
import SmsCampaignsTab from "@/components/admin/SmsCampaignsTab";
import EmailCampaignsTab from "@/components/admin/EmailCampaignsTab";
import FaxTab from "@/components/admin/FaxTab";
import BulkStatusToolbar from "@/components/admin/BulkStatusToolbar";
import BrokerApplicationsTab from "@/components/admin/BrokerApplicationsTab";
import NotificationBell from "@/components/admin/NotificationBell";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("mlc_admin_auth") === "1");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_date"); // "created_date" | "full_name"
  const [sortOrder, setSortOrder] = useState(-1); // 1 = asc, -1 = desc
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    if (authed) loadLeads();
  }, [authed]);

  const exportCSV = () => {
    const headers = ["Lead ID","Full Name","Date of Birth","Phone","Email","ZIP Code","Product Type","Status","CTA Source","Source Page","Language","Preferred Language","Household Size","Est. Income","Best Time to Call","Contact Method","SMS Sent","Notes","Internal Notes","Created Date"];
    const rows = filtered.map(l => [
      l.lead_id, l.full_name, l.date_of_birth, l.phone, l.email, l.zip_code,
      l.product_type, l.status, l.cta_source, l.source_page, l.language_selected,
      l.preferred_language, l.household_size, l.estimated_income,
      l.best_time_to_call, l.preferred_contact_method, l.sms_sent,
      l.notes, l.internal_notes, l.created_date
    ].map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`));

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mlc-leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadLeads = async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 200);
    setLeads(data);
    setLoading(false);
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || [l.full_name, l.email, l.phone, l.zip_code, l.lead_id]
      .some(v => v && v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchProduct = productFilter === "all" || l.product_type === productFilter;
    return matchSearch && matchStatus && matchProduct;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = sortBy === "full_name" ? a.full_name : (a.created_date || "");
    const bVal = sortBy === "full_name" ? b.full_name : (b.created_date || "");
    return aVal < bVal ? sortOrder : aVal > bVal ? -sortOrder : 0;
  });

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} lead(s)?`)) return;
    setBulkDeleting(true);
    await Promise.all([...selectedIds].map(id => base44.entities.Lead.delete(id)));
    setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  const handleBulkStatusComplete = async () => {
    setSelectedIds(new Set());
    await loadLeads();
  };

  if (!authed) {
    return <AdminLoginGate onAuthenticated={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">MLC Insurance — Leads Dashboard</h1>
          <p className="text-blue-200 text-sm">{leads.length} total leads captured</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell onNavigate={(tab) => setActiveTab(tab)} />
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={loadLeads}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="flex gap-0">
          {[{ id: "leads", label: "Leads" }, { id: "sms", label: "SMS Subscribers" }, { id: "campaigns", label: "SMS Campaigns" }, { id: "email", label: "Email Campaigns" }, { id: "fax", label: "Fax" }, { id: "brokers", label: "Broker Applications" }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-[#1e3a5f] text-[#1e3a5f]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "sms" ? (
        <div className="p-4 md:p-6"><SmsSubscribersTab /></div>
      ) : activeTab === "campaigns" ? (
        <div className="p-4 md:p-6"><SmsCampaignsTab /></div>
      ) : activeTab === "email" ? (
        <div className="p-4 md:p-6"><EmailCampaignsTab /></div>
      ) : activeTab === "fax" ? (
        <div className="p-4 md:p-6"><FaxTab /></div>
      ) : activeTab === "brokers" ? (
        <div className="p-4 md:p-6"><BrokerApplicationsTab /></div>
      ) : (
      <div className="p-4 md:p-6">
        <StatsBar leads={leads} />

        {selectedIds.size > 0 && (
          <BulkStatusToolbar selectedIds={selectedIds} onComplete={handleBulkStatusComplete} />
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-5">
         <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input
               placeholder="Search by name, email, phone, ZIP..."
               value={search}
               onChange={e => { setSearch(e.target.value); setSelectedIds(new Set()); }}
               className="pl-9"
             />
           </div>
           <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setSelectedIds(new Set()); }}>
             <SelectTrigger className="w-full sm:w-44">
               <SelectValue placeholder="All Statuses" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Statuses</SelectItem>
               <SelectItem value="partial_confirmed">Partial</SelectItem>
               <SelectItem value="completed">Completed</SelectItem>
               <SelectItem value="contacted">Contacted</SelectItem>
               <SelectItem value="closed">Closed</SelectItem>
               <SelectItem value="archived">Archived</SelectItem>
             </SelectContent>
           </Select>
           <Select value={productFilter} onValueChange={(v) => { setProductFilter(v); setSelectedIds(new Set()); }}>
             <SelectTrigger className="w-full sm:w-52">
               <SelectValue placeholder="All Products" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Products</SelectItem>
               <SelectItem value="ACA / Obamacare">ACA / Obamacare</SelectItem>
               <SelectItem value="Medicare Advantage">Medicare Advantage</SelectItem>
               <SelectItem value="Life Insurance">Life Insurance</SelectItem>
               <SelectItem value="Dental & Vision">Dental & Vision</SelectItem>
             </SelectContent>
           </Select>
         </div>

         {/* Sort + Bulk Actions */}
         <div className="flex gap-2 flex-wrap items-center">
           <button
             onClick={() => setSortBy("created_date")}
             className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === "created_date" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
           >
             Date {sortBy === "created_date" && (sortOrder === -1 ? "↓" : "↑")}
           </button>
           <button
             onClick={() => setSortBy("full_name")}
             className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === "full_name" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
           >
             Name {sortBy === "full_name" && (sortOrder === -1 ? "↓" : "↑")}
           </button>
           {(sortBy === "full_name" || sortBy === "created_date") && (
             <button
               onClick={() => setSortOrder(o => -o)}
               className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border bg-white hover:bg-gray-50"
             >
               <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 1 ? "rotate-180" : ""}`} />
             </button>
           )}
           {selectedIds.size > 0 && (
             <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ml-auto">
               <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.size}
             </button>
           )}
         </div>
        </div>

        {!loading && (
          <p className="text-xs text-gray-400 mb-3">
            Showing {filtered.length} of {leads.length} leads
          </p>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No leads found.</div>
        ) : (
          <LeadsTable leads={sorted} onSelect={setSelected} onToggleSelect={(id) => { const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s); }} selectedIds={selectedIds} />
        )}
      </div>
      )}

      {selected && (
        <LeadDetailPanel
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdate={updated => {
            setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}