import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Users, Clock, ArrowLeft,
  CheckCircle, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEventAndRegistration();
  }, [eventId]);

  const fetchEventAndRegistration = async () => {
    setLoading(true);
    try {
      const [eventRes, regRes] = await Promise.allSettled([
        API.get(`/events/${eventId}`),
        API.get("/registrations/me"),
      ]);

      if (eventRes.status === "fulfilled") setEvent(eventRes.value.data);
      if (regRes.status === "fulfilled") {
        const myReg = regRes.value.data.find(
          (r) => r.event_id === eventId && r.status === "registered"
        );
        setRegistration(myReg || null);
      }
    } catch {
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await API.post(`/registrations/events/${eventId}`);
      toast.success("Successfully registered!");
      fetchEventAndRegistration();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel your registration for this event?")) return;
    setActionLoading(true);
    try {
      await API.delete(`/registrations/events/${eventId}`);
      toast.success("Registration cancelled");
      fetchEventAndRegistration();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Cancellation failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div className="text-gray-500">Event not found.</div>;

  const isDeadlinePassed = new Date() > new Date(event.registration_deadline);
  const isFull = event.available_slots <= 0;
  const canRegister =
    !registration &&
    !isDeadlinePassed &&
    !isFull &&
    event.status !== "completed" &&
    event.status !== "cancelled";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-sm text-gray-500
          hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to events
      </button>

      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-indigo-50 to-sky-100 rounded-2xl
        flex items-center justify-center mb-6 relative">
        <Calendar size={48} className="text-indigo-200" />
        <div className="absolute top-4 right-4">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins] mb-4">
          {event.title}
        </h1>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} className="text-indigo-400 flex-shrink-0" />
            {new Date(event.start_datetime).toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric",
              month: "long", year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} className="text-indigo-400 flex-shrink-0" />
            {new Date(event.start_datetime).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            })}
            {" — "}
            {new Date(event.end_datetime).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            })}
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} className="text-indigo-400 flex-shrink-0" />
              {event.venue}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={16} className="text-indigo-400 flex-shrink-0" />
            {event.total_registrations} / {event.capacity} registered
            {isFull && (
              <span className="text-xs text-red-500 font-medium">(Full)</span>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              About this event
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {/* Deadline notice */}
        <div className={`flex items-center gap-2 text-sm p-3 rounded-xl mb-5 ${
          isDeadlinePassed
            ? "bg-red-50 text-red-600"
            : "bg-amber-50 text-amber-600"
        }`}>
          <AlertCircle size={16} className="flex-shrink-0" />
          Registration deadline:{" "}
          {new Date(event.registration_deadline).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
          })}
          {isDeadlinePassed && " — Closed"}
        </div>

        {/* Capacity bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{event.total_registrations} registered</span>
            <span>{event.available_slots} spots left</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? "bg-red-400" :
                event.available_slots < event.capacity * 0.2
                  ? "bg-orange-400" : "bg-indigo-400"
              }`}
              style={{
                width: `${Math.min(
                  (event.total_registrations / event.capacity) * 100, 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Registration section */}
        {registration ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                You are registered!
              </span>
            </div>
            <p className="text-xs text-emerald-600 mb-3">
              Show the QR code below at the event entrance.
            </p>
            {registration.qr_code_url && (
              <div className="flex flex-col items-center gap-2 mb-3">
                <img
                  src={`https://eventpulse-backend-yao4.onrender.com${registration.qr_code_url}`}
                  alt="Your QR Code"
                  className="w-40 h-40 rounded-xl border border-emerald-100"
                />
                <p className="text-xs text-gray-400">
                  Token: {registration.qr_code_token?.slice(0, 8)}...
                </p>
              </div>
            )}
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full py-2 rounded-xl text-sm font-medium bg-white
                border border-red-200 text-red-500 hover:bg-red-50
                transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Cancelling..." : "Cancel registration"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRegister}
            disabled={!canRegister || actionLoading}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
              canRegister
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } disabled:opacity-60`}
          >
            {actionLoading ? "Registering..." :
             isFull ? "Event is full" :
             isDeadlinePassed ? "Registration closed" :
             event.status === "completed" ? "Event completed" :
             event.status === "cancelled" ? "Event cancelled" :
             "Register for this event"}
          </button>
        )}
      </div>
    </div>
  );
}