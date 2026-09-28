import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Zap, LayoutDashboard, CalendarDays, ClipboardList,
  QrCode, BarChart3, MessageSquare, Award,
  Bell, Settings, LogOut, Users,Search
} from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/events", icon: CalendarDays, label: "Events" },
  { to: "/admin/registrations", icon: ClipboardList, label: "Registrations" },
  { to: "/admin/scanner", icon: QrCode, label: "QR Scanner" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
  { to: "/admin/certificates", icon: Award, label: "Certificates" },
  { to: "/admin/expert-search", icon: Search, label: "Expert Search" },  
];

const participantLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Browse Events" },
  { to: "/my-registrations", icon: ClipboardList, label: "My Registrations" },
  { to: "/my-certificates", icon: Award, label: "My Certificates" },
];

const bottomLinks = [
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin() ? adminLinks : participantLinks;
  const notifTo = isAdmin() ? "/admin/notifications" : "/notifications";

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-30">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 font-[Poppins] leading-none">
            EventPulse
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isAdmin() ? "Admin Panel" : "Participant"}
          </p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
          {isAdmin() ? "Management" : "Explore"}
        </p>

        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">
          Account
        </p>

        <NavLink
          to={notifTo}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-indigo-50 text-indigo-600 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Bell size={17} />
          Notifications
        </NavLink>
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-1">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-indigo-600">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user?.full_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500
            hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}