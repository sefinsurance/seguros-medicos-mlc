import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Inbox, Send, RefreshCw, FileText, ExternalLink,
  AlertCircle, RotateCcw, ChevronRight, X
} from "lucide-react";

function formatDate(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateFull(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const inboxStatusStyle = {
  received: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const outboxStatusStyle = {
  queued: "bg-gray-100 text-gray-600",
  sending: "bg-yellow-100 text-yellow-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function DetailRow({ label, value, link }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
      {link
        ? <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"><ExternalLink className="w-3.5 h-3.5" />{value}</a>
        : <span className="text-sm text-gray-800">{value}</span>}
    </div>
  );
}

function InboxDetail({ fax, onClose, onRetry, retrying }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-[#1e3a5f]">Received Fax</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        <DetailRow label="Timestamp" value={formatDateFull(fax.received_at)} />
        <DetailRow label="From Number" value={fax.from_number} />
        <DetailRow label="Pages" value={fax.pages} />
        <DetailRow label="File" value={fax.pdf_url ? "View PDF" : null} link={fax.pdf_url} />
        <DetailRow label="Delivered To" value={fax.routed_email} />
        <DetailRow label="Status" value={
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inboxStatusStyle[fax.status] || "bg-gray-100 text-gray-600"}`}>
            {fax.status || "received"}
          </span>
        } />
      </div>
    </div>
  );
}

function OutboxDetail({ fax, onClose, onRetry, retrying }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-[#1e3a5f]">Sent Fax</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        <DetailRow label="Timestamp" value={formatDateFull(fax.sent_at)} />
        <DetailRow label="To Number" value={fax.to_number} />
        <DetailRow label="Sender Email" value={fax.sender_email} />
        <DetailRow label="Filename" value={fax.attachment_url ? fax.attachment_name || "View File" : fax.attachment_name} link={fax.attachment_url || null} />
        <DetailRow label="Status" value={
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${outboxStatusStyle[fax.status] || "bg-gray-100 text-gray-600"}`}>
            {fax.status || "—"}
          </span>
        } />
        <DetailRow label="Telnyx Fax ID" value={fax.telnyx_fax_id} />
        {fax.error_message && (
          <div className="flex items-start gap-2 mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700 mb-0.5">Failure Reason</p>
              <p className="text-sm text-red-600">{fax.error_message}</p>
            </div>
          </div>
        )}
        {fax.status === "sent" && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-semibold text-green-800 text-sm">Fax Delivered Successfully</span>
            </div>
            <div className="text-xs text-green-700 space-y-1 ml-8">
              <p>Delivered to: <span className="font-mono font-semibold">{fax.to_number}</span></p>
              {fax.sent_at && <p>Confirmed at: <span className="font-semibold">{formatDateFull(fax.sent_at)}</span></p>}
              {fax.telnyx_fax_id && <p>Telnyx ID: <span className="font-mono">{fax.telnyx_fax_id}</span></p>}
            </div>
          </div>
        )}
        {fax.status === "failed" && (
          <div className="pt-3">
            <button
              onClick={() => onRetry(fax)}
              disabled={retrying === fax.id}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            >
              <RotateCcw className="w-4 h-4" />
              {retrying === fax.id ? "Retrying..." : "Retry Fax"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FaxTab() {
  const [view, setView] = useState("inbox"); // "inbox" | "outbox"
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [retrying, setRetrying] = useState(null);

  const load = async () => {
    setLoading(true);
    const adminToken = localStorage.getItem("mlc_admin_token") || "";
    
    if (!adminToken) {
      setReceived([]);
      setSent([]);
      setLoading(false);
      return;
    }

    try {
      const res = await base44.functions.invoke("adminGetFaxRecords", { adminToken });
      if (res.data?.error === 'Unauthorized' || !res.data?.received || !res.data?.sent) {
        setReceived([]);
        setSent([]);
        setLoading(false);
        return;
      }
      setReceived(res.data.received);
      setSent(res.data.sent);
    } catch (error) {
      console.error("Error loading fax records:", error);
      setReceived([]);
      setSent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRetry = async (fax) => {
    setRetrying(fax.id);
    const adminToken = localStorage.getItem("mlc_admin_token") || "";
    await base44.functions.invoke("adminUpdateSentFax", { 
      adminToken, 
      faxId: fax.id, 
      updates: { status: "queued", error_message: "" } 
    });
    await load();
    setRetrying(null);
  };

  const handleViewSwitch = (v) => { setView(v); setSelected(null); };

  const list = view === "inbox" ? received : sent;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm font-medium">
          <button
            onClick={() => handleViewSwitch("inbox")}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${view === "inbox" ? "bg-[#1e3a5f] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <Inbox className="w-4 h-4" /> Fax Inbox
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${view === "inbox" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{received.length}</span>
          </button>
          <button
            onClick={() => handleViewSwitch("outbox")}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${view === "outbox" ? "bg-[#1e3a5f] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <Send className="w-4 h-4" /> Fax Outbox
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${view === "outbox" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{sent.length}</span>
          </button>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading fax records…</div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* List pane */}
          <div className={`flex flex-col border-r border-gray-100 overflow-y-auto ${selected ? "hidden md:flex md:w-80 lg:w-96" : "w-full"}`}>
            {list.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 py-16">
                <FileText className="w-8 h-8 opacity-30" />
                <p className="text-sm">{view === "inbox" ? "No received faxes yet." : "No sent faxes yet."}</p>
              </div>
            ) : list.map(fax => {
              const isInbox = view === "inbox";
              const status = fax.status;
              const statusStyle = isInbox ? inboxStatusStyle[status] : outboxStatusStyle[status];
              const primary = isInbox ? fax.from_number : fax.to_number;
              const secondary = isInbox ? (fax.routed_email || "—") : (fax.sender_email || "—");
              const meta = isInbox
                ? `${fax.pages ?? "?"} page${fax.pages !== 1 ? "s" : ""}`
                : (fax.attachment_name || fax.telnyx_fax_id || "—");
              const ts = isInbox ? fax.received_at : fax.sent_at;
              const isSelected = selected?.id === fax.id;

              return (
                <button
                  key={fax.id}
                  onClick={() => setSelected(fax)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors ${isSelected ? "bg-blue-50 border-l-2 border-l-[#1e3a5f]" : "hover:bg-gray-50"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${isInbox ? "bg-[#1e3a5f]" : "bg-slate-500"}`}>
                    {isInbox ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-gray-800 font-mono truncate">{primary || "—"}</span>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(ts)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 truncate">{secondary}</span>
                      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyle || "bg-gray-100 text-gray-500"}`}>{status || "—"}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{meta}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Detail pane */}
          {selected && (
            <div className="flex-1 overflow-y-auto">
              {view === "inbox"
                ? <InboxDetail fax={selected} onClose={() => setSelected(null)} />
                : <OutboxDetail fax={selected} onClose={() => setSelected(null)} onRetry={handleRetry} retrying={retrying} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}