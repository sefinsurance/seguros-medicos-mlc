import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignEnrollmentModal from "./CampaignEnrollmentModal";

const STATUS_LABELS = {
  partial_confirmed: "Partial",
  completed: "Completed",
  contacted: "Contacted",
  closed: "Closed",
  archived: "Archived",
};

export default function BulkStatusToolbar({ selectedIds, onComplete }) {
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const handleUpdate = async () => {
    if (!status) return;
    setUpdating(true);
    await Promise.all([...selectedIds].map(id => base44.entities.Lead.update(id, { status })));
    setUpdating(false);
    setStatus("");
    onComplete();
  };

  return (
    <>
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
        <span className="text-sm font-medium text-blue-900">{selectedIds.size} selected</span>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-blue-700">Update status to:</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Choose status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partial_confirmed">Partial</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleUpdate}
            disabled={!status || updating}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
          </button>
        </div>
        <button
          onClick={() => setShowEnrollment(true)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          title="Enroll in campaigns"
        >
          <Tag className="w-3 h-3" />
          Campaigns
        </button>
        <button
          onClick={onComplete}
          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showEnrollment && (
        <CampaignEnrollmentModal
          entityIds={Array.from(selectedIds)}
          entityType="lead"
          onClose={() => setShowEnrollment(false)}
          onComplete={() => {
            setShowEnrollment(false);
            onComplete();
          }}
        />
      )}
    </>
  );
}