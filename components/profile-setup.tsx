"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sparkles,
  Camera,
  Activity,
  CloudSun,
  ArrowRight,
} from "lucide-react"
import type { DietaryRestriction, Profile } from "@/lib/types"

const RESTRICTIONS: { value: DietaryRestriction; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "dairy_free", label: "Dairy-free" },
  { value: "nut_free", label: "Nut-free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "low_sodium", label: "Low sodium" },
  { value: "low_sugar", label: "Low sugar" },
  { value: "keto", label: "Keto" },
]

const FEATURES = [
  {
    icon: Camera,
    label: "Snap or describe meals",
    desc: "Photo recognition with Gemini",
    tone: "emerald",
  },
  {
    icon: Activity,
    label: "Real-time alerts",
    desc: "Catch unhealthy patterns",
    tone: "coral",
  },
  {
    icon: CloudSun,
    label: "Context-aware",
    desc: "Time, location & weather",
    tone: "sky",
  },
] as const

const TONE_BG: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  coral: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
}

export function ProfileSetup({
  initial,
  onSave,
}: {
  initial?: Profile | null
  onSave: (p: Profile) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [age, setAge] = useState(initial?.age?.toString() ?? "30")
  const [weight, setWeight] = useState(initial?.weightKg?.toString() ?? "70")
  const [height, setHeight] = useState(initial?.heightCm?.toString() ?? "170")
  const [sex, setSex] = useState<Profile["sex"]>(initial?.sex ?? "male")
  const [activity, setActivity] = useState<Profile["activityLevel"]>(
    initial?.activityLevel ?? "moderate",
  )
  const [goal, setGoal] = useState<Profile["goal"]>(
    initial?.goal ?? "general_health",
  )
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>(
    initial?.restrictions ?? [],
  )

  const isEdit = !!initial

  function toggleRestriction(r: DietaryRestriction) {
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: name.trim(),
      age: Number.parseInt(age, 10) || 30,
      weightKg: Number.parseFloat(weight) || 70,
      heightCm: Number.parseFloat(height) || 170,
      sex,
      activityLevel: activity,
      goal,
      restrictions,
    })
  }

  return (
    <div className="space-y-4">
      {!isEdit && (
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="bg-brand-gradient relative px-5 py-6 text-primary-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Powered by Gemini
            </span>
            <h2 className="mt-3 text-pretty text-2xl font-bold leading-tight">
              Your AI nutrition coach,
              <br />
              in your pocket.
            </h2>
            <p className="mt-1.5 max-w-xs text-pretty text-sm text-primary-foreground/85">
              Snap a meal, get instant macros, real-time alerts, and personalized
              recommendations.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-start gap-1.5 rounded-xl border border-border/60 bg-card p-3"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONE_BG[f.tone]}`}
                >
                  <f.icon className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="text-[11px] font-semibold leading-tight">
                  {f.label}
                </div>
                <div className="text-[10px] leading-tight text-muted-foreground">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-pretty text-lg">
            {isEdit ? "Edit your profile" : "Build your profile"}
          </CardTitle>
          <CardDescription className="text-pretty text-xs">
            We use this to personalize macro targets, alerts, and meal
            recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={sex} onValueChange={(v) => setSex(v as Profile["sex"])}>
                  <SelectTrigger id="sex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activity">Activity level</Label>
              <Select
                value={activity}
                onValueChange={(v) =>
                  setActivity(v as Profile["activityLevel"])
                }
              >
                <SelectTrigger id="activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">
                    Sedentary (little/no exercise)
                  </SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">
                    Moderate (3-5 days/week)
                  </SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">
                    Very active (athlete)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Fitness goal</Label>
              <Select
                value={goal}
                onValueChange={(v) => setGoal(v as Profile["goal"])}
              >
                <SelectTrigger id="goal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose weight</SelectItem>
                  <SelectItem value="maintain">Maintain weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain muscle</SelectItem>
                  <SelectItem value="improve_energy">Improve energy</SelectItem>
                  <SelectItem value="general_health">General health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Dietary restrictions</Label>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-secondary/30 p-3">
                {RESTRICTIONS.map((r) => {
                  const checked = restrictions.includes(r.value)
                  return (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition ${
                        checked ? "bg-emerald-500/10" : "hover:bg-card"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRestriction(r.value)}
                        aria-label={r.label}
                      />
                      <span>{r.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="bg-brand-gradient mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 hover:opacity-95"
            >
              {isEdit ? "Save changes" : "Start coaching"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
