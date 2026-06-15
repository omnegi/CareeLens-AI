import React from "react";
import { Analysis, Interview } from "../types";
import { BarChart2, Star, CheckCircle, Upload, Brain, FileText, Mic, Settings, Play, ArrowRight, Info } from "lucide-react";

interface DashboardViewProps {
  analyses: Analysis[];
  interviews: Interview[];
  onNavigate: (view: string) => void;
  onSelectAnalysis: (analysis: Analysis) => void;
  onSelectInterview: (interview: Interview) => void;
}

export default function DashboardView({
  analyses,
  interviews,
  onNavigate,
  onSelectAnalysis,
  onSelectInterview,
}: DashboardViewProps) {
  // Compute metrics from actual database states
  const totalAnalyses = analyses.length;
  
  const avgScore = totalAnalyses > 0 
    ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / totalAnalyses)
    : 0;

  const completedInterviews = interviews.filter(i => i.status === "completed");
  const avgInterviewScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + i.score, 0) / completedInterviews.length)
    : 0;

  // Determine readiness level
  let readiness = "Needs Prep";
  let readinessPercentage = 25;
  if (avgScore >= 85 || avgInterviewScore >= 80) {
    readiness = "Elite (Tier 1)";
    readinessPercentage = 95;
  } else if (avgScore >= 70 || avgInterviewScore >= 65) {
    readiness = "High (Tier 2)";
    readinessPercentage = 75;
  } else if (totalAnalyses > 0 || interviews.length > 0) {
    readiness = "Moderate";
    readinessPercentage = 50;
  }

  // Combine actions into a unified history chronological ledger
  const recentActivities = [
    ...analyses.map(a => ({
      id: a.id,
      type: "analysis" as const,
      title: `${a.roleName} @ ${a.companyName || "Target Company"}`,
      subtitle: `Resume analyzed ${new Date(a.createdAt).toLocaleDateString()}`,
      score: `${a.atsScore} Match`,
      scoreLabel: a.atsScore >= 85 ? "Superior" : a.atsScore >= 70 ? "Excellent" : "Needs Tuning",
      raw: a,
      createdAt: new Date(a.createdAt).getTime()
    })),
    ...interviews.map(i => ({
      id: i.id,
      type: "interview" as const,
      title: `Prep: ${i.roleName}`,
      subtitle: `Mock prep ${new Date(i.createdAt).toLocaleDateString()} (${i.status})`,
      score: i.status === "completed" ? `${i.score}% Score` : "Incomplete",
      scoreLabel: i.score >= 80 ? "Superior" : i.score >= 60 ? "Proficient" : "Needs Review",
      raw: i,
      createdAt: new Date(i.createdAt).getTime()
    }))
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-tab">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back! Your career trajectory is optimal. {" "}
            <span className="text-indigo-600 font-semibold">+12% growth</span> this quarter.
          </p>
        </div>
        <button 
          id="btn-new-analysis-hero"
          onClick={() => onNavigate("resume-lab")}
          className="flex items-center gap-sm px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-indigo-600/10 transition-all cursor-pointer transform active:scale-95"
        >
          <Upload className="w-5 h-5" />
          New Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Analyses */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group shadow-sm">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-center text-indigo-600">
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">Real-time</span>
          </div>
          <div>
            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Analyses</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-slate-900">{totalAnalyses}</span>
              <span className="text-[11px] text-slate-400 font-bold">+12% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group shadow-sm">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-center text-emerald-600">
            <Star className="w-6 h-6" />
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">Target: 80+</span>
          </div>
          <div>
            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average ATS Match</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-emerald-650 text-emerald-600">{avgScore}%</span>
              <span className="text-[11px] text-slate-400">Top 8% candidate</span>
            </div>
          </div>
        </div>

        {/* Card 3: Interview Readiness */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group shadow-sm">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-center text-indigo-600">
            <CheckCircle className="w-6 h-6" />
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">Active</span>
          </div>
          <div>
            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Interview Readiness</h3>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">{readiness}</span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${readinessPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Start (Left 8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-lg font-bold text-slate-900">Quick Start</h2>
              <span className="text-indigo-600 text-xs font-semibold">Select a workspace action</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Action Card 1 */}
              <div 
                onClick={() => onNavigate("resume-lab")}
                className="group cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-indigo-600 transition-all hover:bg-white relative overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-slate-900 mb-2 font-bold text-base">Resume Optimization</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    AI-powered AST report, missing keyword identification, and job description alignment gap scanner.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform text-xs">
                  Run Analyzer <Play className="w-3.5 h-3.5 ml-1 fill-current" />
                </div>
              </div>

              {/* Action Card 2 */}
              <div 
                onClick={() => onNavigate("mock-prep")}
                className="group cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-emerald-600 transition-all hover:bg-white relative overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-slate-900 mb-2 font-bold text-base">Mock Interview AI</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    Real-time conversation simulator generated dynamically based on your targets, with confidence and pace logs.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform text-xs">
                  Start Session <Play className="w-3.5 h-3.5 ml-1 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity lists */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline text-lg font-bold text-slate-900">Recent History Logs</h2>
              <button 
                onClick={() => onNavigate("history")} 
                className="text-indigo-600 font-semibold text-xs hover:underline cursor-pointer"
              >
                View Repository &rarr;
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center gap-3">
                <FileText className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-medium">No analysis history recorded yet.</p>
                <button 
                  onClick={() => onNavigate("resume-lab")}
                  className="text-xs text-indigo-600 underline"
                >
                  Upload your first resume to get started
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div 
                    key={act.id}
                    onClick={() => act.type === "analysis" ? onSelectAnalysis(act.raw as Analysis) : onSelectInterview(act.raw as Interview)}
                    className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-white transition-all rounded-lg group cursor-pointer border border-slate-100 hover:border-slate-200 shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      act.type === "analysis" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {act.type === "analysis" ? <FileText className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-sm">{act.title}</h4>
                      <p className="text-slate-400 text-xs">{act.subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0 mr-4">
                      <div className={`text-sm font-bold ${
                        act.type === "analysis" ? "text-indigo-600" : "text-emerald-600"
                      }`}>{act.score}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{act.scoreLabel}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill metrics circular SVG */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="font-headline text-base font-bold text-slate-900">Skill Metrics</h2>
              <Info className="w-4 h-4 text-slate-450 text-slate-400" />
            </div>

            <div className="relative w-44 h-44 mb-6 mt-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circles */}
                <circle cx="50" cy="50" fill="none" r="42" stroke="#f1f5f9" strokeWidth="8"></circle>
                <circle cx="50" cy="50" fill="none" r="32" stroke="#f1f5f9" strokeWidth="8"></circle>
                <circle cx="50" cy="50" fill="none" r="22" stroke="#f1f5f9" strokeWidth="8"></circle>
                {/* Progress rings */}
                {/* Technical: 85% score */}
                <circle cx="50" cy="50" fill="none" r="42" stroke="#4f46e5" strokeDasharray="263.8" strokeDashoffset={263.8 * (1 - (analyses.length > 0 ? (analyses.reduce((sum, a) => sum + a.matchRateTechnical, 0)/analyses.length)/100 : 0.85))} strokeLinecap="round" strokeWidth="8"></circle>
                {/* Experience: 70% */}
                <circle cx="50" cy="50" fill="none" r="32" stroke="#10b981" strokeDasharray="201" strokeDashoffset={201 * (1 - (analyses.length > 0 ? (analyses.reduce((sum, a) => sum + a.matchRateExperience, 0)/analyses.length)/100 : 0.70))} strokeLinecap="round" strokeWidth="8"></circle>
                {/* Education: 75% */}
                <circle cx="50" cy="50" fill="none" r="22" stroke="#f59e0b" strokeDasharray="138.2" strokeDashoffset={138.2 * (1 - (analyses.length > 0 ? (analyses.reduce((sum, a) => sum + a.matchRateEducation, 0)/analyses.length)/100 : 0.75))} strokeLinecap="round" strokeWidth="8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-900">{avgScore > 0 ? avgScore : 75}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Avg Match</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-3 pt-4 border-t border-slate-150 border-slate-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="text-slate-500">Technical Keywords</span>
                </div>
                <span className="text-slate-800 font-bold text-xs">
                  {analyses.length > 0 ? `${Math.round(analyses.reduce((sum, a) => sum + a.matchRateTechnical, 0) / analyses.length)}%` : "85%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-500">Experience Alignment</span>
                </div>
                <span className="text-slate-800 font-bold text-xs">
                  {analyses.length > 0 ? `${Math.round(analyses.reduce((sum, a) => sum + a.matchRateExperience, 0) / analyses.length)}%` : "70%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-slate-500">Education & Certs</span>
                </div>
                <span className="text-slate-800 font-bold text-xs">
                  {analyses.length > 0 ? `${Math.round(analyses.reduce((sum, a) => sum + a.matchRateEducation, 0) / analyses.length)}%` : "75%"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tip module */}
          <div className="bg-indigo-50/40 border border-l-4 border-l-indigo-600 border-indigo-100/60 p-5 rounded-r-xl rounded-l-md flex flex-col justify-between shadow-sm">
            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Live Pro Tip</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              "Candidates who perform multiple AI scan iterations and edit their experience bullet points to match target skills increase callback rates by up to 2.5x."
            </p>
            <button 
              onClick={() => onNavigate("resume-lab")} 
              className="text-xs text-indigo-600 hover:underline font-bold text-left self-start cursor-pointer"
            >
              Analyze Resume Now &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
