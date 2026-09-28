import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, Calendar, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

const EMPTY_FORM = {
  title: "", description: "", venue: "",
  start_datetime: "", end_datetime: "",
  registration_deadline: "", capacity: "",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/events?page=1&page_size=50");
      setEvents(res.data.events);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      venue: event.venue || "",
      start_datetime: event.start_datetime?.slice(0, 16),
      end_datetime: event.end_datetime?.slice(0, 16),
      registration_deadline: event.registration_deadline?.slice(0, 16),
      capacity: event.capacity,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity),
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
        registration_deadline: new Date(form.registration_deadline).toISOString(),
      };
      if (editingEvent) {
        await API.put(`/events/${editingEvent.id}`, payload);
        toast.success("Event updated successfully");
      } else {
        await API.post("/events", payload);
        toast.success("Event created successfully");
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    }
  };

  const handleBannerUpload = async (eventId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await API.post(`/events/${eventId}/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Banner uploaded");
      fetchEvents();
    } catch {
      toast.error("Banner upload failed");
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
            Event Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {events.length} total events
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white
            text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Create event
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg
          text-sm outline-none focus:border-indigo-400 mb-5 bg-white"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No events yet"
          subtitle="Create your first event to get started."
          action={
            <button onClick={openCreate}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl
                hover:bg-indigo-700 transition-colors">
              Create event
            </button>
          }
        />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Event</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Capacity</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.venue && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {event.venue}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-600">
                      {new Date(event.start_datetime).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Users size={11} />
                      {event.total_registrations}/{event.capacity}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <label className="cursor-pointer w-7 h-7 flex items-center
                        justify-center rounded-lg text-gray-400 hover:bg-sky-50
                        hover:text-sky-600 transition-colors" title="Upload banner">
                        <Upload size={14} />
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0])
                              handleBannerUpload(event.id, e.target.files[0]);
                          }}
                        />
                      </label>
                      <button
                        onClick={() => openEdit(event)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg
                          text-gray-400 hover:bg-indigo-50 hover:text-indigo-600
                          transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id, event.title)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg
                          text-gray-400 hover:bg-red-50 hover:text-red-500
                          transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4
              flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 font-[Poppins]">
                {editingEvent ? "Edit event" : "Create new event"}
              </h3>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Event title *
                </label>
                <input required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Tech Fest 2026"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg
                    text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the event..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg
                    text-sm outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Venue
                </label>
                <input value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Main Auditorium, Block A"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg
                    text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Start date & time *
                  </label>
                  <input required type="datetime-local" value={form.start_datetime}
                    onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                      text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    End date & time *
                  </label>
                  <input required type="datetime-local" value={form.end_datetime}
                    onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                      text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Registration deadline *
                  </label>
                  <input required type="datetime-local" value={form.registration_deadline}
                    onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                      text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Capacity *
                  </label>
                  <input required type="number" min="1" value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                      text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm
                    text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm
                    font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingEvent ? "Update event" : "Create event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}