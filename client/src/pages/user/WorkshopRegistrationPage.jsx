
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import {
  getWorkshopById,
  registerForWorkshop,
} from "../../services/workshopService";

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString("en-IN", {
    weekday: "long",
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

export default function WorkshopRegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const workshopId = searchParams.get("workshopId");

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registrationResult, setRegistrationResult] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchWorkshop() {
      if (!workshopId) {
        setError("No workshop was selected. Please choose a workshop first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getWorkshopById(workshopId);

        if (active) {
          setWorkshop(result);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load this workshop.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchWorkshop();

    return () => {
      active = false;
    };
  }, [workshopId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedMobile = mobileNumber.trim();

    if (!/^\+?[0-9]{10,15}$/.test(normalizedMobile)) {
      setError("Enter a valid mobile number containing 10–15 digits.");
      return;
    }

    if (!workshop || workshop.availableSeats <= 0) {
      setError("Sorry, this workshop is fully booked.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await registerForWorkshop({
        workshopId,
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: normalizedMobile,
      });

      setRegistrationResult(result);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-offwhite">
        <div className="flex items-center gap-3 text-sm text-navy/60">
          <LoaderCircle className="animate-spin" size={20} />
          Loading workshop details...
        </div>
      </main>
    );
  }

  if (registrationResult) {
    return (
      <main className="min-h-screen bg-offwhite px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white px-8 py-14 text-center shadow-xl shadow-navy/5 md:px-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={34} />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
            Registration confirmed
          </p>

          <h1 className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl">
            You're on the list!
          </h1>

          <p className="mt-5 leading-7 text-navy/60">
            Your registration for{" "}
            <span className="font-semibold text-navy">
              {workshop.title}
            </span>{" "}
            was successful. We've received your details.
          </p>

          <div className="mt-8 rounded-2xl bg-cream p-6 text-left">
            <p className="text-sm font-semibold text-navy">
              Registration details
            </p>
            <p className="mt-3 text-sm text-navy/65">
              Name: {registrationResult.registration?.fullName || fullName}
            </p>
            <p className="mt-2 text-sm text-navy/65">
              Email: {registrationResult.registration?.email || email}
            </p>
          </div>

          {registrationResult.whatsappLink && (
            <a
              href={registrationResult.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1fb85a]"
            >
              Join the workshop WhatsApp group
              <ArrowRight size={17} />
            </a>
          )}

          <Link
            to="/my-workshops"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-navy px-7 py-4 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy"
          >
            View my workshops
          </Link>
        </div>
      </main>
    );
  }

  if (!workshop) {
    return (
      <main className="min-h-[70vh] bg-offwhite px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center">
          <h1 className="font-display text-2xl font-semibold text-navy">
            Workshop unavailable
          </h1>
          <p className="mt-4 text-sm leading-7 text-navy/60">
            {error || "We couldn't find this workshop."}
          </p>
          <Link
            to="/workshops"
            className="mt-7 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Explore workshops
          </Link>
        </div>
      </main>
    );
  }

  const isFull = workshop.availableSeats <= 0;

  return (
    <main className="min-h-screen bg-offwhite px-6 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/workshops"
          className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-navy/60 transition hover:text-[#987438]"
        >
          <ArrowLeft size={17} />
          Back to workshops
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Workshop information */}
          <section className="h-fit overflow-hidden rounded-3xl bg-navy text-offwhite">
            <div className="p-8 md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                Your next experience
              </p>

              <h1 className="mt-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
                {workshop.title}
              </h1>

              <p className="mt-5 text-sm leading-8 text-white/60">
                {workshop.description ||
                  "Join us for an engaging learning experience."}
              </p>

              <div className="mt-9 space-y-6 border-t border-white/15 pt-7">
                <div className="flex items-start gap-4">
                  <CalendarDays className="mt-0.5 shrink-0 text-gold" size={19} />
                  <div>
                    <p className="text-xs text-white/45">Date</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(workshop.dateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock3 className="mt-0.5 shrink-0 text-gold" size={19} />
                  <div>
                    <p className="text-xs text-white/45">Time</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatTime(workshop.dateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Users className="mt-0.5 shrink-0 text-gold" size={19} />
                  <div>
                    <p className="text-xs text-white/45">Availability</p>
                    <p className="mt-1 text-sm font-medium">
                      {isFull
                        ? "Fully booked"
                        : `${workshop.availableSeats} seats available`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/5 px-8 py-5 md:px-10">
              <p className="text-xs leading-6 text-white/50">
                Complete your details to reserve your place at this workshop.
              </p>
            </div>
          </section>

          {/* Registration form */}
          <section className="rounded-3xl border border-navy/10 bg-white p-8 shadow-xl shadow-navy/5 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              Registration
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
              Reserve your place
            </h2>

            <p className="mt-3 text-sm leading-7 text-navy/55">
              Please provide your details below to complete your registration.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {isFull ? (
              <div className="mt-8 rounded-2xl bg-cream p-6 text-center">
                <p className="font-semibold text-navy">
                  This workshop is fully booked.
                </p>
                <p className="mt-2 text-sm text-navy/55">
                  Please explore our other upcoming workshops.
                </p>
                <Link
                  to="/workshops"
                  className="mt-5 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
                >
                  Explore workshops
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-navy"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-navy"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="mb-2 block text-sm font-semibold text-navy"
                  >
                    Mobile number
                  </label>
                  <input
                    id="mobileNumber"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={mobileNumber}
                    onChange={(event) => setMobileNumber(event.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                  />
                  <p className="mt-2 text-xs text-navy/45">
                    Include your country code if applicable.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isFull}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-4 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Confirm Registration
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-6 text-navy/40">
                  By confirming, you agree to submit your details for this
                  workshop registration.
                </p>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
