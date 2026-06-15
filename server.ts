import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import * as pdf from "pdf-parse";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// -----------------------------------------------------------------
// 1. PDF Parsing Helper
// -----------------------------------------------------------------
async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  let PDFParseClass: any = (pdf as any).PDFParse;
  if (!PDFParseClass && (pdf as any).default && typeof (pdf as any).default.PDFParse !== "undefined") {
    PDFParseClass = (pdf as any).default.PDFParse;
  }
  if (!PDFParseClass && typeof pdf === "function") {
    PDFParseClass = pdf;
  } else if (!PDFParseClass && pdf && typeof (pdf as any).default === "function") {
    PDFParseClass = (pdf as any).default;
  }

  if (!PDFParseClass) {
    throw new Error("Could not resolve PDF parser class/constructor from pdf-parse library");
  }

  if (PDFParseClass.prototype && typeof PDFParseClass.prototype.getText === "function") {
    const parser = new PDFParseClass({ data: buffer });
    const result = await parser.getText();
    return result.text || "";
  } else if (typeof PDFParseClass === "function") {
    const result = await PDFParseClass(buffer);
    return result.text || "";
  } else {
    throw new TypeError(`Resolved PDF parser is not a class or function: ${typeof PDFParseClass}`);
  }
}

// -----------------------------------------------------------------
// 2. Gemini GenAI lazy client initialization & Fallback Engine
// -----------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getGoogleGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

