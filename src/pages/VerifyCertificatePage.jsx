import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldX, Search, Zap } from "lucide-react";
import API from "../services/api";

export default function VerifyCertificatePage() {
  const navigate = useNavigate();
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await API.get(`/certificates/verify/${certId.trim().toUpperCase()}`);
      setResult(res.data);
    } catch {
      setResult({ valid: false,
        message: "Certificate not found. The ID entered is invalid." });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal navbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4
        flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate("/login")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center
            justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 font-[Poppins]">
            EventPulse
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Sign in
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center
              justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">
              Verify Certificate
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Enter a certificate ID to verify its authenticity
            </p>
          </div>

          {/* Search form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Certificate ID
                </label>
                <input
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. EP-2026-00001"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                    text-sm outline-none focus:border-indigo-400 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !certId.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5
                  bg-indigo-600 text-white text-sm font-medium rounded-xl
                  hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white
                    border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Search size={15} /> Verify Certificate</>
                )}
              </button>
            </form>
          </div>

          {/* Result */}
          {searched && result && (
            result.valid ? (
              <div className="bg-white border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex
                    items-center justify-center">
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      ✓ Certificate Verified
                    </p>
                    <p className="text-xs text-emerald-600">
                      This certificate is authentic
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  {[
                    { label: "Participant", value: result.participant_name },
                    { label: "Event", value: result.event_title },
                    { label: "Event Date", value: result.event_date },
                    { label: "Certificate ID", value: result.certificate_number },
                    { label: "Issued On", value: result.issued_at },
                    { label: "Issued By", value: result.organizer },
                    { label: "Status", value: result.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {label}
                      </span>
                      <span className={`text-xs font-medium text-right ${
                        label === "Status" ? "text-emerald-600" : "text-gray-900"
                      }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center
                    justify-center">
                    <ShieldX size={20} className="text-red-500" />
                  </div>
                  <p className="text-sm font-bold text-red-600">
                    ✕ Certificate Not Found
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {result.message}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-gray-400 border-t
        border-gray-100">
        © 2026 EventPulse · Certificate Verification Portal
      </footer>
    </div>
  );
}