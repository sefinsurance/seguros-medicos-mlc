import React from "react";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Calendar, User } from "lucide-react";
import CampaignTags from "./CampaignTags";

const statusColors = {
  partial_confirmed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-purple-100 text-purple-800 border-purple-200",
  closed: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels = {
  partial_confirmed: "Partial",
  completed: "Completed",
  contacted: "Contacted",
  closed: "Closed",
  archived: "Archived",
};

export default function LeadsTable({ leads, onSelect, onToggleSelect, selectedIds = new Set() }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 w-6">
                <input type="checkbox" checked={selectedIds.size === leads.length && leads.length > 0} onChange={e => {
                  if (e.target.checked) {
                    const newSelected = new Set([...selectedIds, ...leads.map(l => l.id)]);
                    leads.forEach(l => {
                      if (!selectedIds.has(l.id)) onToggleSelect(l.id);
                    });
                  } else {
                    leads.forEach(l => {
                      if (selectedIds.has(l.id)) onToggleSelect(l.id);
                    });
                  }
                }} className="w-4 h-4" />
              </th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Contact</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">ZIP</th>
              <th className="text-left px-4 py-3">Campaigns</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr
                key={lead.id}
                className={`border-b last:border-0 hover:bg-blue-50 transition-colors ${selectedIds.has(lead.id) ? "bg-blue-50" : ""}`}
              >
                <td className="px-4 py-3 text-center">
                  <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => onToggleSelect(lead.id)} onClick={e => e.stopPropagation()} className="w-4 h-4" />
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(lead)}>
                  <div className="font-semibold text-[#1e3a5f]">{lead.full_name}</div>
                  <div className="text-xs text-gray-400">{lead.lead_id}</div>
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(lead)}>
                  <div className="text-gray-700">{lead.phone}</div>
                  <div className="text-xs text-gray-400">{lead.email}</div>
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(lead)}>
                   {lead.product_type ? (
                     <span className="bg-blue-50 text-blue-700 rounded px-2 py-0.5 text-xs font-medium">{lead.product_type}</span>
                   ) : <span className="text-gray-300">—</span>}
                 </td>
                 <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => onSelect(lead)}>{lead.zip_code || "—"}</td>
                 <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                   <CampaignTags entityId={lead.id} entityType="lead" />
                 </td>
                 <td className="px-4 py-3 text-gray-500 text-xs cursor-pointer" onClick={() => onSelect(lead)}>
                   {lead.created_date ? new Date(lead.created_date).toLocaleDateString() : "—"}
                 </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(lead)}>
                  <Badge className={`${statusColors[lead.status]} border text-xs font-semibold`}>
                    {statusLabels[lead.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden grid gap-3">
        {leads.map(lead => (
          <div
            key={lead.id}
            className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-[#2563eb] transition-all ${selectedIds.has(lead.id) ? "bg-blue-50 border-blue-300" : ""}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => onToggleSelect(lead.id)} onClick={e => e.stopPropagation()} className="w-4 h-4 mt-0.5" />
                <div className="flex items-center gap-2 flex-1" onClick={() => onSelect(lead)}>
                  <div className="w-9 h-9 rounded-full bg-[#dbeafe] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#2563eb]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1e3a5f] text-sm">{lead.full_name}</div>
                    <div className="text-xs text-gray-400">{lead.lead_id}</div>
                  </div>
                </div>
              </div>
              <Badge className={`${statusColors[lead.status]} border text-xs font-semibold shrink-0`}>
                {statusLabels[lead.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 cursor-pointer" onClick={() => onSelect(lead)}>
              {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
              {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
              {lead.zip_code && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.zip_code}</span>}
              {lead.created_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(lead.created_date).toLocaleDateString()}</span>}
              {lead.product_type && <span className="bg-blue-50 text-blue-700 rounded px-2 py-0.5">{lead.product_type}</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}