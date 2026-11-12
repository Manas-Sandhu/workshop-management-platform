import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loginAdmin,
    isAdminAuthenticated,
    adminAuthLoading,
  } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (adminAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-offwhite">
        <p className="text-sm text-navy/60">
          Checking admin session...
        </p>
      </main>
    );
  }

  if (isAdminAuthenticated) {
    return <Navigate to="/admin/workshops" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAdmin({ email, password });

      const returnTo = location.state?.from?.pathname;

      navigate(
        returnTo?.startsWith("/admin/") && returnTo !== "/admin/login"
          ? returnTo
          : "/admin/workshops",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-offwhite px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto grid min-h-[680px] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy/5 md:grid-cols-2">

        <section className="flex flex-col justify-between bg-navy p-9 text-white md:p-14">
          <Link to="/" className="font-display text-2xl font-extrabold">
            WORKSHOP<span className="text-gold">.</span>
          </Link>

          <div className="my-16">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <ShieldCheck size={27} className="text-gold" />
            </div>

            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Administration portal
            </p>

            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              Manage experiences that inspire.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-8 text-white/60">
              Manage workshops, keep track of registrations and
              make every learning experience count.
            </p>
          </div>

          <p className="text-sm text-white/40">
            Workshop Platform · Admin Access
          </p>
        </section>

        <section className="flex items-center px-7 py-14 md:px-14">
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              Welcome back
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
              Admin sign in
            </h2>

            <p className="mt-3 text-sm leading-7 text-navy/55">
              Sign in with your authorised administrator account.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-6">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-navy"
                >
                  Email address
                </label>

                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-navy/15 bg-offwhite px-4 py-3.5 text-sm outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-navy"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="admin-password"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {loading ? "Signing in..." : "Access dashboard"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-6 text-navy/45">
              This portal is restricted to authorised administrators.
            </p>

            <p className="mt-5 text-center text-sm text-navy/55">
              Not an administrator?{" "}
              <Link to="/login" className="font-semibold text-[#987438] hover:underline">
                User login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}