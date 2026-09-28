import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Calendar, MapPin, QrCode } from "lucide-react";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

export default function MyRegistrationsPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    API.get("/registrations/me")
      .then((res) => setRegistrations(res.data))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          My Registrations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          All events you have registered for
        </p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="No registrations yet"
          subtitle="Browse events and register to see them here."
          action={
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl
                hover:bg-indigo-700 transition-colors"
            >
              Browse events
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white border border-gray-100 rounded-2xl p-5
                hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm font-[Poppins] truncate">
                      {reg.event_title || "Event"}
                    </h3>
                    <StatusBadge status={reg.status} />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2">
                    {reg.event_start_datetime && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(reg.event_start_datetime).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    )}
                    {reg.event_venue && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} />
                        {reg.event_venue}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Registered on{" "}
                    {new Date(reg.registered_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                {reg.status === "registered" && reg.qr_code_url && (
                  <button
                    onClick={() => setSelectedQR(reg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      bg-indigo-50 text-indigo-600 text-xs font-medium
                      hover:bg-indigo-100 transition-colors flex-shrink-0"
                  >
                    <QrCode size={13} /> View QR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900 mb-1 font-[Poppins]">
              Your QR Code
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {selectedQR.event_title}
            </p>
            <img
              src={`https://eventpulse-backend-yao4.onrender.com${selectedQR.qr_code_url}`}
              alt="QR Code"
              className="w-48 h-48 mx-auto rounded-xl border border-gray-100 mb-4"
            />
            <p className="text-xs text-gray-400 mb-4">
              Show this at the event entrance
            </p>
            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600
                text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}