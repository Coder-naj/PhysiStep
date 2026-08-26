import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client with required header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

import { solvePhysicsFallback } from "./src/server/fallbackPhysicsSolver";

// Resilient AI generation with exponential backoff and fallback models
const CANDIDATE_MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.1-pro-preview"];

async function generateContentResilient(
  ai: GoogleGenAI,
  requestConfig: {
    contents: string;
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: any;
  }
) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const maxRetries = 1;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const config: any = {};
        if (requestConfig.systemInstruction) {
          config.systemInstruction = requestConfig.systemInstruction;
        }
        if (requestConfig.responseMimeType) {
          config.responseMimeType = requestConfig.responseMimeType;
        }
        if (requestConfig.responseSchema) {
          config.responseSchema = requestConfig.responseSchema;
        }

        const response = await ai.models.generateContent({
          model,
          contents: requestConfig.contents,
          config,
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("Overloaded") ||
          errMsg.includes("fetch failed");

        if (isTransient && attempt < maxRetries) {
          const delayMs = 300 + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        // Rapidly try next candidate model without holding up the request
        break;
      }
    }
  }

  throw lastError || new Error("AI service is currently experiencing high demand. Please try again in a moment.");
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// AI Physics Problem Solver Endpoint
app.post("/api/ai/solve-physics", async (req, res) => {
  try {
    const { problemText, gravityValue = 9.8, customPrompt, language = 'en' } = req.body;

    if (!problemText || typeof problemText !== "string") {
      return res.status(400).json({ error: "Please provide a valid physics problem description." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment. Please configure it in AI Studio settings.",
      });
    }

    const isBangla = language === 'bn' || /[\u0980-\u09FF]/.test(problemText);

    const systemInstruction = `You are an expert high school physics teacher and math step-by-step problem solver specializing in Motion (Kinematics), Force (Newton's Laws, Friction, Inclined Planes, Momentum), and Work, Power & Energy.
Your goal is to break down physics problems into clear, pedagogical, high school-friendly steps with crystal clear mathematical derivations, LaTeX formulas, explicit unit conversions, and physical intuition checks.

Use standard gravity g = ${gravityValue} m/s² unless specified otherwise in the problem.
${isBangla ? 'IMPORTANT: The user has requested output in Bengali (বাংলা). Write all textual explanations, step titles, problem summaries, quantity names (e.g., আদিবেগ, শেষবেগ, ত্বরণ, বল, সরণ, ভর, গতিশক্তি, বিভব শক্তি, ক্ষমতা), principles, sanity checks, interpretations, and pitfalls in fluent Bengali (বাংলা). Mathematical formulas and variable symbols should use standard LaTeX notation (e.g. $v = u + at$, $F = ma$). Standard SI unit symbols (m/s, N, J, W, kg) can remain in standard Latin/LaTeX.' : 'Output all explanations in clear English.'}

For every problem:
1. Summarize the physical scenario clearly.
2. Categorize the topic (Motion, Force, Work, Power, Energy, or Combined).
3. Identify all Given quantities with their original units, converted SI standard values, and symbols.
4. Identify Target Unknowns.
5. List the Fundamental Physics Laws & Principles used (e.g. Newton's Second Law, Conservation of Mechanical Energy, Kinematic Equation for constant acceleration).
6. Provide LaTeX formulas.
7. Give a step-by-step mathematical solution where every step has a clear title, LaTeX equation, algebraic isolation, numerical substitution with units, and result.
8. State the final answers clearly with units and significance.
9. Provide a physical "Sanity Check" (why does this answer make sense physically?).
10. Highlight "Common Pitfalls" high school students should watch out for.
11. Suggest simulation parameters (topic: "motion"|"force"|"energy"|"inclined_plane", and relevant numeric parameters) so the interactive canvas can display it.`;

    const result = await generateContentResilient(ai, {
      contents: `Solve this high school physics problem step-by-step:\n\n${problemText}${customPrompt ? `\n\nAdditional instruction: ${customPrompt}` : ""}`,
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemSummary: { type: Type.STRING, description: "Brief clear restatement of what is happening" },
          category: { type: Type.STRING, description: "One of: Motion, Force, Work, Power, Energy, Combined" },
          givens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                originalValue: { type: Type.STRING },
                siValue: { type: Type.STRING },
                unit: { type: Type.STRING },
                conversionNote: { type: Type.STRING },
              },
              required: ["symbol", "name", "siValue", "unit"],
            },
          },
          unknowns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                targetUnit: { type: Type.STRING },
              },
              required: ["symbol", "name", "targetUnit"],
            },
          },
          principlesUsed: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          keyFormulasLatex: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                formulaLatex: { type: Type.STRING },
                explanation: { type: Type.STRING },
                algebraicDerivation: { type: Type.STRING },
                substitutionLatex: { type: Type.STRING },
                calculatedResult: { type: Type.STRING },
              },
              required: ["stepNumber", "title", "formulaLatex", "explanation", "calculatedResult"],
            },
          },
          finalAnswers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                quantity: { type: Type.STRING },
                symbol: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                scientificNotation: { type: Type.STRING },
                interpretation: { type: Type.STRING },
              },
              required: ["quantity", "symbol", "value", "unit", "interpretation"],
            },
          },
          sanityCheck: { type: Type.STRING },
          commonPitfalls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          suggestedSimulator: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "motion | projectile | inclined_plane | force_fbd | energy_rollercoaster" },
              initialVelocity: { type: Type.NUMBER },
              acceleration: { type: Type.NUMBER },
              mass: { type: Type.NUMBER },
              appliedForce: { type: Type.NUMBER },
              angleDeg: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              distance: { type: Type.NUMBER },
              frictionCoeff: { type: Type.NUMBER },
            },
          },
        },
        required: ["problemSummary", "category", "givens", "unknowns", "principlesUsed", "keyFormulasLatex", "steps", "finalAnswers", "sanityCheck", "commonPitfalls"],
      },
    });

    const jsonText = result.text || "{}";
    const parsed = JSON.parse(jsonText);
    res.json({ success: true, data: parsed, modelUsed: result.modelUsed });
  } catch (error: any) {
    console.warn("AI models busy or failed, engaging deterministic physics solver fallback:", error?.message);
    try {
      const isBangla = req.body?.language === 'bn' || /[\u0980-\u09FF]/.test(req.body?.problemText || '');
      const fallbackSolution = solvePhysicsFallback(
        req.body?.problemText || '',
        req.body?.gravityValue || 9.8,
        isBangla ? 'bn' : 'en'
      );
      return res.json({
        success: true,
        data: fallbackSolution,
        modelUsed: "High-Precision Physics Math Engine (Deterministic Fallback)",
        isFallback: true,
      });
    } catch (fallbackErr: any) {
      console.error("Error solving physics problem:", error);
      const msg = error?.message || "Failed to generate solution";
      return res.status(500).json({ 
        error: msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")
          ? "The AI service is experiencing high demand right now. Please try again in a moment."
          : msg 
      });
    }
  }
});

