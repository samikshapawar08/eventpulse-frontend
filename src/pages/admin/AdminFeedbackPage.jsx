import { useState, useEffect } from "react";
import { Star, ChevronDown, MessageSquare } from "lucide-react";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/events?page=1&page_size=50")
      .then((res) => setEvents(res.data.events));
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    API.get(`/feedback/events/${selectedEvent}`)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          Feedback
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          View ratings and comments per event
        </p>
      </div>

      {/* Event selector */}
      <div className="relative w-72 mb-6">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="appearance-none w-full px-4 py-2 pr-8 border border-gray-200
            rounded-lg text-sm outline-none focus:border-indigo-400 bg-white"
        >
          <option value="">Select an event...</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
          text-gray-400 pointer-events-none" />
      </div>

      {!selectedEvent ? (
        <EmptyState
          icon={<MessageSquare size={28} />}
          title="Select an event"
          subtitle="Choose an event to view its feedback and ratings."
        />
      ) : loading ? (
        <LoadingSpinner />
      ) : !summary || summary.total_feedback === 0 ? (
        <EmptyState
          icon={<MessageSquare size={28} />}
          title="No feedback yet"
          subtitle="No participants have submitted feedback for this event."
        />
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-2xl font-bold text-gray-900">
                {summary.total_feedback}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Total responses</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-2xl font-bold text-amber-500">
                {summary.average_rating} ★
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Average rating</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="space-y-1">
                {Object.entries(summary.rating_breakdown)
                  .reverse()
                  .map(([star, count]) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{star}★</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: summary.total_feedback > 0
                              ? `${(count / summary.total_feedback) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-4">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Individual feedback */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-500">
                Individual responses
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {summary.feedbacks.map((f) => (
                <div key={f.feedback_id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-900">
                      {f.participant_name || "Anonymous"}
                    </p>
                    <StarRating rating={f.rating} />
                  </div>
                  {f.comment && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {f.comment}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(f.submitted_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}