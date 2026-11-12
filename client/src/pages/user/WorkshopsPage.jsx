
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
} from "lucide-react";

import { getPublishedWorkshops } from "../../services/workshopService";

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

          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              isFull
                ? "border-red-300/40 text-red-200"
                : "border-white/20 text-white/80"
            }`}
          >
            {isFull ? "Fully booked" : "Registration open"}
          </span>
        </div>

        <h2 className="mt-8 font-display text-2xl font-semibold leading-snug">
          {workshop.title}
        </h2>
      </div>

      {/* Card details */}
      <div className="flex flex-1 flex-col p-7">
        <p className="min-h-16 text-sm leading-7 text-navy/65">
          {workshop.description ||
            "Join us for an engaging learning experience."}
        </p>

        <div className="mt-6 space-y-4 border-y border-navy/10 py-5">
          <div className="flex items-center gap-3 text-sm text-navy/75">
            <CalendarDays size={17} className="shrink-0 text-[#A68143]" />
            {formatDate(workshop.dateTime)}
          </div>

          <div className="flex items-center gap-3 text-sm text-navy/75">
            <Clock3 size={17} className="shrink-0 text-[#A68143]" />
            {formatTime(workshop.dateTime)}
          </div>

          <div className="flex items-center gap-3 text-sm text-navy/75">
            <Users size={17} className="shrink-0 text-[#A68143]" />
            {isFull
              ? "No seats available"
              : `${workshop.availableSeats} seats available`}
          </div>
        </div>

        <div className="mt-auto pt-6">
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
  const [workshops, setWorkshops] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPublishedWorkshops(page);

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
  }, [page]);

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
        <div className="mb-10 flex items-end justify-between">
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
              Something exciting is on its way.
            </h3>

            <p className="mt-3 text-sm text-navy/60">
              There are no upcoming published workshops at the moment.
              Please check back soon.
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
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
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
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
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
