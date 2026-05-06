"use client"

import { useEffect, useState } from "react"
import type { ContextData } from "@/lib/types"

function timeOfDayFromHour(h: number): ContextData["timeOfDay"] {
  if (h < 5) return "night"
  if (h < 11) return "morning"
  if (h < 14) return "midday"
  if (h < 17) return "afternoon"
  if (h < 21) return "evening"
  return "night"
}

const WMO: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
}

export function useContextData() {
  const [ctx, setCtx] = useState<ContextData>(() => {
    const h = new Date().getHours()
    return { hour: h, timeOfDay: timeOfDayFromHour(h) }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = new Date().getHours()
    let cancelled = false

    async function loadFromCoords(lat: number, lon: number) {
      try {
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
        )
        const wData = await wRes.json()
        const code = wData?.current?.weather_code
        const temp = wData?.current?.temperature_2m

        // Best-effort reverse geocode using open-meteo's free geocoding
        let label: string | undefined
        try {
          const gRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`,
          )
          const gData = await gRes.json()
          const r = gData?.results?.[0]
          if (r) {
            label = [r.name, r.admin1, r.country_code].filter(Boolean).join(", ")
          }
        } catch {
          // ignore
        }

        if (cancelled) return
        setCtx({
          hour: h,
          timeOfDay: timeOfDayFromHour(h),
          location: label,
          weather:
            typeof temp === "number"
              ? {
                  temperatureC: Math.round(temp),
                  condition: WMO[code] ?? "Unknown",
                }
              : undefined,
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadFromCoords(pos.coords.latitude, pos.coords.longitude),
        () => {
          if (!cancelled) setLoading(false)
        },
        { timeout: 5000, maximumAge: 10 * 60 * 1000 },
      )
    } else {
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [])

  return { ctx, loading }
}
