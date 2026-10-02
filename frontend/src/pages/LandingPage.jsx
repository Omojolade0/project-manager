import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BarChart3,
  Check,
  LayoutGrid,
  Layers,
  List,
  ListChecks,
  Menu,
  Pin,
  ShieldCheck,
  Sparkles,
  StickyNote,
  X,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import HeroScene from "@/components/landing/HeroScene";

// Marketing-only display type — headings on this page use it for a
// distinct, brand-y look; body copy stays on the app's default font.
const displayFont = { fontFamily: "'Space Grotesk', 'Poppins', sans-serif" };

const FEATURES = [
  {
    icon: Layers,
    title: "Project Management",
    desc: "Create and manage projects with status tracking. Keep everything organized in one place.",
  },
  {
    icon: ListChecks,
    title: "Task Tracking",
    desc: "Break projects into tasks. Set statuses, track progress, and stay on top of what matters.",
  },
  {
    icon: StickyNote,
    title: "Project Notes",
    desc: "Attach notes directly to projects. Pin the ones that matter and keep context where it belongs.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create an account",
    desc: "Sign up for free. No credit card required, no setup fees.",
  },
  {
    step: "02",
    title: "Add your projects",
    desc: "Create projects and set their status. Add descriptions to keep context.",
  },
  {
    step: "03",
    title: "Track & deliver",
    desc: "Add tasks, write notes, and ship your projects with confidence.",
  },
];

const NAV_LINKS = [
  ["#features", "Features"],
  ["#views", "Views"],
  ["#ai", "AI tasks"],
  ["#how", "How it works"],
];

const AI_SUGGESTIONS = [
  { title: "Set up CI pipeline", priority: "High", checked: true },
  { title: "Fix push token refresh", priority: "High", checked: true },
  { title: "Write onboarding note", priority: "Medium", checked: true },
  { title: "Add crash reporting", priority: "Low", checked: false },
];

const INSIGHT_DAYS = [
  { label: "Thu", count: 0 },
  { label: "Fri", count: 0 },
  { label: "Sat", count: 1 },
  { label: "Sun", count: 3 },
  { label: "Mon", count: 1 },
  { label: "Tue", count: 3 },
  { label: "Wed", count: 4 },
];

const STATS = [
  { n: "100%", label: "Free to start" },
  { n: "JWT", label: "Secure auth" },
  { n: "∞", label: "Projects & tasks" },
];

