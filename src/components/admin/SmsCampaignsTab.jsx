import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MessageSquare, Clock, CheckCircle2, Trash2, Users, Play, RefreshCw, Cake, AlertCircle, Copy } from "lucide-react";
import SmsCampaignComposer from "./SmsCampaignComposer";

const STATUS_STYLES = {
  draft: { color: "bg-gray-100 text-gray-600", label: "Draft" },
  scheduled: { color: "bg-blue-100 text-blue-700", label: "Scheduled" },
  sending: { color: "bg-yellow-100 text-yellow-700", label: "Sending..." },
  sent: { color: "bg-green-100 text-green-700", label: "Sent" },
  failed: { color: "bg-red-100 text-red-700", label: "Failed" },
};

const AUDIENCE_LABELS = {
  all_leads: "All Leads",
  all_subscribers: "All SMS Subscribers",
  leads_by_product: "Leads by Product",
  leads_by_status: "Leads by Status",
  csv_upload: "CSV Upload",
  birthday_campaign: "🎂 Birthday Campaign",
};

export default function SmsCampaignsTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [launching, setLaunching] = useState({});
  const [overrideHours, setOverrideHours] = useState({});
  const pollRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SmsCampaign.list("-created_date", 100);
    setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Poll every 3s if any campaign is "sending"
  useEffect(() => {
    const hasSending = campaigns.some(c => c.status === "sending");
    if (hasSending && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const data = await base44.entities.SmsCampaign.list("-created_date", 100);
        setCampaigns(data);
        if (!data.some(c => c.status === "sending")) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 3000);
    }
    return () => {
      if (!hasSending && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [campaigns]);

  const handleClone = async (campaign) => {
    const newName = `${campaign.name} (Copy)`;
    const cloned = await base44.entities.SmsCampaign.create({
      name: newName,
      message_template: campaign.message_template,
      audience: campaign.audience,
      audience_filter: campaign.audience_filter,
      csv_recipients: campaign.csv_recipients,
      attachment_url: campaign.attachment_url,
      status: "draft",
      recipient_count: campaign.recipient_count,
    });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    await base44.entities.SmsCampaign.delete(id);
    setCampaigns(cs => cs.filter(c => c.id !== id));
  };

  const handleLaunch = async (campaign) => {
    setLaunching(l => ({ ...l, [campaign.id]: true }));
    const res = await base44.functions.invoke("sendSmsCampaign", { campaign_id: campaign.id, override_hours: !!overrideHours[campaign.id] });
    if (res.data?.error === 'Outside sending window') {
      alert("⏰ Campaigns can only be sent between 8:00 AM and 6:00 PM Eastern Time.");
      await load();
      setLaunching(l => ({ ...l, [campaign.id]: false }));
      return;
    }
    setTimeout(load, 1500);
    setLaunching(l => ({ ...l, [campaign.id]: false }));
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const getSendingProgress = (c) => {
    if (!c.recipient_count || !c.sent_count) return null;
    return Math.round((c.sent_count / c.recipient_count) * 100);
  };

  return (
    <div>
      {showComposer && (
        <SmsCampaignComposer
          onClose={() => setShowComposer(false)}
          onSaved={() => { setShowComposer(false); load(); }}
        />
      )}

      {/* Send Window Notice */}
      {(() => {
        const etHour = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false });
        const h = parseInt(etHour, 10);
        const inWindow = h >= 8 && h < 18;
        return !inWindow ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span><strong>Outside sending window.</strong> Campaigns can only be launched between <strong>8:00 AM – 6:00 PM Eastern Time</strong>. Current ET time: {new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true })}.</span>
          </div>
        ) : null;
      })()}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-800">SMS Campaigns</h2>
          <p className="text-xs text-gray-500 mt-0.5">Sending allowed 8:00 AM – 6:00 PM ET · Auto opt-out on STOP/UNSUBSCRIBE</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#163059] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No campaigns yet</p>
          <p className="text-xs mt-1">Click "New Campaign" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const st = STATUS_STYLES[c.status] || STATUS_STYLES.draft;
            const isExpanded = expandedId === c.id;
            const progress = getSendingProgress(c);
            const isBirthday = c.audience === "birthday_campaign";
            const isLaunching = launching[c.id];

            return (
              <div key={c.id} className={`bg-white rounded-xl border overflow-hidden ${isBirthday ? "border-amber-200" : "border-gray-200"}`}>
                <div
                  className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isBirthday && <Cake className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                      <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      {isBirthday && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Auto-Daily</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {AUDIENCE_LABELS[c.audience] || c.audience}
                        {c.audience_filter && <span className="text-gray-400">· {c.audience_filter}</span>}
                      </span>
                      {c.recipient_count > 0 && (
                        <span className="text-xs text-gray-500">{c.recipient_count} contacts</span>
                      )}
                      {c.status === "sending" && c.sent_count > 0 && (
                        <span className="text-xs text-yellow-600 font-medium">{c.sent_count}/{c.recipient_count} sent</span>
                      )}
                      {c.status === "sent" && c.sent_count > 0 && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {c.sent_count} sent · {formatDate(c.sent_at)}
                        </span>
                      )}
                      {c.scheduled_at && c.status === "scheduled" && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(c.scheduled_at)}
                        </span>
                      )}
                    </div>

                    {/* Progress bar for sending */}
                    {c.status === "sending" && progress !== null && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 max-w-xs">
                        <div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Launch button — only for draft/failed, not birthday (auto) */}
                    {!isBirthday && (c.status === "draft" || c.status === "failed") && (
                      <div className="flex flex-col items-end gap-1">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!overrideHours[c.id]}
                            onChange={e => setOverrideHours(o => ({ ...o, [c.id]: e.target.checked }))}
                            className="accent-amber-500 w-3.5 h-3.5"
                          />
                          Override hours
                        </label>
                        <button
                          onClick={() => handleLaunch(c)}
                          disabled={isLaunching}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-60"
                        >
                          <Play className="w-3 h-3" />
                          {isLaunching ? "Starting..." : "Launch"}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleClone(c)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Clone campaign"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={c.status === "sending"}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Message Template</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {c.message_template}
                    </div>
                    {(c.audience === "csv_upload" || c.audience === "birthday_campaign") && c.csv_recipients && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Recipients (first 5)</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {JSON.parse(c.csv_recipients || "[]").slice(0, 5).map((r, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-gray-400 w-4">{i + 1}.</span>
                              <span className="font-medium">{r.name}</span>
                              <span className="text-gray-400">{r.phone}</span>
                              {r.birthday && <span className="text-amber-500">🎂 {r.birthday}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">Created {formatDate(c.created_date)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}