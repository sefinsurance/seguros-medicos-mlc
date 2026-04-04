import { appParams } from "@/lib/app-params";

const API_BASE =
  import.meta.env.VITE_MLC_API_BASE_URL ||
  "https://api.mlcinsuranceagency.com";

const API_TOKEN =
  import.meta.env.VITE_MLC_API_TOKEN ||
  appParams?.token ||
  "";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch {}
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  return res.json();
}

export const adminApi = {
  // ── Prospects ─────────────────────────────────────────────────────────────
  async getProspects({ search = "", tag = "all", offset = 0, limit = 50 } = {}) {
    const p = new URLSearchParams({ segment: "prospect", offset: String(offset), limit: String(limit) });
    if (search) p.set("q", search);
    if (tag && tag !== "all") p.set("tag", tag);
    const data = await request(`/admin/contacts?${p}`);
    return { prospects: data.items || [], total: data.total || 0, hasMore: (offset + limit) < (data.total || 0) };
  },
  async updateProspect(contactId, patch) {
    return request(`/admin/contacts/${contactId}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  // ── Clients ───────────────────────────────────────────────────────────────
  async getClients({ search = "", client_status = "", offset = 0, limit = 50 } = {}) {
    const p = new URLSearchParams({ segment: "client", offset: String(offset), limit: String(limit) });
    if (search) p.set("q", search);
    if (client_status && client_status !== "all") p.set("client_status", client_status);
    const data = await request(`/admin/contacts?${p}`);
    return { clients: data.items || [], total: data.total || 0, hasMore: (offset + limit) < (data.total || 0) };
  },
  async updateClient(contactId, patch) {
    return request(`/admin/contacts/${contactId}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  // ── Global Search ─────────────────────────────────────────────────────────
  async globalSearch(q, limit = 20) {
    return request(`/admin/search?${new URLSearchParams({ q, limit: String(limit) })}`);
  },

  // ── Broker Applications ───────────────────────────────────────────────────
  async getBrokerApplications({ offset = 0, limit = 50 } = {}) {
    return request(`/admin/broker-applications?${new URLSearchParams({ offset: String(offset), limit: String(limit) })}`);
  },
  async updateBrokerApplication(id, patch) {
    return request(`/admin/broker-applications/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  // ── Phone Book ────────────────────────────────────────────────────────────
  async getPhoneBook({ search = "", segment = "", offset = 0, limit = 50 } = {}) {
    const p = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    if (search) p.set("q", search);
    if (segment && segment !== "all") p.set("segment", segment);
    const data = await request(`/admin/contacts?${p}`);
    return { items: data.items || [], total: data.total || 0, hasMore: (offset + limit) < (data.total || 0) };
  },
  async getPhoneBookByLetter({ letter, segment = "", offset = 0, limit = 100 } = {}) {
    const p = new URLSearchParams({ letter, offset: String(offset), limit: String(limit) });
    if (segment && segment !== "all") p.set("segment", segment);
    const data = await request(`/admin/contacts?${p}`);
    return { items: data.items || [], total: data.total || 0 };
  },
  async getContact(contactId) {
    return request(`/contacts/${contactId}`);
  },
  async updateContact(contactId, patch) {
    return request(`/admin/contacts/${contactId}`, { method: "PATCH", body: JSON.stringify(patch) });
  },
  async createContact(data) {
    return request(`/contacts`, { method: "POST", body: JSON.stringify(data) });
  },

  // ── Activity / Notes ──────────────────────────────────────────────────────
  async getNotes(contactId) {
    const data = await request(`/admin/contacts/${contactId}/timeline`);
    return data.notes || data.items || data || [];
  },
  async createNote(contactId, payload) {
    return request(`/admin/contacts/${contactId}/notes`, { method: "POST", body: JSON.stringify(payload) });
  },
  async deleteNote(noteId) {
    return request(`/admin/notes/${noteId}`, { method: "DELETE" });
  },

  // ── SMS Templates ─────────────────────────────────────────────────────────
  async getSmsTemplates() {
    const data = await request(`/admin/sms-templates`);
    return data.templates || data.items || data || [];
  },
  async createSmsTemplate(data) {
    return request(`/admin/sms-templates`, { method: "POST", body: JSON.stringify(data) });
  },
  async updateSmsTemplate(id, data) {
    return request(`/admin/sms-templates/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  async deleteSmsTemplate(id) {
    return request(`/admin/sms-templates/${id}`, { method: "DELETE" });
  },

  // ── SMS Send (contact-level) ───────────────────────────────────────────────
  async sendSms({ phone, contactName, message, attachmentUrl, action, scheduledAt }) {
    return request(`/admin/sms/send`, {
      method: "POST",
      body: JSON.stringify({
        phone, contact_name: contactName, message,
        attachment_url: attachmentUrl || null,
        action, scheduled_at: scheduledAt || null,
      }),
    });
  },

  // ── SMS Logs ──────────────────────────────────────────────────────────────
  async getSmsLogs({ contactId, campaignId, limit = 200 } = {}) {
    const p = new URLSearchParams({ limit: String(limit) });
    if (contactId)  p.set("contact_id", contactId);
    if (campaignId) p.set("campaign_id", campaignId);
    const data = await request(`/admin/sms-logs?${p}`);
    return data.logs || data.items || data || [];
  },

  // ── SMS Subscribers ───────────────────────────────────────────────────────
  async getSmsSubscribers({ search = "", statusFilter = "all", offset = 0, limit = 50 } = {}) {
    const p = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    if (search) p.set("q", search);
    if (statusFilter && statusFilter !== "all") p.set("status", statusFilter);
    return request(`/admin/sms-subscribers?${p}`);
  },
  async createSmsSubscriber(data) {
    return request(`/admin/sms-subscribers`, { method: "POST", body: JSON.stringify(data) });
  },
  async updateSmsSubscriber(id, data) {
    return request(`/admin/sms-subscribers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  async deleteSmsSubscriber(id) {
    return request(`/admin/sms-subscribers/${id}`, { method: "DELETE" });
  },

  // ── SMS Tags ──────────────────────────────────────────────────────────────
  async getSmsTags({ search = "", tagFilter = "all", offset = 0, limit = 50 } = {}) {
    const p = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    if (search) p.set("q", search);
    if (tagFilter && tagFilter !== "all") p.set("tag", tagFilter);
    const data = await request(`/admin/sms-tags?${p}`);
    return { tags: data.tags || data.items || [], hasMore: data.hasMore || false };
  },
  async createSmsTag(data) {
    return request(`/admin/sms-tags`, { method: "POST", body: JSON.stringify(data) });
  },
  async deleteSmsTag(id) {
    return request(`/admin/sms-tags/${id}`, { method: "DELETE" });
  },

  // ── Scheduled SMS ─────────────────────────────────────────────────────────
  async getScheduledSms() {
    const data = await request(`/admin/sms-scheduled`);
    return data.messages || data.items || data || [];
  },
  async createScheduledSms(data) {
    return request(`/admin/sms-scheduled`, { method: "POST", body: JSON.stringify(data) });
  },
  async updateScheduledSms(id, data) {
    return request(`/admin/sms-scheduled/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  async deleteScheduledSms(id) {
    return request(`/admin/sms-scheduled/${id}`, { method: "DELETE" });
  },

  // ── SMS Campaigns ─────────────────────────────────────────────────────────
  async getSmsCampaigns() {
    const data = await request(`/admin/sms-campaigns`);
    return data.campaigns || data.items || data || [];
  },
  async createSmsCampaign(data) {
    return request(`/admin/sms-campaigns`, { method: "POST", body: JSON.stringify(data) });
  },
  async updateSmsCampaign(id, data) {
    return request(`/admin/sms-campaigns/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  async deleteSmsCampaign(id) {
    return request(`/admin/sms-campaigns/${id}`, { method: "DELETE" });
  },
  async launchSmsCampaign(id, overrideHours = false) {
    return request(`/admin/sms-campaigns/${id}/launch`, {
      method: "POST", body: JSON.stringify({ override_hours: overrideHours }),
    });
  },
  async pauseSmsCampaign(id) {
    return request(`/admin/sms-campaigns/${id}/pause`, { method: "POST" });
  },
  async resumeSmsCampaign(id, overrideHours = false) {
    return request(`/admin/sms-campaigns/${id}/resume`, {
      method: "POST", body: JSON.stringify({ override_hours: overrideHours }),
    });
  },

  // ── SMS Automation ────────────────────────────────────────────────────────
  async getSmsAutomationRules() {
    const data = await request(`/admin/sms-automation`);
    return data.rules || data.items || data || [];
  },
  async createSmsAutomationRule(data) {
    return request(`/admin/sms-automation`, { method: "POST", body: JSON.stringify(data) });
  },
  async updateSmsAutomationRule(id, data) {
    return request(`/admin/sms-automation/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  async deleteSmsAutomationRule(id) {
    return request(`/admin/sms-automation/${id}`, { method: "DELETE" });
  },

  // ── File Upload (replaces base44.integrations.Core.UploadFile) ─────────────
  // TODO: server needs POST /admin/upload → { file_url: "https://..." }
  async uploadFile(file) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json(); // expects { file_url }
  },
};
