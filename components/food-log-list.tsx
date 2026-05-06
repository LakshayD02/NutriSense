"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, Trash2, Lightbulb, Clock, ShieldAlert, ShieldCheck } from "lucide-react"
import type { FoodEntry } from "@/lib/types"

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function scoreColor(score: number) {
  if (score >= 7)
    return "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
  if (score >= 4)
    return "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300"
  return "bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-300"
}

function scoreBg(score: number) {
  if (score >= 7) return "from-emerald-500/10 to-emerald-500/5"
  if (score >= 4) return "from-amber-500/10 to-amber-500/5"
  return "from-red-500/10 to-red-500/5"
}

export function FoodLogList({
  entries,
  onDelete,
}: {
  entries: FoodEntry[]
  onDelete: (id: string) => void
}) {
  if (entries.length === 0) {
    return (
      <Card className="border-dashed border-border/70">
        <CardContent className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No food logged yet today</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">
            Add your first meal above to get personalized insights.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2.5">
      {entries.map((entry) => {
        const a = entry.analysis
        return (
          <Collapsible key={entry.id}>
            <Card className={`overflow-hidden border-border/60 bg-gradient-to-r ${scoreBg(a.healthScore)} shadow-sm transition-all hover:shadow-md`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {entry.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.imageDataUrl || "/placeholder.svg"}
                      alt={a.name}
                      className="h-16 w-16 flex-shrink-0 rounded-xl object-cover ring-1 ring-border shadow-sm"
                    />
                  ) : (
                    <div
                      className={`flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${scoreColor(
                        a.healthScore,
                      )}`}
                    >
                      <span className="text-lg font-bold leading-none">
                        {a.healthScore}
                      </span>
                      <span className="mt-0.5 text-[9px] font-medium opacity-70">
                        / 10
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {a.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.loggedAt)} · {a.estimatedPortion}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="flex-shrink-0 bg-emerald-500/10 text-emerald-700 font-semibold dark:text-emerald-300 shadow-sm"
                      >
                        {a.calories} kcal
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium">
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                        P {Math.round(a.protein)}g
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-300">
                        C {Math.round(a.carbs)}g
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-orange-500/10 px-1.5 py-0.5 text-orange-700 dark:text-orange-300">
                        F {Math.round(a.fat)}g
                      </span>
                      {a.fitsRestrictions ? (
                        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-red-600 dark:text-red-400">
                          <ShieldAlert className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    {a.warnings.length > 0 && (
                      <div className="mt-1.5">
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                          ⚠ {a.warnings[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs hover:bg-secondary/70"
                    >
                      Details
                      <ChevronDown className="h-3.5 w-3.5 transition-transform [[data-state=open]_&]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(entry.id)}
                    aria-label={`Delete ${a.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <CollapsibleContent className="mt-2 space-y-3 border-t border-border/40 pt-3 text-sm">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {a.notes}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border border-border/60 bg-card p-2.5 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sugar
                      </div>
                      <div className="mt-0.5 text-sm font-bold">{Math.round(a.sugar)}g</div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card p-2.5 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Fiber
                      </div>
                      <div className="mt-0.5 text-sm font-bold">{Math.round(a.fiber)}g</div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card p-2.5 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sodium
                      </div>
                      <div className="mt-0.5 text-sm font-bold">
                        {Math.round(a.sodium)}mg
                      </div>
                    </div>
                  </div>
                  {a.alternatives.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Healthier Alternatives
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                        {a.alternatives.map((alt, i) => (
                          <li key={i} className="text-pretty leading-snug">
                            {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        )
      })}
    </div>
  )
}
