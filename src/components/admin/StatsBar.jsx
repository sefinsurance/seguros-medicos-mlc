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
        <div key={key} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <div className={`text-2xl font-extrabold ${color}`}>{counts[key]}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}