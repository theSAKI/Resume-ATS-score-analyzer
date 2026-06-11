import express from "express";
import path from "path";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Configure Multer for PDF file uploads (in-memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf";
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper function to extract text safely from PDF buffer
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    if (textResult && textResult.text) {
      return textResult.text.trim();
    }
    throw new Error("Empty text returned from PDF parser");
  } catch (error: any) {
    console.error("Primary PDF parsing failed, trying string recovery:", error);
    // Graceful string recovery fallback
    let recoveredText = "";
    for (let i = 0; i < buffer.length; i++) {
      const code = buffer[i];
      if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
        recoveredText += String.fromCharCode(code);
      }
    }
    if (recoveredText && recoveredText.length > 50) {
      return recoveredText;
    }
    throw new Error(`Failed to parse PDF resume: ${error.message || error}`);
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// AI analysis API route
app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Missing uploaded resume. Please upload a PDF resume file." });
      return;
    }

    const { jobDescription = "" } = req.body;

    // 1. Extract plain text from PDF
    console.log("Analyzing uploaded file:", req.file.originalname, `(${req.file.size} bytes)`);
    const resumeText = await extractTextFromPdf(req.file.buffer);

    if (!resumeText || resumeText.length < 100) {
      res.status(400).json({
        error: "Resume text is too brief or empty. Please ensure the PDF is not scanned or contains selectable text."
      });
      return;
    }

    // 2. Build prompt for Gemini
    console.log("Preparing prompt for Gemini model: gemini-3.5-flash");
    const jobDescriptionPrompt = jobDescription
      ? `Compare the Resume with this target Job Description:\n=== JOB DESCRIPTION ===\n${jobDescription}\n===`
      : "No job description provided. Analyze the resume general fit, formatting, impact, and standard industry preparedness.";

    const systemPrompt = `You are an elite, highly experienced Senior Technical Recruiter and Certified Professional Resume Writer (CPRW).
Assess the provided Resume plain-text for parsing health, structure, vocabulary strength, impact, and relevancy. 
Analyze the metrics meticulously and return structured data meeting the provided schema.

If a Job Description is provided, calculate the match percentage, identify matched and missing keywords/skills, and provide targeted optimizations.
If NO job description is provided, calculate matchScore as 0, but provide thorough ATS suggestions and core strengths.

Provide detailed Before and After bullet point improvements in the 'improvementSuggestions' array, specifically showing how to convert weak, passive bullet points on the resume (e.g. 'Responsible for writing code') into highly professional, action-driven, metric-focused statements (e.g. 'Engineered high-throughput cloud API handlers, reducing database response latency by 42% through structured batching'). This satisfies the user's specific request for professional resume bullet points. Ensure they are tailored to the candidate's industry if found.`;

    const promptText = `
${systemPrompt}

=== RESUME PLAIN TEXT ===
${resumeText}
========================

${jobDescriptionPrompt}

Analyze the candidate and return the diagnostic JSON. Provide excellent feedback.
`;

    // 3. Query Gemini
    if (!apiKey) {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured in secrets. Please set it in Settings -> Secrets." });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER, description: "ATS readability and standard score (0-100)" },
            matchScore: { type: Type.INTEGER, description: "Match percentage alignment with job description (0-100) or 0 if job description is empty" },
            summary: { type: Type.STRING, description: "Expert recruiter assessment of candidate's key strengths and placement readiness in 2-3 sentences" },
            candidateInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Full Name of candidate if detected, else 'Unknown'" },
                email: { type: Type.STRING, description: "Email address, else 'Unknown'" },
                phone: { type: Type.STRING, description: "Contact number, else 'Unknown'" },
                location: { type: Type.STRING, description: "City/State/Country/Remote, else 'Unknown'" },
                currentTitle: { type: Type.STRING, description: "Most recent job title or professional headline, else 'N/A'" }
              },
              required: ["name", "email", "phone", "location", "currentTitle"]
            },
            sectionScores: {
              type: Type.OBJECT,
              properties: {
                experience: { type: Type.INTEGER, description: "Experience relevance, action verbs, and impact score (0-100)" },
                skills: { type: Type.INTEGER, description: "Skill variety and keyword coverage score (0-100)" },
                education: { type: Type.INTEGER, description: "Education detail completeness (0-100)" },
                formatting: { type: Type.INTEGER, description: "Layout simplicity, contact info inclusion (0-100)" }
              },
              required: ["experience", "skills", "education", "formatting"]
            },
            keySkillsExtracted: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of technical & soft skills extracted from the resume"
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key skills/phrases present in job description but ABSENT/weak in the resume"
            },
            matchedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key skills/phrases matching between job description and resume"
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 prominent strengths in experience, leadership, or execution"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 gaps or formatting flaws that hurt the resume"
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING, description: "e.g., 'Work Experience', 'Professional Summary', 'Skills Section'" },
                  before: { type: Type.STRING, description: "Weak/generic bullet or block currently on resume" },
                  after: { type: Type.STRING, description: "Polished bullet point with explicit metric placeholders, action verbs, and impact" },
                  explanation: { type: Type.STRING, description: "Short rationale for the replacement" }
                },
                required: ["section", "before", "after", "explanation"]
              },
              description: "5 tailored before-and-after action-oriented resume bullet points to dramatically boost ATS and recruiter validation"
            },
            atsBreakdown: { type: Type.STRING, description: "Explanatory paragraphs highlighting exact parsing success, layout advice, and key actions" }
          },
          required: [
            "atsScore",
            "matchScore",
            "summary",
            "candidateInfo",
            "sectionScores",
            "keySkillsExtracted",
            "missingKeywords",
            "matchedKeywords",
            "strengths",
            "weaknesses",
            "improvementSuggestions",
            "atsBreakdown"
          ]
        }
      }
    });

    console.log("Successfully retrieved response from Gemini!");
    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Empty text response from Gemini");
    }

    try {
      const parsedData = JSON.parse(textResponse.trim());
      res.json(parsedData);
    } catch (parseError) {
      console.error("JSON parse failure on model text output. Output is:", textResponse);
      res.status(502).json({
        error: "Failed to parse the analyzer report payload. Please try again.",
        raw: textResponse
      });
    }

  } catch (error: any) {
    console.error("Error in analyze-resume endpoint:", error);
    res.status(500).json({ error: error.message || "Internal server error during resume assessment" });
  }
});

// Configure Vite or Static Assets handling
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring dev mode fallback through Vite Dev Server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring production static file serving from '/dist'...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Resume Analyzer Server booting at http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Server boot error:", err);
});
