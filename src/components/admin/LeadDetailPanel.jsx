import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Phone, MessageCircle, Mail, Save, Loader2, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import LeadNotesSection from "./LeadNotesSection";
import CampaignTags from "./CampaignTags";
import CampaignEnrollmentModal from "./CampaignEnrollmentModal";
import { getAdminToken } from "./useAdminToken";

const statusColors = {
  partial_confirmed: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  closed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-700",
};

export default function LeadDetailPanel({ lead, onClose, onUpdate }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.internal_notes || "");
  const [saving, setSaving] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const adminToken = await getAdminToken();
      await base44.functions.invoke("pgUpsertLead", {
        adminToken,
        id: lead.id,
        status,
        internal_notes: notes
      });
      onUpdate({ ...lead, status, internal_notes: notes });
    } catch (err) {
      alert("Session expired. Please log in again.");
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const row = (label, value) => value ? (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium break-all">{value}</span>
    </div>
  ) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
        <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-[#1e3a5f] text-white px-5 py-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-lg">{lead.full_name}</div>
              <div className="text-blue-200 text-xs">{lead.lead_id}</div>
            </div>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 px-5 py-3 bg-gray-50 border-b">
            <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#162d4a] transition-colors">
              <Phone className="w-4 h-4" /> Call
            </a>
            <a href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#22c55e] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#16a34a] transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href={`mailto:${lead.email}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Mail className="w-4 h-4" /> Email
            </a>
          </div>

          <div className="flex-1 p-5 space-y-5">
            {/* Status update */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partial_confirmed">Partial Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              </div>

              {/* Contact info */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Info</label>
                <div className="bg-gray-50 rounded-xl px-4 py-1">
                  {row("Full Name", lead.full_name)}
                  {row("Date of Birth", lead.date_of_birth)}
                  {row("Phone", lead.phone)}
                  {row("Email", lead.email)}
                  {row("ZIP Code", lead.zip_code)}
                </div>
              </div>

              {/* Insurance details */}
              {(lead.product_type || lead.preferred_language || lead.household_size || lead.estimated_income) && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Insurance Details</label>
                  <div className="bg-gray-50 rounded-xl px-4 py-1">
                    {row("Product Type", lead.product_type)}
                    {row("Pref. Language", lead.preferred_language)}
                    {row("Household Size", lead.household_size)}
                    {row("Est. Income", lead.estimated_income ? `$${lead.estimated_income.toLocaleString()}` : null)}
                    {row("Current Coverage", lead.current_coverage)}
                    {row("Doctors", lead.doctors)}
                    {row("Prescriptions", lead.prescriptions)}
                    {row("Best Time to Call", lead.best_time_to_call)}
                    {row("Contact Method", lead.preferred_contact_method)}
                  </div>
                </div>
              )}

              {/* Source */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Source</label>
                <div className="bg-gray-50 rounded-xl px-4 py-1">
                  {row("CTA Source", lead.cta_source?.replace("_", " "))}
                  {row("Source Page", lead.source_page)}
                  {row("Language", lead.language_selected?.toUpperCase())}
                  {row("Created", lead.created_date ? new Date(lead.created_date).toLocaleString() : null)}
                </div>
              </div>

              {/* Campaigns */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Campaigns</label>
                  <button
                    onClick={() => setShowEnrollment(true)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    Enroll
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <CampaignTags entityId={lead.id} entityType="lead" />
                </div>
              </div>

              {/* Notes */}
              <div>
                {lead.notes && (
                  <div className="mb-3 bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                    <div className="font-semibold text-xs text-blue-500 mb-1">Client Notes</div>
                    {lead.notes}
                  </div>
                )}
                <LeadNotesSection leadId={lead.id} />
              </div>

              {/* Legacy internal notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Legacy Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              </div>
              </div>
              </div>

      {showEnrollment && (
        <CampaignEnrollmentModal
          entityIds={[lead.id]}
          entityType="lead"
          onClose={() => setShowEnrollment(false)}
          onComplete={() => setShowEnrollment(false)}
        />
      )}
    </>
  );
}