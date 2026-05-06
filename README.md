# NutriSense 🥗

**NutriSense** is an AI-powered smart nutrition assistant that provides real-time, context-aware meal tracking and personalized coaching. Powered by Google's Gemini models, it allows users to log meals using natural language or images, instantly calculating macros, offering healthier alternatives, and scoring choices based on personal fitness goals and dietary restrictions.

## 🌟 Key Features

- **Multi-Modal Food Logging**: Describe what you ate using natural text or simply upload a photo. The AI automatically identifies the food, estimates portion sizes, and extracts full nutritional data.
- **Dynamic Macro Tracking**: Visualizes your daily calorie, protein, carbohydrate, and fat intake using interactive Recharts.
- **Context-Aware Coaching**: Analyzes your food choices not just in a vacuum, but in the context of the current time of day, your local weather, and your specific dietary restrictions (e.g., Keto, Vegan).
- **Intelligent Fallback Architecture**: Uses OpenRouter API as the primary AI provider with an automatic fallback to the direct Google Gemini API, ensuring 100% uptime even during rate-limits or high-demand periods.
- **Health Scoring & Alerts**: Gives every logged meal a 1-10 health score and alerts you if an ingredient violates your personal dietary profile or flags excessive sugar/sodium.
- **Local Data Persistence**: Operates entirely in your browser using local storage, ensuring your private health data remains on your device.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Models Used**: Google `gemini-2.5-flash` (via OpenRouter & Google AI Studio)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18 or higher) installed on your machine.

### Installation

1. **Clone the repository** (or download the source code)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   # Primary Provider: OpenRouter (Optional but recommended)
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Fallback Provider: Google AI Studio
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Structure

- `app/actions.ts`: Contains the secure server actions that interface with the Vercel AI SDK and Gemini models.
- `components/nutrition-app.tsx`: The main dashboard controller handling layout, global state, and responsive design.
- `components/food-logger.tsx`: The interface for text and image-based food logging.
- `components/daily-insights.tsx`: Renders the AI-generated summaries, charts, and behavioral suggestions.
- `lib/storage.ts`: Utility functions for managing browser local storage persistence.