/**
 * Executes a Gemini model call with built-in retries (exponential backoff)
 * and automatic fallback to gemini-3.1-flash-lite to bypass temporary 503 high demand spikes.
 */
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  }
): Promise<any> {
  const maxRetries = 2;
  const initialDelayMs = 1200;
  let currentModel = params.model;

  for (let attempt = 1; ; attempt++) {
    try {
      console.log(`[Gemini Pipeline] Querying ${currentModel} (Attempt ${attempt})...`);
      const response = await ai.models.generateContent({
        ...params,
        model: currentModel
      });
      return response;
    } catch (error: any) {
      const errorMsg = (error?.message || "").toLowerCase();
      
      const isTransientError = 
        errorMsg.includes("503") || 
        errorMsg.includes("unavailable") || 
        errorMsg.includes("429") || 
        errorMsg.includes("resource_exhausted") || 
        errorMsg.includes("high demand") || 
        errorMsg.includes("busy") ||
        errorMsg.includes("temporary");

      console.warn(`[Gemini Pipeline] Error from ${currentModel} (Attempt ${attempt}): ${error.message || error}`);

      if (isTransientError && attempt <= maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.info(`[Gemini Pipeline] Retrying transient error in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If gemini-3.5-flash fails after retries, switch to high-availability gemini-3.1-flash-lite
      if (currentModel === "gemini-3.5-flash") {
        console.warn(`[Gemini Pipeline] Transitioning pipeline to high-availability fallback model: gemini-3.1-flash-lite`);
        currentModel = "gemini-3.1-flash-lite";
        attempt = 0; // reset attempts for the fallback model
        await new Promise((resolve) => setTimeout(resolve, 500)); // brief pause
        continue;
      }

      throw error;
    }
  }
}

// -----------------------------------------------------------------
// 3. Mount Express application gateway to handle API and serve SPA
// -----------------------------------------------------------------
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set standard JSON boundaries
  app.use(express.json({ limit: "50mb" }));

  // --- GATEWAY API: Health ---
  app.get("/api/health", async (req, res) => {
    try {
      const isGeminiConfigured = !!process.env.GEMINI_API_KEY;
      res.json({
        status: "ok",
        gateway: "express-node",
        geminiConfigured: isGeminiConfigured,
        pythonBackend: {
          status: "migrated",
          backend: "native-node-genai"
        }
      });
    } catch (err: any) {
      res.status(500).json({
        status: "error",
        error: err.message
      });
    }
  });

  // --- GATEWAY API: Parse + Analyze Resume ---
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      const { resumeBase64, resumeFilename, resumeRawText, jobDescription, roleName, companyName } = req.body;

      let resumeParsedText = resumeRawText || "";

      // Decode PDF on the server where pdf-parse package is guaranteed
      if (resumeBase64) {
        try {
          const buffer = Buffer.from(resumeBase64, "base64");
          resumeParsedText = await parsePdfBuffer(buffer);
        } catch (pdfError: any) {
          console.error("[Node Gateway] Resume PDF parsing failed:", pdfError);
          if (!resumeParsedText) {
            return res.status(400).json({ error: `Failed to extract structured text from resume PDF: ${pdfError.message}` });
          }
        }
      }

      if (!resumeParsedText || resumeParsedText.trim().length === 0) {
        return res.status(400).json({ error: "Resume contents appear blank or unreadable." });
      }

      const ai = getGoogleGenAI();

      const systemInstruction = 
        "You are an elite, world-class ATS (Applicant Tracking System) parser and senior recruiter. " +
        "Your objective is to provide a highly rigorous, honest, and exact alignment analysis comparing the candidate's resume with the job description.\n\n" +
        "EVALUATION CRITERIA:\n" +
        "1. Technical Skill Density: Match of engineering stack, programming languages, databases, or role-specific methodologies.\n" +
        "2. Experience Fit: Check for alignment in level, tenure, scoped project responsibilities, and team scale.\n" +
        "3. Education & Credentials: Match of degree requirements, specialized certifications, and continuous education.\n" +
        "4. Layout & Structural Compatibility: Scan for multi-column layouts, tables, text-in-images, decorative symbols, and non-standard sections that trip up real-world ATS software.\n\n" +
        "SCORING POLICIES:\n" +
        "- Do not elevate scores out of politeness. Give authentic, direct, actionable metrics.\n" +
        "- The overall 'atsScore' must be calculated using a weighted combination: 45% Technical Skill Match, 35% Experience Fit, and 20% Education Compatibility.\n" +
        "- If key skills from the Job Description are completely missing, reduce Technical Match proportionally.\n" +
        "You must respond in strict JSON format matching the requested schema.";

      const promptMsg = 
        `ROLE/JOB TITLE: ${roleName || 'Unspecified Role'} at ${companyName || 'Unspecified Company'}\n\n` +
        `JOB DESCRIPTION SPECIFICATION:\n${jobDescription}\n\n` +
        `CANDIDATE RESUME RAW CONTENT:\n${resumeParsedText}\n\n` +
        "INSTRUCTIONS FOR GAPS & RECOMMENDATIONS (gapsAndRecommendations):\n" +
        "Compile a comprehensive, beautifully structured review in GitHub Flavored Markdown. Avoid generic advice. Include:\n" +
        "1. ## ATS SCORE BREAKDOWN: Explain the math behind the tech, experience, and education sub-scores.\n" +
        "2. ## GAP ANALYSIS: Provide a granular comparison of missing methodologies, frameworks, or tools.\n" +
        "3. ## CRITICAL FORMATTING WARNINGS: Flag any multi-column layout, custom tables, non-standard text layouts, or other elements that hurt parsability.\n" +
        "4. ## ACTIONABLE BULLET IMPROVEMENTS: Suggest exactly how the user can rewrite 2-3 bullet points from their existing resume to match the STAR framework and utilize missing keywords.";

      const response = await generateContentWithRetryAndFallback(ai, {
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.INTEGER, description: "Rigorous overall suitability score out of 100 based on weighted metrics" },
              matchRateTechnical: { type: Type.INTEGER, description: "Actual technical skills match rate (0 to 100)" },
              matchRateExperience: { type: Type.INTEGER, description: "Experience alignment fit rate (0 to 100)" },
              matchRateEducation: { type: Type.INTEGER, description: "Education and credentials match rate (0 to 100)" },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Granular list of key tech/soft skills found in both resume and JD"
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "High-priority target keywords/skills from the job description missing or underrepresented on the resume"
              },
              gapsAndRecommendations: {
                type: Type.STRING,
                description: "Comprehensive, highly formatted markdown text detailing score breakdown, logical gaps, formatting issues, and customized STAR bullet rewrites"
              }
            },
            required: [
              "atsScore", "matchRateTechnical", "matchRateExperience", "matchRateEducation",
              "matchedKeywords", "missingKeywords", "gapsAndRecommendations"
            ]
          }
        }
      });

      const parsedJson = JSON.parse(response.text || "{}");

      res.json({
        success: true,
        resumeText: resumeParsedText.substring(0, 10000),
        analysis: {
          ...parsedJson,
          resumeFilename: resumeFilename || "resume_upload.pdf",
          roleName: roleName || "Software Developer",
          companyName: companyName || "Target Company"
        }
      });

    } catch (err: any) {
      console.error("[Node Gateway] Error in resume analysis:", err);
      res.status(500).json({ error: err.message || "An exception occurred during pipeline resume analysis." });
    }
  });

  // --- GATEWAY API: Enhance Resume ---
  app.post("/api/enhance-resume", async (req, res) => {
    try {
      const { resumeText, jobDescription, roleName, missingKeywords, enhancementFocus } = req.body;

      if (!resumeText) {
        return res.status(400).json({ error: "Original resume content is required." });
      }

      const ai = getGoogleGenAI();

      const systemInstruction = 
        "You are an elite senior resume optimization writer and executive coach.\n" +
        "Your task is to take the original resume text and generate an optimized variant tailored perfectly for the job description, seamlessly weaving the missing keywords while elevating the impact of accomplishments.\n\n" +
        "STRICT COMPLIANCE RULES:\n" +
        "1. Resume Layout: Output must be in crisp, clean, professional standard Markdown with clear margins, clean headings, and bullet points. Avoid cluttered formatting.\n" +
        "2. Keyword Weaving: Integrate the provided missing keywords NATURALLY into relevant sections (skills pool, professional experience, projects) ONLY if they logically fit. Do NOT construct fictitious histories. Match the exact context of the keyword.\n" +
        "3. STAR Method Refinement: Transform passive description lines under past roles into powerful action-oriented results (STAR formula) including placeholders like '[quantify: metric/outcome % or $]' where actual numbers are unknown to guide the user to fill them in.\n" +
        "Ensure your response is in strict JSON format matching the requested schema.";

      const promptMsg = 
        `TARGET ROLE: ${roleName || 'Desired Position'}\n` +
        `JOB SUMMARY:\n${jobDescription || 'Not Provided'}\n\n` +
        `MISSING TARGET KEYWORDS:\n${JSON.stringify(missingKeywords || [])}\n\n` +
        `CURRENT RESUME TEXT:\n${resumeText}\n\n` +
        `ENHANCEMENT FOCUS: ${enhancementFocus || 'all'}\n\n` +
        "Please rewrite the resume text with strategic keyword placement, outstanding typography layout, and output detailed professional recommendations.";

      const response = await generateContentWithRetryAndFallback(ai, {
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              enhancedText: {
                type: Type.STRING,
                description: "Highly formatted markdown of the optimized resume following professional layout guidelines"
              },
              gapsAddressed: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific keywords or gaps successfully integrated into the resume"
              },
              explanation: {
                type: Type.STRING,
                description: "Detailed explanation of visual layout, keyword placement reasoning, and instructions for how to fill metric placeholders"
              }
            },
            required: ["enhancedText", "gapsAddressed", "explanation"]
          }
        }
      });

      const parsedJson = JSON.parse(response.text || "{}");

      res.json({
        success: true,
        enhancedText: parsedJson.enhancedText || "",
        gapsAddressed: parsedJson.gapsAddressed || [],
        explanation: parsedJson.explanation || ""
      });

    } catch (err: any) {
      console.error("[Node Gateway] Error in resume enhancement:", err);
      res.status(500).json({ error: err.message || "An exception occurred during pipeline resume enhancement." });
    }
  });

  // --- GATEWAY API: Prep Interview - Get next question ---
  app.post("/api/mock-prep/next-question", async (req, res) => {
    try {
      const { roleName, jobDescription, resumeText, chatHistory } = req.body;

      const ai = getGoogleGenAI();

      const systemInstruction = 
        `You are an elite, highly rigorous executive interviewer conducting a professional mock interview for a ${roleName || 'Senior candidate'}.\n\n` +
        "INTERVIEW GUIDELINES:\n" +
        "1. Dynamic Difficulty: Inspect the candidate's Resume and target Job Description. Formulate deep questions calibrated strictly to their experience level (e.g. Staff/Principal vs Entry level).\n" +
        "2. Question Typology: Alternate between high-impact behavioral scenarios, deep architectural questions (for engineering roles), or situational leadership crises (for managerial roles).\n" +
        "3. STAR Method Priming: Design questions that implicitly prompt candidates to reply with structured STAR context.\n" +
        "4. Strict Prompt Persona: Speak with professional, firm, yet encouraging interviewer authority. Never include preambles, meta-commentary, greetings, or descriptions outside of your speaking role. State ONLY the question directly.";

      // Format conversation history
      let historyText = "";
      if (chatHistory && Array.isArray(chatHistory)) {
        historyText = chatHistory.map((msg: any) => `${msg.sender === "ai" ? "Interviewer" : "Candidate"}: ${msg.text}`).join("\n");
      }

      const contextPrompt = 
        `TARGET JOB SPECIFICATION:\n${jobDescription || 'Unspecified'}\n\n` +
        `CANDIDATE EXPERIENTIAL RESUME:\n${resumeText || 'No resume available'}\n\n` +
        `INTERVIEW CONVERSATION HISTORY:\n${historyText}\n\n` +
        "Formulate and output your next single interview question directly. Output absolutely nothing else.";

      const response = await generateContentWithRetryAndFallback(ai, {
        model: "gemini-3.5-flash",
        contents: contextPrompt,
        config: {
          systemInstruction
        }
      });

      res.json({
        question: (response.text || "").trim()
      });

    } catch (err: any) {
      console.error("[Node Gateway] Error in next question:", err);
      res.status(500).json({ error: err.message || "An exception occurred during mock preparation next question analysis." });
    }
  });

  // --- GATEWAY API: Prep Interview - Analyze answer ---
  app.post("/api/mock-prep/analyze-answer", async (req, res) => {
    try {
      const { lastQuestion, userAnswer, jobDescription, roleName } = req.body;

      if (!userAnswer) {
        return res.status(400).json({ error: "User answer is required" });
      }

      const ai = getGoogleGenAI();

      const systemInstruction = 
        "You are an elite AI Interview Coach evaluating a candidate's answer to an interview question.\n\n" +
        "EVALUATION CRITERIA:\n" +
        "1. STAR Alignment: Check if the response clearly covers Situation, Task, Action, and Result.\n" +
        "2. Keyword Match Relevance: Detect technical or soft competencies matching the role requirements.\n" +
        "3. Confidence & Tone: Assess assertiveness and clarity.\n" +
        "4. Verbal Fillers & Pace: Flag filler terminology ('um', 'ah', 'like', 'basically', 'you know', 'actually') and gauge pace density.\n" +
        "Always respond in JSON format conforming to the requested schema.";

      const promptMsg = 
        `ROLE SPECIFICATION: ${roleName || 'Unspecified'}\n` +
        `TARGET JOB REQUIREMENTS:\n${jobDescription || 'Unspecified'}\n\n` +
        `QUESTION POSED:\n${lastQuestion}\n\n` +
        `CANDIDATE RESPONSE TO EVALUATE:\n${userAnswer}\n\n` +
        "Perform a thorough analysis. In 'analysisTip', compile a beautifully structured evaluation in GitHub Flavored Markdown, including:\n" +
        "1. ## STAR ADHERENCE SCORECARD: Break down Situation, Task, Action, and Result coverage.\n" +
        "2. ## KEYWORD & TECHNIQUE REVIEW: Highlight vocabulary strengths or gaps.\n" +
        "3. ## VERBAL CLARITY & FILLER ALERT: Assess speaking pace and highlight any filler words used.\n" +
        "4. ## CHOSEN BETTER PATHWAY: Provide an fully re-written exemplar answer illustrating exactly how the candidate should have formulated their response for maximum impact.";

      const response = await generateContentWithRetryAndFallback(ai, {
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidenceLevel: { type: Type.INTEGER, description: "Candidate confidence estimation from 0 to 100" },
              keywordsIdentified: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific core industry vocabulary, tools, or behavioral competencies identified in their answer"
              },
              ratingScore: { type: Type.INTEGER, description: "Overall rigorous performance rating out of 100" },
              paceAssessment: { type: Type.STRING, description: "Crisp evaluation of verbal delivery pace (e.g. Too Fast, Too Slow, Ideal/Engaging)" },
              analysisTip: { type: Type.STRING, description: "Comprehensive markdown critique of STAR structure, filler analytics, and rewritten response exemplar" }
            },
            required: ["confidenceLevel", "keywordsIdentified", "ratingScore", "paceAssessment", "analysisTip"]
          }
        }
      });

      const parsedJson = JSON.parse(response.text || "{}");
      res.json(parsedJson);

    } catch (err: any) {
      console.error("[Node Gateway] Error in analyze-answer:", err);
      res.status(500).json({ error: err.message || "An exception occurred during pipeline answer critique." });
    }
  });

  // -----------------------------------------------------------------
  // 4. Serve Vite built dynamic SPA
  // -----------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Node Server] Serving natively on http://0.0.0.0:${PORT}`);
  });
}

startServer();
