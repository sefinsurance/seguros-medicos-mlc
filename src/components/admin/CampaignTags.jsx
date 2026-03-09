import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2 } from "lucide-react";

export default function CampaignTags({ entityId, entityType }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadEnrollments();
  }, [entityId, entityType]);

  const loadEnrollments = async () => {
    setLoading(true);
    const data = await base44.entities.CampaignEnrollment.filter({
      entity_type: entityType,
      entity_id: entityId
    }, "-enrolled_date", 50);
    setEnrollments(data);
    setLoading(false);
  };

  const unenroll = async (enrollmentId) => {
    setDeleting(enrollmentId);
    await base44.entities.CampaignEnrollment.delete(enrollmentId);
    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    setDeleting(null);
  };

  const campaignTypeColor = (type) => type === "sms" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";

  if (loading) return <div className="text-xs text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-wrap gap-1">
      {enrollments.length === 0 ? (
        <span className="text-xs text-gray-400">No campaigns</span>
      ) : (
        enrollments.map(e => (
          <div
            key={e.id}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${campaignTypeColor(e.campaign_type)}`}
          >
            <span className="truncate">{e.campaign_name}</span>
            <button
              onClick={() => unenroll(e.id)}
              disabled={deleting === e.id}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30"
            >
              {deleting === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            </button>
          </div>
        ))
      )}
    </div>
  );
}