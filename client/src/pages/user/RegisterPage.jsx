
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { registerUser } from "../../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const returnTo = location.state?.from || "/my-workshops";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({ name, email, password });

      // Registration creates an account but does not log the user in.
      navigate("/login", {
        replace: true,
        state: {
          from: returnTo,
          message: "Account created successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-offwhite px-6 py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy/5 md:grid-cols-2">
        <div className="flex flex-col justify-between bg-navy p-10 text-white md:p-14">
          <Link to="/" className="font-display text-2xl font-bold">
            WORKSHOP<span className="text-gold">.</span>
          </Link>

          <div className="my-16">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Start something new
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              Make space for learning and growth.
            </h1>
            <p className="mt-6 leading-8 text-white/60">
              Create your account and discover experiences designed to inspire.
            </p>
          </div>

          <p className="text-sm text-white/40">
            Discover. Learn. Experience.
          </p>
        </div>

        <div className="flex items-center px-8 py-14 md:px-14">
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              Join our community
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
              Create account
            </h2>
            <p className="mt-3 text-sm leading-7 text-navy/55">
              Fill in your details to get started.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Email address
                </label>
                <input
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
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-4 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-navy/60">
              Already have an account?{" "}
              <Link
                to="/login"
                state={location.state}
                className="font-semibold text-[#987438] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
