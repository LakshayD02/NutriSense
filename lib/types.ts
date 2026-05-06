export type FitnessGoal =
  | "lose_weight"
  | "maintain"
  | "gain_muscle"
  | "improve_energy"
  | "general_health"

export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "dairy_free"
  | "nut_free"
  | "halal"
  | "kosher"
  | "low_sodium"
  | "low_sugar"
  | "keto"

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

export type Profile = {
  name: string
  age: number
  weightKg: number
  heightCm: number
  sex: "male" | "female" | "other"
  activityLevel: ActivityLevel
  goal: FitnessGoal
  restrictions: DietaryRestriction[]
}

export type ContextData = {
  timeOfDay: "morning" | "midday" | "afternoon" | "evening" | "night"
  hour: number
  location?: string
  weather?: {
    temperatureC: number
    condition: string
  }
}

export type FoodEntry = {
  id: string
  loggedAt: number // epoch ms
  source: "text" | "image"
  inputText?: string
  imageDataUrl?: string
  analysis: FoodAnalysis
}

export type FoodAnalysis = {
  name: string
  estimatedPortion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  healthScore: number // 1-10
  category: string
  warnings: string[]
  alternatives: string[]
  fitsRestrictions: boolean
  notes: string
}

export type DailyInsights = {
  summary: string
  strengths: string[]
  concerns: string[]
  alerts: { severity: "info" | "warning" | "critical"; message: string }[]
  behavioralSuggestions: string[]
  recommendedMeals: {
    name: string
    type: "breakfast" | "lunch" | "dinner" | "snack"
    description: string
    estimatedCalories: number
    reason: string
  }[]
  targets: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}
