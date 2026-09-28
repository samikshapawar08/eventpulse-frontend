import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import API from "../services/api";

const pageTitles = {
  "/dashboard": "Browse Events",
  "/my-registrations": "My Registrations",
  "/my-certificates": "My Certificates",
  "/notifications": "Notifications",
  "/admin/dashboard": "Dashboard",
  "/admin/events": "Event Management",
  "/admin/registrations": "Registrations",
  "/admin/scanner": "QR Scanner",
  "/admin/analytics": "Analytics",
  "/admin/feedback": "Feedback",
  "/admin/certificates": "Certificates",
  "/admin/notifications": "Notifications",
};

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const title = pageTitles[location.pathname] || "EventPulse";
  const notifTo = isAdmin() ? "/admin/notifications" : "/notifications";

  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications");
      setUnreadCount(res.data.unread || 0);
    } catch {
      // silently fail
    }
  };

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">

      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900 font-[Poppins]">
          {title}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button
          onClick={() => navigate(notifTo)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg
            text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white
              text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-600">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-900 leading-none">
              {user?.full_name?.split(" ")[0]}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}