import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { ClipboardList } from "lucide-react";

export default function AdminRegistrationsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/events?page=1&page_size=50")
      .then((res) => setEvents(res.data.events))
      .finally(() => setEventsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    API.get(`/registrations/events/${selectedEvent}`)
      .then((res) => setRegistrations(res.data))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const filtered = registrations.filter((r) =>
    r.participant_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.participant_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          Registrations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          View all participants for each event
        </p>
      </div>

      {/* Event selector */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="appearance-none w-full sm:w-72 px-4 py-2 pr-8 border
              border-gray-200 rounded-lg text-sm outline-none
              focus:border-indigo-400 bg-white"
          >
            <option value="">Select an event...</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 pointer-events-none" />
        </div>

        {selectedEvent && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2
              text-gray-400" />
            <input
              type="text"
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                outline-none focus:border-indigo-400 w-64"
            />
          </div>
        )}
      </div>

      {!selectedEvent ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="Select an event"
          subtitle="Choose an event from the dropdown to view its registrations."
        />
      ) : loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="No registrations"
          subtitle="No participants have registered for this event yet."
        />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex
            items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              {filtered.length} participant{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                  Participant
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                  Registered on
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                  QR Token
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {reg.participant_name}
                    </p>
                    <p className="text-xs text-gray-400">{reg.participant_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600">
                      {new Date(reg.registered_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-mono">
                      {reg.qr_code_token?.slice(0, 12)}...
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}