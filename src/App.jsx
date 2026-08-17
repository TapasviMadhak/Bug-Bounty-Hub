import { ClipboardList, FileText, Home, Moon, Newspaper, ShieldCheck, Sun, User, Wrench } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { NavLink, Route, Routes } from "react-router-dom"
import AboutPage from "./pages/AboutPage"
import BlogsPage from "./pages/BlogsPage"
import BugReportsPage from "./pages/BugReportsPage"
import HomePage from "./pages/HomePage"
import MasterChecklistPage from "./pages/MasterChecklistPage"
import ToolkitPage from "./pages/ToolkitPage"

const navigation = [
  { to: "/", title: "Home", icon: Home, end: true, featured: true },
  { to: "/master-checklist", title: "Master Checklist", icon: ClipboardList },
  { to: "/news", title: "Top News", icon: Newspaper },
  { to: "/bug-reports", title: "Bug Reports", icon: FileText },
  { to: "/about", title: "About Me", icon: User },
  { to: "/toolkit", title: "Toolkit", icon: Wrench },
]

const THEME_STORAGE_KEY = "bb-theme"

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light"

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [themeBurst, setThemeBurst] = useState(null)
  const themeButtonRef = useRef(null)
  const themeBurstTimerRef = useRef(null)
  const isDark = theme === "dark"

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [isDark, theme])

  useEffect(() => {
    return () => {
      if (themeBurstTimerRef.current) clearTimeout(themeBurstTimerRef.current)
    }
  }, [])

  const toggleTheme = () => {
    const rect = themeButtonRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 48
    const y = rect ? rect.top + rect.height / 2 : 48
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    if (themeBurstTimerRef.current) clearTimeout(themeBurstTimerRef.current)
    setThemeBurst({
      x,
      y,
      radius,
      color: isDark ? "#f3f4ee" : "#07100f",
    })
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
    themeBurstTimerRef.current = setTimeout(() => setThemeBurst(null), 720)
  }

  return (
    <div className="min-h-screen text-neutral-950 transition-colors duration-500">
      {themeBurst ? (
        <span
          className="theme-burst"
          style={{
            left: themeBurst.x,
            top: themeBurst.y,
            "--theme-burst-radius": `${themeBurst.radius}px`,
            "--theme-burst-color": themeBurst.color,
          }}
        />
      ) : null}

      <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-4 md:grid-cols-[250px_1fr] md:px-6 lg:py-6">
        <aside className="md:sticky md:top-6 md:h-[calc(100vh-3rem)]">
          <div className="page-panel flex h-full flex-col rounded-lg p-4">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-950 text-lime-300">
                <ShieldCheck size={21} />
              </span>
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-950 dark:text-stone-300">
                  Security Workspace
                </p>
                <p className="text-base font-extrabold text-neutral-950">BountyForge Hub</p>
              </div>
            </div>

            <div className="mt-4 border-b border-stone-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950">Workspace</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-950">
                Checklists, reports, tools, posts, and profile notes in one focused hunting console.
              </p>
            </div>

            <nav className="mt-4 grid gap-1">
              {navigation.map(({ to, title, icon: Icon, end, featured }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      "inline-flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition",
                      isActive
                        ? "bg-neutral-950 text-white shadow-sm dark:bg-teal-400 dark:text-stone-950"
                        : featured
                          ? "nav-link-inactive nav-link-featured border border-lime-300 bg-lime-50 hover:bg-lime-100 dark:border-lime-300 dark:bg-lime-50 dark:hover:bg-lime-100"
                          : "nav-link-inactive border border-transparent hover:bg-stone-100 hover:text-neutral-950 dark:hover:bg-stone-900/60",
                    ].join(" ")
                  }
                >
                  <Icon size={15} />
                  {title}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto">
              <button
                ref={themeButtonRef}
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="theme-toggle theme-toggle-icon flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white text-neutral-950 transition hover:border-teal-500"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/news" element={<BlogsPage />} />
            <Route path="/bug-reports" element={<BugReportsPage />} />
            <Route path="/toolkit" element={<ToolkitPage />} />
            <Route path="/master-checklist" element={<MasterChecklistPage />} />
            <Route path="*" element={<MasterChecklistPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
