import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import WorkshopRegistrationsPage from "./pages/admin/WorkshopRegistrationsPage";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";

import HomePage from "./pages/user/HomePage";
import WorkshopsPage from "./pages/user/WorkshopsPage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import WorkshopRegistrationPage from "./pages/user/WorkshopRegistrationPage";
import MyWorkshopsPage from "./pages/user/MyWorkshopsPage";

import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminWorkshopsPage from "./pages/admin/AdminWorkshopsPage";

function PlaceholderPage({ title }) {
  return (
    <main className="min-h-[70vh] bg-offwhite px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
          Workshop Platform
        </p>
        <h1 className="font-display text-4xl font-semibold text-navy md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-navy/60">
          This page will be implemented in the next development stages.
        </p>
      </div>
    </main>
  );
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />

            <Route
              path="/workshops"
              element={
                <PublicLayout>
                  <WorkshopsPage />
                </PublicLayout>
              }
            />

            <Route
              path="/login"
              element={
                <PublicLayout>
                  <LoginPage />
                </PublicLayout>
              }
            />

            <Route
              path="/register"
              element={
                <PublicLayout>
                  <RegisterPage />
                </PublicLayout>
              }
            />

            <Route
              path="/my-workshops"
              element={
                <PublicLayout>
                  <MyWorkshopsPage />
                </PublicLayout>
              }
            />

            <Route
              path="/workshops/register"
              element={
                <ProtectedRoute>
                  <PublicLayout>
                    <WorkshopRegistrationPage />
                  </PublicLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="/admin/dashboard"
              element={<Navigate to="/admin/workshops" replace />}
            />

            <Route
              path="/admin/workshops"
              element={
                <AdminProtectedRoute>
                  <AdminWorkshopsPage />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/registrations"
              element={
                <AdminProtectedRoute>
                  <PlaceholderPage title="All Registrations" />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/workshops/:workshopId/registrations"
              element={
                <AdminProtectedRoute>
                  <WorkshopRegistrationsPage />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <PublicLayout>
                  <PlaceholderPage title="Page Not Found" />
                </PublicLayout>
              }
            />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
