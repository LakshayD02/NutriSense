"use client"

import { Cloud, Clock, MapPin, Loader2 } from "lucide-react"
import type { ContextData } from "@/lib/types"

const TIME_LABEL: Record<ContextData["timeOfDay"], string> = {
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
}

export function ContextBar({
  ctx,
  loading,
}: {
  ctx: ContextData
  loading: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Pill
        icon={<Clock className="h-3 w-3" aria-hidden />}
        tone="emerald"
        label={`${TIME_LABEL[ctx.timeOfDay]} · ${ctx.hour}:00`}
      />
      {ctx.location && (
        <Pill
          icon={<MapPin className="h-3 w-3" aria-hidden />}
          tone="coral"
          label={ctx.location}
        />
      )}
      {ctx.weather && (
        <Pill
          icon={<Cloud className="h-3 w-3" aria-hidden />}
          tone="sky"
          label={`${ctx.weather.condition} · ${ctx.weather.temperatureC}°C`}
        />
      )}
      {loading && !ctx.location && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
          <Loader2 className="h-3 w-3 animate-spin" />
          Detecting context…
        </span>
      )}
    </div>
  )
}

const TONE: Record<string, string> = {
  emerald:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  coral:
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
}

function Pill({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode
  label: string
  tone: "emerald" | "coral" | "sky"
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${TONE[tone]}`}
    >
      {icon}
      {label}
    </span>
  )
}
