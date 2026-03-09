import React, { useState, useEffect, useRef } from "react";
import { Bell, Users, Briefcase, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "mlc_notif_last_seen";

export default function NotificationBell({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ leads: 0, brokers: 0, faxes: 0 });
  const [lastSeen, setLastSeen] = useState(() => localStorage.getItem(STORAGE_KEY) || new Date(0).toISOString());
  const ref = useRef(null);

  useEffect(() => {
    fetchCounts();
  }, [lastSeen]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchCounts = async () => {
    const [leads, brokers, faxes] = await Promise.all([
      base44.entities.Lead.list("-created_date", 200),
      base44.entities.BrokerApplication.list("-created_date", 100),
      base44.entities.ReceivedFax.list("-created_date", 100),
    ]);
    const since = new Date(lastSeen);
    setCounts({
      leads: leads.filter(l => new Date(l.created_date) > since).length,
      brokers: brokers.filter(b => b.status === "new" && new Date(b.created_date) > since).length,
      faxes: faxes.filter(f => f.status === "received" && new Date(f.created_date) > since).length,
    });
  };

  const total = counts.leads + counts.brokers + counts.faxes;

  const dismiss = () => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, now);
    setLastSeen(now);
    setCounts({ leads: 0, brokers: 0, faxes: 0 });
    setOpen(false);
  };

  const items = [
    { key: "leads", icon: Users, label: "New Leads", count: counts.leads, tab: "leads" },
    { key: "brokers", icon: Briefcase, label: "Broker Applications", count: counts.brokers, tab: "brokers" },
    { key: "faxes", icon: FileText, label: "Received Faxes", count: counts.faxes, tab: "fax" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Bell className="w-4 h-4 text-white" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-[#1e3a5f]">Notifications</span>
            {total > 0 && (
              <button onClick={dismiss} className="text-xs text-blue-500 hover:text-blue-700 transition-colors font-medium">
                Mark all read
              </button>
            )}
          </div>

          {total === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">All caught up!</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {items.filter(i => i.count > 0).map(({ key, icon: Icon, label, count, tab }) => (
                <button
                  key={key}
                  onClick={() => { onNavigate(tab); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#1e3a5f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{count} {label}</p>
                    <p className="text-xs text-gray-400">Since your last visit</p>
                  </div>
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}