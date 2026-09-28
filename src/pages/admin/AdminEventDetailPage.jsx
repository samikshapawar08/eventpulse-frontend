import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  MessageSquare,
  Award,
  Mail,
} from "lucide-react";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-hot-toast";

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon size={18} />
      </div>

      <p className="text-xl font-bold text-gray-900">
        {value}
      </p>

      <p className="text-xs text-gray-500 mt-0.5">
        {label}
      </p>
    </div>
  );
}

export default function AdminEventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Send reminder email state
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [eventId]);

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [
        eventRes,
        analyticsRes,
        attendanceRes,
      ] = await Promise.allSettled([
        API.get(`/events/${eventId}`),
        API.get(`/analytics/events/${eventId}`),
        API.get(`/attendance/events/${eventId}`),
      ]);

      if (eventRes.status === "fulfilled") {
        setEvent(eventRes.value.data);
      }

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.data);
      }

      if (attendanceRes.status === "fulfilled") {
        setAttendance(attendanceRes.value.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Send reminder emails
  // ============================================================

  const handleSendReminders = async () => {
    if (
      !confirm(
        "Send reminder emails to all registered participants?"
      )
    ) {
      return;
    }

    setSendingReminders(true);

    try {
      const res = await API.post(
        `/email-notifications/reminder/${eventId}`
      );

      toast.success(
        `${res.data.sent} reminder emails queued!`
      );
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to send reminders"
      );
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="text-gray-500">
        Event not found.
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate("/admin/events")}
        className="flex items-center gap-2 text-sm text-gray-500
          hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to events
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-[Poppins] mb-2">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar
                  size={15}
                  className="text-indigo-400"
                />

                {new Date(
                  event.start_datetime
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              {event.venue && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin
                    size={15}
                    className="text-indigo-400"
                  />
                  {event.venue}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock
                  size={15}
                  className="text-indigo-400"
                />

                Deadline:{" "}
                {new Date(
                  event.registration_deadline
                ).toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>

          {/* Status + Send Reminders */}
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={event.status} />

            <button
              onClick={handleSendReminders}
              disabled={sendingReminders}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={13} />

              {sendingReminders
                ? "Sending..."
                : "Send Reminders"}
            </button>
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      {/* Analytics stats */}
      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <StatCard
              label="Registrations"
              value={analytics.total_registrations}
              icon={Users}
              color="indigo"
            />

            <StatCard
              label="Present"
              value={analytics.total_present}
              icon={TrendingUp}
              color="emerald"
            />

            <StatCard
              label="Attendance Rate"
              value={`${analytics.attendance_rate}%`}
              icon={TrendingUp}
              color="amber"
            />

            <StatCard
              label="Avg Rating"
              value={
                analytics.average_rating > 0
                  ? `${analytics.average_rating}★`
                  : "N/A"
              }
              icon={MessageSquare}
              color="sky"
            />
          </div>

          {/* Engagement score */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Engagement Score
              </p>

              <p className="text-lg font-bold text-indigo-600">
                {analytics.engagement_score}/100
              </p>
            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{
                  width: `${analytics.engagement_score}%`,
                }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Attendance × 40% + Feedback × 30% +
              Registrations × 30%
            </p>
          </div>
        </>
      )}

      {/* Attendance table */}
      {attendance &&
        attendance.records.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div
              className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex
                items-center justify-between"
            >
              <p className="text-xs font-medium text-gray-500">
                Attendance Records
              </p>

              <div className="flex gap-3 text-xs">
                <span className="text-emerald-600 font-medium">
                  ✓ {attendance.total_present} present
                </span>

                <span className="text-gray-400">
                  ✗ {attendance.total_absent} absent
                </span>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Participant
                  </th>

                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Registration
                  </th>

                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Attendance
                  </th>

                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Scanned at
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {attendance.records.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {r.participant_name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {r.participant_email}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={r.registration_status}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={r.attendance_status}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">
                        {r.scanned_at
                          ? new Date(
                              r.scanned_at
                            ).toLocaleTimeString(
                              "en-IN"
                            )
                          : "—"}
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