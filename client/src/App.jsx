
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/user/HomePage";
import WorkshopsPage from "./pages/user/WorkshopsPage";

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
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />

        {/* Actual workshops page */}
        <Route
          path="/workshops"
          element={
            <PublicLayout>
              <WorkshopsPage />
            </PublicLayout>
          }
        />

        <Route
          path="/my-workshops"
          element={
            <PublicLayout>
              <PlaceholderPage title="My Workshops" />
            </PublicLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PublicLayout>
              <PlaceholderPage title="Log In" />
            </PublicLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PublicLayout>
              <PlaceholderPage title="Create an Account" />
            </PublicLayout>
          }
        />

        <Route
          path="/workshops/register"
          element={
            <PublicLayout>
              <PlaceholderPage title="Workshop Registration" />
            </PublicLayout>
          }
        />

        <Route
          path="/admin/login"
          element={<PlaceholderPage title="Admin Login" />}
        />

        <Route
          path="/admin/dashboard"
          element={<PlaceholderPage title="Admin Dashboard" />}
        />

        <Route
          path="/admin/workshops/:workshopId/registrations"
          element={<PlaceholderPage title="Workshop Registrations" />}
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
    </BrowserRouter>
  );
}
