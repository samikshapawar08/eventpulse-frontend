import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  CalendarDays, Users, ClipboardList, TrendingUp,
  Award, MessageSquare, Star, Activity,
} from "lucide-react";
import API from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];

function KPICard({ title, value, subtitle, icon: Icon, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 font-[Poppins]">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [k, t, top, s, r] = await Promise.all([
        API.get("/analytics/kpis"),
        API.get("/analytics/trends"),
        API.get("/analytics/top-events"),
        API.get("/analytics/event-status-distribution"),
        API.get("/analytics/rating-distribution"),
      ]);
      setKpis(k.data);
      setTrends(t.data.trends);
      setTopEvents(top.data);
      setStatusDist(s.data);
      setRatingDist(r.data);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Events" value={kpis.total_events}
            subtitle="All time" icon={CalendarDays} color="indigo" />
          <KPICard title="Total Users" value={kpis.total_users}
            subtitle="Participants" icon={Users} color="sky" />
          <KPICard title="Registrations" value={kpis.total_registrations}
            subtitle="Active" icon={ClipboardList} color="emerald" />
          <KPICard title="Attendance Rate" value={`${kpis.attendance_rate}%`}
            subtitle={`${kpis.total_present} present`} icon={TrendingUp} color="orange" />
          <KPICard title="Certificates" value={kpis.total_certificates}
            subtitle="Issued" icon={Award} color="purple" />
          <KPICard title="Feedback" value={kpis.total_feedback}
            subtitle="Submissions" icon={MessageSquare} color="sky" />
          <KPICard title="Avg Rating" value={`${kpis.average_rating} ★`}
            subtitle="Out of 5" icon={Star} color="orange" />
          <KPICard title="Present" value={kpis.total_present}
            subtitle="Attended" icon={Activity} color="emerald" />
        </div>
      )}

      {/* Monthly Trends */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 font-[Poppins] mb-4">
          Monthly Trends
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="registrations"
              stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="attendance"
              stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="events"
              stroke="#0EA5E9" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Top Events */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 font-[Poppins] mb-4">
            Top Events by Registrations
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topEvents} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="event_title" type="category"
                width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="registrations" fill="#4F46E5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 font-[Poppins] mb-4">
            Event Status
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} dataKey="count" nameKey="status"
                cx="50%" cy="50%" outerRadius={80}
                label={({ status, percent }) =>
                  `${status} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 font-[Poppins] mb-4">
          Rating Distribution
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ratingDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}