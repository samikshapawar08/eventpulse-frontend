import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../services/api";

export default function QRScanner({ onSuccess }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
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
        { facingMode: "environment" }, // use back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR code scanned — stop scanner and send to backend
          await html5QrCode.stop();
          setScanning(false);
          await sendToBackend(decodedText);
        },
        () => {} // ignore scan failures (happens every frame until success)
      );
    } catch (err) {
      setScanning(false);
      setError("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  const sendToBackend = async (token) => {
    setLoading(true);
    try {
      const response = await API.post("/attendance/scan", { qr_token: token });
      setResult(response.data);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 font-[Poppins]">
        QR Attendance Scanner
      </h2>

      {/* Scanner viewport */}
      <div
        id="qr-reader"
        className="w-full rounded-xl overflow-hidden bg-gray-100"
        style={{ minHeight: scanning ? "300px" : "0px" }}
      />

      {/* Controls */}
      <div className="mt-4 flex gap-3">
        {!scanning ? (
          <button
            onClick={startScanner}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Start Scanner"}
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {/* Success result */}
      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-emerald-700 font-semibold">✓ Attendance Marked</p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Name:</span> {result.participant_name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {result.participant_email}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Event:</span> {result.event_title}
          </p>
          <button
            onClick={startScanner}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Scan Next
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 font-medium">✗ {error}</p>
          <button
            onClick={startScanner}
            className="mt-2 text-sm text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}