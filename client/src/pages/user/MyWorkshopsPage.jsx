
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  ArrowUpRight,
  BookOpen,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyRegistrations } from "../../services/registrationService";

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
                {formatTime(workshop.dateTime)} IST
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-xl bg-cream p-4 md:min-w-48">
            <p className="text-xs uppercase tracking-wider text-navy/45">
              Registered on
            </p>
            <p className="mt-2 text-sm font-semibold text-navy">
              {formatDate(registration.registeredAt)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-5">
          <div>
            <p className="text-xs text-navy/45">
              Registration ID
            </p>
            <p className="mt-1 font-mono text-xs text-navy/65">
              {registration.id}
            </p>
          </div>

          <Link
            to="/workshops"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-[#987438]"
          >
            Explore more
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function MyWorkshopsPage() {
  const { user, isAuthenticated, authLoading } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;

    async function loadRegistrations() {
      try {
        setLoading(true);
        setError("");

        const result = await getMyRegistrations(page, 10);

        if (!cancelled) {
          setRegistrations(result.registrations);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load your registrations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, page, refreshKey]);

  const filteredRegistrations = useMemo(() => {
    if (activeTab === "upcoming") {
      return registrations.filter(
        (item) =>
          item.workshop.status !== "CANCELLED" &&
          isUpcoming(item)
      );
    }

    if (activeTab === "past") {
      return registrations.filter(
        (item) =>
          item.workshop.status !== "CANCELLED" &&
          !isUpcoming(item)
      );
    }

    if (activeTab === "cancelled") {
      return registrations.filter(
        (item) => item.workshop.status === "CANCELLED"
      );
    }

    return registrations;
  }, [registrations, activeTab]);

  const upcomingCount = registrations.filter(
    (item) =>
      item.workshop.status !== "CANCELLED" &&
      isUpcoming(item)
  ).length;

  const cancelledCount = registrations.filter(
    (item) => item.workshop.status === "CANCELLED"
  ).length;

  if (authLoading) {
    return (
      <main className="min-h-screen bg-offwhite px-6 py-24">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-64 rounded bg-navy/10" />
          <div className="mt-8 h-48 rounded-2xl bg-navy/5" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-offwhite px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream text-navy">
            <BookOpen size={28} />
          </div>

          <h1 className="mt-6 font-display text-3xl font-semibold text-navy">
            Your workshops await.
          </h1>

          <p className="mt-4 leading-7 text-navy/55">
            Sign in to see your registrations and keep track of
            your upcoming experiences.
          </p>

          <Link
            to="/login"
            state={{ from: "/my-workshops" }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy"
          >
            Log in to continue
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-offwhite pb-24">
      {/* Page heading */}
      <section className="border-b border-navy/10 bg-cream/60">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#987438]">
            Your learning journey
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-4xl font-semibold text-navy md:text-5xl">
                My Workshops<span className="text-gold">.</span>
              </h1>

              <p className="mt-4 text-sm leading-7 text-navy/55 md:text-base">
                Welcome back, {user?.name?.split(" ")[0] || "there"}.
                Here's everything you've signed up for.
              </p>
            </div>

            <Link
              to="/workshops"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy"
            >
              Discover workshops
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-12 lg:px-10">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm text-navy/50">Total registrations</p>
            <p className="mt-3 font-display text-4xl font-semibold text-navy">
              {pagination?.total ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm text-navy/50">Upcoming workshops</p>
            <p className="mt-3 font-display text-4xl font-semibold text-navy">
              {upcomingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm text-navy/50">Cancelled registrations</p>
            <p className="mt-3 font-display text-4xl font-semibold text-navy">
              {cancelledCount}
            </p>
          </div>
        </div>

        {/* Registration list */}
        <div className="mt-14">
          <div className="flex flex-col justify-between gap-5 border-b border-navy/10 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-navy">
                Your registrations
              </h2>
              <p className="mt-2 text-sm text-navy/50">
                All your workshop bookings in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60 transition hover:text-gold"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All" },
              { id: "upcoming", label: "Upcoming" },
              { id: "past", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-navy text-white"
                    : "border border-navy/10 bg-white text-navy/60 hover:border-gold"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-8 space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl bg-navy/5"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
                className="mt-4 text-sm font-semibold text-red-700 underline"
              >
                Try again
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-navy/10 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-navy">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-5 font-display text-2xl font-semibold text-navy">
                {registrations.length === 0
                  ? "Your journey starts here."
                  : "Nothing to show here yet."}
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
          ) : (
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
        </div>
      </section>
    </main>
  );
}
