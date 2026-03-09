import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Plus, Trash2 } from "lucide-react";

export default function CampaignEnrollmentModal({ entityIds, entityType, onClose, onComplete }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const sms = await base44.entities.SmsCampaign.list("-created_date", 100);
    const email = await base44.entities.EmailCampaign.list("-created_date", 100);
    setCampaigns([
      ...sms.map(c => ({ ...c, campaign_type: "sms" })),
      ...email.map(c => ({ ...c, campaign_type: "email" }))
    ]);
    setLoading(false);
  };

  const toggleCampaign = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const enroll = async () => {
    setEnrolling(true);
    const enrollments = [];
    for (const entityId of entityIds) {
      for (const campaignId of selected) {
        const campaign = campaigns.find(c => c.id === campaignId);
        enrollments.push({
          entity_type: entityType,
          entity_id: entityId,
          entity_phone: entityType === "sms_subscriber" ? entityId : undefined,
          campaign_id: campaignId,
          campaign_type: campaign.campaign_type,
          campaign_name: campaign.name,
          enrolled_date: new Date().toISOString()
        });
      }
    }
    await base44.entities.CampaignEnrollment.bulkCreate(enrollments);
    setEnrolling(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-96 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Enroll in Campaigns</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No campaigns available</div>
          ) : (
            <div className="space-y-2">
              {campaigns.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleCampaign(c.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.campaign_type === "sms" ? "SMS" : "Email"} · {c.status}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={enroll}
            disabled={selected.size === 0 || enrolling}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Enroll {entityIds.length}
          </button>
        </div>
      </div>
    </div>
  );
}