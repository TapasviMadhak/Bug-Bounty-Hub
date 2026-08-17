import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  DollarSign,
  FileText,
  Newspaper,
  Radar,
  ShieldCheck,
  User,
} from "lucide-react"
import { Link } from "react-router-dom"
import { disclosedReports, SEVERITY_META } from "../data/bugReports"
import { tools } from "../data/content"
import { criticalFallbacks, roadmapPhases } from "../data/checklistRoadmap"

const workspaces = [
  {
    title: "Master Checklist",
    copy: "Run the simplified roadmap, then expand categories for deep checks.",
    icon: ClipboardList,
    to: "/master-checklist",
    accent: "bg-lime-100 text-lime-900",
  },
  {
    title: "Bug Reports",
    copy: "Browse real HackerOne disclosed reports — vulnerability, company, bounty.",
    icon: FileText,
    to: "/bug-reports",
    accent: "bg-cyan-100 text-cyan-900",
  },
  {
    title: "Blogs and Posts",
    copy: "Maintain your useful posts, Medium links, tweets, and Reddit threads.",
    icon: Newspaper,
    to: "/news",
    accent: "bg-rose-100 text-rose-900",
  },
  {
    title: "Toolkit",
    copy: "Copy install commands and usage notes for core hunting tools.",
    icon: Radar,
    to: "/toolkit",
    accent: "bg-amber-100 text-amber-900",
  },
  {
    title: "About Me",
    copy: "Profile area reserved for your story, links, certifications, and wins.",
    icon: User,
    to: "/about",
    accent: "bg-violet-100 text-violet-900",
  },
]

const roadmapSteps =
  roadmapPhases.reduce((total, phase) => total + phase.items.length, 0) +
  criticalFallbacks.reduce((total, bundle) => total + bundle.items.length, 0)

const stats = [
  { label: "Roadmap Steps", value: roadmapSteps },
  { label: "Tools", value: tools.length },
  { label: "Disclosed Reports", value: disclosedReports.length },
]

const fmt = (n) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`

// Show the top 5 by bounty in the sidebar
const topReports = [...disclosedReports].sort((a, b) => b.bounty - a.bounty).slice(0, 5)

export default function HomePage() {
  return (
    <section className="space-y-5">
      <div className="page-panel overflow-hidden rounded-lg">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 md:p-8">
            <p className="eyebrow">Security Research Workspace</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight text-neutral-950 md:text-6xl">
              Hunt notes, reports, and checklists without leaving the desk.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
              A practical bug bounty console for repeatable web testing, report study, tooling, and curated learning.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/master-checklist" className="action-button bg-neutral-950 text-white hover:bg-teal-700">
                Open Checklist
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/bug-reports"
                className="action-button border border-stone-300 bg-white text-neutral-950 hover:border-teal-500 hover:text-teal-700"
              >
                Study Reports
                <BookOpen size={16} />
              </Link>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-neutral-950 p-6 text-white lg:border-l lg:border-t-0 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lime-300 text-neutral-950">
                <ShieldCheck size={22} />
              </span>
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-300">
                  Active Index
                </p>
                <p className="text-xl font-extrabold">BountyForge Hub</p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-300">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Sections</p>
              <h2 className="mt-1 text-2xl font-extrabold text-neutral-950">Workspace Modules</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map(({ title, copy, icon: Icon, to, accent }) => (
              <Link
                key={title}
                to={to}
                className="group page-panel rounded-lg p-4 transition hover:-translate-y-0.5 hover:border-neutral-900"
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-neutral-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-700">
                  Open
                  <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="page-panel h-fit overflow-hidden rounded-lg p-4">
          <p className="eyebrow">Top Bounties</p>
          <h2 className="mt-1 text-xl font-extrabold text-neutral-950">Recent Reports</h2>
          <div className="mt-4 grid gap-2">
            {topReports.map((r) => {
              const sev = SEVERITY_META[r.severity]
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-lg border border-stone-200 bg-stone-50 p-3 transition hover:border-teal-400 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
                    <div className="ml-auto flex items-center gap-0.5 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-extrabold text-teal-700">
                      <DollarSign size={11} />
                      {fmt(r.bounty).replace("$", "")}
                      <ArrowUpRight size={11} className="ml-1 text-stone-400 transition group-hover:text-teal-500" />
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs font-bold leading-snug text-neutral-950 group-hover:text-teal-700">
                    {r.vulnerability}
                  </p>
                  <p className="mt-0.5 text-[11px] text-stone-500">{r.company}</p>
                </a>
              )
            })}
          </div>
          <Link
            to="/bug-reports"
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
          >
            View all reports <ArrowRight size={12} />
          </Link>
        </aside>
      </div>
    </section>
  )
}
