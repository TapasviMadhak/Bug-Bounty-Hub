import {
  ArrowUp,
  Clock,
  ExternalLink,
  Flame,
  MessageSquare,
  RefreshCw,
  Search,
  TrendingUp,
  User,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const HN_API = "https://hacker-news.firebaseio.com/v0"
const TOP_STORIES_URL = `${HN_API}/topstories.json`
const ITEM_URL = (id) => `${HN_API}/item/${id}.json`
const HN_ITEM_URL = (id) => `https://news.ycombinator.com/item?id=${id}`
const TOP_N = 30

const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "news.ycombinator.com"
  }
}

const formatTimeAgo = (unixTime) => {
  if (!unixTime) return ""
  const seconds = Math.floor(Date.now() / 1000) - unixTime
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const formatScore = (score) => {
  if (!score) return "0"
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
  return String(score)
}

const getFaviconUrl = (url) => {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`
  } catch {
    return null
  }
}

async function fetchTopStoryIds() {
  const res = await fetch(TOP_STORIES_URL)
  if (!res.ok) throw new Error("Failed to fetch top stories")
  const ids = await res.json()
  return ids.slice(0, TOP_N)
}

async function fetchStory(id, signal) {
  const res = await fetch(ITEM_URL(id), { signal })
  if (!res.ok) return null
  return res.json()
}

export default function NewsPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const abortRef = useRef(null)

  const loadStories = useCallback(async (isRefresh = false) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const ids = await fetchTopStoryIds()
      const settled = await Promise.allSettled(
        ids.map((id) => fetchStory(id, controller.signal))
      )

      if (controller.signal.aborted) return

      const items = settled
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter(Boolean)
        .filter((item) => item.type === "story" && item.title)

      setStories(items)
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to load Hacker News stories. Please try again.")
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    loadStories(false)
    return () => abortRef.current?.abort()
  }, [loadStories])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stories
    return stories.filter((s) => {
      const hay = [s.title, s.by, s.url ? getHostname(s.url) : ""].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [stories, query])

  return (
    <section className="space-y-5">
      <header className="page-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Live Feed</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950 flex items-center gap-3">
              <Flame size={32} className="text-orange-500" />
              Top News
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Live top 30 stories from Hacker News, updated on demand.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">
            <TrendingUp size={16} />
            {stories.length} stories
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <label className="flex-1 flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3">
            <Search size={16} className="text-stone-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories by title, author, or domain…"
              className="w-full bg-transparent text-sm text-stone-800 outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => loadStories(true)}
            disabled={loading || refreshing}
            title="Refresh stories"
            className="action-button border border-stone-300 bg-white text-stone-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadStories(false)} />
      ) : filtered.length === 0 ? (
        <div className="page-panel rounded-lg p-8 text-center text-sm text-stone-500">
          {query ? "No stories match your search." : "No stories found."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} rank={stories.indexOf(story) + 1} />
          ))}
        </div>
      )}
    </section>
  )
}

function StoryCard({ story, rank }) {
  const host = story.url ? getHostname(story.url) : null
  const faviconUrl = story.url ? getFaviconUrl(story.url) : null
  const [faviconOk, setFaviconOk] = useState(true)
  const commentUrl = HN_ITEM_URL(story.id)

  return (
    <article className="page-panel rounded-lg p-5 transition-all duration-200 hover:shadow-md group">
      <div className="flex gap-4">
        <div className="shrink-0 flex items-start pt-0.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-xs font-extrabold text-orange-600 font-mono">
            {rank}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
            {faviconUrl && faviconOk && (
              <img
                src={faviconUrl}
                alt=""
                className="h-4 w-4 rounded-sm object-contain"
                onError={() => setFaviconOk(false)}
              />
            )}
            {host && <span className="text-stone-500">{host}</span>}
            {host && <span className="h-1 w-1 rounded-full bg-stone-300" />}
            <span className="inline-flex items-center gap-1">
              <User size={11} />
              {story.by}
            </span>
            <span className="h-1 w-1 rounded-full bg-stone-300" />
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {formatTimeAgo(story.time)}
            </span>
          </div>

          <a
            href={story.url || commentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-lg font-extrabold leading-snug text-neutral-950 group-hover:text-orange-600 transition-colors duration-150"
          >
            {story.title}
          </a>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-bold text-orange-700">
              <ArrowUp size={12} />
              {formatScore(story.score)} pts
            </span>

            <a
              href={commentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 border border-stone-200 px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
            >
              <MessageSquare size={12} />
              {story.descendants ?? 0} comments
            </a>

            {story.url && (
              <a
                href={story.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-orange-600 transition-colors"
              >
                Read article
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="page-panel rounded-lg p-5 animate-pulse">
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-lg bg-stone-200 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-3 w-20 rounded bg-stone-200" />
                <div className="h-3 w-16 rounded bg-stone-200" />
                <div className="h-3 w-14 rounded bg-stone-200" />
              </div>
              <div className="h-5 w-3/4 rounded bg-stone-200" />
              <div className="h-5 w-1/2 rounded bg-stone-200" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-20 rounded-md bg-stone-200" />
                <div className="h-6 w-24 rounded-md bg-stone-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="page-panel rounded-lg p-10 text-center space-y-4">
      <p className="text-4xl">⚠️</p>
      <p className="font-bold text-neutral-950">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="action-button border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 mx-auto"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}
