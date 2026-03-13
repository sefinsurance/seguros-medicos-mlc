import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Clock, XCircle, PhoneCall, Mail, MapPin, Briefcase, ChevronRight } from "lucide-react";

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
};

export default function BrokerApplicationsTab() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
   setLoading(true);
   try {
     const { getAdminToken } = await import("./useAdminToken");
     const adminToken = await getAdminToken();
     const res = await base44.functions.invoke("adminGetBrokerApplications", { adminToken });
     if (res.data?.error === 'Unauthorized' || !res.data?.applications) {
       setApps([]);
       setLoading(false);
       return;
     }
     setApps(res.data.applications);
   } catch (err) {
     console.error('Failed to load broker applications:', err);
     setApps([]);
   } finally {
     setLoading(false);
   }
  };

  const updateStatus = async (app, status) => {
    setSaving(true);
    const { getAdminToken } = await import("./useAdminToken");
    const adminToken = await getAdminToken();
    const res = await base44.functions.invoke("adminUpdateBrokerApplication", { 
      adminToken, 
      applicationId: app.id, 
      status 
    });
    if (res.data?.application) {
      setApps(prev => prev.map(a => a.id === res.data.application.id ? res.data.application : a));
      setSelected(res.data.application);
    }
    setSaving(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="flex h-[calc(100vh-140px)] gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* List */}
      <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applications ({apps.length})</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
          ) : apps.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No applications yet.</div>
          ) : apps.map(app => (
            <button
              key={app.id}
              onClick={() => setSelected(app)}
              className={`w-full text-left px-4 py-3.5 hover:bg-blue-50 transition-colors ${selected?.id === app.id ? "bg-blue-50 border-l-2 border-[#1e3a5f]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-[#1e3a5f] truncate">{app.full_name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[app.status]?.color || "bg-gray-100 text-gray-500"}`}>
                  {statusConfig[app.status]?.label || app.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 truncate">{app.email}</div>
              <div className="text-xs text-gray-400 mt-0.5">{formatDate(app.created_date)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Briefcase className="w-10 h-10 opacity-30" />
            <p className="text-sm">Select an application to view details</p>
          </div>
        ) : (
          <div className="p-6 max-w-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">{selected.full_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Applied {formatDate(selected.created_date)}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusConfig[selected.status]?.color || "bg-gray-100 text-gray-500"}`}>
                {statusConfig[selected.status]?.label || selected.status}
              </span>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <a href={`tel:${selected.phone}`} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:bg-blue-50 transition-colors text-sm text-[#1e3a5f]">
                <PhoneCall className="w-4 h-4 shrink-0" /> {selected.phone}
              </a>
              <a href={`mailto:${selected.email}`} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:bg-blue-50 transition-colors text-sm text-[#1e3a5f] truncate">
                <Mail className="w-4 h-4 shrink-0" /> {selected.email}
              </a>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 mb-6">
              {[
                { label: "State", value: selected.state },
                { label: "Years of Experience", value: selected.years_experience },
                { label: "License Types", value: selected.license_types },
                { label: "Carriers", value: selected.carriers },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex items-start px-4 py-3 gap-4">
                  <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-gray-700">{value}</span>
                </div>
              ) : null)}
            </div>

            {selected.message && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  {selected.message}
                </div>
              </div>
            )}

            {/* Status Actions */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    disabled={saving || selected.status === key}
                    onClick={() => updateStatus(selected, key)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${selected.status === key ? cfg.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}