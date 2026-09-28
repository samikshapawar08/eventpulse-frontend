import { useState } from "react";
import { Search, ExternalLink, CheckCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

const TEMPLATE_FIELDS = [
  { key: "topic", label: "Session Topic *", placeholder: "e.g. Career in Data Analytics", required: true },
  { key: "skills", label: "Required Skills", placeholder: "e.g. Python, SQL, Power BI" },
  { key: "industry", label: "Industry / Domain", placeholder: "e.g. IT / Analytics" },
  { key: "audience", label: "Target Audience", placeholder: "e.g. BSc IT Students" },
  { key: "experience", label: "Preferred Experience", placeholder: "e.g. 3+ years" },
  { key: "location", label: "Location (optional)", placeholder: "e.g. Mumbai, India" },
  { key: "additional_requirements", label: "Additional Requirements", placeholder: "Any other details..." },
];

const SCORE_CRITERIA = [
  { label: "Topic/Domain Match", weight: "30%" },
  { label: "Skills Match", weight: "25%" },
  { label: "Profession Match", weight: "20%" },
  { label: "Experience Match", weight: "15%" },
  { label: "Industry Match", weight: "10%" },
];

function MatchScore({ score }) {
  const color =
    score >= 70 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    score >= 40 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-red-500 bg-red-50 border-red-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs
      font-bold border ${color}`}>
      {score}% Match
    </span>
  );
}

function ExpertCard({ expert, index }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5
      hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center
            justify-center shrink-0">
            <span className="text-sm font-bold text-indigo-600">
              {expert.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {expert.name}
            </p>
            {expert.profession && (
              <p className="text-xs text-gray-500">{expert.profession}</p>
            )}
            {expert.organization && (
              <p className="text-xs text-indigo-500">{expert.organization}</p>
            )}
          </div>
        </div>
        <MatchScore score={expert.match_score} />
      </div>

      {expert.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
          {expert.description}
        </p>
      )}

      {expert.match_reasons?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1.5">
            Recommended because:
          </p>
          <div className="space-y-1">
            {expert.match_reasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle size={11} />
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {expert.profile_url && (
        <a
          href={expert.profile_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600
            hover:text-indigo-700 font-medium border border-indigo-200
            hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink size={12} /> View Profile / Source
        </a>
      )}
    </div>
  );
}

export default function ExpertSearchPage() {
  const [form, setForm] = useState({
    topic: "", skills: "", industry: "", audience: "",
    experience: "", location: "", additional_requirements: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      toast.error("Session topic is required");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const res = await API.post("/expert-search/search", form);
      setResults(res.data.results || []);
      setSearched(true);
      if (res.data.results?.length === 0) {
        toast("No results found. Try broadening your search.", { icon: "🔍" });
      } else {
        toast.success(`Found ${res.data.results.length} relevant results`);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Search failed. Try again.";
      toast.error(msg);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      topic: "", skills: "", industry: "", audience: "",
      experience: "", location: "", additional_requirements: "",
    });
    setResults([]);
    setSearched(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          Expert Session Recommendation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter session requirements to find relevant experts via real-time web search
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Search Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 font-[Poppins]">
              Session Requirements
            </h3>

            <form onSubmit={handleSearch} className="space-y-3">
              {TEMPLATE_FIELDS.map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  {key === "additional_requirements" ? (
                    <textarea
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg
                        text-xs outline-none focus:border-indigo-400 resize-none"
                    />
                  ) : (
                    <input
                      required={required}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg
                        text-xs outline-none focus:border-indigo-400"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5
                    bg-indigo-600 text-white text-xs font-medium rounded-xl
                    hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader size={13} className="animate-spin" /> Searching...</>
                  ) : (
                    <><Search size={13} /> Search Experts</>
                  )}
                </button>
                {searched && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2.5 border border-gray-200 text-gray-500
                      text-xs rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {/* Scoring criteria */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Matching Criteria
              </p>
              <div className="space-y-1.5">
                {SCORE_CRITERIA.map((c) => (
                  <div key={c.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{c.label}</span>
                    <span className="text-indigo-600 font-medium">{c.weight}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Results are ranked using a transparent rule-based scoring system.
                This is not an AI model — it performs a real-time web search and
                matches results against your requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent
                rounded-full animate-spin" />
              <p className="text-sm text-gray-400">
                Searching the web for relevant experts...
              </p>
            </div>
          )}

          {!loading && !searched && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center
                justify-center mb-4">
                <Search size={28} className="text-indigo-400" />
              </div>
              <p className="text-base font-semibold text-gray-700 font-[Poppins]">
                Enter requirements to search
              </p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Fill in the session details on the left and click Search Experts
                to find relevant professionals.
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center
                justify-center mb-4">
                <Search size={28} className="text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-700 font-[Poppins]">
                No results found
              </p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Try using broader terms, different skills, or remove optional filters.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{results.length}</span>
                  {" "}results found for{" "}
                  <span className="font-semibold text-indigo-600">"{form.topic}"</span>
                </p>
                <p className="text-xs text-gray-400">Sorted by match score</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((expert, i) => (
                  <ExpertCard key={i} expert={expert} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}