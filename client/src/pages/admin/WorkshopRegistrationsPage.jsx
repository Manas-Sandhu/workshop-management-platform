
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Users,
  UserRoundCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  RefreshCw,
  UsersRound,
  Ticket,
} from "lucide-react";

import { getWorkshopRegistrations } from "../../services/adminRegistrationService";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function SummaryCard({ label, value, icon: Icon, note }) {
  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy/55">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-[#987438]">
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-navy">
        {value}
      </p>
      <p className="mt-1 text-xs text-navy/40">{note}</p>
    </div>
  );
}

export default function WorkshopRegistrationsPage() {
  const { workshopId } = useParams();

  const [workshop, setWorkshop] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRegistrations = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await getWorkshopRegistrations(workshopId, {
        page,
        limit: 10,
        search,
      });

      const result = response.data;

      setWorkshop(result.workshop);
      setRegistrations(result.registrations || []);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message || "Unable to load workshop registrations.");
    } finally {
      setLoading(false);
    }
  }, [ workshopId ]);

  useEffect(() => {
  loadRegistrations(1, "");
}, [loadRegistrations]);

  function handleSearch(event) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setAppliedSearch(nextSearch);
    loadRegistrations(1, nextSearch);
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    loadRegistrations(1, "");
  }

  function changePage(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    loadRegistrations(nextPage, appliedSearch);
  }

  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      <header className="border-b border-navy/8 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-8">
          <Link to="/admin/workshops" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-[#CBA765]">
              <UsersRound size={19} />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold text-navy">
                WORKSHOP<span className="text-gold">.</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-navy/40">
                Administration
              </p>
            </div>
          </Link>

          <Link
            to="/admin/workshops"
            className="flex items-center gap-2 rounded-full border border-navy/12 px-4 py-2.5 text-xs font-semibold text-navy transition hover:bg-cream"
          >
            <ArrowLeft size={15} /> All workshops
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-9 md:px-8 md:py-12">
        <div className="mb-8">
          <Link
            to="/admin/workshops"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-navy/45 transition hover:text-[#987438]"
          >
            <ArrowLeft size={14} /> Back to workshops
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
            Workshop overview
          </p>

          <h1 className="mt-3 font-display text-3xl font-bold text-navy md:text-4xl">
            Registrations
          </h1>

          <p className="mt-3 text-sm text-navy/50">
            View and manage participants registered for this workshop.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadRegistrations(pagination.page)}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && !workshop ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-navy/8 bg-white">
            <div className="flex items-center gap-3 text-sm text-navy/50">
              <RefreshCw size={17} className="animate-spin" />
              Loading workshop details...
            </div>
          </div>
        ) : workshop ? (
          <>
            <section className="mb-7 overflow-hidden rounded-3xl bg-navy p-6 text-white md:p-9">
              <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${
                      workshop.status === "CANCELLED"
                        ? "bg-red-400/15 text-red-200"
                        : "bg-green-400/15 text-green-200"
                    }`}
                  >
                    {workshop.status}
                  </span>

                  <h2 className="mt-5 font-display text-2xl font-bold leading-tight md:text-3xl">
                    {workshop.title}
                  </h2>

                  {workshop.description && (
                    <p className="mt-3 text-sm leading-7 text-white/55">
                      {workshop.description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/65">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-gold" />
                      {formatDateTime(workshop.dateTime)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 size={15} className="text-gold" />
                      {formatTime(workshop.dateTime)}
                    </span>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                    Workshop capacity
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold text-gold">
                    {workshop.capacity}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    Total participant seats
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-9 grid gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Registrations"
                value={workshop.registrationCount}
                icon={Users}
                note="Total participants registered"
              />
              <SummaryCard
                label="Available seats"
                value={workshop.availableSeats}
                icon={UserRoundCheck}
                note="Remaining capacity"
              />
              <SummaryCard
                label="Total capacity"
                value={workshop.capacity}
                icon={Ticket}
                note="Maximum participants"
              />
            </section>

            <section>
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-display text-xl font-bold text-navy">
                    Participant directory
                  </h2>
                  <p className="mt-1 text-xs text-navy/45">
                    {pagination.total} participant(s) registered
                  </p>
                </div>

                <form
                  onSubmit={handleSearch}
                  className="flex w-full gap-2 sm:max-w-md"
                >
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/35"
                    />
                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search name, email or mobile..."
                      className="w-full rounded-full border border-navy/12 bg-white py-3 pl-11 pr-4 text-xs outline-none transition focus:border-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-navy px-5 py-3 text-xs font-semibold text-white transition hover:bg-gold hover:text-navy"
                  >
                    Search
                  </button>
                </form>
              </div>

              {appliedSearch && (
                <div className="mb-4 flex items-center gap-2 text-xs text-navy/50">
                  Showing results for
                  <span className="font-semibold text-navy">
                    "{appliedSearch}"
                  </span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="font-semibold text-[#987438] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-navy/8 bg-[#FAFAF8]">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-navy/45">
                          Participant
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-navy/45">
                          Email address
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-navy/45">
                          Mobile number
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-navy/45">
                          Registered on
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-14 text-center text-sm text-navy/45">
                            <RefreshCw size={17} className="mx-auto mb-3 animate-spin" />
                            Loading participants...
                          </td>
                        </tr>
                      ) : registrations.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-16 text-center">
                            <UsersRound size={28} className="mx-auto text-gold" />
                            <p className="mt-3 font-semibold text-navy">
                              No participants found
                            </p>
                            <p className="mt-1 text-xs text-navy/45">
                              {appliedSearch
                                ? "Try another search term."
                                : "Registrations will appear here when participants sign up."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        registrations.map((person) => (
                          <tr
                            key={person.id}
                            className="border-b border-navy/6 last:border-0 transition hover:bg-[#FCFBF8]"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-bold text-[#987438]">
                                  {person.fullName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <span className="text-sm font-semibold text-navy">
                                  {person.fullName}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <a
                                href={`mailto:${person.email}`}
                                className="flex items-center gap-2 text-sm text-navy/60 transition hover:text-[#987438]"
                              >
                                <Mail size={14} />
                                {person.email}
                              </a>
                            </td>

                            <td className="px-6 py-5">
                              <a
                                href={`tel:${person.mobileNumber}`}
                                className="flex items-center gap-2 text-sm text-navy/60 transition hover:text-[#987438]"
                              >
                                <Phone size={14} />
                                {person.mobileNumber}
                              </a>
                            </td>

                            <td className="px-6 py-5 text-sm text-navy/55">
                              {formatDate(person.registeredAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-navy/8 bg-white px-5 py-4 sm:flex-row sm:items-center md:px-6">
                  <p className="text-xs text-navy/45">
                    {pagination.total === 0
                      ? "No results"
                      : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )} of ${pagination.total}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={loading || pagination.page <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/12 text-navy transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <span className="px-2 text-xs font-semibold text-navy/60">
                      Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                    </span>

                    <button
                      type="button"
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={loading || pagination.page >= pagination.totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/12 text-navy transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Next page"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : !loading && !error ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-navy/50">
            Workshop details could not be found.
          </div>
        ) : null}
      </main>
    </div>
  );
}
