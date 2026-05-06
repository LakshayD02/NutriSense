"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Camera,
  Send,
  X,
  Loader2,
  Type as TypeIcon,
  ImagePlus,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeFoodAction } from "@/app/actions"
import type { ContextData, FoodEntry, Profile } from "@/lib/types"
import { toast } from "sonner"

export function FoodLogger({
  profile,
  context,
  onLogged,
}: {
  profile: Profile
  context: ContextData
  onLogged: (entry: FoodEntry) => void
}) {
  const [text, setText] = useState("")
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<"text" | "image">("text")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image too large (max 6MB)")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (loading) return
    if (tab === "text" && !text.trim()) {
      toast.error("Describe what you ate first")
      return
    }
    if (tab === "image" && !imageDataUrl) {
      toast.error("Add a photo first")
      return
    }

    setLoading(true)
    try {
      const analysis = await analyzeFoodAction({
        text: tab === "text" ? text.trim() : undefined,
        imageDataUrl: tab === "image" ? imageDataUrl ?? undefined : undefined,
        profile,
        context,
      })
      const entry: FoodEntry = {
        id: crypto.randomUUID(),
        loggedAt: Date.now(),
        source: tab,
        inputText: tab === "text" ? text.trim() : undefined,
        imageDataUrl: tab === "image" ? imageDataUrl ?? undefined : undefined,
        analysis,
      }
      onLogged(entry)
      setText("")
      setImageDataUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

      if (analysis.healthScore <= 3) {
        toast.warning(`${analysis.name}: low health score`, {
          description: analysis.warnings[0] ?? analysis.notes,
        })
      } else if (!analysis.fitsRestrictions) {
        toast.warning(`${analysis.name} may not fit your restrictions`, {
          description: analysis.notes,
        })
      } else {
        toast.success(`Logged: ${analysis.name}`, {
          description: `${analysis.calories} kcal · health ${analysis.healthScore}/10`,
        })
      }
    } catch (err) {
      console.log("[v0] analyzeFoodAction error:", err)
      toast.error("Could not analyze food", {
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold">Log a Meal</h3>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Instant AI analysis
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "text" | "image")}>
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-secondary/60 p-1">
            <TabsTrigger
              value="text"
              className="gap-2 rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <TypeIcon className="h-3.5 w-3.5" />
              Describe
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="gap-2 rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Photo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <Textarea
              placeholder="e.g. Grilled chicken salad with olive oil dressing, brown rice on the side..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-none rounded-xl border-border/70 bg-background/60 text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20"
            />
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            {imageDataUrl ? (
              <div className="relative overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl || "/placeholder.svg"}
                  alt="Food preview"
                  className="h-48 w-full rounded-xl object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button
                  type="button"
                  onClick={() => setImageDataUrl(null)}
                  className="absolute right-2 top-2 rounded-full bg-background/95 p-2 text-foreground shadow-lg ring-1 ring-border transition-transform hover:scale-105"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-sm dark:text-emerald-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 transition-transform group-hover:scale-110">
                  <Upload className="h-5 w-5" aria-hidden />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Upload or take a photo</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">JPG, PNG up to 6MB</p>
                </div>
              </button>
            )}
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          className="bg-brand-gradient mt-4 h-12 w-full rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:opacity-95 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing with Gemini…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Log &amp; Analyze
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
