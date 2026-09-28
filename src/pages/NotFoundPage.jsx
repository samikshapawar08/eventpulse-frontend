import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16
          bg-indigo-600 rounded-2xl mb-6">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 font-[Poppins] mb-2">
          404
        </h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">
          Page not found
        </p>
        <p className="text-gray-400 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium
            rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );
}