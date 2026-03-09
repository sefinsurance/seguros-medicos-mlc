import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2, Plus } from "lucide-react";

export default function LeadNotesSection({ leadId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadNotes();
  }, [leadId]);

  const loadNotes = async () => {
    setLoading(true);
    const data = await base44.entities.LeadNote.filter({ lead_id: leadId }, "-created_date", 50);
    setNotes(data);
    setLoading(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    await base44.entities.LeadNote.create({ lead_id: leadId, text: newNote });
    setNewNote("");
    await loadNotes();
    setSaving(false);
  };

  const deleteNote = async (id) => {
    setDeleting(id);
    await base44.entities.LeadNote.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    setDeleting(null);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Timestamped Notes</label>
      
      {/* Notes list */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2 max-h-48 overflow-y-auto">
        {loading ? (
          <div className="text-xs text-gray-400 text-center py-4">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">No notes yet</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white rounded-lg p-2 flex items-start justify-between gap-2 border border-gray-200 text-xs">
              <div className="flex-1 min-w-0">
                <div className="text-gray-700 break-words">{note.text}</div>
                <div className="text-gray-400 text-xs mt-1">{formatDate(note.created_date)}</div>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                disabled={deleting === note.id}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting === note.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add note */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyPress={e => e.key === "Enter" && addNote()}
          placeholder="Add a note..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim() || saving}
          className="flex items-center justify-center gap-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}