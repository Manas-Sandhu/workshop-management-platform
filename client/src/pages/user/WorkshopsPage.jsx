import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Users,
  RefreshCw,
  Sparkles,
  Search,
} from "lucide-react";

import { getPublishedWorkshops } from "../../services/workshopService";
import { useAuth } from "../../context/AuthContext";

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function WorkshopCard({ workshop }) {
  const isFull = workshop.availableSeats <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/5">
      {/* Card header */}
      <div className="flex min-h-48 flex-col justify-between bg-navy p-7 text-offwhite">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Curated experience
          </span>

          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">
            {workshop.availableSeats} seats left
          </span>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-xs text-white/50">
            <CalendarDays size={14} />
            {formatDate(workshop.dateTime)}
          </p>

          <h3 className="font-display text-2xl font-semibold leading-snug text-white">
            {workshop.title}
          </h3>
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-7">
        <p className="line-clamp-3 min-h-[72px] text-sm leading-7 text-navy/60">
          {workshop.description || "More details coming soon."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-5 text-sm text-navy/60">
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-gold" />
            {formatTime(workshop.dateTime)}
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="text-gold" />
            {workshop.registrationCount} registered
          </div>
        </div>

        <div className="mt-auto pt-7">
          {isFull ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full bg-cream px-5 py-3.5 text-sm font-semibold text-navy/40"
            >
              Fully Booked
            </button>
          ) : (
            <Link
              to={`/workshops/register?workshopId=${encodeURIComponent(
                workshop.id
              )}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3.5 text-sm font-semibold text-offwhite transition hover:bg-gold hover:text-navy"
            >
              Register Now
              <ArrowUpRight size={17} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="h-[440px] animate-pulse rounded-2xl bg-cream" />
  );
}

export default function WorkshopsPage() {
  const { user } = useAuth();

  const [workshops, setWorkshops] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("soonest");

  // Wait briefly after typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPublishedWorkshops(
        page,
        6,
        search,
        sort,
        user?.id || "guest"
      );

      setWorkshops(result.workshops);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err.message ||
          "We couldn't load the workshops. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, user?.id]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  return (
    <main className="min-h-screen bg-offwhite">
      {/* Page hero */}
      <section className="bg-cream px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#987438]">
            <Sparkles size={15} />
            Discover · Learn · Experience
          </p>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-navy md:text-6xl">
                Find your next
                <br />
                <span className="text-[#A68143]">
                  inspiring experience.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-navy/60">
                Explore our upcoming workshops and discover opportunities
                to learn new skills, connect and grow.
              </p>
            </div>

            <Link
              to="/my-workshops"
              className="inline-flex items-center gap-2 text-sm font-bold text-navy transition hover:text-[#987438]"
            >
              View my workshops
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Workshop collection */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              The collection
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
              Upcoming workshops
            </h2>
          </div>

          {!loading && pagination && (
            <p className="text-sm text-navy/50">
              {pagination.total} experiences
            </p>
          )}
        </div>

        {/* Search and sort */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search workshops..."
              aria-label="Search workshops"
              className="w-full rounded-xl border border-navy/15 bg-white py-3.5 pl-11 pr-4 text-sm text-navy outline-none transition placeholder:text-navy/40 focus:border-gold"
            />
          </div>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            aria-label="Sort workshops"
            className="rounded-xl border border-navy/15 bg-white px-4 py-3.5 text-sm text-navy outline-none focus:border-gold"
          >
            <option value="soonest">Soonest first</option>
            <option value="latest">Latest first</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <LoadingCard key={item} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchWorkshops}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && workshops.length === 0 && (
          <div className="rounded-2xl bg-cream px-6 py-20 text-center">
            <h3 className="font-display text-2xl font-semibold text-navy">
              {search
                ? "No matching workshops found."
                : "Something exciting is on its way."}
            </h3>

            <p className="mt-3 text-sm text-navy/60">
              {search
                ? "Try another workshop title or keyword."
                : "There are no upcoming published workshops at the moment. Please check back soon."}
            </p>
          </div>
        )}

        {/* Workshop cards */}
        {!loading && !error && workshops.length > 0 && (
          <>
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {workshops.map((workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-30"
                >
                  Previous
                </button>

                <span className="text-sm text-navy/60">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}