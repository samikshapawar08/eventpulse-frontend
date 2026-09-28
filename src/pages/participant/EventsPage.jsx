import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, MapPin, Users, Clock } from "lucide-react";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

const STATUS_FILTERS = ["all", "upcoming", "ongoing", "completed"];

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 9;

  useEffect(() => {
    fetchEvents();
  }, [search, statusFilter, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        page_size: PAGE_SIZE,
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const res = await API.get(`/events?${params}`);
      setEvents(res.data.events);
      setTotal(res.data.total);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          Browse Events
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Discover and register for upcoming events
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
              outline-none focus:border-indigo-400 bg-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <LoadingSpinner text="Fetching events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No events found"
          subtitle="Try adjusting your search or check back later for new events."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm
                  disabled:opacity-40 hover:border-indigo-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm
                  disabled:opacity-40 hover:border-indigo-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, onClick }) {
  const spotsLeft = event.available_slots;
  const isFull = spotsLeft <= 0;
  const isDeadlinePassed = new Date() > new Date(event.registration_deadline);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden
        hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
    >
      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-indigo-50 to-sky-50 flex items-center
        justify-center relative">
        <Calendar size={32} className="text-indigo-200" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-indigo-600
          transition-colors font-[Poppins] line-clamp-1">
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={13} />
            {new Date(event.start_datetime).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={13} />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={13} />
            Deadline: {new Date(event.registration_deadline).toLocaleDateString("en-IN", {
              day: "numeric", month: "short",
            })}
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1">
              <Users size={11} /> {event.total_registrations}/{event.capacity}
            </span>
            <span>{isFull ? "Full" : `${spotsLeft} spots left`}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? "bg-red-400" :
                spotsLeft < event.capacity * 0.2 ? "bg-orange-400" : "bg-indigo-400"
              }`}
              style={{ width: `${Math.min((event.total_registrations / event.capacity) * 100, 100)}%` }}
            />
          </div>
        </div>

        <button
          className={`w-full py-2 rounded-xl text-xs font-medium transition-colors ${
            isFull || isDeadlinePassed || event.status === "completed" || event.status === "cancelled"
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isFull ? "Full" :
           isDeadlinePassed ? "Deadline passed" :
           event.status === "completed" ? "Completed" :
           event.status === "cancelled" ? "Cancelled" :
           "View & Register"}
        </button>
      </div>
    </div>
  );
}