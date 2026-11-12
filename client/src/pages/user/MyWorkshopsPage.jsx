import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  ArrowUpRight,
  BookOpen,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getMyRegistrations,
  clearMyRegistrationsCache,
} from "../../services/registrationService";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function isUpcoming(registration) {
  return new Date(registration.workshop.dateTime) > new Date();
}

function StatusBadge({ status, upcoming }) {
  if (status === "CANCELLED") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        Cancelled
      </span>
    );
  }

  if (!upcoming) {
    return (
      <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600">
        Completed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
      Confirmed
    </span>
  );
}

function RegistrationCard({ registration }) {
  const workshop = registration.workshop;
  const upcoming = isUpcoming(registration);

  const canJoinGroup =
    upcoming &&
    workshop.status !== "CANCELLED" &&
    workshop.whatsappLink;

  return (
    <article className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl hover:shadow-navy/5">
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#987438]">
            Workshop Registration
          </p>

          <StatusBadge
            status={workshop.status}
            upcoming={upcoming}
          />
        </div>

        <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-navy transition group-hover:text-[#987438] md:text-3xl">
              {workshop.title}
            </h2>

            {workshop.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-7 text-navy/55">
                {workshop.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-navy/65">
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-gold" />
                {formatDate(workshop.dateTime)}
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={17} className="text-gold" />
                {formatTime(workshop.dateTime)}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge
              status={workshop.status}
              upcoming={upcoming}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-5">
          <div>
            <p className="text-xs text-navy/40">
              Registered on {formatDate(registration.registeredAt)}
            </p>

            <p className="mt-1 text-xs text-navy/40">
              Registration ID: {registration.id}
            </p>
          </div>

          {canJoinGroup && (
            <a
              href={workshop.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1DA851]"
            >
              <MessageCircle size={18} />
              Join Group
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MyWorkshopsPage() {
  const { user, isAuthenticated, authLoading } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const userId = user?.id || "guest";

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setRegistrations([]);
      setPagination(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchRegistrations() {
      try {
        setLoading(true);
        setError("");

        const result = await getMyRegistrations(
          page,
          10,
          userId
        );

        if (active) {
          setRegistrations(result.registrations);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "We couldn't load your workshops. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchRegistrations();

    return () => {
      active = false;
    };
  }, [
    page,
    refreshKey,
    userId,
    isAuthenticated,
    authLoading,
  ]);

  function handleRefresh() {
    clearMyRegistrationsCache(userId);
    setRefreshKey((current) => current + 1);
  }

  const filteredRegistrations = useMemo(() => {
    if (activeTab === "upcoming") {
      return registrations.filter(
        (registration) =>
          isUpcoming(registration) &&
          registration.workshop.status !== "CANCELLED"
      );
    }

    if (activeTab === "past") {
      return registrations.filter(
        (registration) => !isUpcoming(registration)
      );
    }

    if (activeTab === "cancelled") {
      return registrations.filter(
        (registration) =>
          registration.workshop.status === "CANCELLED"
      );
    }

    return registrations;
  }, [registrations, activeTab]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-offwhite px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-cream" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-offwhite px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <BookOpen size={40} className="mx-auto text-gold" />

          <h1 className="mt-5 font-display text-3xl font-semibold text-navy">
            Your workshops await.
          </h1>

          <p className="mt-3 text-sm text-navy/60">
            Please log in to view your workshop registrations.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy"
          >
            Log in
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-offwhite">
      {/* Page hero */}
      <section className="bg-cream px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
            Your journey
          </p>

          <h1 className="mt-3 font-display text-4xl font-semibold text-navy md:text-5xl">
            My Workshops
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-navy/60">
            All your registered experiences, together in one place.
          </p>
        </div>
      </section>

      {/* Registrations */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Your registrations
            </h2>

            {!loading && pagination && (
              <p className="mt-2 text-sm text-navy/50">
                {pagination.total} total registrations
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold disabled:opacity-40"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-navy/10 pb-4">
          {[
            { value: "all", label: "All" },
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.value
                  ? "bg-navy text-white"
                  : "bg-white text-navy/60 hover:bg-cream"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl bg-cream"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredRegistrations.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white px-6 py-16 text-center">
            <BookOpen size={36} className="mx-auto text-gold" />

            <h3 className="mt-5 font-display text-2xl font-semibold text-navy">
              No workshops here yet.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-navy/55">
              {registrations.length === 0
                ? "You haven't registered for any workshops yet. Explore our upcoming sessions and find something that inspires you."
                : "There are no registrations in this category right now."}
            </p>

            <Link
              to="/workshops"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy"
            >
              Explore workshops
              <ArrowUpRight size={17} />
            </Link>
          </div>
        )}

        {/* Registration cards */}
        {!loading && !error && filteredRegistrations.length > 0 && (
          <div className="mt-8 space-y-5">
            {filteredRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          !error &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-navy/10 pt-6">
              <p className="text-sm text-navy/50">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-full border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-30"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}