// AI Follow-up Concept Q&A Tutor
app.post("/api/ai/ask-tutor", async (req, res) => {
  try {
    const { question, contextProblem, language = 'en' } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
      });
    }

    const isBangla = language === 'bn' || /[\u0980-\u09FF]/.test(question);

    const prompt = `You are an encouraging, patient high school physics teacher. A student is asking a question about a physics concept or solution.
${contextProblem ? `Current problem context: "${contextProblem}"` : ""}
Student's Question: "${question}"

Explain clearly with high school intuition, everyday analogies, relevant math formulas (formatted in LaTeX), and a quick check question to test their understanding. Keep it structured, clear, and engaging.${isBangla ? ' Respond in natural, fluent Bengali (বাংলা) while keeping mathematical formulas in LaTeX.' : ''}`;

    const result = await generateContentResilient(ai, {
      contents: prompt,
      systemInstruction: `You are an elite high school physics tutor. Format math formulas in clear LaTeX notation (e.g. $F = ma$).${isBangla ? ' Provide answers in Bengali (বাংলা).' : ''}`,
    });

    res.json({ success: true, answer: result.text, modelUsed: result.modelUsed });
  } catch (error: any) {
    console.warn("AI tutor model busy:", error?.message);
    const isBangla = req.body?.language === 'bn' || /[\u0980-\u09FF]/.test(req.body?.question || '');
    
    // Provide a helpful, structured physics tutor response even during upstream demand spikes
    const fallbackAnswer = isBangla
      ? `### 💡 পদার্থবিজ্ঞান ধারণা ও ব্যাখ্যা (Physics Concept Guide)

**প্রশ্ন:** "${req.body?.question}"

1. **মূল নীতি (Fundamental Principle):**
   পদার্থবিজ্ঞানের সমস্যা সমাধানে সর্বপ্রথম প্রদত্ত রাশিগুলো ($m, u, v, s, t, F, a$) এসআই (SI) এককে রূপান্তর করা আবশ্যক।

2. **প্রয়োজনীয় সূত্রাবলি (Key Formulas in LaTeX):**
   - একমাত্রিক গতি: $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$
   - নিউটনের গতির ২য় সূত্র: $F_{net} = ma$
   - ঘর্ষণ বল: $f_k = \\mu_k N = \\mu_k mg$ (সমতলে)
   - কাজ ও শক্তি: $W = Fd\\cos\\theta$, $E_k = \\frac{1}{2}mv^2$, $E_p = mgh$
   - ক্ষমতা: $P = \\frac{W}{t} = Fv$

3. **অনুশীলন টিপস:**
   - সর্বদা বস্তুর উপর ক্রিয়াশীল বলগুলোর একটি **মুক্ত বস্তু চিত্র (Free Body Diagram)** আঁকুন।
   - কোণ থাকলে বল বা বেগকে অনুভূমিক ($F\\cos\\theta$) ও উল্লম্ব ($F\\sin\\theta$) উপাংশে ভাগ করুন।`
      : `### 💡 High School Physics Tutor Insights

**Your Question:** "${req.body?.question}"

1. **Core Physics Strategy:**
   Always begin by listing your knowns with standardized SI units ($m, u, v, s, t, F, a$), identifying target unknowns, and choosing the appropriate conservation law or kinematic equation.

2. **Essential Formulas (LaTeX):**
   - **Constant Acceleration Motion:** $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$
   - **Dynamics & Newton's 2nd Law:** $\\Sigma F = ma$, Friction $f_k = \\mu_k N$
   - **Work & Mechanical Energy:** $W = Fd\\cos\\theta$, $E_k = \\frac{1}{2}mv^2$, $E_p = mgh$
   - **Power:** $P = \\frac{W}{t} = F v$

3. **Key Problem-Solving Check:**
   - Draw a Free Body Diagram (FBD) for all force components.
   - Separate horizontal motion (constant velocity) from vertical motion (accelerated by gravity $g = 9.8\\text{ m/s}^2$).`;

    res.json({ 
      success: true, 
      answer: fallbackAnswer, 
      modelUsed: "PhysiStep Tutor Knowledge Base",
      isFallback: true 
    });
  }
});

// Setup Vite middleware for full-stack dev / static files for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PhysiStep server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
