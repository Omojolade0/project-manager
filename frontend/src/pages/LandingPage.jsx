import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-background border-b border-border px-20 py-5 flex items-center justify-between">
        <span className="text-2xl font-semibold tracking-tight">Ceous</span>
        <div className="flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-outline">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-10 pt-28 pb-20 text-center">
        <span className="inline-block bg-secondary-tint text-primary text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          Now in beta · Free to use
        </span>
        <h1 className="text-6xl font-semibold tracking-tight leading-tight text-foreground mb-6">
          Manage projects.
          <br />
          <span className="text-primary">Stay in control.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-xl mx-auto mb-10">
          Ceous brings your projects, tasks, and notes into one clean workspace.
          Built for focus, not complexity.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary px-7 py-3 text-base">
            Start for free
          </Link>
          <a href="#how" className="btn-outline px-7 py-3 text-base">
            See how it works
          </a>
        </div>

        {/* Stats row */}
        <div className="flex justify-center mt-20 pt-10 border-t border-border divide-x divide-border">
          {[
            { n: "100%", label: "Free to start" },
            { n: "JWT", label: "Secure auth" },
            { n: "∞", label: "Projects & tasks" },
          ].map((s, i) => (
            <div key={i} className="px-10 text-center">
              <p className="text-3xl font-semibold text-foreground mb-1">
                {s.n}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App preview */}
      <section className="max-w-5xl mx-auto px-10 pb-24">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="flex gap-2 mb-6">
            {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
              <div
                key={i}
                style={{ background: c }}
                className="w-3 h-3 rounded-full"
              />
            ))}
          </div>
          <div className="flex gap-5">
            <div className="w-44 bg-muted rounded-xl p-4 shrink-0">
              <p className="text-sm font-semibold text-foreground mb-4">Ceous</p>
              {["Dashboard", "Projects", "Settings"].map((item, i) => (
                <div
                  key={i}
                  className={`text-sm px-3 py-2 rounded-lg mb-1 ${i === 1 ? "bg-secondary-tint text-primary font-medium" : "text-muted-foreground"}`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-widest">
                My Projects
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    name: "Website Redesign",
                    status: "Active",
                    color: "bg-status-done-tint text-status-done",
                  },
                  {
                    name: "Mobile App",
                    status: "In Progress",
                    color: "bg-status-progress-tint text-status-progress",
                  },
                  {
                    name: "API Integration",
                    status: "Completed",
                    color: "bg-secondary-tint text-primary",
                  },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="bg-muted border border-border rounded-xl p-4"
                  >
                    <p className="text-sm font-medium text-foreground mb-2">
                      {p.name}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${p.color}`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-10 py-24">
        <p className="section-label mb-3">Features</p>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-14">
          Everything you need,
          <br />
          nothing you don't
        </h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              icon: "◈",
              title: "Project Management",
              desc: "Create and manage projects with status tracking. Keep everything organized in one place.",
            },
            {
              icon: "◉",
              title: "Task Tracking",
              desc: "Break projects into tasks. Set statuses, track progress, and stay on top of what matters.",
            },
            {
              icon: "◎",
              title: "Project Notes",
              desc: "Attach notes directly to projects. Keep context, decisions, and ideas where they belong.",
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="text-2xl text-primary mb-5">{f.icon}</div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-10 py-24">
          <p className="section-label mb-3">How it works</p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-14">
            Up and running in minutes
          </h2>
          <div className="grid grid-cols-3 gap-12">
            {[
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
            ].map((s, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-primary mb-3 tracking-widest">
                  {s.step}
                </p>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-10 py-28 text-center">
        <h2 className="text-5xl font-semibold tracking-tight text-foreground mb-5">
          Ready to get organised?
        </h2>
        <p className="text-lg text-muted-foreground font-light mb-10">
          Join Ceous and take control of your projects today.
        </p>
        <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
          Get started for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-20 py-8 flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground">Ceous</span>
        <p className="text-sm text-muted-foreground">Built with FastAPI & React</p>
      </footer>
    </div>
  );
}
