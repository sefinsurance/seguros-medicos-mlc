import React, { useState } from "react";
import { X, Mail, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EmailCampaignDetail({ campaign, onClose, onUpdate }) {
  const [addingContact, setAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddContact = async () => {
    if (!newContactEmail.trim()) return;
    setSaving(true);
    const { getAdminToken } = await import("./useAdminToken");
    const adminToken = await getAdminToken();
    const currentRecipients = campaign.csv_recipients ? JSON.parse(campaign.csv_recipients) : [];
    currentRecipients.push({ name: newContactName.trim() || "Manual Contact", email: newContactEmail.trim() });
    await base44.functions.invoke("adminManageEmailCampaign", {
      adminToken,
      action: "update",
      campaignId: campaign.id,
      data: {
        csv_recipients: JSON.stringify(currentRecipients),
        recipient_count: currentRecipients.length
      }
    });
    setSaving(false);
    setAddingContact(false);
    setNewContactName("");
    setNewContactEmail("");
    onUpdate({ ...campaign, csv_recipients: JSON.stringify(currentRecipients), recipient_count: currentRecipients.length });
  };

  const recipients = campaign.csv_recipients ? JSON.parse(campaign.csv_recipients) : [];
  const isCompleted = campaign.status === "sent";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#1e3a5f]" />
            <h2 className="text-base font-bold text-[#1e3a5f]">Email Campaign Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-base font-semibold text-gray-900">{campaign.name}</p>
            <p className="text-sm text-gray-600 mt-1">Subject: {campaign.subject}</p>
          </div>

          {/* Add Contact */}
          {!isCompleted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-800">Add Individual Contact</p>
                </div>
                {!addingContact && (
                  <button
                    onClick={() => setAddingContact(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add
                  </button>
                )}
              </div>
              {addingContact && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email address (required)"
                    value={newContactEmail}
                    onChange={e => setNewContactEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddContact}
                      disabled={!newContactEmail.trim() || saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Adding..." : "Add Contact"}
                    </button>
                    <button
                      onClick={() => { setAddingContact(false); setNewContactName(""); setNewContactEmail(""); }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-blue-700 mt-2">Add 1-2 extra contacts to include in this campaign</p>
            </div>
          )}

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Recipients ({recipients.length} total)</p>
              <div className="border border-gray-200 rounded-lg overflow-auto max-h-48">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-700">{r.name}</td>
                        <td className="px-3 py-2 text-gray-700">{r.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Message Body</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {campaign.message_body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}