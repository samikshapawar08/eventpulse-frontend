import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
//import API from "../../services/api";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const typeColors = {
  registration_confirmed: "bg-emerald-50 text-emerald-600",
  certificate_ready: "bg-indigo-50 text-indigo-600",
  event_updated: "bg-amber-50 text-amber-600",
  event_cancelled: "bg-red-50 text-red-600",
  general: "bg-gray-100 text-gray-500",
};

export default function NotificationsPage() {
  const [data, setData] = useState({ total: 0, unread: 0, notifications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setData(res.data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
            Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {data.unread} unread · {data.total} total
          </p>
        </div>
        {data.unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-indigo-600
              hover:text-indigo-700 font-medium"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {data.notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No notifications"
          subtitle="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="space-y-2">
          {data.notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white border rounded-xl p-4 transition-all ${
                n.is_read
                  ? "border-gray-100"
                  : "border-indigo-100 bg-indigo-50/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  flex-shrink-0 text-xs font-bold
                  ${typeColors[n.type] || "bg-gray-100 text-gray-500"}`}>
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                        text-gray-400 hover:text-emerald-600 hover:bg-emerald-50
                        transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                      text-gray-400 hover:text-red-500 hover:bg-red-50
                      transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}