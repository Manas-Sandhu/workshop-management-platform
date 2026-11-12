import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Explore Workshops", to: "/workshops" },
  { label: "My Workshops", to: "/my-workshops" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-offwhite/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight text-navy">
          WORKSHOP<span className="text-gold">.</span>
        </Link>

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

        <div className="hidden items-center gap-4 md:flex">
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
        </div>

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
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Log in
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            Get Started
          </Link>
        </nav>
      )}
    </header>
  );
}