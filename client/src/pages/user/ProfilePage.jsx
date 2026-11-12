import { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Pencil,
  X,
  Save,
  LoaderCircle,
  Award,
  Hash,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyRegistrations } from "../../services/registrationService";

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-navy">
          <Icon size={21} />
        </div>
        <span className="text-2xl font-bold tabular-nums text-navy">
          {value}
        </span>
      </div>

      <p className="mt-5 font-semibold text-navy">{label}</p>
      <p className="mt-1 text-xs text-navy/50">{description}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 border-b border-navy/10 py-4 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-navy">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-navy/45">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-navy">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  useEffect(() => {
    let active = true;

    async function loadRegistrations() {
      try {
        setLoadingStats(true);
        setStatsError("");

        const firstPage = await getMyRegistrations(1);
        const allRegistrations = [...(firstPage.registrations || [])];

        const totalPages = firstPage.pagination?.totalPages || 1;

        for (let page = 2; page <= totalPages; page += 1) {
          const result = await getMyRegistrations(page);
          allRegistrations.push(...(result.registrations || []));
        }

        if (active) {
          setRegistrations(allRegistrations);
        }
      } catch (err) {
        if (active) {
          setStatsError(
            err.message || "Unable to load your workshop statistics."
          );
        }
      } finally {
        if (active) {
          setLoadingStats(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();

    const validRegistrations = registrations.filter(
      (registration) => registration.workshop?.status !== "CANCELLED"
    );

    const upcoming = validRegistrations.filter(
      (registration) =>
        new Date(registration.workshop?.dateTime) >= now
    );

    const completed = validRegistrations.filter(
      (registration) =>
        new Date(registration.workshop?.dateTime) < now
    );

    return {
      total: registrations.length,
      upcoming: upcoming.length,
      completed: completed.length,
    };
  }, [registrations]);

  async function handleSaveProfile(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Your name must have at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateProfile({ name: trimmedName });

      setName(trimmedName);
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setName(user?.name || "");
    setEditing(false);
    setError("");
    setSuccess("");
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-offwhite px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#987438]">
            Your Account
          </p>

          <h1 className="font-display text-3xl font-semibold text-navy md:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-navy/55">
            Manage your personal information and explore your workshop journey.
          </p>
        </div>

        {/* Profile overview */}
        <section className="relative overflow-hidden rounded-3xl bg-navy p-7 text-white shadow-xl shadow-navy/10 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white/15 bg-[#CBA765] font-display text-3xl font-bold text-navy shadow-lg">
              {getInitials(user.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-semibold md:text-3xl">
                  {user.name}
                </h2>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Active Member
                </span>
              </div>

              <p className="mt-2 break-all text-sm text-white/65">
                {user.email}
              </p>

              <p className="mt-4 flex items-center gap-2 text-xs text-white/55">
                <CalendarDays size={15} />
                Member since {formatDate(user.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 sm:self-center">
              <Award size={18} className="text-[#CBA765]" />
              Workshop Member
            </div>
          </div>
        </section>

        {/* Workshop statistics */}
        <section className="mt-9">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-navy">
                Your Workshop Journey
              </h2>
              <p className="mt-1 text-sm text-navy/50">
                An overview of your workshop registrations.
              </p>
            </div>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-navy/10 bg-white p-10 text-sm text-navy/60">
              <LoaderCircle size={19} className="animate-spin" />
              Loading your workshop statistics...
            </div>
          ) : statsError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {statsError}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={BookOpen}
                label="Total Registrations"
                value={stats.total}
                description="All your workshop registrations"
              />

              <StatCard
                icon={Clock3}
                label="Upcoming Workshops"
                value={stats.upcoming}
                description="Workshops scheduled ahead"
              />

              <StatCard
                icon={CheckCircle2}
                label="Completed Workshops"
                value={stats.completed}
                description="Workshops whose dates have passed"
              />
            </div>
          )}
        </section>

        {/* Personal information and account details */}
        <section className="mt-9 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy">
                  Personal Information
                </h2>
                <p className="mt-1 text-xs text-navy/50">
                  Your basic account information
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setSuccess("");
                    setError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-xs font-semibold text-navy transition hover:border-gold hover:bg-cream"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile}>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-navy/55"
                >
                  Full Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  minLength={2}
                  required
                  className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />

                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy/55">
                    Email Address
                  </p>
                  <div className="rounded-xl border border-navy/10 bg-cream/60 px-4 py-3 text-sm text-navy/55">
                    {user.email}
                    <span className="mt-1 block text-[11px]">
                      Email address cannot be changed here.
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-cream disabled:opacity-60"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <DetailRow
                  icon={UserRound}
                  label="Full Name"
                  value={user.name}
                />

                <DetailRow
                  icon={Mail}
                  label="Email Address"
                  value={user.email}
                />
              </>
            )}
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-5">
              <h2 className="font-display text-xl font-semibold text-navy">
                Account Details
              </h2>
              <p className="mt-1 text-xs text-navy/50">
                Information about your membership
              </p>
            </div>

            <DetailRow
              icon={Hash}
              label="User ID"
              value={user.id}
            />

            <DetailRow
              icon={CalendarDays}
              label="Account Created"
              value={formatDate(user.createdAt)}
            />

            <DetailRow
              icon={ShieldCheck}
              label="Account Role"
              value={user.role === "ADMIN" ? "Administrator" : "Member"}
            />

            <DetailRow
              icon={CheckCircle2}
              label="Account Status"
              value="Active"
            />
          </div>
        </section>

        {success && !editing && (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <p className="mt-8 text-center text-xs text-navy/40">
          Thank you for being part of our workshop community.
        </p>
      </div>
    </main>
  );
}