import React, { useState, useEffect, useRef } from "react";
import { adminApi } from "@/api/adminApi";
import {
  MessageSquare, Phone, Bell, Trash2, Loader2, Send,
  PhoneCall, PhoneMissed, PhoneIncoming, Voicemail, PhoneOff, MessageCircle
} from "lucide-react";
import ContactSmsPanel from "./ContactSmsPanel";

const TYPE_OPTIONS = [
  { value: "comment",  label: "Comment",  icon: MessageSquare, color: "text-blue-500"  },
  { value: "call",     label: "Call Log",  icon: Phone,         color: "text-green-500" },
  { value: "reminder", label: "Reminder",  icon: Bell,          color: "text-amber-500" },
];

const CALL_OUTCOMES = [
  { value: "answered",           label: "Answered",           icon: PhoneCall,     color: "text-green-600"  },
  { value: "no_answer",          label: "No Answer",          icon: PhoneMissed,   color: "text-red-500"    },
  { value: "voicemail",          label: "Voicemail",          icon: Voicemail,     color: "text-purple-500" },
  { value: "callback_requested", label: "Callback Requested", icon: PhoneIncoming, color: "text-blue-500"   },
  { value: "not_interested",     label: "Not Interested",     icon: PhoneOff,      color: "text-gray-500"   },
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function ActivityEntry({ note, onDelete, deleting }) {
  const typeInfo = TYPE_OPTIONS.find(t => t.value === note.type) || TYPE_OPTIONS[0];
  const TypeIcon = typeInfo.icon;
  const callInfo = CALL_OUTCOMES.find(c => c.value === note.call_outcome);
  const CallIcon = callInfo?.icon;

  const authorName = note.author
    ? note.author.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "Admin";

  return (
    <div className="group flex gap-2.5">
      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        note.type === "comment" ? "bg-blue-100" : note.type === "call" ? "bg-green-100" : "bg-amber-100"
      }`}>
        <TypeIcon className={`w-3 h-3 ${typeInfo.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={`rounded-xl px-3 py-2 text-xs ${
          note.type === "comment" ? "bg-blue-50 border border-blue-100" :
          note.type === "call"    ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"
        }`}>
          {note.type === "call" && callInfo && (
            <div className={`flex items-center gap-1 font-semibold mb-1 ${callInfo.color}`}>
              <CallIcon className="w-3 h-3" />
              {callInfo.label}
            </div>
          )}
          {note.type === "reminder" && note.reminder_at && (
            <div className="flex items-center gap-1 text-amber-600 font-semibold mb-1">
              <Bell className="w-3 h-3" />
              Follow-up: {formatDate(note.reminder_at)}
            </div>
          )}
          <p className="text-gray-700 break-words leading-relaxed">{note.text}</p>
        </div>
        <div className="flex items-center justify-between mt-1 px-1">
          <span className="text-[10px] text-gray-400">
            <span className="font-medium text-gray-500">{authorName}</span>
            {" · "}{formatDate(note.created_date || note.created_at)}
          </span>
          <button
            onClick={() => onDelete(note.id)}
            disabled={deleting === note.id}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-0.5 rounded"
          >
            {deleting === note.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed({ leadId, entityType = "lead", contactName = "", contactPhone = "", followUpDate = "" }) {
  const [activeTab, setActiveTab]     = useState("notes");
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(null);
  const [type, setType]               = useState("comment");
  const [text, setText]               = useState("");
  const [callOutcome, setCallOutcome] = useState("answered");
  const [reminderAt, setReminderAt]   = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, [leadId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const notes = await adminApi.getNotes(leadId);
      setNotes(Array.isArray(notes) ? notes : []);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const payload = {
        type,
        text: text.trim(),
        author: "admin",
        contact_name: contactName,
        entity_type: entityType,
        ...(type === "call"     ? { call_outcome: callOutcome } : {}),
        ...(type === "reminder" ? { reminder_at: reminderAt }   : {}),
      };
      await adminApi.createNote(leadId, payload);
      setText("");
      setReminderAt("");
      await loadNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    setDeleting(id);
    try {
      await adminApi.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Header + tab switcher */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-bold text-[#1e3a5f]">Activity</h3>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "notes" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <MessageSquare className="w-3 h-3" /> Notes
          </button>
          <button
            onClick={() => setActiveTab("sms")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "sms" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <MessageCircle className="w-3 h-3" /> SMS
          </button>
        </div>
      </div>

      {activeTab === "sms" ? (
        <ContactSmsPanel contactPhone={contactPhone} contactName={contactName} followUpDate={followUpDate} />
      ) : (
        <>
          {/* Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-300">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No activity yet</p>
              </div>
            ) : (
              notes.map(note => (
                <ActivityEntry key={note.id} note={note} onDelete={deleteNote} deleting={deleting} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3 space-y-3">
            <div className="flex gap-1">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    type === t.value ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <t.icon className="w-3 h-3" />
                  {t.label}
                </button>
              ))}
            </div>

            {type === "call" && (
              <div className="grid grid-cols-2 gap-1">
                {CALL_OUTCOMES.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setCallOutcome(o.value)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                      callOutcome === o.value
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <o.icon className={`w-3 h-3 ${callOutcome === o.value ? "text-[#1e3a5f]" : o.color}`} />
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            {type === "reminder" && (
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={e => setReminderAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              />
            )}

            <div className="flex gap-2 items-end">
              <textarea
                rows={2}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder={
                  type === "comment" ? "Leave a comment..." :
                  type === "call"    ? "Notes from the call..." : "Reminder details..."
                }
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              />
              <button
                onClick={submit}
                disabled={!text.trim() || saving}
                className="flex items-center justify-center w-9 h-9 bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
