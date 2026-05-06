"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
  Utensils,
  TrendingUp,
  Sun,
  Sunset,
  Moon,
  Apple,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"
import type { DailyInsights, FoodEntry } from "@/lib/types"

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

const MEAL_ICON: Record<string, React.ReactNode> = {
  breakfast: <Sun className="h-3.5 w-3.5" />,
  lunch: <Utensils className="h-3.5 w-3.5" />,
  dinner: <Sunset className="h-3.5 w-3.5" />,
  snack: <Apple className="h-3.5 w-3.5" />,
}

const MEAL_TONE: Record<string, string> = {
  breakfast: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  lunch: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  dinner: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  snack: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

const MACRO_COLORS = {
  protein: "#10b981",
  carbs: "#f59e0b",
  fat: "#f97316",
}

export function DailyInsightsPanel({
  insights,
  todayEntries,
  loading,
  onRefresh,
}: {
  insights: DailyInsights | null
  todayEntries: FoodEntry[]
  loading: boolean
  onRefresh: () => void
}) {
  const totals = todayEntries.reduce(
    (acc, e) => {
      acc.calories += e.analysis.calories
      acc.protein += e.analysis.protein
      acc.carbs += e.analysis.carbs
      acc.fat += e.analysis.fat
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  // Pie chart data for macro distribution
  const macroData = [
    { name: "Protein", value: Math.round(totals.protein), color: MACRO_COLORS.protein },
    { name: "Carbs", value: Math.round(totals.carbs), color: MACRO_COLORS.carbs },
    { name: "Fat", value: Math.round(totals.fat), color: MACRO_COLORS.fat },
  ].filter((d) => d.value > 0)

  // Timeline data for calorie progression
  const timelineData = todayEntries
    .slice()
    .sort((a, b) => a.loggedAt - b.loggedAt)
    .reduce<{ time: string; calories: number; cumulative: number; name: string }[]>(
      (acc, entry) => {
        const t = new Date(entry.loggedAt)
        const hh = t.getHours().toString().padStart(2, "0")
        const mm = t.getMinutes().toString().padStart(2, "0")
        const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0
        acc.push({
          time: `${hh}:${mm}`,
          calories: Math.round(entry.analysis.calories),
          cumulative: Math.round(prev + entry.analysis.calories),
          name: entry.analysis.name,
        })
        return acc
      },
      [],
    )

  // Bar chart data for per-meal health scores
  const healthScoreData = todayEntries
    .slice()
    .sort((a, b) => a.loggedAt - b.loggedAt)
    .map((entry) => ({
      name: entry.analysis.name.length > 12
        ? entry.analysis.name.slice(0, 12) + "…"
        : entry.analysis.name,
      score: entry.analysis.healthScore,
      fill:
        entry.analysis.healthScore >= 7
          ? "#10b981"
          : entry.analysis.healthScore >= 4
            ? "#f59e0b"
            : "#ef4444",
    }))

  if (todayEntries.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-card">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold">No meals logged yet</p>
            <p className="mt-1 text-pretty text-xs text-muted-foreground max-w-xs">
              Add your first meal and Gemini will generate personalized macro targets,
              alerts, and meal recommendations for the rest of your day.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Macro overview with charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Macro Progress Card */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-4 w-4" />
              </span>
              <CardTitle className="text-sm font-semibold">
                Macro Tracker
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 gap-1 text-xs hover:bg-secondary/70"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroRow
              label="Calories"
              value={Math.round(totals.calories)}
              target={insights?.targets.calories ?? 2000}
              unit="kcal"
              tone="emerald"
            />
            <div className="grid grid-cols-3 gap-2">
              <MacroSmall
                label="Protein"
                value={Math.round(totals.protein)}
                target={insights?.targets.protein ?? 100}
                tone="emerald"
              />
              <MacroSmall
                label="Carbs"
                value={Math.round(totals.carbs)}
                target={insights?.targets.carbs ?? 250}
                tone="amber"
              />
              <MacroSmall
                label="Fat"
                value={Math.round(totals.fat)}
                target={insights?.targets.fat ?? 70}
                tone="coral"
              />
            </div>
          </CardContent>
        </Card>

        {/* Macro Distribution Pie Chart */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <PieChartIcon className="h-4 w-4" />
              </span>
              Macro Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            {macroData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-[140px] w-[140px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={62}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {macroData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {macroData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs font-medium text-foreground">{d.name}</span>
                      <span className="ml-auto text-xs font-bold tabular-nums">{d.value}g</span>
                    </div>
                  ))}
                  <div className="mt-1 border-t border-border/60 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">{Math.round(totals.calories)} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Log food to see macro distribution
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calorie Timeline Chart */}
      {timelineData.length > 1 && (
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Activity className="h-4 w-4" />
              </span>
              Calorie Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} kcal`,
                      name === "cumulative" ? "Running Total" : "This Meal",
                    ]}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#calorieGrad)"
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                    activeDot={{ r: 6, fill: "#10b981" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Score per meal chart */}
      {healthScoreData.length > 0 && (
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <TrendingUp className="h-4 w-4" />
              </span>
              Health Scores by Meal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthScoreData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number) => [`${value}/10`, "Health Score"]}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {healthScoreData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {insights?.alerts.map((a, i) => (
        <Alert
          key={i}
          variant={a.severity === "critical" ? "destructive" : "default"}
          className={
            a.severity === "warning"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 [&>svg]:text-amber-600"
              : a.severity === "info"
                ? "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-200 [&>svg]:text-sky-600"
                : ""
          }
        >
          {a.severity === "critical" ? (
            <AlertCircle className="h-4 w-4" />
          ) : a.severity === "warning" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">
            {a.severity}
          </AlertTitle>
          <AlertDescription className="text-sm">{a.message}</AlertDescription>
        </Alert>
      ))}

      {/* Summary + strengths/concerns */}
      {insights && (
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              AI Daily Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-pretty leading-relaxed">
              {insights.summary}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {insights.strengths.length > 0 && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Doing well
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {insights.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                        <span className="text-pretty">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.concerns.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Watch out for
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {insights.concerns.map((c, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                        <span className="text-pretty">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavioral suggestions */}
      {insights && insights.behavioralSuggestions.length > 0 && (
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <Moon className="h-4 w-4" />
              </span>
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {insights.behavioralSuggestions.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-bold text-primary-foreground shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-pretty leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights && insights.recommendedMeals.length > 0 && (
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <Utensils className="h-4 w-4" />
              </span>
              Recommended Next Meals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.recommendedMeals.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-secondary/30 p-4 transition-all hover:bg-secondary/50 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                        MEAL_TONE[m.type] ?? MEAL_TONE.snack
                      }`}
                    >
                      {MEAL_ICON[m.type] ?? MEAL_ICON.snack}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {m.name}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {m.type}
                      </p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-sm">
                    ~{m.estimatedCalories} kcal
                  </span>
                </div>
                <p className="mt-2.5 text-xs leading-snug text-foreground/90">
                  {m.description}
                </p>
                <p className="mt-1.5 text-[11px] italic leading-snug text-muted-foreground">
                  {m.reason}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!insights && !loading && (
        <p className="text-center text-xs text-muted-foreground">
          Tap Refresh to generate insights for today.
        </p>
      )}
    </div>
  )
}

const MACRO_TONE: Record<string, { bar: string; text: string; bg: string }> = {
  emerald: {
    bar: "[&>div]:bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10 border-emerald-500/25",
  },
  amber: {
    bar: "[&>div]:bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10 border-amber-500/25",
  },
  coral: {
    bar: "[&>div]:bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/10 border-orange-500/25",
  },
}

function MacroRow({
  label,
  value,
  target,
  unit,
  tone = "emerald",
}: {
  label: string
  value: number
  target: number
  unit: string
  tone?: keyof typeof MACRO_TONE
}) {
  const pct = target > 0 ? clamp((value / target) * 100) : 0
  const t = MACRO_TONE[tone]
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          <span className={`font-semibold ${t.text}`}>{value.toLocaleString()}</span>
          <span className="opacity-60"> / {target.toLocaleString()} {unit}</span>
        </span>
      </div>
      <Progress value={pct} className={`h-2.5 ${t.bar}`} />
    </div>
  )
}

function MacroSmall({
  label,
  value,
  target,
  tone,
}: {
  label: string
  value: number
  target: number
  tone: keyof typeof MACRO_TONE
}) {
  const pct = target > 0 ? clamp((value / target) * 100) : 0
  const t = MACRO_TONE[tone]
  return (
    <div className={`rounded-xl border p-2.5 ${t.bg}`}>
      <div
        className={`text-[10px] font-bold uppercase tracking-wider ${t.text}`}
      >
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold tabular-nums">
        {value}
        <span className="text-[11px] font-medium opacity-60">/{target}g</span>
      </div>
      <Progress value={pct} className={`mt-1.5 h-1 ${t.bar}`} />
    </div>
  )
}
