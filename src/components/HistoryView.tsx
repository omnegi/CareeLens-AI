import React, { useState } from "react";
import { Analysis, Interview } from "../types";
import { 
  History, 
  Trash2, 
  BarChart2, 
  ChevronRight, 
  Sliders, 
  FileText, 
  Mic, 
  Search, 
  AlertTriangle,
  ExternalLink,
  MessageSquare
} from "lucide-react";

interface HistoryViewProps {
  analyses: Analysis[];
  interviews: Interview[];
  onDeleteAnalysis: (id: string) => void;
  onDeleteInterview: (id: string) => void;
  onSelectAnalysis: (analysis: Analysis) => void;
  onSelectInterview: (interview: Interview) => void;
}

export default function HistoryView({
  analyses,
  interviews,
  onDeleteAnalysis,
  onDeleteInterview,
  onSelectAnalysis,
  onSelectInterview,
}: HistoryViewProps) {
  const [activeTab, setActiveTab] = useState<"analyses" | "interviews">("analyses");
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<number>(0);

  // Filters logic
  const filteredAnalyses = analyses.filter(a => {
    const matchText = (a.roleName + " " + (a.companyName || "")).toLowerCase();
    const matchesSearch = matchText.includes(searchTerm.toLowerCase());
    const matchesScore = a.atsScore >= scoreFilter;
    return matchesSearch && matchesScore;
  });

  const filteredInterviews = interviews.filter(i => {
    const matchText = i.roleName.toLowerCase();
    const matchesSearch = matchText.includes(searchTerm.toLowerCase());
    // Use overall score
    const matchesScore = i.score >= scoreFilter;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="history-repository-tab">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-headline text-3xl text-slate-900 font-bold">Historical Repository</h1>
        <p className="text-slate-500 text-sm mt-1">
          A persistent database log of your past premium scans, keyword matches, and deep interview mock prep transcripts.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button 
            onClick={() => setActiveTab("analyses")}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "analyses" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <FileText className="w-4 h-4" /> ATS Scans ({analyses.length})
          </button>
          <button 
            onClick={() => setActiveTab("interviews")}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "interviews" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Mic className="w-4 h-4" /> Mock Drills ({interviews.length})
          </button>
        </div>

        {/* Sub filter details */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              id="history-search-input"
              type="text"
              placeholder="Search targeting..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-60 bg-white border border-slate-250 border-slate-205 border-slate-200 focus:border-indigo-600 text-xs text-slate-900 pl-9 pr-4 py-2.5 rounded-lg outline-none transition-colors shadow-sm"
            />
          </div>

          {/* Slider trigger */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs text-slate-700 shadow-sm">
            <Sliders className="w-4 h-4 text-slate-450 text-slate-450 text-slate-400" />
            <span className="text-slate-500 text-[10px] uppercase font-bold">Min Score:</span>
            <input 
              id="history-score-slider"
              type="range"
              min="0"
              max="90"
              step="10"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(Number(e.target.value))}
              className="w-16 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-indigo-600 font-extrabold min-w-8 text-center">{scoreFilter}%</span>
          </div>
        </div>
      </div>

      {/* Main List workspace */}
      {activeTab === "analyses" ? (
        filteredAnalyses.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 border border-slate-150 border-slate-200 rounded-xl space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-905 text-slate-900 text-sm">No scans found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                No archived Resume ATS analyses match your search key or threshold targets.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAnalyses.map((a) => (
              <div 
                key={a.id}
                className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between group relative hover:border-indigo-600/75 transition-all cursor-pointer shadow-sm shadow-slate-100/40"
                onClick={() => onSelectAnalysis(a)}
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="min-w-0 flex-grow">
                      <h4 className="font-headline text-slate-900 font-bold group-hover:text-indigo-600 transition-colors truncate text-base">{a.roleName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-bold">{a.companyName || "Target Company"}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className={`text-2xl font-extrabold ${
                          a.atsScore >= 80 ? "text-emerald-600" : a.atsScore >= 60 ? "text-amber-600" : "text-rose-600"
                        }`}>{a.atsScore}%</div>
                        <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Match</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs mb-5 border-t border-slate-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Keywords Overlap:</span>
                      <span className="text-slate-850 text-slate-800 font-bold">{a.matchedKeywords?.length || 0} overlapping</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Filename:</span>
                      <span className="text-slate-850 text-slate-850 text-slate-800 font-mono truncate max-w-[150px] font-bold">{a.resumeFilename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Archived date:</span>
                      <span className="text-slate-400 text-[10px] font-bold">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-xs text-indigo-650 text-indigo-600 flex items-center gap-1.5 font-bold hover:underline">
                    Inspect Report <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <button 
                    id={`btn-delete-${a.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to permanently delete this scan archive?")) {
                        onDeleteAnalysis(a.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded hover:bg-rose-50"
                    title="Delete permanently from Firestore"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredInterviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 border border-slate-150 border-slate-200 rounded-xl space-y-4">
            <Mic className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">No drill sessions found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                No archived mock conversational runs found matching your search key or score targets.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInterviews.map((i) => (
              <div 
                key={i.id}
                className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between group relative hover:border-indigo-600/75 transition-all cursor-pointer shadow-sm shadow-slate-100/40"
                onClick={() => onSelectInterview(i)}
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="min-w-0 flex-grow">
                      <h4 className="font-headline text-slate-900 font-bold group-hover:text-indigo-600 transition-colors truncate text-base">{i.roleName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-bold">{i.status === "completed" ? "Successfully Complete" : "Aborted"}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-indigo-600">{i.score}%</div>
                        <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400">rating</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs mb-5 border-t border-slate-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Confidence Estimate:</span>
                      <span className="text-slate-850 text-slate-800 font-bold">{i.confidenceLevel}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Turns Recorded:</span>
                      <span className="text-slate-850 text-slate-800 font-bold">{i.chatHistory?.length || 0} turns</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Archived date:</span>
                      <span className="text-slate-400 text-[10px] font-bold">{new Date(i.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-xs text-indigo-600 flex items-center gap-1.5 font-bold hover:underline">
                    View Transcripts &rarr;
                  </span>
                  <button 
                    id={`btn-delete-drill-${i.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to permanently delete this interview session report?")) {
                        onDeleteInterview(i.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded hover:bg-rose-50"
                    title="Delete permanently from Firestore"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
