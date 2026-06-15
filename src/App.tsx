import React, { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  auth
} from "./firebase";
import { 
  fetchUserAnalyses, 
  fetchUserInterviews, 
  saveAnalysis, 
  saveInterviewSession, 
  deleteAnalysisDoc, 
  deleteInterviewSession
} from "./firebaseUtils";
import { Analysis, Interview } from "./types";
import DashboardView from "./components/DashboardView";
import ResumeLabView from "./components/ResumeLabView";
import MockPrepView from "./components/MockPrepView";
import HistoryView from "./components/HistoryView";
import LandingPage from "./components/LandingPage";

import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Mic, 
  History, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Info,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Sync class on body/html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Database lists
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Selected item detail drawers (passed into views if selected)
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Guest simulation state (used if google auth is blocked or guest login selected)
  const [isGuest, setIsGuest] = useState(false);

  // Define unique mock userId for Guest session to allow persistent local state
  const guestUserId = "guest_user_ats_pro";

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
      } else {
        // If guest was active, keep it. Otherwise empty.
        if (!isGuest) {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  // Synchronize database documents
  useEffect(() => {
    if (!user) {
      setAnalyses([]);
      setInterviews([]);
      return;
    }

    const loadData = async () => {
      setLoadingDb(true);
      try {
        if (isGuest) {
          // Load from LocalStorage for guest sandbox experience
          const cachedAnalyses = localStorage.getItem(`analyses_${guestUserId}`);
          const cachedInterviews = localStorage.getItem(`interviews_${guestUserId}`);
          setAnalyses(cachedAnalyses ? JSON.parse(cachedAnalyses) : []);
          setInterviews(cachedInterviews ? JSON.parse(cachedInterviews) : []);
        } else {
          // Fetch from authentic Firestore database
          const ans = await fetchUserAnalyses(user.uid);
          const ints = await fetchUserInterviews(user.uid);
          setAnalyses(ans);
          setInterviews(ints);
        }
      } catch (err) {
        console.error("Database sync failed, falling back to local fallback stores", err);
      } finally {
        setLoadingDb(false);
      }
    };

    loadData();
  }, [user, isGuest]);

  // Authenticate Actions
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setIsGuest(false);
    } catch (err: any) {
      console.warn("Google Signin blocked or failed. Activating instant Guest Simulator sandbox.", err);
      // Fallback bypass
      handleGuestLogin();
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setUser({
      uid: guestUserId,
      displayName: "Executive Guest",
      email: "guest@careerlens.ai",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
    });
  };

  const handleLogout = async () => {
    try {
      if (!isGuest) {
        await signOut(auth);
      }
      setUser(null);
      setIsGuest(false);
      resetActiveSelection();
    } catch (err) {
      console.error(err);
    }
  };

  // State Mutation triggers
  const handleSaveAnalysis = async (newAnalysis: Analysis) => {
    const updated = [newAnalysis, ...analyses];
    setAnalyses(updated);
    
    if (isGuest) {
      localStorage.setItem(`analyses_${guestUserId}`, JSON.stringify(updated));
    } else {
      await saveAnalysis(user.uid, newAnalysis);
    }
  };

  const handleSaveInterview = async (newInterview: Interview) => {
    const updated = [newInterview, ...interviews];
    setInterviews(updated);

    if (isGuest) {
      localStorage.setItem(`interviews_${guestUserId}`, JSON.stringify(updated));
    } else {
      await saveInterviewSession(user.uid, newInterview);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    const updated = analyses.filter(a => a.id !== id);
    setAnalyses(updated);

    if (isGuest) {
      localStorage.setItem(`analyses_${guestUserId}`, JSON.stringify(updated));
    } else {
      await deleteAnalysisDoc(id);
    }
  };

  const handleDeleteInterview = async (id: string) => {
    const updated = interviews.filter(i => i.id !== id);
    setInterviews(updated);

    if (isGuest) {
      localStorage.setItem(`interviews_${guestUserId}`, JSON.stringify(updated));
    } else {
      await deleteInterviewSession(id);
    }
  };

  // Drill down selections
  const handleSelectAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setActiveTab("resume-lab");
  };

  const handleSelectInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setActiveTab("mock-prep");
  };

  const resetActiveSelection = () => {
    setSelectedAnalysis(null);
    setSelectedInterview(null);
  };

  // Nav routing controller
  const navigateTo = (view: string) => {
    setActiveTab(view);
    resetActiveSelection();
  };

  // Render Login state
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 font-sans">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-indigo-600 tracking-widest uppercase">Initializing Executive Suite...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        onGoogleLogin={handleGoogleLogin}
        onGuestLogin={handleGuestLogin}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  // Active dashboard session layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans" id="app-workspace">
      {/* Sidebar Rail */}
      <aside className="w-full md:w-64 bg-slate-900/95 text-white border-b md:border border-slate-800/80 flex flex-col justify-between flex-shrink-0 relative z-20 md:my-4 md:ml-4 md:h-[calc(100vh-2rem)] md:rounded-2xl shadow-2xl shadow-indigo-950/20 md:backdrop-blur-xl overflow-hidden transition-all duration-300">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-36 h-36 bg-gradient-to-br from-indigo-500/15 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-800/40 flex items-center justify-between gap-md relative z-10 bg-slate-950/25">
            {/* Clickable Logo leading back to landing page */}
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              title="Return to Landing Page"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-indigo-500/35 bg-slate-950 p-1.5 transition-all group-hover:border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <img src="/src/assets/logo.svg" alt="CareerLens AI Logo" className="w-full h-full object-contain transition-transform group-hover:rotate-6" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white tracking-wide group-hover:text-indigo-100 transition-colors">
                  CAREER<span className="text-indigo-400">LENS</span>
                </h2>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold block mt-0.5 bg-gradient-to-r from-slate-400 to-indigo-300 bg-clip-text text-transparent">ATS PRO v2.4</span>
              </div>
            </button>
            {/* Elegant Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/40 transition-all cursor-pointer active:scale-95 shadow-sm"
              title={darkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2 pt-6 flex flex-col relative z-10">
            {/* Nav 1: Dashboard */}
            <button 
              id="nav-link-dashboard"
              onClick={() => navigateTo("dashboard")}
              className={`group relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "dashboard" 
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-semibold border-t border-white/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
              }`}
            >
              {activeTab === "dashboard" && (
                <span className="absolute left-2 w-1.5 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-transform"></span>
              )}
              <LayoutDashboard className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === "dashboard" ? "text-indigo-100" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span>Dashboard</span>
            </button>

            {/* Nav 2: ATS Scanner */}
            <button 
              id="nav-link-resumelab"
              onClick={() => navigateTo("resume-lab")}
              className={`group relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "resume-lab" 
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-semibold border-t border-white/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
              }`}
            >
              {activeTab === "resume-lab" && (
                <span className="absolute left-2 w-1.5 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-transform"></span>
              )}
              <FileText className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === "resume-lab" ? "text-indigo-100" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span>Resume ATS Lab</span>
            </button>

            {/* Nav 3: Mock simulator */}
            <button 
              id="nav-link-mockprep"
              onClick={() => navigateTo("mock-prep")}
              className={`group relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "mock-prep" 
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-semibold border-t border-white/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
              }`}
            >
              {activeTab === "mock-prep" && (
                <span className="absolute left-2 w-1.5 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-transform"></span>
              )}
              <Mic className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === "mock-prep" ? "text-indigo-100" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span>Mock Prep Engine</span>
            </button>

            {/* Nav 4: History log */}
            <button 
              id="nav-link-history"
              onClick={() => navigateTo("history")}
              className={`group relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "history" 
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-semibold border-t border-white/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
              }`}
            >
              {activeTab === "history" && (
                <span className="absolute left-2 w-1.5 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-transform"></span>
              )}
              <History className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === "history" ? "text-indigo-100" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span>History Archives</span>
            </button>
          </nav>
        </div>

        {/* User Card Profile & Logout */}
        <div className="p-5 bg-slate-950/75 border-t border-slate-800/40 relative z-10 md:rounded-b-2xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"} 
                alt="user avatar" 
                className="w-8 h-8 rounded-full bg-indigo-500/15 object-cover border border-slate-700 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user.displayName || "John Stevens"}</div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-0.5">
                  {isGuest ? "Guest Sandbox" : "Pro Account"}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {isGuest && (
            <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg text-[10px] text-slate-400 flex gap-2 items-center">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>Mock sandbox environments active.</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main viewport */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView 
              analyses={analyses}
              interviews={interviews}
              onNavigate={navigateTo}
              onSelectAnalysis={handleSelectAnalysis}
              onSelectInterview={handleSelectInterview}
            />
          )}

          {activeTab === "resume-lab" && (
            <ResumeLabView 
              onSaveAnalysis={handleSaveAnalysis}
              selectedAnalysis={selectedAnalysis}
              onClearSelected={resetActiveSelection}
              userId={user.uid}
            />
          )}

          {activeTab === "mock-prep" && (
            <MockPrepView 
              onSaveInterview={handleSaveInterview}
              selectedInterview={selectedInterview}
              onClearSelected={resetActiveSelection}
              userId={user.uid}
              analyses={analyses}
            />
          )}

          {activeTab === "history" && (
            <HistoryView 
              analyses={analyses}
              interviews={interviews}
              onDeleteAnalysis={handleDeleteAnalysis}
              onDeleteInterview={handleDeleteInterview}
              onSelectAnalysis={handleSelectAnalysis}
              onSelectInterview={handleSelectInterview}
            />
          )}
        </div>
      </main>
    </div>
  );
}
