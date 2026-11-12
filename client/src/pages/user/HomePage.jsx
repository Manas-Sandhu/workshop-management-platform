import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative bg-navy px-6 py-24 text-offwhite md:py-36 lg:px-10">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full border border-gold/20" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full border border-gold/10" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <Sparkles size={14} />
            Curated learning experiences
          </div>

          <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.12] tracking-tight md:text-7xl">
            Make room for
            <br />
            <span className="text-gold">something extraordinary.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-offwhite/65 md:text-lg">
            Discover thoughtfully designed workshops that inspire new skills,
            fresh perspectives, and meaningful connections.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              to="/workshops"
              className="inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold text-navy transition hover:bg-[#dbb978]"
            >
              Explore Workshops <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/my-workshops"
              className="inline-flex items-center gap-2 text-sm font-semibold text-offwhite transition hover:text-gold"
            >
              My Workshops <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-24 flex flex-wrap items-center gap-8 border-t border-offwhite/15 pt-8 text-xs font-semibold uppercase tracking-[0.18em] text-offwhite/50">
            <span>Learn something new</span>
            <span className="hidden h-1 w-1 rounded-full bg-gold sm:block" />
            <span>Meet inspiring people</span>
            <span className="hidden h-1 w-1 rounded-full bg-gold sm:block" />
            <span>Create lasting memories</span>
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              Designed for discovery
            </p>
            <h2 className="font-display text-4xl font-semibold leading-tight text-navy md:text-5xl">
              Your next great experience starts here.
            </h2>
          </div>

          <div>
            <p className="max-w-lg text-base leading-8 text-navy/65">
              Explore upcoming experiences, reserve your place in a few simple
              steps, and keep track of every workshop you've joined — all in
              one beautifully simple space.
            </p>
            <Link
              to="/workshops"
              className="mt-6 inline-flex items-center gap-2 border-b border-navy pb-2 text-sm font-bold text-navy transition hover:text-[#987438]"
            >
              Browse upcoming workshops <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}