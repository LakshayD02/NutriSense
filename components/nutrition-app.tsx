"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Leaf,
  Settings,
  Sparkles,
  Flame,
  LayoutDashboard,
  Utensils,
  BarChart3,
  History,
  Zap,
  Target,
  TrendingUp,
  Heart,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { ProfileSetup } from "@/components/profile-setup"
import { ContextBar } from "@/components/context-bar"
import { FoodLogger } from "@/components/food-logger"
import { FoodLogList } from "@/components/food-log-list"
import { DailyInsightsPanel } from "@/components/daily-insights"
import { useContextData } from "@/hooks/use-context-data"
import {
  isToday,
  loadEntries,
  loadProfile,
  saveEntries,
  saveProfile,
} from "@/lib/storage"
import type { DailyInsights, FoodEntry, Profile } from "@/lib/types"
import { getDailyInsightsAction } from "@/app/actions"
import { toast } from "sonner"

export function NutritionApp() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [insights, setInsights] = useState<DailyInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"dashboard" | "log" | "insights" | "history">("dashboard")
  const { ctx, loading: ctxLoading } = useContextData()

  useEffect(() => {
    const p = loadProfile()
    const e = loadEntries()
    setProfile(p)
    setEntries(e)
    setHydrated(true)
  }, [])

  const todayEntries = useMemo(
    () => entries.filter((e) => isToday(e.loggedAt)),
    [entries],
  )

  const todayCalories = useMemo(
    () =>
      Math.round(
        todayEntries.reduce((sum, e) => sum + e.analysis.calories, 0),
      ),
    [todayEntries],
  )

  const todayProtein = useMemo(
    () =>
      Math.round(
        todayEntries.reduce((sum, e) => sum + e.analysis.protein, 0),
      ),
    [todayEntries],
  )

  const todayCarbs = useMemo(
    () =>
      Math.round(
        todayEntries.reduce((sum, e) => sum + e.analysis.carbs, 0),
      ),
    [todayEntries],
  )

  const todayFat = useMemo(
    () =>
      Math.round(
        todayEntries.reduce((sum, e) => sum + e.analysis.fat, 0),
      ),
    [todayEntries],
  )

  const avgScore = useMemo(() => {
    if (todayEntries.length === 0) return 0
    return Math.round(
      todayEntries.reduce((sum, e) => sum + e.analysis.healthScore, 0) /
        todayEntries.length,
    )
  }, [todayEntries])

  const handleSaveProfile = useCallback((p: Profile) => {
    setProfile(p)
    saveProfile(p)
    setEditProfileOpen(false)
    toast.success("Profile saved")
  }, [])

  const handleLogged = useCallback((entry: FoodEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev]
      saveEntries(next)
      return next
    })
    setInsights(null)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveEntries(next)
      return next
    })
    setInsights(null)
  }, [])

  const refreshInsights = useCallback(async () => {
    if (!profile) return
    setInsightsLoading(true)
    try {
      const flat = todayEntries.map((e) => ({
        name: e.analysis.name,
        loggedAt: e.loggedAt,
        calories: e.analysis.calories,
        protein: e.analysis.protein,
        carbs: e.analysis.carbs,
        fat: e.analysis.fat,
        fiber: e.analysis.fiber,
        sugar: e.analysis.sugar,
        sodium: e.analysis.sodium,
        healthScore: e.analysis.healthScore,
        category: e.analysis.category,
      }))
      const result = await getDailyInsightsAction({
        profile,
        context: ctx,
        todaysEntries: flat,
      })
      setInsights(result)
      result.alerts
        .filter((a) => a.severity === "critical" || a.severity === "warning")
        .slice(0, 1)
        .forEach((a) =>
          a.severity === "critical"
            ? toast.error(a.message)
            : toast.warning(a.message),
        )
    } catch (err) {
      console.log("[v0] getDailyInsightsAction error:", err)
      toast.error("Could not generate insights", {
        description:
          err instanceof Error ? err.message : "Please try again shortly.",
      })
    } finally {
      setInsightsLoading(false)
    }
  }, [profile, ctx, todayEntries])

  useEffect(() => {
    if (!profile) return
    if (todayEntries.length === 0) return
    if (insights || insightsLoading) return
    refreshInsights()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayEntries.length, profile])

  if (!hydrated) return null

  if (!profile) {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-background">
        <div className="bg-app-mesh pointer-events-none absolute inset-0 -z-10" />
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-5 px-4 py-6">
          <BrandHeader />
          <ProfileSetup onSave={handleSaveProfile} />
          <Toaster position="top-center" />
        </main>
      </div>
    )
  }

  const NAV_ITEMS = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "log" as const, label: "Log Food", icon: Utensils },
    { id: "insights" as const, label: "Insights", icon: BarChart3 },
    { id: "history" as const, label: "History", icon: History },
  ]

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="bg-app-mesh pointer-events-none absolute inset-0 -z-10 opacity-80" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/60 bg-card/80 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-md shadow-primary/20">
            <Leaf className="h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight">NutriSense</h1>
            <p className="text-[11px] text-muted-foreground">AI nutrition assistant</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? "bg-brand-gradient text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border/60 p-4">
          <div className="rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Gemini
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Real-time AI nutrition analysis
            </p>
          </div>
        </div>

        <div className="border-t border-border/60 p-3">
          <button
            onClick={() => setEditProfileOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Top bar for mobile + desktop */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandHeader />
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-nutri-pulse rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {greetingFor(ctx.timeOfDay)}
                </p>
              </div>
              <span className="text-muted-foreground/30">·</span>
              <h2 className="text-lg font-bold tracking-tight">
                {profile.name ? (
                  <>
                    Hey, <span className="text-brand-gradient">{profile.name}</span>
                  </>
                ) : (
                  <>
                    Let&apos;s eat <span className="text-brand-gradient">smart</span>
                  </>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ContextBar ctx={ctx} loading={ctxLoading} />
              <Sheet open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Edit profile"
                    className="h-9 w-9 rounded-full border-border/70 bg-card shadow-sm lg:hidden"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full overflow-y-auto sm:max-w-md"
                >
                  <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <ProfileSetup initial={profile} onSave={handleSaveProfile} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Mobile greeting */}
        <div className="px-4 pt-4 lg:hidden">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-nutri-pulse rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {greetingFor(ctx.timeOfDay)}
            </p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {profile.name ? (
              <>
                Hey, <span className="text-brand-gradient">{profile.name}</span>
              </>
            ) : (
              <>
                Let&apos;s eat <span className="text-brand-gradient">smart</span>
              </>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time coaching tailored to your goal & context
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="mx-auto max-w-6xl px-4 pt-5 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Calories"
              value={todayCalories.toLocaleString()}
              suffix="kcal"
              target={insights?.targets.calories}
              icon={<Flame className="h-4 w-4" />}
              tone="emerald"
            />
            <StatCard
              label="Protein"
              value={todayProtein.toString()}
              suffix="g"
              target={insights?.targets.protein}
              icon={<Zap className="h-4 w-4" />}
              tone="sky"
            />
            <StatCard
              label="Meals"
              value={todayEntries.length.toString()}
              suffix="logged"
              icon={<Target className="h-4 w-4" />}
              tone="amber"
            />
            <StatCard
              label="Health"
              value={avgScore ? avgScore.toString() : "—"}
              suffix={avgScore ? "/10" : ""}
              icon={<Heart className="h-4 w-4" />}
              tone="coral"
            />
          </div>
        </div>

        {/* Desktop: Grid layout / Mobile: Tab-based */}
        <div className="mx-auto max-w-6xl px-4 py-5 lg:px-8">
          {/* Mobile tabs */}
          <div className="lg:hidden">
            <Tabs
              value={activeSection}
              onValueChange={(v) => setActiveSection(v as typeof activeSection)}
              className="w-full"
            >
              <TabsList className="grid h-11 w-full grid-cols-4 rounded-xl border border-border/60 bg-card p-1 shadow-sm">
                {NAV_ITEMS.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="gap-1 rounded-lg text-[11px] data-[state=active]:bg-brand-gradient data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="dashboard" className="mt-4 space-y-4">
                <FoodLogger profile={profile} context={ctx} onLogged={handleLogged} />
                <DailyInsightsPanel
                  insights={insights}
                  todayEntries={todayEntries}
                  loading={insightsLoading}
                  onRefresh={refreshInsights}
                />
              </TabsContent>
              <TabsContent value="log" className="mt-4">
                <FoodLogger profile={profile} context={ctx} onLogged={handleLogged} />
              </TabsContent>
              <TabsContent value="insights" className="mt-4">
                <DailyInsightsPanel
                  insights={insights}
                  todayEntries={todayEntries}
                  loading={insightsLoading}
                  onRefresh={refreshInsights}
                />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <FoodLogList entries={todayEntries} onDelete={handleDelete} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop content — responds to sidebar nav */}
          <div className="hidden lg:block">
            {activeSection === "dashboard" && (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="col-span-5 space-y-5">
                  <FoodLogger profile={profile} context={ctx} onLogged={handleLogged} />
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        Today&apos;s Log
                      </h3>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {todayEntries.length} meals
                      </span>
                    </div>
                    <FoodLogList entries={todayEntries} onDelete={handleDelete} />
                  </div>
                </div>
                <div className="col-span-7 space-y-5">
                  <DailyInsightsPanel
                    insights={insights}
                    todayEntries={todayEntries}
                    loading={insightsLoading}
                    onRefresh={refreshInsights}
                  />
                </div>
              </div>
            )}

            {activeSection === "log" && (
              <div className="mx-auto max-w-lg space-y-5">
                <FoodLogger profile={profile} context={ctx} onLogged={handleLogged} />
              </div>
            )}

            {activeSection === "insights" && (
              <div className="space-y-5">
                <DailyInsightsPanel
                  insights={insights}
                  todayEntries={todayEntries}
                  loading={insightsLoading}
                  onRefresh={refreshInsights}
                />
              </div>
            )}

            {activeSection === "history" && (
              <div className="mx-auto max-w-2xl space-y-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Today&apos;s Log
                  </h3>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {todayEntries.length} meals
                  </span>
                </div>
                <FoodLogList entries={todayEntries} onDelete={handleDelete} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Toaster position="top-center" />
    </div>
  )
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-md shadow-primary/20">
        <Leaf className="h-5 w-5" aria-hidden />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
      </div>
      <div className="leading-tight">
        <h1 className="text-base font-bold tracking-tight">NutriSense</h1>
        <p className="text-[11px] text-muted-foreground">
          AI nutrition assistant
        </p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix,
  target,
  icon,
  tone,
}: {
  label: string
  value: string
  suffix?: string
  target?: number
  icon: React.ReactNode
  tone: "emerald" | "amber" | "sky" | "coral"
}) {
  const TONE_STYLES: Record<string, { bg: string; icon: string; accent: string }> = {
    emerald: {
      bg: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10",
      icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      accent: "text-emerald-700 dark:text-emerald-300",
    },
    amber: {
      bg: "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10",
      icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      accent: "text-amber-700 dark:text-amber-300",
    },
    sky: {
      bg: "border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-sky-500/10",
      icon: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      accent: "text-sky-700 dark:text-sky-300",
    },
    coral: {
      bg: "border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-500/10",
      icon: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
      accent: "text-orange-700 dark:text-orange-300",
    },
  }

  const t = TONE_STYLES[tone]
  const pct = target && target > 0 ? Math.min(100, Math.round((parseInt(value.replace(/,/g, "")) / target) * 100)) : null

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${t.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.icon}`}>
          {icon}
        </div>
        {pct !== null && (
          <span className={`text-[10px] font-bold ${t.accent}`}>{pct}%</span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums tracking-tight">{value}</span>
        {suffix && <span className="text-xs font-medium text-muted-foreground">{suffix}</span>}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        {target && (
          <span className="text-[10px] text-muted-foreground/70">/ {target.toLocaleString()}</span>
        )}
      </div>
      {pct !== null && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-foreground/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              tone === "emerald" ? "bg-emerald-500" :
              tone === "amber" ? "bg-amber-500" :
              tone === "sky" ? "bg-sky-500" : "bg-orange-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

function greetingFor(timeOfDay: string) {
  switch (timeOfDay) {
    case "morning":
      return "Good morning"
    case "midday":
      return "Good midday"
    case "afternoon":
      return "Good afternoon"
    case "evening":
      return "Good evening"
    case "night":
      return "Late night check-in"
    default:
      return "Welcome back"
  }
}
