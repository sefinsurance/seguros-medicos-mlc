import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Mail, Clock, CheckCircle2, Trash2, Users, RefreshCw, Pause, Play, Upload, Loader2, Copy } from "lucide-react";
import EmailCampaignComposer from "./EmailCampaignComposer";
import CsvImportModal from "./CsvImportModal";

const STATUS_STYLES = {
  draft: { color: "bg-gray-100 text-gray-600", label: "Draft" },
  scheduled: { color: "bg-blue-100 text-blue-700", label: "Scheduled" },
  sending: { color: "bg-yellow-100 text-yellow-700", label: "Sending..." },
  sent: { color: "bg-green-100 text-green-700", label: "Sent" },
  failed: { color: "bg-red-100 text-red-700", label: "Failed" },
};

export default function EmailCampaignsTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [launching, setLaunching] = useState({});
  const [pausing, setPausing] = useState({});
  const pollRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.EmailCampaign.list("-created_date", 100);
    setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const hasSending = campaigns.some(c => c.status === "sending");
    if (hasSending && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const data = await base44.entities.EmailCampaign.list("-created_date", 100);
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
    const cloned = await base44.entities.EmailCampaign.create({
      name: newName,
      subject: campaign.subject,
      message_body: campaign.message_body,
      csv_recipients: campaign.csv_recipients,
      attachment_urls: campaign.attachment_urls,
      campaign_type: campaign.campaign_type,
      status: "draft",
      recipient_count: campaign.recipient_count,
    });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    await base44.entities.EmailCampaign.delete(id);
    setCampaigns(cs => cs.filter(c => c.id !== id));
  };

  const handlePause = async (id) => {
    setPausing(p => ({ ...p, [id]: true }));
    await base44.entities.EmailCampaign.update(id, { status: "draft" });
    setCampaigns(cs => cs.map(c => c.id === id ? { ...c, status: "draft" } : c));
    setPausing(p => ({ ...p, [id]: false }));
  };

  const handleResume = async (id) => {
    setPausing(p => ({ ...p, [id]: true }));
    await base44.entities.EmailCampaign.update(id, { status: "scheduled" });
    setCampaigns(cs => cs.map(c => c.id === id ? { ...c, status: "scheduled" } : c));
    setPausing(p => ({ ...p, [id]: false }));
  };

  const handleLaunch = async (campaign) => {
    setLaunching(l => ({ ...l, [campaign.id]: true }));
    await base44.functions.invoke("sendEmailCampaign", { campaign_id: campaign.id });
    setTimeout(load, 1500);
    setLaunching(l => ({ ...l, [campaign.id]: false }));
  };

  const handleCsvImportSaved = async (campaignId) => {
    setShowCsvImport(false);
    setSelectedCampaignId(null);
    setTimeout(load, 800);
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
        <EmailCampaignComposer
          onClose={() => setShowComposer(false)}
          onSaved={() => { setShowComposer(false); load(); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-800">Email Campaigns</h2>
          <p className="text-xs text-gray-500 mt-0.5">Send bulk emails with attachments</p>
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
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No campaigns yet</p>
          <p className="text-xs mt-1">Click "New Campaign" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const st = STATUS_STYLES[c.status] || STATUS_STYLES.draft;
            const isExpanded = expandedId === c.id;
            const progress = getSendingProgress(c);
            const isLaunching = launching[c.id];
            const attachments = JSON.parse(c.attachment_urls || "[]");

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      {c.campaign_type === "birthday" && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">🎂 Birthday</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-600 font-medium">"{c.subject}"</span>
                      {c.recipient_count > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {c.recipient_count} contacts
                        </span>
                      )}
                      {attachments.length > 0 && (
                        <span className="text-xs text-gray-500">{attachments.length} attachment{attachments.length > 1 ? "s" : ""}</span>
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

                    {c.status === "sending" && progress !== null && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 max-w-xs">
                        <div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {(c.status === "draft" || c.status === "failed") && (
                      <>
                        <button
                          onClick={() => { setSelectedCampaignId(c.id); setShowCsvImport(true); }}
                          disabled={c.status === "sending"}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60"
                        >
                          <Upload className="w-3 h-3" />
                          CSV
                        </button>
                        <button
                          onClick={() => handleLaunch(c)}
                          disabled={isLaunching}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-60"
                        >
                          {isLaunching ? "Sending..." : "Send"}
                        </button>
                      </>
                    )}
                    {(c.status === "scheduled" || c.status === "sent") && (
                      <button
                        onClick={() => handlePause(c.id)}
                        disabled={pausing[c.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-60"
                      >
                        {pausing[c.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                        {pausing[c.id] ? "..." : "Pause"}
                      </button>
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
                    <p className="text-xs font-semibold text-gray-500 mb-2">Message Body</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {c.message_body}
                    </div>
                    {attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Attachments</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {attachments.map((url, i) => (
                            <div key={i} className="text-gray-500">📎 {url.split('/').pop()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {JSON.parse(c.csv_recipients || "[]").length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">Recipients (first 5)</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {JSON.parse(c.csv_recipients || "[]").slice(0, 5).map((r, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-gray-400 w-4">{i + 1}.</span>
                              <span className="font-medium">{r.name}</span>
                              <span className="text-gray-400">{r.email}</span>
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