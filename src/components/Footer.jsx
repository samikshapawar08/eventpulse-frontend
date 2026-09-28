import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center
                justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 font-[Poppins]">
                EventPulse
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">
              Smart Event Engagement & Analytics System
            </p>
            <p className="text-xs text-indigo-500 italic font-medium">
              "Plan. Participate. Connect."
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-semibold text-gray-800 uppercase
              tracking-wider mb-3">
              Quick Links
            </p>
            <ul className="space-y-2">
              {[
                { label: "Home", to: "/dashboard" },
                { label: "Browse Events", to: "/dashboard" },
                { label: "Verify Certificate", to: "/verify-certificate" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-xs text-gray-500 hover:text-indigo-600
                      transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Participants */}
          <div>
            <p className="text-xs font-semibold text-gray-800 uppercase
              tracking-wider mb-3">
              Participants
            </p>
            <ul className="space-y-2">
              {[
                { label: "Browse Events", to: "/dashboard" },
                { label: "My Registrations", to: "/my-registrations" },
                { label: "My Certificates", to: "/my-certificates" },
                { label: "Verify Certificate", to: "/verify-certificate" },
                { label: "Notifications", to: "/notifications" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-xs text-gray-500 hover:text-indigo-600
                      transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <p className="text-xs font-semibold text-gray-800 uppercase
              tracking-wider mb-3">
              Organizers
            </p>
            <ul className="space-y-2">
              {[
                { label: "Dashboard", to: "/admin/dashboard" },
                { label: "Manage Events", to: "/admin/events" },
                { label: "Analytics", to: "/admin/analytics" },
                { label: "QR Scanner", to: "/admin/scanner" },
                { label: "Expert Recommendation", to: "/admin/expert-search" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-xs text-gray-500 hover:text-indigo-600
                      transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold text-gray-800 uppercase
              tracking-wider mb-3">
              Support
            </p>
            <ul className="space-y-2">
              {[
                { label: "Verify Certificate", to: "/verify-certificate" },
                { label: "Sign In", to: "/login" },
                { label: "Create Account", to: "/signup" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-xs text-gray-500 hover:text-indigo-600
                      transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 mt-8 pt-5 flex flex-col
          sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © 2026 EventPulse. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built for colleges, NGOs & organizations
          </p>
        </div>
      </div>
    </footer>
  );
}