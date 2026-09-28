import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, QrCode, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

export default function QRScannerPage() {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState("");

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setResult(null);
    setError(null);
    setScanning(true);

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);
          await sendToken(decodedText);
        },
        () => {}
      );
    } catch {
      setScanning(false);
      setError("Camera access denied. Use manual entry below.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  const sendToken = async (token) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await API.post("/attendance/scan", { qr_token: token });
      setResult(res.data);
      toast.success("Attendance marked!");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to mark attendance";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    sendToken(manualToken.trim());
    setManualToken("");
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          QR Scanner
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Scan participant QR codes to mark attendance
        </p>
      </div>

      {/* Scanner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
        <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-gray-100"
          style={{ minHeight: scanning ? "300px" : "0px" }} />

        <div className="flex gap-3 mt-4">
          {!scanning ? (
            <button onClick={startScanner} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5
                bg-indigo-600 text-white text-sm font-medium rounded-xl
                hover:bg-indigo-700 transition-colors disabled:opacity-50">
              <QrCode size={16} />
              {loading ? "Processing..." : "Start camera scanner"}
            </button>
          ) : (
            <button onClick={stopScanner}
              className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium
                rounded-xl hover:bg-red-600 transition-colors">
              Stop scanner
            </button>
          )}
        </div>
      </div>

      {/* Manual entry */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Manual token entry
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste QR token here..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm
              outline-none focus:border-indigo-400"
          />
          <button type="submit" disabled={loading || !manualToken.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg
              hover:bg-indigo-700 transition-colors disabled:opacity-50">
            Submit
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={20} className="text-emerald-600" />
            <p className="font-semibold text-emerald-700 text-sm">
              Attendance marked successfully
            </p>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Name:</span> {result.participant_name}</p>
            <p><span className="font-medium">Email:</span> {result.participant_email}</p>
            <p><span className="font-medium">Event:</span> {result.event_title}</p>
            <p><span className="font-medium">Scanned at:</span>{" "}
              {new Date(result.scanned_at).toLocaleTimeString("en-IN")}
            </p>
          </div>
          <button onClick={() => { setResult(null); startScanner(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5
              bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700
              transition-colors">
            <RefreshCw size={14} /> Scan next participant
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
          <button onClick={() => setError(null)}
            className="mt-3 text-xs text-red-400 underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}