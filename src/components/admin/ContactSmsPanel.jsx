import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { Send, Clock, RefreshCw, MessageSquare, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp, Plus } from "lucide-react";

const TYPE_LABELS = {
  initial_contact: { label: "Initial Contact", color: "bg-blue-100 text-blue-700"   },
  follow_up:       { label: "Follow-up",        color: "bg-amber-100 text-amber-700" },
  x_date_reminder: { label: "X-Date Reminder",  color: "bg-purple-100 text-purple-700" },
  callback:        { label: "Callback",          color: "bg-green-100 text-green-700" },
  general:         { label: "General",           color: "bg-gray-100 text-gray-600"  },
};

const SAMPLE_TEMPLATES = [
  {
    name: "Initial Contact",
    message_type: "initial_contact",
    description: "First outreach to a new lead",
    message_template: "Hi {{name}}, this is MLC Insurance reaching out. We received your request for a quote and would love to help you find the best coverage. When is a good time to chat? Call us at (877) 458-2557.",
  },
  {
    name: "Follow-up Reminder",
    message_type: "follow_up",
    description: "Follow up after initial contact",
    message_template: "Hi {{name}}, just following up from MLC Insurance! We wanted to make sure you got the information you needed. Feel free to reply or call us at (877) 458-2557 — we're happy to help!",
  },
  {
    name: "X-Date Reminder",
    message_type: "x_date_reminder",
    description: "Remind contact of upcoming plan renewal",
    message_template: "Hi {{name}}, your health insurance plan renewal is coming up soon! Now is a great time to review your options. Contact MLC Insurance at (877) 458-2557 or reply to this message.",
  },
  {
    name: "Callback Scheduled",
    message_type: "callback",
    description: "Confirm a scheduled callback",
    message_template: "Hi {{name}}, this is MLC Insurance confirming your callback appointment. We'll be reaching out shortly. If you need to reschedule, please reply or call (877) 458-2557.",
  },
];

