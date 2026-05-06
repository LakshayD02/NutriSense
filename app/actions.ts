"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import type {
  ContextData,
  DailyInsights,
  FoodAnalysis,
  Profile,
} from "@/lib/types"

// Groq configuration
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
})

// Use a fast model - works without json_schema
const MODEL = groq("llama-3.1-8b-instant")

export async function analyzeFoodAction(input: {
  text?: string
  imageDataUrl?: string
  profile: Profile
  context: ContextData
}): Promise<FoodAnalysis> {
  const { text, imageDataUrl, profile, context } = input

  const prompt = `You are a registered-dietitian-level nutrition assistant.
Analyze the food the user just ate or is about to eat and return ONLY a valid JSON object (no markdown, no code blocks, no extra text).

USER PROFILE:
Name: ${profile.name || "User"}
Age: ${profile.age}
Sex: ${profile.sex}
Weight: ${profile.weightKg} kg
Height: ${profile.heightCm} cm
Activity level: ${profile.activityLevel}
Goal: ${profile.goal}
Dietary restrictions: ${profile.restrictions.length ? profile.restrictions.join(", ") : "none"}

CURRENT CONTEXT:
Time of day: ${context.timeOfDay} (local hour ${context.hour})
${context.location ? `Location: ${context.location}` : ""}
${context.weather ? `Weather: ${context.weather.condition}, ${context.weather.temperatureC}°C` : ""}

${text ? `The user describes the food as: "${text}"` : "Identify the food from the attached image."}

Return this EXACT JSON structure (replace with real values):
{
  "name": "string",
  "estimatedPortion": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "healthScore": number (1-10),
  "category": "string",
  "warnings": ["string"],
  "alternatives": ["string", "string"],
  "fitsRestrictions": boolean,
  "notes": "string"
}`

  console.log("[NutriSense] Analyzing food...")
  const { text: response } = await generateText({
    model: MODEL,
    prompt,
  })

  // Clean and parse JSON response
  const cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const result = JSON.parse(cleaned) as FoodAnalysis
    console.log("[NutriSense] Food analysis complete!")
    return result
  } catch (error) {
    console.error("[NutriSense] Failed to parse:", cleaned)
    throw new Error("Failed to parse food analysis response")
  }
}

export async function getDailyInsightsAction(input: {
  profile: Profile
  context: ContextData
  todaysEntries: {
    name: string
    loggedAt: number
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
    healthScore: number
    category: string
  }[]
}): Promise<DailyInsights> {
  const { profile, context, todaysEntries } = input

  // Calculate totals
  const totals = todaysEntries.reduce(
    (acc, e) => {
      acc.calories += e.calories
      acc.protein += e.protein
      acc.carbs += e.carbs
      acc.fat += e.fat
      acc.fiber += e.fiber
      acc.sugar += e.sugar
      acc.sodium += e.sodium
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  )

  // Format today's log
  const log = todaysEntries
    .map((e) => {
      const t = new Date(e.loggedAt)
      const time = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`
      return `- ${time} ${e.name} (${e.category}) — ${e.calories} kcal, P${e.protein}g C${e.carbs}g F${e.fat}g, sugar ${e.sugar}g, sodium ${e.sodium}mg, health ${e.healthScore}/10`
    })
    .join("\n")

  const prompt = `You are a real-time nutrition coach. Return ONLY a valid JSON object (no markdown, no code blocks).

USER PROFILE:
Name: ${profile.name || "User"}
Age: ${profile.age}
Sex: ${profile.sex}
Weight: ${profile.weightKg} kg
Height: ${profile.heightCm} cm
Activity level: ${profile.activityLevel}
Goal: ${profile.goal}
Dietary restrictions: ${profile.restrictions.length ? profile.restrictions.join(", ") : "none"}

CURRENT CONTEXT:
Time of day: ${context.timeOfDay} (local hour ${context.hour})
${context.location ? `Location: ${context.location}` : ""}
${context.weather ? `Weather: ${context.weather.condition}, ${context.weather.temperatureC}°C` : ""}

TODAY'S TOTALS SO FAR:
Calories: ${Math.round(totals.calories)} kcal
Protein: ${Math.round(totals.protein)} g
Carbs: ${Math.round(totals.carbs)} g
Fat: ${Math.round(totals.fat)} g
Fiber: ${Math.round(totals.fiber)} g
Sugar: ${Math.round(totals.sugar)} g
Sodium: ${Math.round(totals.sodium)} mg

TODAY'S LOG (${todaysEntries.length} entries):
${log || "(no entries yet)"}

Return this EXACT JSON structure:
{
  "summary": "string",
  "strengths": ["string"],
  "concerns": ["string"],
  "alerts": [
    {"severity": "info|warning|critical", "message": "string"}
  ],
  "behavioralSuggestions": ["string"],
  "recommendedMeals": [
    {
      "name": "string",
      "type": "breakfast|lunch|dinner|snack",
      "description": "string",
      "estimatedCalories": number,
      "reason": "string"
    }
  ],
  "targets": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
}`

  console.log("[NutriSense] Getting daily insights...")
  const { text: response } = await generateText({
    model: MODEL,
    prompt,
  })

  // Clean and parse JSON response
  const cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const result = JSON.parse(cleaned) as DailyInsights
    console.log("[NutriSense] Daily insights complete!")
    return result
  } catch (error) {
    console.error("[NutriSense] Failed to parse:", cleaned)
    throw new Error("Failed to parse daily insights response")
  }
}