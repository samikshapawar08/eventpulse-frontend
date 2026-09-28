import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute, PublicRoute } from "./routes/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Participant Pages
import ParticipantLayout from "./layouts/ParticipantLayout";
import EventsPage from "./pages/participant/EventsPage";
import EventDetailPage from "./pages/participant/EventDetailPage";
import MyRegistrationsPage from "./pages/participant/MyRegistrationsPage";
import MyCertificatesPage from "./pages/participant/MyCertificatesPage";
import NotificationsPage from "./pages/NotificationsPage";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminEventDetailPage from "./pages/admin/AdminEventDetailPage";
import AdminRegistrationsPage from "./pages/admin/AdminRegistrationsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage";
import AdminCertificatesPage from "./pages/admin/AdminCertificatesPage";
import QRScannerPage from "./pages/admin/QRScannerPage";
import ExpertSearchPage from "./pages/admin/ExpertSearchPage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";

import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute><SignupPage /></PublicRoute>
          } />
          <Route path="/verify-certificate" element={<VerifyCertificatePage />} />

          {/* Participant routes */}
          <Route path="/" element={
            <ProtectedRoute><ParticipantLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<EventsPage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="my-registrations" element={<MyRegistrationsPage />} />
            <Route path="my-certificates" element={<MyCertificatesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin routes */}
              <Route path="/admin" element={
        <AdminRoute><AdminLayout /></AdminRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="events/:eventId" element={<AdminEventDetailPage />} />
        <Route path="scanner" element={<QRScannerPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="registrations" element={<AdminRegistrationsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="expert-search" element={<ExpertSearchPage />} />
      </Route>

          {/* Fallback */}
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}