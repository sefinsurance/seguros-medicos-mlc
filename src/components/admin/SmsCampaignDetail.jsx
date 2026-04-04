import React, { useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { X, Calendar, Clock, MessageSquare, Users, Edit3, Play, TrendingUp, UserPlus, FileText, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function SmsCampaignDetail({ campaign, onClose, onUpdate }) {
  const [editing, setEditing]             = useState(false);
  const [editName, setEditName]           = useState(campaign.name);
  const [editMessage, setEditMessage]     = useState(campaign.message_template);
  const [saving, setSaving]               = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [newContactName, setNewContactName]   = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [logs, setLogs]                   = useState([]);
  const [loadingLogs, setLoadingLogs]     = useState(false);
  const [showLogs, setShowLogs]           = useState(false);
  const [logFilter, setLogFilter]         = useState("all");

  const isActive    = ["sending", "paused", "scheduled"].includes(campaign.status);
  const isCompleted = ["sent", "failed"].includes(campaign.status);

  const calculateStats = () => {
    const remaining = (campaign.recipient_count || 0) - (campaign.sent_count || 0);
    const progress  = campaign.recipient_count > 0 ? Math.round(((campaign.sent_count || 0) / campaign.recipient_count) * 100) : 0;
    let daysRunning = 0;
    let daysRemaining = null;

    if (campaign.started_at) {
      const start = new Date(campaign.started_at);
      const end   = isCompleted && campaign.completed_at ? new Date(campaign.completed_at) : new Date();
      daysRunning = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
    }

    if (isActive && campaign.throttle_mode === "time" && campaign.throttle_time_days) {
      daysRemaining = Math.max(0, campaign.throttle_time_days - daysRunning);
    } else if (isActive && campaign.throttle_mode === "quantity" && campaign.throttle_quantity_per_day) {
      daysRemaining = Math.ceil(remaining / campaign.throttle_quantity_per_day);
    }
    return { remaining, progress, daysRunning, daysRemaining };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSmsCampaign(campaign.id, { name: editName, message_template: editMessage });
      setEditing(false);
      onUpdate({ ...campaign, name: editName, message_template: editMessage });
    } catch (err) {
      console.error("Failed to save campaign:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReuse = async () => {
    try {
      await adminApi.createSmsCampaign({
        name:             `${campaign.name} (Reused)`,
        message_template: campaign.message_template,
        audience:         campaign.audience,
        audience_filter:  campaign.audience_filter,
        csv_recipients:   campaign.csv_recipients,
        attachment_url:   campaign.attachment_url,
        throttle_mode:             campaign.throttle_mode,
        throttle_time_days:        campaign.throttle_time_days,
        throttle_speed_per_sec:    campaign.throttle_speed_per_sec,
        throttle_quantity_per_day: campaign.throttle_quantity_per_day,
        status:           "draft",
        recipient_count:  campaign.recipient_count,
        last_sent_index:  0,
      });
      alert("Campaign duplicated as draft!");
      onClose();
    } catch (err) {
      console.error("Failed to reuse campaign:", err);
    }
  };

  const handleAddContact = async () => {
    if (!newContactPhone.trim()) return;
    setSaving(true);
    try {
      const currentRecipients = campaign.csv_recipients ? JSON.parse(campaign.csv_recipients) : [];
      currentRecipients.push({ name: newContactName.trim() || "Manual Contact", phone: newContactPhone.trim() });
      const newRecipientCount = currentRecipients.length;
      await adminApi.updateSmsCampaign(campaign.id, {
        csv_recipients:  JSON.stringify(currentRecipients),
        recipient_count: newRecipientCount,
      });
      setAddingContact(false);
      setNewContactName("");
      setNewContactPhone("");
      onUpdate({ ...campaign, csv_recipients: JSON.stringify(currentRecipients), recipient_count: newRecipientCount });
    } catch (err) {
      console.error("Failed to add contact:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { if (showLogs) loadLogs(); }, [showLogs, campaign.id]);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await adminApi.getSmsLogs({ campaignId: campaign.id });
      setLogs(Array.isArray(data) ? data : (data.logs || []));
    } catch (err) {
      console.error("Failed to load logs:", err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const stats        = calculateStats();
  const recipients   = campaign.csv_recipients ? JSON.parse(campaign.csv_recipients) : [];
  const filteredLogs = logFilter === "all" ? logs : logs.filter(l => l.status === logFilter);
  const successCount = logs.filter(l => l.status === "sent").length;
  const failCount    = logs.filter(l => l.status === "failed").length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#1e3a5f]" /><h2 className="text-base font-bold text-[#1e3a5f]">Campaign Details</h2></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Campaign Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Campaign Name</label>
              {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"><Edit3 className="w-3 h-3" />Edit</button>}
            </div>
            {editing ? (
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            ) : (
              <p className="text-base font-semibold text-gray-900">{campaign.name}</p>
            )}
          </div>

          {editing && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Message Template</label>
              <textarea value={editMessage} onChange={e => setEditMessage(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                <button onClick={() => { setEditing(false); setEditName(campaign.name); setEditMessage(campaign.message_template); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { bg: "bg-blue-50 border-blue-200", icon: TrendingUp, iconCls: "text-blue-600", label: "Progress", value: `${stats.progress}%`, sub: `${campaign.sent_count || 0} of ${campaign.recipient_count || 0} sent`, valueCls: "text-blue-900" },
              { bg: "bg-green-50 border-green-200", icon: Users, iconCls: "text-green-600", label: "Remaining", value: stats.remaining, sub: "messages left", valueCls: "text-green-900" },
              { bg: "bg-purple-50 border-purple-200", icon: Clock, iconCls: "text-purple-600", label: isActive ? "Running For" : "Ran For", value: stats.daysRunning, sub: `day${stats.daysRunning !== 1 ? "s" : ""}`, valueCls: "text-purple-900" },
              ...(stats.daysRemaining !== null ? [{ bg: "bg-amber-50 border-amber-200", icon: Calendar, iconCls: "text-amber-600", label: "Est. Remaining", value: stats.daysRemaining, sub: `day${stats.daysRemaining !== 1 ? "s" : ""}`, valueCls: "text-amber-900" }] : []),
            ].map((s, i) => (
              <div key={i} className={`${s.bg} border rounded-lg p-4`}>
                <div className={`flex items-center gap-2 ${s.iconCls} mb-1`}><s.icon className="w-4 h-4" /><span className="text-xs font-semibold">{s.label}</span></div>
                <p className={`text-2xl font-bold ${s.valueCls}`}>{s.value}</p>
                <p className={`text-xs mt-1 ${s.iconCls}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Throttle */}
          {campaign.throttle_mode && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Throttle Settings</p>
              {campaign.throttle_mode === "time"     && <p className="text-sm text-gray-700">Spread over <strong>{campaign.throttle_time_days} business days</strong> (Mon-Fri, 9am-5pm ET)</p>}
              {campaign.throttle_mode === "speed"    && <p className="text-sm text-gray-700">Send at <strong>{campaign.throttle_speed_per_sec} SMS/sec</strong> (Mon-Fri, 9am-5pm ET)</p>}
              {campaign.throttle_mode === "quantity" && <p className="text-sm text-gray-700">Daily limit: <strong>{campaign.throttle_quantity_per_day} SMS/day</strong> (Mon-Fri, 9am-5pm ET)</p>}
            </div>
          )}

          {/* Message */}
          {!editing && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Message Template</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{campaign.message_template}</div>
            </div>
          )}

          {/* Delivery Logs */}
          {["sending", "sent", "paused"].includes(campaign.status) && (
            <div>
              <button onClick={() => setShowLogs(!showLogs)}
                className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />Delivery Logs
                  {logs.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{successCount} sent · {failCount} failed</span>}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLogs ? "rotate-180" : ""}`} />
              </button>
              {showLogs && (
                <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                  {loadingLogs ? (
                    <div className="text-center py-8 text-gray-400 text-xs">Loading logs...</div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">No delivery logs yet</div>
                  ) : (
                    <>
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex gap-2">
                        {[{ value: "all", label: "All" }, { value: "sent", label: "Sent" }, { value: "failed", label: "Failed" }].map(f => (
                          <button key={f.value} onClick={() => setLogFilter(f.value)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${logFilter === f.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                            {f.label} ({f.value === "all" ? logs.length : logs.filter(l => l.status === f.value).length})
                          </button>
                        ))}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {filteredLogs.map((log, i) => (
                          <div key={i} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-gray-900">{log.recipient_name || "Unknown"}</span>
                                  <span className="text-xs text-gray-500">{log.recipient_phone}</span>
                                  {log.status === "sent" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
                                </div>
                                {log.error_message && <p className="text-xs text-red-600 mt-1">{log.error_message}</p>}
                                <p className="text-xs text-gray-400 mt-1">{new Date(log.sent_at || log.created_date || log.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">All Phone Numbers ({filteredLogs.length})</p>
                        <div className="text-xs text-gray-700 max-h-32 overflow-y-auto bg-white rounded border border-gray-200 p-2">
                          {filteredLogs.map(log => log.recipient_phone).join(", ")}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-600" /><p className="text-xs font-semibold text-blue-800">Add Individual Contact</p></div>
              {!addingContact && <button onClick={() => setAddingContact(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add</button>}
            </div>
            {addingContact && (
              <div className="space-y-2">
                <input type="text" placeholder="Name (optional)" value={newContactName} onChange={e => setNewContactName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="tel"  placeholder="Phone number (required)" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleAddContact} disabled={!newContactPhone.trim() || saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? "Adding..." : "Add Contact"}</button>
                  <button onClick={() => { setAddingContact(false); setNewContactName(""); setNewContactPhone(""); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            )}
            <p className="text-xs text-blue-700 mt-2">{isCompleted ? "Add contacts for future campaigns" : "Add extra contacts — they'll be appended to the end of the list"}</p>
          </div>

          {/* Recipients */}
          {recipients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Recipients ({recipients.length} total)</p>
              <div className="border border-gray-200 rounded-lg overflow-auto max-h-48">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.slice(0, 50).map((r, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-700">{r.name}</td>
                        <td className="px-3 py-2 text-gray-700">{r.phone}</td>
                      </tr>
                    ))}
                    {recipients.length > 50 && <tr><td colSpan={2} className="px-3 py-2 text-gray-400 text-center">...and {recipients.length - 50} more</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Created:</strong> {new Date(campaign.created_date || campaign.created_at).toLocaleString()}</p>
            {campaign.started_at   && <p><strong>Started:</strong>   {new Date(campaign.started_at).toLocaleString()}</p>}
            {campaign.completed_at && <p><strong>Completed:</strong> {new Date(campaign.completed_at).toLocaleString()}</p>}
          </div>

          {/* Reuse */}
          {isCompleted && (
            <button onClick={handleReuse} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors">
              <Play className="w-4 h-4" />Reuse Campaign (Duplicate as Draft)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
