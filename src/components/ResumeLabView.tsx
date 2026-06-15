import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { Analysis } from "../types";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Briefcase, 
  ArrowLeft, 
  RefreshCw,
  Sparkles,
  Info,
  Download,
  Clipboard,
  Check,
  Edit2,
  BookOpen,
  CheckCircle2,
  Sliders,
  FileDown,
  Eye,
  Printer
} from "lucide-react";

interface ResumeLabViewProps {
  onSaveAnalysis: (analysis: Analysis) => void;
  selectedAnalysis: Analysis | null;
  onClearSelected: () => void;
  userId: string;
}

export default function ResumeLabView({
  onSaveAnalysis,
  selectedAnalysis,
  onClearSelected,
  userId
}: ResumeLabViewProps) {
  // Input form state
  const [roleName, setRoleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFilename, setResumeFilename] = useState("");

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");

  // Result state
  const [localAnalysis, setLocalAnalysis] = useState<Analysis | null>(null);

  // Resume active enhancements state
  const [editedResumeText, setEditedResumeText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementFocus, setEnhancementFocus] = useState<"all" | "keywords" | "structure">("all");
  const [gapsAddressed, setGapsAddressed] = useState<string[]>([]);
  const [enhancementExplanation, setEnhancementExplanation] = useState("");
  const [copied, setCopied] = useState(false);
  const [reScanning, setReScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAnalysis = selectedAnalysis || localAnalysis;

  // Sync edited resume text when active analysis changes
  useEffect(() => {
    if (activeAnalysis) {
      setEditedResumeText(activeAnalysis.resumeText || "");
      setGapsAddressed([]);
      setEnhancementExplanation("");
    }
  }, [activeAnalysis?.id]);

  // Handle auto weave enhancement
  const handleAutoEnhance = async () => {
    if (!activeAnalysis) return;
    setIsEnhancing(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/enhance-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: editedResumeText,
          jobDescription: activeAnalysis.jobDescription,
          roleName: activeAnalysis.roleName,
          missingKeywords: activeAnalysis.missingKeywords,
          provider: provider,
          enhancementFocus
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to auto-enhance resume");
      }

      setEditedResumeText(data.enhancedText);
      setGapsAddressed(data.gapsAddressed || []);
      setEnhancementExplanation(data.explanation || "");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during resume auto-enhancement.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Run a real-time re-scan on edited draft
  const handleReScanDraft = async () => {
    if (!activeAnalysis) return;
    setReScanning(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeRawText: editedResumeText,
          jobDescription: activeAnalysis.jobDescription,
          roleName: activeAnalysis.roleName,
          companyName: activeAnalysis.companyName,
          provider
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred during re-scanning.");
      }

      const readyAnalysis: Analysis = {
        ...activeAnalysis,
        resumeText: editedResumeText,
        atsScore: data.analysis.atsScore,
        matchRateTechnical: data.analysis.matchRateTechnical,
        matchRateExperience: data.analysis.matchRateExperience,
        matchRateEducation: data.analysis.matchRateEducation,
        matchedKeywords: data.analysis.matchedKeywords || [],
        missingKeywords: data.analysis.missingKeywords || [],
        gapsAndRecommendations: data.analysis.gapsAndRecommendations || "Analysis complete.",
      };

      // Trigger standard save
      await onSaveAnalysis(readyAnalysis);
      setLocalAnalysis(readyAnalysis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to re-scan draft.");
    } finally {
      setReScanning(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editedResumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download raw txt file
  const handleDownloadTxt = () => {
    if (!activeAnalysis) return;
    const element = document.createElement("a");
    const file = new Blob([editedResumeText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeAnalysis.roleName.replace(/\s+/g, "_")}_Optimized_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Process Markdown to simple clean HTML
  const renderMarkdownToHtml = (markdownText: string): string => {
    if (!markdownText) return "";
    let html = markdownText;

    // Escaping simple HTML tags to prevent XSS
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 15px; margin-bottom: 5px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 17px; font-weight: 600; color: #4f46e5; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 4px; text-transform: uppercase;">$1</h1>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Unordered list items starting with - or *
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        const listElement = `<li style="font-size: 13.5px; color: #334155; margin-bottom: 4px;">${content}</li>`;
        if (!inList) {
          inList = true;
          return '<ul style="margin-top: 0; margin-bottom: 12px; padding-left: 20px; list-style-type: disc;">' + listElement;
        }
        return listElement;
      } else {
        if (inList) {
          inList = false;
          return '</ul>' + (trimmed ? `<p style="margin-top: 0; margin-bottom: 8px; font-size: 13.5px; color: #334155; line-height: 1.5;">${trimmed}</p>` : '');
        }
        return trimmed ? `<p style="margin-top: 0; margin-bottom: 8px; font-size: 13.5px; color: #334155; line-height: 1.5;">${trimmed}</p>` : '';
      }
    });

    if (inList) {
      processedLines.push('</ul>');
    }

    return processedLines.join('\n');
  };

  // Download high fidelity printable HTML file
  const handleDownloadHtml = () => {
    if (!activeAnalysis) return;
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${activeAnalysis.roleName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 50px 60px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border-radius: 8px;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: -0.02em;
        }
        h2 {
            font-size: 16px;
            font-weight: 600;
            color: #4f46e5;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 4px;
            margin-top: 25px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        h3 {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
            margin-top: 12px;
            margin-bottom: 4px;
        }
        p {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 13.5px;
            color: #334155;
            line-height: 1.5;
        }
        ul {
            margin-top: 0;
            margin-bottom: 12px;
            padding-left: 20px;
        }
        li {
            font-size: 13.5px;
            color: #334155;
            margin-bottom: 4px;
        }
        @media print {
            body {
                background-color: #ffffff;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="no-print" style="max-width: 800px; margin: 0 auto 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div>
            <p style="margin: 0; font-weight: 600; font-size: 13px; color: #0f172a;">PDF Print Optimization Console</p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">Press <strong>Ctrl + P</strong> (or <strong>Cmd + P</strong>) on your keyboard to instantly print or Save as PDF!</p>
        </div>
        <button onclick="window.print()" style="background-color: #4f46e5; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.2s;">Print / Save as PDF</button>
    </div>
    <div class="container">
        ${renderMarkdownToHtml(editedResumeText)}
    </div>
</body>
</html>
    `;
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeAnalysis.roleName.replace(/\s+/g, "_")}_Optimized_Printable.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      setErrorMsg("Supported formats: PDF or plain text TXT only.");
      return;
    }
    setErrorMsg("");
    setResumeFile(file);
    setResumeFilename(file.name);
  };

  const loadExampleJD = () => {
    setRoleName("Senior Fullstack Engineer");
    setCompanyName("Initech Corp");
    setJobDescription(
      "We are looking for a Senior Fullstack Engineer proficient in React, Node.js, and TypeScript to architect high-performance dashboards, configure cloud storage triggers, and implement Firestore / SQL security rules. Ideal candidate possesses experience leading agile software design, resolving memory leaks, and building modular RESTful backend services."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!jobDescription || jobDescription.trim().length < 20) {
      setErrorMsg("Please enter a comprehensive job description for accurate targeting.");
      return;
    }

    if (!resumeFile && !resumeText.trim()) {
      setErrorMsg("Please upload a resume (PDF/TXT) or paste your resume content below.");
      return;
    }

    setLoading(true);

    try {
      let base64String = "";
      if (resumeFile) {
        // Convert file to Base64
        base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(resumeFile);
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]); // extract standard base64 from dataurl
          };
          reader.onerror = (error) => reject(error);
        });
      }

      // Call express API route
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeBase64: base64String,
          resumeFilename: resumeFilename || "pasted_resume.txt",
          resumeRawText: resumeText,
          jobDescription,
          roleName,
          companyName,
          provider
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred during resume parsing.");
      }

      const generatedId = "ana_" + Math.random().toString(36).substring(2, 11);
      const readyAnalysis: Analysis = {
        id: generatedId,
        userId: userId,
        roleName: roleName || "Senior Engineer",
        companyName: companyName || "Target Company",
        jobDescription,
        resumeText: data.resumeText || resumeText,
        resumeFilename: resumeFilename || "Pasted Content",
        atsScore: data.analysis.atsScore,
        matchRateTechnical: data.analysis.matchRateTechnical,
        matchRateExperience: data.analysis.matchRateExperience,
        matchRateEducation: data.analysis.matchRateEducation,
        matchedKeywords: data.analysis.matchedKeywords || [],
        missingKeywords: data.analysis.missingKeywords || [],
        gapsAndRecommendations: data.analysis.gapsAndRecommendations || "Analysis complete.",
        createdAt: new Date().toISOString()
      };

      // Persistence trigger
      await onSaveAnalysis(readyAnalysis);
      setLocalAnalysis(readyAnalysis);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to make full-stack AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    onClearSelected();
    setLocalAnalysis(null);
    setRoleName("");
    setCompanyName("");
    setJobDescription("");
    setResumeText("");
    setResumeFile(null);
    setResumeFilename("");
    setErrorMsg("");
  };

  // Render Result mode
  if (activeAnalysis) {
    // Score colors
    const getScoreColorClass = (score: number) => {
      if (score >= 80) return "text-emerald-500 stroke-emerald-500";
      if (score >= 60) return "text-amber-500 stroke-amber-500";
      return "text-rose-500 stroke-rose-500";
    };

    const getBarColorClass = (score: number) => {
      if (score >= 80) return "bg-emerald-500";
      if (score >= 60) return "bg-amber-500";
      return "bg-rose-500";
    };

    return (
      <div className="space-y-6 animate-fade-in" id="resume-lab-results">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-slate-200 pb-5">
          <div>
            <button 
              onClick={resetForm}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-2 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Analyzer
            </button>
            <h1 className="font-headline text-2xl text-slate-900 font-bold">
              ATS Scan Report: {activeAnalysis.roleName}
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> {activeAnalysis.companyName || "Target Company"} 
              <span className="text-slate-300">&bull;</span>
              <span className="font-mono text-xs text-slate-400">ID: {activeAnalysis.id}</span>
            </p>
          </div>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Scan Another
          </button>
        </div>

        {/* Scoring Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Circular match dial */}
          <div className="md:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-6">ATS Score Compatibility</h3>
            
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#f1f5f9" strokeWidth="8"></circle>
                <circle 
                  cx="50" cy="50" fill="none" r="42" 
                  className={getScoreColorClass(activeAnalysis.atsScore)}
                  strokeDasharray="263.8" 
                  strokeDashoffset={263.8 * (1 - activeAnalysis.atsScore / 100)} 
                  strokeLinecap="round" strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold ${
                  activeAnalysis.atsScore >= 80 ? "text-emerald-500" : activeAnalysis.atsScore >= 60 ? "text-amber-500" : "text-rose-500"
                }`}>{activeAnalysis.atsScore}</span>
                <span className="text-[11px] text-slate-400 mt-1 font-bold">out of 100</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {activeAnalysis.atsScore >= 80 ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> High Match Success
                </div>
              ) : activeAnalysis.atsScore >= 60 ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-705 text-amber-700 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Keyword Injection
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Critically Missing Alignment
                </div>
              )}
            </div>
          </div>

          {/* Individual Category rating bars */}
          <div className="md:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col justify-between">
            <h3 className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-6">Alignment breakdown</h3>
            
            <div className="space-y-4">
              {/* Technical skills */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold">Technical Competency Matching</span>
                  <span className="font-bold text-slate-900">{activeAnalysis.matchRateTechnical}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getBarColorClass(activeAnalysis.matchRateTechnical)}`} 
                    style={{ width: `${activeAnalysis.matchRateTechnical}%` }}
                  ></div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold">Professional Experience Alignment</span>
                  <span className="font-bold text-slate-900">{activeAnalysis.matchRateExperience}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getBarColorClass(activeAnalysis.matchRateExperience)}`} 
                    style={{ width: `${activeAnalysis.matchRateExperience}%` }}
                  ></div>
                </div>
              </div>

              {/* Education */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold">Academic & Credentials Fitment</span>
                  <span className="font-bold text-slate-900">{activeAnalysis.matchRateEducation}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getBarColorClass(activeAnalysis.matchRateEducation)}`} 
                    style={{ width: `${activeAnalysis.matchRateEducation}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2 items-center text-xs text-slate-500">
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Matching uses Gemini-based deep semantic vector lookup matching targets rather than plain strict text matching.</span>
            </div>
          </div>
        </div>

        {/* Keywords Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Keywords */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="text-emerald-600 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Overlapping / Found Skills ({activeAnalysis.matchedKeywords.length})
            </h3>
            {activeAnalysis.matchedKeywords.length === 0 ? (
              <p className="text-sm text-slate-400">No clear keywords overlaps detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeAnalysis.matchedKeywords.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-150 font-mono font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Keywords */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="text-amber-655 text-amber-600 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> High Priority Missing Keywords ({activeAnalysis.missingKeywords.length})
            </h3>
            {activeAnalysis.missingKeywords.length === 0 ? (
              <p className="text-sm text-emerald-600 font-bold">Brilliant! You have met all requirements.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeAnalysis.missingKeywords.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded bg-amber-50 text-amber-750 text-amber-700 text-xs border border-amber-150 font-mono font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Gap Analysis */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h2 className="font-headline text-lg text-slate-900 font-bold mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-indigo-600" /> AI Gap Scan & Improvement Playbook
          </h2>
          <div className="text-sm text-slate-800 leading-relaxed prose max-w-none">
            <Markdown>{activeAnalysis.gapsAndRecommendations}</Markdown>
          </div>
        </div>

        {/* --- NEW FUNCTIONALITY: INTERACTIVE RESUME CRAFTING STUDIO --- */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-6" id="resume-optimization-studio">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <h2 className="font-headline text-lg text-slate-900 font-bold uppercase tracking-wide">
                  Active Resume Crafting Studio
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Edit, AI-optimize alignment gaps, and output high-fidelity print-ready PDF resumes.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" /> Copy Text
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" /> Raw Txt
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* AI Optimizer Toolbar Controls */}
          <div className="bg-slate-50 border border-slate-200/65 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Personalize AI Focus
              </span>
              <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg max-w-sm">
                <button
                  type="button"
                  onClick={() => setEnhancementFocus("all")}
                  className={`flex-1 text-center py-1 px-3 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    enhancementFocus === "all" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All Focus
                </button>
                <button
                  type="button"
                  onClick={() => setEnhancementFocus("keywords")}
                  className={`flex-1 text-center py-1 px-3 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    enhancementFocus === "keywords" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Weave Keywords
                </button>
                <button
                  type="button"
                  onClick={() => setEnhancementFocus("structure")}
                  className={`flex-1 text-center py-1 px-3 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    enhancementFocus === "structure" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Structure Fixes
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end w-full md:w-auto">
              {/* Trigger AI Enhancement */}
              <button
                type="button"
                onClick={handleAutoEnhance}
                disabled={isEnhancing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Auto-Weaving Elements...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> 🪄 Auto-Weave Gaps
                  </>
                )}
              </button>

              {/* Instant Score Checking */}
              <button
                type="button"
                onClick={handleReScanDraft}
                disabled={reScanning || isEnhancing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {reScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scoring Draft...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> 🔄 Re-Scan Final Draft
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Explanation Feed if triggered */}
          {enhancementExplanation && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2 animate-fade-in">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Optimization Summary
              </span>
              <div className="text-xs text-slate-700 leading-relaxed prose max-w-none">
                <Markdown>{enhancementExplanation}</Markdown>
              </div>
              {gapsAddressed.length > 0 && (
                <div className="pt-2 border-t border-emerald-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Injected Gaps:</span>
                  {gapsAddressed.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-mono text-[10px] rounded">
                      +{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interactive Split View (Editor vs High Fidelity Live Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Box: Textarea Editor */}
            <div className="lg:col-span-6 flex flex-col space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-505 text-indigo-600" /> Interactive Markdown Draft
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {editedResumeText.length} characters
                </span>
              </div>
              <textarea
                value={editedResumeText}
                onChange={(e) => setEditedResumeText(e.target.value)}
                placeholder="Paste or write your resume in plain text/markdown here..."
                rows={22}
                className="w-full h-[550px] bg-slate-900 border border-slate-800 focus:border-indigo-600 outline-none text-slate-100 px-4 py-3 rounded-xl text-xs font-mono resize-none leading-relaxed shadow-inner"
              />
            </div>

            {/* Right Box: Absolute Realism Paper Preview */}
            <div className="lg:col-span-6 flex flex-col space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" /> Executive Paper Preview
                </span>
                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> High-Fidelity Render
                </span>
              </div>

              {/* The Paper Component Sheet */}
              <div 
                className="w-full h-[550px] bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs overflow-y-auto px-8 py-10 text-left transition-all"
                style={{ contentVisibility: "auto" }}
              >
                <div 
                  className="prose prose-sm font-sans text-slate-850 max-w-none" 
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(editedResumeText) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Input view mode
  return (
    <div className="space-y-6 animate-fade-in" id="resume-lab-input">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-headline text-3xl text-slate-900 font-bold">Resume ATS Lab</h1>
        <p className="text-slate-500 text-sm mt-1">
          Run your career profile through an elite recruitment analyzer. Obtain real-time skill gaps mapping and strategic improvements recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Target Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-550 text-slate-500 uppercase tracking-wider mb-2">
              Target Job Role Title
            </label>
            <input 
              id="input-role-title"
              type="text"
              placeholder="e.g. Senior Software Architect"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-600 text-slate-900 px-4 py-2.5 rounded-lg outline-none text-sm transition-colors shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Target Company Name
            </label>
            <input 
              id="input-company-name"
              type="text"
              placeholder="e.g. Acme Corporation"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-600 text-slate-900 px-4 py-2.5 rounded-lg outline-none text-sm transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Row 2: Target JD */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Job Description
            </label>
            <button 
              type="button"
              onClick={loadExampleJD}
              className="text-xs text-indigo-600 flex items-center gap-1 hover:underline cursor-pointer font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" /> Inject Spec Specimen
            </button>
          </div>
          <textarea 
            id="input-job-details"
            rows={5}
            placeholder="Paste target job listing requirements or scope details here (minimum 20 characters)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-600 text-slate-900 px-4 py-3 rounded-lg outline-none text-sm font-sans transition-colors resize-y leading-relaxed shadow-sm"
          ></textarea>
        </div>

        {/* Row 3: Resume Uploader Drag & Drop */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Candidate Resume
          </label>
          
          <div 
            id="resume-drag-uploader"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-4 transition-all h-48 shadow-sm ${
              dragActive ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 bg-white hover:bg-slate-50/50"
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              resumeFilename ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
            }`}>
              {resumeFilename ? <FileText className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              {resumeFilename ? (
                <>
                  <p className="text-slate-900 font-bold text-sm truncate max-w-md mx-auto">{resumeFilename}</p>
                  <p className="text-emerald-600 text-xs font-semibold">Ready to parse. Click or drag to replace.</p>
                </>
              ) : (
                <>
                  <p className="text-slate-800 font-bold text-sm">Drag and drop your resume file here</p>
                  <p className="text-slate-400 text-xs">Supports PDF or raw text (.txt format). Max size 10MB.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Optional text-based resume paste backup */}
        <div className="pt-2">
          <details className="group border border-slate-200 bg-white rounded-lg shadow-sm">
            <summary className="cursor-pointer p-4 text-xs font-bold text-slate-500 uppercase select-none group-open:border-b group-open:border-slate-200 hover:text-slate-800 transition-colors">
              Or copy & paste your raw resume text instead
            </summary>
            <div className="p-4 bg-slate-50/50">
              <textarea 
                rows={4}
                placeholder="Paste the raw text values of your resume profile here if you do not have a PDF document..."
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  if (e.target.value.trim() && !resumeFilename) {
                    setResumeFilename("Manual Paste Content");
                  }
                }}
                className="w-full bg-white border border-slate-200 focus:border-indigo-600 text-slate-900 px-4 py-3 rounded-lg outline-none text-sm font-mono transition-colors shadow-sm"
              ></textarea>
            </div>
          </details>
        </div>

        {/* Intelligence Engine Selector */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Intelligence Engine</h4>
              <p className="text-xs text-slate-400 mt-0.5">Select the artificial intelligence provider for the scan.</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  provider === "gemini"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setProvider("groq")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  provider === "groq"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Groq LLaMA-3.3
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100 rounded flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button 
            id="btn-trigger-analyzer"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-md hover:shadow-indigo-600/10 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Deep Alignment Mapping...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Start ATS Scan Match
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
