import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import API from "../services/api";

const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];

function KPICard({ title, value, subtitle, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colorMap[color]}`}>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="text-gray-800 font-semibold text-sm">{title}</h3>
      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [kpiRes, trendsRes, topRes, statusRes, ratingRes] =
        await Promise.all([
          API.get("/analytics/kpis"),
          API.get("/analytics/trends"),
          API.get("/analytics/top-events"),
          API.get("/analytics/event-status-distribution"),
          API.get("/analytics/rating-distribution"),
        ]);

      setKpis(kpiRes.data);
      setTrends(trendsRes.data.trends);
      setTopEvents(topRes.data);
      setStatusDist(statusRes.data);
      setRatingDist(ratingRes.data);
    } catch (err) {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform-wide performance overview
        </p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Events"
            value={kpis.total_events}
            subtitle="All time"
            color="indigo"
          />
          <KPICard
            title="Total Users"
            value={kpis.total_users}
            subtitle="Participants"
            color="sky"
          />
          <KPICard
            title="Registrations"
            value={kpis.total_registrations}
            subtitle="Active"
            color="emerald"
          />
          <KPICard
            title="Attendance Rate"
            value={`${kpis.attendance_rate}%`}
            subtitle={`${kpis.total_present} present`}
            color="orange"
          />
          <KPICard
            title="Certificates Issued"
            value={kpis.total_certificates}
            color="indigo"
          />
          <KPICard
            title="Feedback Received"
            value={kpis.total_feedback}
            color="sky"
          />
          <KPICard
            title="Average Rating"
            value={`${kpis.average_rating} ★`}
            subtitle="Out of 5"
            color="emerald"
          />
        </div>
      )}

      {/* Monthly Trends Line Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 font-[Poppins]">
          Monthly Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="registrations"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Events Bar Chart + Status Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 font-[Poppins]">
            Top Events by Registrations
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topEvents} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="event_title"
                type="category"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="registrations" fill="#4F46E5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 font-[Poppins]">
            Event Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDist}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ status, percent }) =>
                  `${status} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusDist.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 font-[Poppins]">
          Rating Distribution
        </h2>
        <ResponsiveContainer width="100%" height={220}>
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