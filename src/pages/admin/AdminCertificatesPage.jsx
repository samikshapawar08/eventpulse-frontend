import { useState, useEffect } from "react";
import { Award, ChevronDown, Download, Zap, Eye } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional design with indigo header and borders",
    colors: ["#4F46E5", "#0EA5E9", "#F8FAFC"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Dark left panel with clean white right section",
    colors: ["#1E1B4B", "#818CF8", "#FFFFFF"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple with accent lines only",
    colors: ["#4F46E5", "#FFFFFF", "#F9FAFB"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Dark navy with gold accents — formal look",
    colors: ["#1E3A5F", "#C9A84C", "#F0F4FF"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Colorful diagonal accents with bold typography",
    colors: ["#4F46E5", "#0EA5E9", "#FAFAFA"],
  },
];

function TemplateCard({ template, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(template.id)}
      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-indigo-200"
      }`}
    >
      {/* Color preview */}
      <div className="flex gap-1.5 mb-3">
        {template.colors.map((color, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-lg border border-gray-100"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-900">{template.name}</p>
        {selected && (
          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            Selected
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">{template.description}</p>
    </div>
  );
}

export default function AdminCertificatesPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  useEffect(() => {
    API.get("/events?page=1&page_size=50")
      .then((res) => setEvents(res.data.events));
  }, []);

  const handleGenerate = async () => {
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const res = await API.post(
        `/certificates/events/${selectedEvent}/generate`,
        { template_name: selectedTemplate }
      );
      setResult(res.data);
      toast.success(`${res.data.generated} certificate(s) generated!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
          Certificate Management
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate certificates for event attendees with custom templates
        </p>
      </div>

      {/* Template Selection */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Select Certificate Template
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Currently selected: <span className="text-indigo-600 font-medium capitalize">
                {selectedTemplate}
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showTemplates ? "Hide" : "Show"} templates
          </button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selectedTemplate === t.id}
                onSelect={setSelectedTemplate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generate Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Generate certificates
        </p>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <select
              value={selectedEvent}
              onChange={(e) => { setSelectedEvent(e.target.value); setResult(null); }}
              className="appearance-none w-full px-4 py-2 pr-8 border border-gray-200
                rounded-lg text-sm outline-none focus:border-indigo-400 bg-white"
            >
              <option value="">Select an event...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
              text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedEvent || generating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white
              text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors
              disabled:opacity-50"
          >
            <Zap size={15} />
            {generating ? "Generating..." : "Generate Certificates"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Only participants marked as present receive certificates.
          Template: <span className="text-indigo-600 capitalize">{selectedTemplate}</span>
        </p>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-2xl font-bold text-emerald-600">{result.generated}</p>
              <p className="text-sm text-gray-500 mt-0.5">Generated</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-2xl font-bold text-gray-400">
                {result.skipped_not_present}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Skipped (absent)</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-2xl font-bold text-gray-900">{result.total_processed}</p>
              <p className="text-sm text-gray-500 mt-0.5">Total processed</p>
            </div>
          </div>

          {result.certificates.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-medium text-gray-500">
                  Generated certificates
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {result.certificates.map((cert, i) => (
                  <div key={i}
                    className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center
                        justify-center">
                        <Award size={15} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {cert.participant_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {cert.certificate_number}
                        </p>
                      </div>
                    </div>
                    
                    <a
                      href={`https://eventpulse-backend-yao4.onrender.com${cert.certificate_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-600
                        hover:text-indigo-700 font-medium"
                    >
                      <Download size={13} /> View PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.skipped_participants?.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-medium text-amber-700 mb-1">
                Skipped (not marked present):
              </p>
              <p className="text-xs text-amber-600">
                {result.skipped_participants.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {!result && !generating && !selectedEvent && (
        <EmptyState
          icon={<Award size={28} />}
          title="Select an event"
          subtitle="Choose an event, pick a template, and generate certificates."
        />
      )}
    </div>
  );
}