
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Preserve the original destination if the user was redirected to login.
  const returnTo = location.state?.from || "/workshops";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });

      // Normal login goes to Explore Workshops.
      // Workshop registration redirects return to their original destination.
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
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
              Welcome back
            </p>

            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              Your next inspiring experience starts here.
            </h1>

            <p className="mt-6 leading-8 text-white/60">
              Sign in to manage your registrations and continue your learning
              journey.
            </p>
          </div>

          <p className="text-sm text-white/40">
            Discover. Learn. Experience.
          </p>
        </div>

        <div className="flex items-center px-8 py-14 md:px-14">
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              Your account
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
              Log in
            </h2>

            <p className="mt-3 text-sm leading-7 text-navy/55">
              Enter your details to access your account.
            </p>

            {location.state?.message && (
              <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                {location.state.message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-9 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Email address
                </label>

                <input
                  type="email"
                  required
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

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-gold"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/50"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-4 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-navy/60">
              Don't have an account?{" "}
              <Link
                to="/register"
                state={location.state}
                className="font-semibold text-[#987438] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
