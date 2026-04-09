import { Link, Eye, BookmarkBook } from "iconoir-react";

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span
          className="text-xl font-semibold text-stone-900 select-none"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Markit
        </span>

        {/* Nav actions */}
        <nav className="flex items-center gap-3">
          <a
            href="#"
            className="px-4 py-2 text-sm font-medium text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Sign in
          </a>
          <a
            href="#"
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function DashboardPlaceholder() {
  return (
    <div className="w-full rounded-2xl border border-stone-300 bg-stone-200 shadow-sm overflow-hidden">
      {/* Browser chrome bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-stone-100 border-b border-stone-300">
        <span className="w-3 h-3 rounded-full bg-stone-300" />
        <span className="w-3 h-3 rounded-full bg-stone-300" />
        <span className="w-3 h-3 rounded-full bg-stone-300" />
        <div className="flex-1 mx-4 h-5 rounded-md bg-stone-300" />
      </div>
      {/* Placeholder screenshot body */}
      <div className="p-6 space-y-4">
        {/* Toolbar row */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 rounded-lg bg-stone-300" />
          <div className="h-8 w-20 rounded-lg bg-stone-300" />
          <div className="ml-auto h-8 w-24 rounded-lg bg-teal-200" />
        </div>
        {/* Card grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-stone-300 aspect-[4/3] opacity-80"
              style={{ opacity: 0.5 + i * 0.07 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-stone-100 py-24 px-6">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
        <h1
          className="text-5xl font-bold text-stone-900 leading-tight"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Save anything.
          <br />
          Find it later.
        </h1>

        <p className="text-lg text-stone-500 max-w-xl">
          Markit saves your links with automatic titles, descriptions, and
          thumbnails — and keeps them organized in collections.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            className="px-6 py-3 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get started free
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3 text-sm font-medium text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-200 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Dashboard preview */}
        <div className="w-full mt-4 max-w-3xl">
          <DashboardPlaceholder />
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

type Step = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: <Link className="w-6 h-6 text-teal-600" />,
    title: "Paste any link",
    description:
      "Drop in a URL and Markit fetches the title, description, and thumbnail automatically.",
  },
  {
    icon: <Eye className="w-6 h-6 text-teal-600" />,
    title: "Preview and edit",
    description:
      "Review the details before saving. Edit anything that doesn't look right.",
  },
  {
    icon: <BookmarkBook className="w-6 h-6 text-teal-600" />,
    title: "Organize into collections",
    description:
      "Group your links into collections and find them instantly.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-semibold text-stone-900 text-center mb-16"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-base font-semibold text-stone-900">
                {step.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Screenshots ───────────────────────────────────────────────────────────────

function ScreenshotPlaceholder() {
  return (
    <div className="w-full aspect-video rounded-2xl bg-stone-200 shadow-sm border border-stone-300 overflow-hidden flex flex-col">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 border-b border-stone-300">
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <div className="flex-1 mx-3 h-4 rounded bg-stone-300" />
      </div>
      <div className="flex-1 p-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-stone-300 opacity-60" />
        ))}
      </div>
    </div>
  );
}

type ScreenshotRowProps = {
  label: string;
  heading: string;
  description: string;
  flip?: boolean;
};

function ScreenshotRow({ label, heading, description, flip = false }: ScreenshotRowProps) {
  const text = (
    <div className="flex flex-col justify-center gap-4">
      <span className="text-sm font-medium text-teal-600">{label}</span>
      <h3
        className="text-2xl font-semibold text-stone-900 leading-snug"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {heading}
      </h3>
      <p className="text-stone-500 leading-relaxed">{description}</p>
    </div>
  );

  const screenshot = <ScreenshotPlaceholder />;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${
        flip ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {flip ? (
        <>
          {text}
          {screenshot}
        </>
      ) : (
        <>
          {screenshot}
          {text}
        </>
      )}
    </div>
  );
}

function Screenshots() {
  return (
    <section className="bg-stone-100 py-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-20">
        <h2
          className="text-3xl font-semibold text-stone-900 text-center"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          See it in action
        </h2>

        <ScreenshotRow
          label="Dashboard"
          heading="All your links in one place"
          description="Browse your full library in a clean grid. Filter by collection, sort by date, and find anything fast."
        />

        <ScreenshotRow
          label="Collections"
          heading="Keep everything organized"
          description="Create collections for any topic and move bookmarks between them effortlessly."
          flip
        />
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 py-6 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span
          className="text-base font-semibold text-stone-900"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Markit
        </span>
        <p className="text-sm text-stone-500">
          Built by{" "}
          <a
            href="https://marcosc.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            Marcos
          </a>
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Screenshots />
      </main>
      <Footer />
    </div>
  );
}
