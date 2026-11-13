//Navbar 

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Menu,
  UserRound,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Compass,
  CalendarDays,
  Settings,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Explore Workshops", to: "/workshops" },
  { label: "My Workshops", to: "/my-workshops" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, isAuthenticated, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();

      setProfileOpen(false);
      setMenuOpen(false);

      navigate("/workshops", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  const profileLinks = [
    {
      label: "Explore Workshops",
      to: "/workshops",
      icon: Compass,
    },
    {
      label: "My Workshops",
      to: "/my-workshops",
      icon: CalendarDays,
    },
    {
      label: "My Profile",
      to: "/profile",
      icon: UserRound,
    },
    {
      label: "Account Settings",
      to: "/settings",
      icon: Settings,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-offwhite/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl font-extrabold tracking-tight text-navy"
        >
          WORKSHOP<span className="text-gold">.</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-gold ${
                  isActive ? "text-gold" : "text-navy/70"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop account section */}
        <div className="hidden items-center gap-4 md:flex">
          {authLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-navy/10" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-3 rounded-full border border-navy/10 bg-white px-3 py-2 transition hover:border-gold"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-navy">
                  <UserRound size={19} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-semibold text-navy">
                    Hi, {user?.name?.split(" ")[0] || "there"}
                  </p>
                  <p className="text-xs text-navy/50">
                    Your account
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-navy/50 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-navy/10 bg-white py-2 shadow-xl shadow-navy/10"
                >
                  <div className="border-b border-navy/10 px-5 py-4">
                    <p className="text-sm font-semibold text-navy">
                      {user?.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-navy/50">
                      {user?.email}
                    </p>
                  </div>

                  {profileLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-navy/70 transition hover:bg-cream hover:text-navy"
                      >
                        <Icon size={17} />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="my-2 border-t border-navy/10" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-navy transition hover:text-gold"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-offwhite transition hover:bg-navy/90"
              >
                Get Started <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-navy md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-navy/10 bg-offwhite px-6 py-5 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-navy"
            >
              {link.label}
            </NavLink>
          ))}

          {authLoading ? (
            <p className="text-sm text-navy/50">Loading account...</p>
          ) : isAuthenticated ? (
            <>
              <div className="border-t border-navy/10 pt-4">
                <p className="font-semibold text-navy">
                  Hi, {user?.name?.split(" ")[0] || "there"}
                </p>
                <p className="mt-1 text-xs text-navy/50">
                  {user?.email}
                </p>
              </div>

              {profileLinks
                .filter(
                  (item) =>
                    item.to === "/profile" || item.to === "/settings"
                )
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-navy"
                  >
                    {item.label}
                  </Link>
                ))}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-left text-sm font-semibold text-red-600"
              >
                <LogOut size={17} />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-navy"
              >
                Log in
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-navy"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
