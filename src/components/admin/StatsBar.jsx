import React from "react";
import { Users, Clock, PhoneCall, CheckCircle } from "lucide-react";

const stats = [
  { key: "all", label: "Total Leads", icon: Users, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  { key: "partial_confirmed", label: "Partial", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  { key: "contacted", label: "Contacted", icon: PhoneCall, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "closed", label: "Closed", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
];

export default function StatsBar({ leads }) {
  const counts = {
    all: leads.length,
    partial_confirmed: leads.filter(l => l.status === "partial_confirmed").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    closed: leads.filter(l => l.status === "closed").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="bg-white rounded-lg px-3 py-2 shadow-sm border flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`text-lg font-bold ${color}`}>{counts[key]}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}