export default function ContactSmsPanel({ contactPhone, contactName, followUpDate }) {
  const [templates, setTemplates]           = useState([]);
  const [smsLog, setSmsLog]                 = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingLog, setLoadingLog]         = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage]   = useState("");
  const [sendMode, setSendMode]             = useState("now");
  const [scheduledAt, setScheduledAt]       = useState(followUpDate ? `${followUpDate}T09:00` : "");
  const [sending, setSending]               = useState(false);
  const [result, setResult]                 = useState(null);
  const [showHistory, setShowHistory]       = useState(true);
  const [seedingTemplates, setSeedingTemplates] = useState(false);
  const [filterType, setFilterType]         = useState("all");

  useEffect(() => {
    loadTemplates();
    if (contactPhone) loadHistory();
  }, [contactPhone]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await adminApi.getSmsTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error("Failed to load SMS templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadHistory = async () => {
    setLoadingLog(true);
    try {
      // Server filters by phone via contact_id; fall back to client-side phone match
      // if the server returns all logs and we need to filter
      const normalized = (contactPhone || "").replace(/\D/g, "");
      const all = await adminApi.getSmsLogs({ limit: 200 });
      const logs = Array.isArray(all) ? all : [];
      const matches = logs.filter(s => {
        const p = (s.recipient_phone || "").replace(/\D/g, "");
        return p.endsWith(normalized) || normalized.endsWith(p);
      });
      setSmsLog(matches);
    } catch (err) {
      console.error("Failed to load SMS history:", err);
    } finally {
      setLoadingLog(false);
    }
  };

  const applyTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    const msg = (tpl.message_template || "")
      .replace(/\{\{name\}\}/g, contactName || "there")
      .replace(/\{\{phone\}\}/g, contactPhone || "");
    setCustomMessage(msg);
  };

  const handleSend = async () => {
    if (!customMessage.trim() || !contactPhone) return;
    setSending(true);
    setResult(null);
    try {
      const payload = {
        phone: contactPhone,
        contactName,
        message: customMessage.trim(),
        attachmentUrl: selectedTemplate?.attachment_url || null,
        action: sendMode === "now" ? "send_now" : "schedule",
        ...(sendMode === "schedule" ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
      };
      const res = await adminApi.sendSms(payload);
      if (res?.success !== false) {
        setResult({ ok: true, msg: sendMode === "now" ? "SMS sent!" : "SMS scheduled!" });
        setCustomMessage("");
        setSelectedTemplate(null);
        if (sendMode === "now") loadHistory();
      } else {
        setResult({ ok: false, msg: res?.error || "Failed to send" });
      }
    } catch (e) {
      setResult({ ok: false, msg: e.message });
    } finally {
      setSending(false);
    }
  };

  const seedSamples = async () => {
    setSeedingTemplates(true);
    try {
      for (const tpl of SAMPLE_TEMPLATES) {
        await adminApi.createSmsTemplate(tpl);
      }
      await loadTemplates();
    } catch (err) {
      console.error("Failed to seed templates:", err);
    } finally {
      setSeedingTemplates(false);
    }
  };

  const filtered = filterType === "all" ? templates : templates.filter(t => t.message_type === filterType);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Template Picker */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Templates</p>
          {templates.length === 0 && !loadingTemplates && (
            <button
              onClick={seedSamples}
              disabled={seedingTemplates}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3 h-3" />
              {seedingTemplates ? "Adding..." : "Add Samples"}
            </button>
          )}
        </div>

        <div className="flex gap-1 flex-wrap">
          {["all", ...Object.keys(TYPE_LABELS)].map(k => (
            <button
              key={k}
              onClick={() => setFilterType(k)}
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all ${
                filterType === k
                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {k === "all" ? "All" : TYPE_LABELS[k].label}
            </button>
          ))}
        </div>

        {loadingTemplates ? (
          <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No templates found</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {filtered.map(tpl => {
              const typeInfo = TYPE_LABELS[tpl.message_type] || TYPE_LABELS.general;
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                    isSelected ? "border-[#1e3a5f] bg-[#1e3a5f]/5" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 truncate">{tpl.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate">{tpl.message_template}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-3 py-3 space-y-2">
        <textarea
          rows={3}
          value={customMessage}
          onChange={e => setCustomMessage(e.target.value)}
          placeholder="Select a template or type a message..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
        />

        <div className="flex gap-1">
          <button
            onClick={() => setSendMode("now")}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg font-medium transition-all ${
              sendMode === "now" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Send className="w-3 h-3" /> Send Now
          </button>
          <button
            onClick={() => setSendMode("schedule")}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg font-medium transition-all ${
              sendMode === "schedule" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-3 h-3" /> Schedule
          </button>
        </div>

        {sendMode === "schedule" && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
          />
        )}

        <button
          onClick={handleSend}
          disabled={!customMessage.trim() || !contactPhone || sending || (sendMode === "schedule" && !scheduledAt)}
          className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-lg py-2 text-xs font-semibold disabled:opacity-40 transition-colors"
        >
          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : sendMode === "now" ? <Send className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {sending ? "Sending..." : sendMode === "now" ? "Send SMS" : "Schedule SMS"}
        </button>

        {result && (
          <div className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {result.ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {result.msg}
          </div>
        )}
      </div>

      {/* SMS History */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <button
          onClick={() => setShowHistory(h => !h)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider bg-white border-b border-gray-200 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            SMS History ({smsLog.length})
          </span>
          <div className="flex items-center gap-1">
            <button onClick={e => { e.stopPropagation(); loadHistory(); }} className="p-0.5 hover:text-blue-600">
              <RefreshCw className="w-3 h-3" />
            </button>
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </button>

        {showHistory && (
          <div className="px-3 py-2 space-y-2">
            {loadingLog ? (
              <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>
            ) : smsLog.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No messages sent yet</p>
            ) : (
              smsLog.map(log => (
                <div key={log.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      log.status === "sent"   ? "bg-green-100 text-green-700" :
                      log.status === "failed" ? "bg-red-100 text-red-700"    : "bg-gray-100 text-gray-600"
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-gray-400">
                      {log.sent_at ? new Date(log.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed line-clamp-2">{log.message_sent}</p>
                  {log.campaign_name && log.campaign_name !== "Direct Send" && (
                    <p className="text-gray-400 mt-0.5">Campaign: {log.campaign_name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
