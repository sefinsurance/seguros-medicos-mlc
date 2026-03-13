import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Inbox, Send, AlertCircle, List, RefreshCw, Search, Filter, X, ChevronRight, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FaxSheetComposer from "./FaxSheetComposer";
import FaxEventTimeline from "./FaxEventTimeline";

const STATUS_COLORS = {
  received: "bg-green-100 text-green-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-blue-100 text-blue-700",
  sending: "bg-blue-100 text-blue-700",
};

function FaxDetailPanel({ faxId, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faxData, setFaxData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { getAdminToken } = await import("./useAdminToken");
        const adminToken = await getAdminToken();
        const res = await base44.functions.invoke("getFaxEventTimeline", {
          adminToken,
          faxId
        });
        
        if (res.data?.error === 'Unauthorized') {
          setLoading(false);
          return;
        }
        
        if (res.data?.events) {
          setEvents(res.data.events);
          if (res.data.events.length > 0) {
            const latest = res.data.events[res.data.events.length - 1];
            setFaxData(latest);
          }
        }
      } catch (error) {
        console.error("Error loading fax timeline:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [faxId]);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Fax Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Summary */}
            {faxData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Fax ID</p>
                    <p className="font-mono text-sm text-gray-900">{faxId}</p>
                  </div>
                  {faxData.from_number && (
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-sm text-gray-900">{faxData.from_number}</p>
                    </div>
                  )}
                  {faxData.to_number && (
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="text-sm text-gray-900">{faxData.to_number}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[faxData.status] || "bg-gray-100"}`}>
                      {faxData.status}
                    </span>
                  </div>
                  {faxData.media_url && (
                    <a
                      href={faxData.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Event Timeline</h4>
            <FaxEventTimeline events={events} />
          </>
        )}
      </div>
    </div>
  );
}

export default function FaxEventDashboard() {
  const [view, setView] = useState("inbox");
  const [summary, setSummary] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDirection, setFilterDirection] = useState("all");
  const [selectedFax, setSelectedFax] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { getAdminToken } = await import("./useAdminToken");
      const adminToken = await getAdminToken();
      const res = await base44.functions.invoke("adminGetFaxEvents", {
        adminToken,
        search,
        filterStatus: view === "failed" ? "failed" : filterStatus,
        filterDirection,
        view
      });
      
      if (res.data?.error === 'Unauthorized') {
        console.error("Unauthorized access");
        setLoading(false);
        return;
      }
      
      if (res.data?.summary) {
        setSummary(res.data.summary);
        setAllEvents(res.data.allEvents);
      }
    } catch (error) {
      console.error("Error loading fax events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [view, search, filterStatus, filterDirection]);

  const getList = () => {
    if (view === "all") return allEvents;
    return summary;
  };

  const list = getList();

  return (
    <>
      {showComposer && (
        <FaxSheetComposer
          onClose={() => setShowComposer(false)}
          onFaxSent={() => load()}
        />
      )}

      {selectedFax && (
        <FaxDetailPanel faxId={selectedFax} onClose={() => setSelectedFax(null)} />
      )}

      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "inbox", label: "Inbox", icon: Inbox },
            { id: "outbound", label: "Outbound", icon: Send },
            { id: "failed", label: "Failed", icon: AlertCircle },
            { id: "all", label: "All Events", icon: List }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search fax ID, from/to number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              Send Fax
            </button>
            <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          {view !== "all" && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDirection} onValueChange={setFilterDirection}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : list.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No faxes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Fax ID</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Number</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Direction</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Pages</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map(fax => (
                    <tr
                      key={fax.id}
                      onClick={() => setSelectedFax(fax.fax_id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{fax.fax_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {fax.direction === "inbound" ? fax.from_number : fax.to_number}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          fax.direction === "inbound" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {fax.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${STATUS_COLORS[fax.status] || "bg-gray-100"}`}>
                          {fax.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{fax.page_count || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(fax.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Showing {list.length} fax{list.length !== 1 ? "es" : ""}
        </p>
      </div>
    </>
  );
}