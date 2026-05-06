"use client"

import type { FoodEntry, Profile } from "./types"

const PROFILE_KEY = "nutri.profile.v1"
const ENTRIES_KEY = "nutri.entries.v1"

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearProfile() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(PROFILE_KEY)
}

export function loadEntries(): FoodEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ENTRIES_KEY)
    return raw ? (JSON.parse(raw) as FoodEntry[]) : []
  } catch {
    return []
  }
}

export function saveEntries(entries: FoodEntry[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function isToday(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}