export default function LandingPage() {
  const { loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("demo_expired") !== "1") return;
    toast("Your demo session ended. Try it again anytime!");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("demo_expired");
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleTryDemo() {
    try {
      setLoadingDemo(true);
      await loginAsGuest();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error starting demo:", error);
      toast.error("Couldn't start the demo. Please try again.");
    } finally {
      setLoadingDemo(false);
    }
  }

  return (
    <>
      {/* Scoped to this page — headings only, rest of the app keeps its font. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
      />
      <style>{`
        @keyframes coeus-drift { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
        .coeus-drift { animation: coeus-drift 4.5s ease-in-out infinite; }
      `}</style>

      <div id="top" className="theme-light-pinned min-h-screen bg-background text-foreground">
        {/* Hero — full-bleed interactive scene with centred copy */}
        <section
          className="relative overflow-hidden min-h-[680px] lg:h-[860px] flex flex-col"
          style={{
            background:
              "radial-gradient(70% 70% at 50% 55%, #EDEBFF 0%, #F6F4FA 60%, #F4F3FA 100%)",
          }}
        >
          <HeroScene className="absolute inset-0" />

          <nav className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-8 lg:px-[72px] py-5 lg:py-8">
            <a href="#top" className="flex items-center gap-2.5 shrink-0">
              <img src="/coeus-favicon.svg" alt="" className="w-7 h-7" />
              <span className="text-[19px] font-medium text-[#22222E]">Coeus</span>
            </a>
            <div className="hidden lg:flex gap-1.5 bg-white/60 p-1.5 rounded-[14px] text-sm text-[#4A4859]">
              {NAV_LINKS.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-[10px] hover:bg-white/80 hover:text-[#22222E] transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4 sm:gap-[26px] text-sm shrink-0">
              <button
                type="button"
                onClick={handleTryDemo}
                disabled={loadingDemo}
                className="hidden sm:inline text-[#22222E] hover:opacity-70 transition-opacity disabled:opacity-60 whitespace-nowrap"
              >
                {loadingDemo ? "Loading…" : "Try demo"}
              </button>
              <Link to="/login" className="hidden sm:inline text-[#22222E] hover:opacity-70 transition-opacity whitespace-nowrap">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-[#22222E] text-white px-[22px] py-[11px] rounded-xl font-medium hover:opacity-85 transition-opacity whitespace-nowrap"
              >
                Get started
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="lg:hidden -mr-1 p-2 rounded-xl text-[#22222E] hover:bg-white/60 transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          {menuOpen && (
            <div className="lg:hidden relative z-10 mx-4 sm:mx-8 flex flex-col gap-1 bg-white/85 backdrop-blur rounded-[14px] p-1.5 text-sm text-[#4A4859] shadow-card">
              {NAV_LINKS.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-[10px] hover:bg-white hover:text-[#22222E]"
                >
                  {label}
                </a>
              ))}
              <div className="sm:hidden border-t border-black/5 mt-1 pt-1 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleTryDemo}
                  disabled={loadingDemo}
                  className="text-left px-4 py-2.5 rounded-[10px] hover:bg-white hover:text-[#22222E] disabled:opacity-60"
                >
                  {loadingDemo ? "Loading…" : "Try demo"}
                </button>
                <Link to="/login" className="px-4 py-2.5 rounded-[10px] hover:bg-white hover:text-[#22222E]">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* pointer-events-none so the scene behind receives hover/drag/click */}
          <div className="relative flex-1 flex flex-col items-center justify-center text-center gap-[26px] px-4 sm:px-8 pt-10 pb-28 pointer-events-none lg:absolute lg:inset-x-0 lg:top-[300px] lg:flex-none lg:justify-start lg:p-0">
            <h1 className="m-0 text-[clamp(44px,9vw,96px)] leading-none font-semibold tracking-[-0.04em] text-[#22222E] max-w-[1000px] text-balance">
              Every project, one clear surface.
            </h1>
            <p className="m-0 text-base sm:text-lg leading-[1.65] text-[#3B3A4B] max-w-[560px] text-pretty">
              Projects, tasks and the notes around them, together on one page. Coeus keeps the whole picture in
              view so you always know what's actually moving.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 mt-1.5 pointer-events-auto">
              <Link
                to="/register"
                className="bg-[#22222E] text-white px-[30px] py-[17px] rounded-[14px] text-base font-medium hover:opacity-85 transition-opacity"
              >
                Start for free
              </Link>
              <a
                href="#how"
                className="bg-white/75 text-[#22222E] px-[30px] py-[17px] rounded-[14px] text-base font-medium hover:bg-white transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-9 flex justify-center pointer-events-none" aria-hidden="true">
            <span className="text-xs font-medium tracking-[0.1em] text-[#6E6C82] bg-white/60 px-4 py-2 rounded-full">
              TOUCH IT · DRAG · CLICK
            </span>
          </div>
        </section>

        <div className="overflow-x-hidden">

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
          <p className="section-label mb-3">Features</p>
          <h2 style={displayFont} className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-10 sm:mb-14 text-balance">
            Everything you need,
            <br />
            nothing you don't
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="w-10 h-10 rounded-xl bg-secondary-tint flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Views: list vs board */}
        <section id="views" className="bg-card border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10 sm:mb-14">
              <div>
                <p className="section-label mb-3">Two views</p>
                <h2 style={displayFont} className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
                  Think in a list.
                  <br />
                  Work on a board.
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                One set of tasks behind both. Tick something off in the list and the board already knows.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-muted/50 rounded-2xl p-5 sm:p-6">
                <span className="inline-flex items-center gap-2 text-caption font-semibold text-foreground bg-card rounded-full px-3.5 py-2 shadow-card">
                  <List className="w-3.5 h-3.5" /> List view
                </span>
                <div className="flex flex-col gap-2 mt-4">
                  {[
                    { name: "Adding Docker", pill: "2d overdue", pillClass: "bg-status-overdue-tint text-status-overdue", done: false },
                    { name: "Fix auth redirect loop", pill: "Today", pillClass: "bg-status-due-tint text-status-due", done: false },
                    { name: "Set up error tracking", pill: null, done: true },
                    { name: "Write release notes", pill: "In 7d", pillClass: "bg-muted text-muted-foreground", done: false },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center gap-3 rounded-xl px-3.5 py-3 bg-card shadow-card">
                      <span
                        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${
                          t.done ? "bg-status-done border-status-done" : "border-border"
                        }`}
                      >
                        {t.done && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                      </span>
                      <span className={`flex-1 min-w-0 truncate text-small font-medium ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {t.name}
                      </span>
                      {t.pill && (
                        <span className={`text-caption font-medium px-2 py-1 rounded-full shrink-0 ${t.pillClass}`}>{t.pill}</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-small text-muted-foreground leading-relaxed mt-5">
                  Group by status or priority, filter to what's left, tick things off without leaving the row.
                </p>
              </div>

              <div className="bg-muted/50 rounded-2xl p-5 sm:p-6">
                <span className="inline-flex items-center gap-2 text-caption font-semibold text-foreground bg-card rounded-full px-3.5 py-2 shadow-card">
                  <LayoutGrid className="w-3.5 h-3.5" /> Board view
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                  <div className="bg-card rounded-xl p-2.5 shadow-card">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-todo" />
                      <span className="text-caption font-semibold">Todo</span>
                      <span className="text-caption text-muted-foreground ml-auto">2</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-caption font-medium mb-1.5">Fix auth redirect</div>
                    <div className="bg-muted rounded-lg p-2 text-caption font-medium">Release notes</div>
                  </div>
                  <div className="bg-card rounded-xl p-2.5 shadow-card">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-progress" />
                      <span className="text-caption font-semibold">In Progress</span>
                      <span className="text-caption text-muted-foreground ml-auto">1</span>
                    </div>
                    <div className="coeus-drift bg-secondary-tint rounded-lg p-2 text-caption font-medium text-primary">Adding Docker</div>
                  </div>
                  <div className="bg-card rounded-xl p-2.5 shadow-card">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-done" />
                      <span className="text-caption font-semibold">Done</span>
                      <span className="text-caption text-muted-foreground ml-auto">7</span>
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-caption font-medium text-muted-foreground line-through mb-1.5">
                      Error tracking
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-caption font-medium text-muted-foreground line-through">
                      Pricing page
                    </div>
                  </div>
                </div>
                <p className="text-small text-muted-foreground leading-relaxed mt-5">
                  Drag a task across columns and the status updates everywhere else, instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI task generation */}
        <section id="ai" className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] items-center gap-10 lg:gap-14">
            <div>
              <p className="section-label mb-3">AI task generation</p>
              <h2 style={displayFont} className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-5 text-balance">
                Describe the project.
                <br />
                Get the task list.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                The blank project is the hardest part. Give Coeus a name and a description and it proposes
                a task list with priorities already set. Keep what fits, edit the rest, skip the noise.
              </p>
              <div className="flex flex-col gap-3 mt-7">
                {["Nothing is added until you accept it", "Works on an existing project too, to fill the gaps"].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="w-5 h-5 rounded-full bg-secondary-tint flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-2xl p-4 sm:p-5">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                  What are you building?
                </p>
                <p className="text-small text-foreground leading-relaxed mt-2">
                  A mobile beta for the iOS companion app, ready for TestFlight in three weeks.
                </p>
                <div className="flex items-center justify-between gap-3 mt-4">
                  <span className="text-caption text-muted-foreground">Coeus suggested 4 tasks</span>
                  <span className="inline-flex items-center gap-1.5 text-caption font-semibold bg-primary text-primary-foreground rounded-full px-3.5 py-2">
                    <Sparkles className="w-3.5 h-3.5" /> Generate tasks
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-3">
                {AI_SUGGESTIONS.map((t) => (
                  <div
                    key={t.title}
                    className={`flex items-center gap-3 bg-card rounded-xl px-3.5 py-3 shadow-card ${t.checked ? "" : "opacity-60"}`}
                  >
                    <span
                      className={`flex items-center justify-center w-[18px] h-[18px] rounded-md border-2 shrink-0 ${
                        t.checked ? "bg-primary border-primary" : "border-border"
                      }`}
                    >
                      {t.checked && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-small font-medium text-foreground">{t.title}</span>
                    <span
                      className={`text-caption font-medium px-2 py-1 rounded-full shrink-0 ${
                        t.priority === "High"
                          ? "bg-status-overdue-tint text-status-overdue"
                          : t.priority === "Medium"
                            ? "bg-status-progress-tint text-status-progress"
                            : "bg-status-done-tint text-status-done"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <span className="text-caption text-muted-foreground">3 of 4 selected</span>
                <span className="text-caption font-semibold text-foreground bg-card rounded-full px-4 py-2 shadow-card">
                  Add 3 tasks
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="bg-foreground text-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] items-center gap-10 lg:gap-14">
              <div>
                <p className="text-caption font-semibold uppercase tracking-widest text-primary mb-3">Insights</p>
                <h2 style={displayFont} className="text-3xl sm:text-4xl font-semibold tracking-tight mb-5 text-balance">
                  Progress you didn't have to type.
                </h2>
                <p className="text-base text-background/70 leading-relaxed max-w-md">
                  Every ring, bar and weekly count comes straight from your tasks. Nothing to update by hand,
                  and the overdue number stays uncomfortable on purpose.
                </p>
                <div className="flex items-center gap-8 mt-8">
                  <div>
                    <p style={displayFont} className="text-2xl font-semibold">Live</p>
                    <p className="text-caption text-background/60 mt-1">Counted, not claimed</p>
                  </div>
                  <span className="w-px h-9 bg-background/15" />
                  <div>
                    <p style={displayFont} className="text-2xl font-semibold">0 setup</p>
                    <p className="text-caption text-background/60 mt-1">Derived from your tasks</p>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-secondary-tint rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-card-title">Insights</p>
                    <p className="text-caption text-muted-foreground">10 tasks tracked</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl bg-muted p-3.5">
                    <p className="text-page-title leading-none mb-1.5">3</p>
                    <p className="text-caption text-muted-foreground">Open</p>
                  </div>
                  <div className="rounded-xl bg-status-progress-tint p-3.5">
                    <p className="text-page-title text-status-progress leading-none mb-1.5">2</p>
                    <p className="text-caption text-status-progress">Due this week</p>
                  </div>
                  <div className="rounded-xl bg-status-overdue-tint p-3.5">
                    <p className="text-page-title text-status-overdue leading-none mb-1.5">1</p>
                    <p className="text-caption text-status-overdue">Overdue</p>
                  </div>
                </div>

                <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Status mix
                </p>
                <div className="flex items-center gap-0.5 h-2 rounded-full overflow-hidden bg-muted mb-2">
                  <div className="bg-status-todo h-full" style={{ width: "20%" }} />
                  <div className="bg-status-progress h-full" style={{ width: "10%" }} />
                  <div className="bg-status-done h-full" style={{ width: "70%" }} />
                </div>
                <div className="flex items-center gap-4 flex-wrap mb-5">
                  {[
                    ["Todo", "bg-status-todo", 2],
                    ["In Progress", "bg-status-progress", 1],
                    ["Done", "bg-status-done", 7],
                  ].map(([label, dot, count]) => (
                    <span key={label} className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                      <span className="font-semibold text-foreground">{count}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                    Completed this week
                  </p>
                  <p className="text-caption text-muted-foreground">7 tasks</p>
                </div>
                <div className="flex items-end justify-between gap-1.5 h-10 mb-1.5">
                  {INSIGHT_DAYS.map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full rounded-md ${d.count > 0 ? "bg-primary" : "bg-muted"}`}
                        style={{ height: d.count > 0 ? `${Math.min(d.count, 4) * 20 + 20}%` : "10%" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-1.5">
                  {INSIGHT_DAYS.map((d, i) => (
                    <span
                      key={d.label}
                      className={`flex-1 text-center text-caption ${
                        i === INSIGHT_DAYS.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] items-center gap-10 lg:gap-14">
            <div className="flex flex-col gap-3 order-2 lg:order-1">
              {[
                { text: "Docker work blocks the staging deploy — do it before release notes.", pinned: true },
                { text: "Agreed to ship V1 without the notifications service. Revisit in September.", pinned: true },
                { text: "Weekly digest email could reuse the insights panel as-is.", pinned: false },
              ].map((n) => (
                <div
                  key={n.text}
                  className={`rounded-2xl p-4 flex items-start gap-3 ${n.pinned ? "bg-secondary-tint" : "bg-muted/60"}`}
                >
                  <Pin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${n.pinned ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                  <p className="text-small text-foreground leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <p className="section-label mb-3">Notes</p>
              <h2 style={displayFont} className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-5 text-balance">
                The reasoning stays with the work.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                Blockers, decisions and ideas live right on the project page. Pin the ones that matter and
                they stay at the top, above everything else.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-card border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
            <p className="section-label mb-3">How it works</p>
            <h2 style={displayFont} className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-10 sm:mb-14 text-balance">
              Up and running in minutes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {STEPS.map((s) => (
                <div key={s.step}>
                  <p style={displayFont} className="text-sm font-semibold text-primary mb-3 tracking-widest">
                    {s.step}
                  </p>
                  <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / beta banner */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
          <div className="bg-secondary-tint rounded-3xl px-6 sm:px-10 py-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 style={displayFont} className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2 text-balance">
                Free while in beta
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                Unlimited projects, tasks and notes. When paid plans arrive, everything you've made stays yours.
              </p>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 flex-wrap justify-center shrink-0">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p style={displayFont} className="text-2xl sm:text-3xl font-semibold text-foreground leading-none mb-1.5">
                    {s.n}
                  </p>
                  <p className="text-caption text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 text-caption text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Secure sign-in, unlimited projects, no credit card
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 md:px-10 pb-16 sm:pb-28 text-center">
          <h2 style={displayFont} className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-5 text-balance">
            Ready to get organised?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-light mb-10">
            Start a project, add three tasks, and watch the ring move.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base inline-flex items-center justify-center gap-2 w-full sm:w-auto">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleTryDemo}
              disabled={loadingDemo}
              className="btn-outline px-8 py-3.5 text-base w-full sm:w-auto disabled:opacity-60"
            >
              {loadingDemo ? "Loading…" : "Try the demo"}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-4 sm:px-6 lg:px-20 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/coeus-favicon.svg" alt="" className="w-5 h-5" />
            <span style={displayFont} className="text-lg font-semibold text-foreground">Coeus</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Built with FastAPI & React</p>
        </footer>
        </div>
      </div>
    </>
  );
}
