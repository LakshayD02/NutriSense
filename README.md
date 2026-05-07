# NutriSense 🥗

**NutriSense** is a high-performance, AI-powered smart nutrition assistant that provides real-time, context-aware meal tracking and personalized coaching. Leveraging **Groq's ultra-fast Llama 3.1 models**, it allows users to log meals using natural language or images, instantly calculating macros, offering healthier alternatives, and scoring choices based on personal fitness goals and dietary restrictions.

## 🌟 Key Features

- **Ultra-Fast AI Analysis**: Powered by Groq Cloud, meal analysis and coaching insights are delivered in milliseconds, providing a lag-free experience.
- **Multi-Modal Food Logging**: Describe what you ate using natural text or simply upload a photo. The AI automatically identifies the food, estimates portion sizes, and extracts full nutritional data.
- **Dynamic Macro Tracking**: Visualizes your daily calorie, protein, carbohydrate, and fat intake using interactive Recharts.
- **Context-Aware Coaching**: Analyzes your food choices not just in a vacuum, but in the context of the current time of day, your local weather, and your specific dietary profile.
- **Health Scoring & Alerts**: Gives every logged meal a 1-10 health score and alerts you if an ingredient violates your personal dietary profile or flags excessive sugar/sodium.
- **Local Data Persistence**: Operates entirely in your browser using local storage, ensuring your private health data remains on your device.
- **Premium UI/UX**: A sophisticated, glassmorphism-inspired interface with responsive design for mobile and desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Primary AI Provider**: [Groq Cloud](https://groq.com/)
- **Model Used**: `llama-3.1-8b-instant`
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
   Create a `.env.local` file in the root directory and add your Groq API key:
   ```env
   # Primary Provider: Groq Cloud
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Structure

- `app/actions.ts`: Contains the secure server actions that interface with the Vercel AI SDK and Groq models.
- `components/nutrition-app.tsx`: The main dashboard controller handling layout, global state, and responsive design.
- `components/food-logger.tsx`: The interface for text and image-based food logging.
- `components/daily-insights.tsx`: Renders the AI-generated summaries, charts, and behavioral suggestions.
- `components/profile-setup.tsx`: The onboarding and settings interface for user biometric data.
- `lib/storage.ts`: Utility functions for managing browser local storage persistence.
