import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  Video, 
  LineChart, 
  Globe, 
  Share2, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Laptop, 
  Zap,
  Lock,
  ChevronRight,
  Cpu,
  GraduationCap,
  CheckCircle2,
  Activity,
  Sliders,
  RotateCcw,
  Mic,
  Volume2,
  Play,
  RotateCcw as RefreshCcw,
  Sparkles as SparkleIcon,
  Video as VideoIcon
} from "lucide-react";

// Interactive 3D HUD Dashboard Simulation - Craftsmanship over Defaults
interface AIDashboard3DSimulatorProps {
  darkMode?: boolean;
}

function AIDashboard3DSimulator({ darkMode = true }: AIDashboard3DSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"ats" | "biometric" | "trajectory">("ats");
  
  // 3D Tilt Coordinates
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const pctX = x / (box.width / 2);
    const pctY = y / (box.height / 2);
    setTilt({ x: pctX * 6, y: -pctY * 6 });
  };
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // ATS Optimization Simulation States
  const [atsScore, setAtsScore] = useState(72);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "optimized">("idle");
  const [scanStep, setScanStep] = useState("");
  const [missingSkills, setMissingSkills] = useState([
    { name: "Distributed Infrastructure Architecture", active: false, scoreDiff: "+8%" },
    { name: "SaaS DevSecOps Guardrails", active: false, scoreDiff: "+10%" },
    { name: "Conflict Negotiation Loop", active: false, scoreDiff: "+7%" },
  ]);

  const [simulationRole, setSimulationRole] = useState("Chief Technology Officer");

  const runAtsScan = () => {
    if (scanState === "scanning") return;
    setScanState("scanning");
    setAtsScore(72);
    
    // Step 1
    setScanStep("EXTRACTING PROFILE STRUCTURE...");
    setTimeout(() => {
      setScanStep("COMPARING WITH 420+ RECRUITER FILTERS...");
      setAtsScore(81);
    }, 1000);

    // Step 2
    setTimeout(() => {
      setScanStep("ALIGNING MISSING TERMINOLOGY MATRICES...");
      setAtsScore(89);
      setMissingSkills(prev => prev.map((s, idx) => idx === 0 ? { ...s, active: true } : s));
    }, 2200);

    // Step 3
    setTimeout(() => {
      setScanStep("SWEEPING SYNTAX & LAYOUT COMPLIANCE...");
      setAtsScore(97);
      setMissingSkills(prev => prev.map(s => ({ ...s, active: true })));
    }, 3400);

    // Final Done
    setTimeout(() => {
      setScanStep("ATS PROFILE RATED AS ELITE MATCH!");
      setScanState("optimized");
    }, 4200);
  };

  const resetAtsScan = () => {
    setScanState("idle");
    setAtsScore(72);
    setScanStep("");
    setMissingSkills([
      { name: "Distributed Infrastructure Architecture", active: false, scoreDiff: "+8%" },
      { name: "SaaS DevSecOps Guardrails", active: false, scoreDiff: "+10%" },
      { name: "Conflict Negotiation Loop", active: false, scoreDiff: "+7%" },
    ]);
  };

  // Biometric Voice States
  const [voiceVolume, setVoiceVolume] = useState([35, 45, 60, 30, 20, 80, 75, 40, 50, 65, 55, 30, 85, 90, 45, 25, 60, 40, 70, 50]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEvaluation, setVoiceEvaluation] = useState({
    resonance: "Calm & Executive",
    stability: "94% (Dominant Pattern)",
    speed: "135 Words / Minute"
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        setVoiceVolume(prev => prev.map(() => Math.floor(Math.random() * 85) + 10));
      }, 150);
    } else {
      setVoiceVolume([15, 20, 25, 15, 10, 20, 15, 25, 20, 30, 25, 10, 15, 25, 20, 15, 10, 20, 15, 10]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transformStyle: "preserve-3d"
      }}
      className={`mt-16 w-full max-w-5xl rounded-2xl border p-5 sm:p-8 relative z-20 transition-all duration-300 ease-out ${darkMode ? "bg-gradient-to-br from-[#0e1111] to-[#050606] border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)]" : "bg-white border-slate-200 shadow-xl"}`}
    >
      {/* 3D Glass Layer overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(137,206,255,0.06),transparent_60%)] pointer-events-none rounded-2xl" />

      {/* Simulator HUD Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b gap-4 transition-colors ${darkMode ? "border-white/5" : "border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full animate-ping ${darkMode ? "bg-sky-400" : "bg-indigo-600"}`} />
          <div>
            <h4 className={`text-sm font-mono tracking-widest font-bold uppercase ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>INTERACTIVE AI SUITE SANDBOX</h4>
            <p className={`text-xs font-sans ${darkMode ? "text-[#bdc8d2]" : "text-slate-500"}`}>Toggle utility tabs to evaluate CareerLens' telemetry algorithms live.</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className={`flex p-1 rounded-xl text-xs font-mono border transition-colors ${darkMode ? "bg-[#121415] border-white/5" : "bg-slate-100 border-slate-200"}`}>
          <button 
            onClick={() => setActiveTab("ats")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "ats" ? (darkMode ? "bg-[#1e2222] text-[#89ceff] font-bold shadow-inner" : "bg-white text-indigo-600 font-bold shadow-sm") : (darkMode ? "text-[#87929c] hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
          >
            ATS Scan HUD
          </button>
          <button 
            onClick={() => setActiveTab("biometric")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "biometric" ? (darkMode ? "bg-[#1e2222] text-[#89ceff] font-bold shadow-inner" : "bg-white text-indigo-600 font-bold shadow-sm") : (darkMode ? "text-[#87929c] hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
          >
            Interview Tone HUD
          </button>
          <button 
            onClick={() => setActiveTab("trajectory")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "trajectory" ? (darkMode ? "bg-[#1e2222] text-[#89ceff] font-bold shadow-inner" : "bg-white text-indigo-600 font-bold shadow-sm") : (darkMode ? "text-[#87929c] hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
          >
            Telemetry Network
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 min-h-[360px] items-stretch">
        
        {/* LEFT SIMULATOR CONTROL/FEEDBACK WORKSPACE */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "ats" && (
              <motion.div 
                key="ats-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Simulated Input Info */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-wider text-sky-450 uppercase font-bold">Target Position Context</span>
                    <span className="text-[10px] font-mono text-[#87929c] uppercase">VECTORED ROLE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={simulationRole}
                      onChange={(e) => {
                        setSimulationRole(e.target.value);
                        resetAtsScan();
                      }}
                      className="bg-[#0c0f0f] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none cursor-pointer"
                    >
                      <option value="Chief Technology Officer">Chief Technology Officer</option>
                      <option value="VP of Infrastructure Security">VP of Infrastructure Security</option>
                      <option value="Director of Engineering Management">Director of Engineering Management</option>
                    </select>
                    <div className="text-xs text-[#bdc8d2] font-semibold italic">99.8% Recruiter Alignment Vetted</div>
                  </div>
                </div>

                {/* Missing Skills Scanning Sweep */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-[#87929c]">
                    <span>Detected Keyword Map</span>
                    <span>Score Impact</span>
                  </div>

                  <div className="space-y-2">
                    {missingSkills.map((skill, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                          skill.active 
                            ? "bg-sky-500/[0.04] border-sky-400/20 text-[#89ceff]" 
                            : "bg-[#101212]/50 border-white/[0.03] text-[#87929c]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`w-4 h-4 ${skill.active ? "text-sky-400" : "text-[#1e2222]"}`} />
                          <span className="text-xs font-medium font-sans">{skill.name}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${skill.active ? "text-sky-400" : "text-[#bdc8d2]"}`}>
                          {skill.active ? "OPTIMIZED" : skill.scoreDiff}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action controls */}
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={runAtsScan}
                    disabled={scanState === "scanning"}
                    className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-bold h-11 rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {scanState === "scanning" ? (
                      <span>Executing Sweep...</span>
                    ) : scanState === "optimized" ? (
                      <span>Redo Performance Sweep</span>
                    ) : (
                      <span>Run Optimization Sweep</span>
                    )}
                  </button>

                  {(scanState === "scanning" || scanState === "optimized") && (
                    <button 
                      onClick={resetAtsScan}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-[#bdc8d2]"
                      title="Reset Sim"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "biometric" && (
              <motion.div 
                key="biometric-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Question Prompt */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-sky-400 uppercase font-bold">Simulated Interview AI Prompt</span>
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed font-sans">
                    "Describe a critical technical decision where you had to push back on executive team timelines to preserve platform security guardrails."
                  </p>
                </div>

                {/* Camera simulation screen */}
                <div className="relative h-44 rounded-xl overflow-hidden bg-[#0c0f0f] border border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10 bg-black/60 px-2 py-1 rounded text-[8px] font-mono tracking-wider font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    LIVE FEED : alex_sterling_exec.stream
                  </div>

                  <div className="space-y-2 z-10 p-4">
                    <VideoIcon className="w-8 h-8 text-sky-400 mx-auto opacity-75" />
                    <p className="text-[#bdc8d2] text-xs font-sans">Virtual Face Mesh & Gaze Vector Active</p>
                  </div>

                  {/* Mesh Scanlines overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#000000_90%)] opacity-80 pointer-events-none" />
                  <div className="absolute inset-x-0 h-0.5 bg-sky-400/10 shadow-[0_0_10px_rgba(137,206,255,0.3)] top-1/2 animate-[bounce_8s_infinite] pointer-events-none" />
                </div>

                {/* Speech controls */}
                <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => setIsSpeaking(!isSpeaking)}
                    className={`flex-grow h-11 rounded-xl text-xs font-mono uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                      isSpeaking ? "bg-red-500 text-white" : "bg-sky-500 text-black hover:bg-sky-400"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isSpeaking ? "Stop Recording / Process" : "Start Simulated Voice Answer"}</span>
                  </button>
                  <div className="text-xs text-[#87929c] font-sans">Use fake stream vectors</div>
                </div>
              </motion.div>
            )}

            {activeTab === "trajectory" && (
              <motion.div 
                key="trajectory-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Telemetry description */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-sky-450 uppercase font-bold">Vectored Trajectory Architecture</span>
                  <p className="text-xs text-[#bdc8d2] leading-relaxed">
                    CareerLens models executive growth pathways into a graph-theory database. Hover over node clusters on the right to dissect how your profile links to elite targets.
                  </p>
                </div>

                {/* Trajectory Details list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#111313] rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#87929c] block uppercase">Next Position Fit</span>
                    <span className="text-xs text-white font-semibold">Chief Information Architect</span>
                  </div>
                  <div className="p-3 bg-[#111313] rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#87929c] block uppercase">Vectored Gap Metric</span>
                    <span className="text-xs text-amber-400 font-semibold">Leadership Core Index (LCI)</span>
                  </div>
                  <div className="p-3 bg-[#111313] rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#87929c] block uppercase">Enterprise Scope</span>
                    <span className="text-xs text-white font-semibold">$50M+ ARR Companies</span>
                  </div>
                  <div className="p-3 bg-[#111313] rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#87929c] block uppercase">Network Credential Score</span>
                    <span className="text-xs text-sky-400 font-semibold">A+ Executive Standing</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sweep dynamic laser scanner subtitle */}
          <div className="text-[9px] font-mono text-[#87929c] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {scanState === "scanning" ? scanStep : activeTab === "ats" ? (scanState === "optimized" ? "ATS SCORED COMPLIANT" : "Awaiting scan trigger...") : activeTab === "biometric" ? (isSpeaking ? "BIOMETRIC SPEECH ACTIVE..." : "Mic muted - click record to test telemetry") : "Telemetry Network Ready"}
          </div>
        </div>

        {/* RIGHT HUD VISUALIZERS (CONCENTRIC RADAR RINGS & SPECTROGRAMS) */}
        <div className="lg:col-span-4 bg-[#090b0b] border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "ats" && (
              <motion.div 
                key="ats-hud"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-full space-y-6 py-4"
              >
                {/* Big Circular Dial */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="43" 
                      fill="none" 
                      stroke="#89ceff" 
                      strokeWidth="6" 
                      strokeDasharray="270"
                      animate={{ strokeDashoffset: 270 - (270 * atsScore) / 100 }}
                      transition={{ type: "spring", stiffness: 40 }}
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="text-center space-y-0.5 z-15">
                    <span className="text-xs font-mono tracking-widest text-[#87929c] block uppercase">MATCH RATE</span>
                    <span className="text-4xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(137,206,255,0.2)]">
                      {atsScore}%
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 font-bold tracking-widest block uppercase">
                      {atsScore >= 95 ? "ELITE" : "UNOPTIMIZED"}
                    </span>
                  </div>

                  {/* Outer scan scanner line */}
                  {scanState === "scanning" && (
                    <div className="absolute inset-1 rounded-full border border-sky-400/20 animate-[spin_3s_linear_infinite]" />
                  )}
                </div>

                <div className="text-center space-y-2 w-full">
                  <p className="text-xs text-[#bdc8d2] font-medium font-sans">
                    {scanState === "scanning" 
                      ? "AI Matrix Engine sweeping..." 
                      : atsScore >= 95 
                        ? "Bypasses 99% of enterprise ATS Filters" 
                        : "Requires keyword alignment sweep"}
                  </p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-sky-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${atsScore}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "biometric" && (
              <motion.div 
                key="biometric-hud"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col justify-between h-full space-y-6 py-2"
              >
                {/* Audio Spectrogram Simulator */}
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-[#87929c] block tracking-widest uppercase">SPEECH PRESENCE OSCILLOSCOPE</span>
                  
                  {/* Glowing Equalizer bars */}
                  <div className="flex items-end justify-between h-24 bg-[#0a0a0a] rounded-lg border border-white/5 p-3.5 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(137,206,255,0.03)_1px,transparent_1px)] bg-[size:100%_12px] opacity-25" />
                    {voiceVolume.map((vol, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ height: "10%" }}
                        animate={{ height: `${vol}%` }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className={`w-[6%] rounded-full opacity-80 ${idx % 3 === 0 ? "bg-sky-400" : idx % 3 === 1 ? "bg-indigo-400" : "bg-amber-400"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice breakdown stats */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between items-center text-[#87929c] border-b border-white/5 pb-2">
                    <span className="font-sans">Tone Evaluation</span>
                    <span className="text-white font-medium">{voiceEvaluation.resonance}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#87929c] border-b border-white/5 pb-2">
                    <span className="font-sans">Confidence Index</span>
                    <span className="text-white font-medium">{voiceEvaluation.stability}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#87929c]">
                    <span className="font-sans">Speaking Pace</span>
                    <span className="text-sky-400 font-semibold">{voiceEvaluation.speed}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "trajectory" && (
              <motion.div 
                key="trajectory-hud"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col justify-between h-full space-y-6 py-2"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-[#87929c] block tracking-widest uppercase font-bold">Node Telemetry Map</span>
                  
                  {/* Stylized interconnected map using SVGs and floating indicators */}
                  <div className="h-32 rounded-lg bg-[#0a0a0a] border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Connection lines */}
                      <line x1="40" y1="30" x2="100" y2="60" stroke="rgba(137,206,255,0.15)" strokeWidth="1" />
                      <line x1="160" y1="30" x2="100" y2="60" stroke="rgba(137,206,255,0.15)" strokeWidth="1" />
                      <line x1="100" y1="60" x2="100" y2="110" stroke="rgba(137,206,255,0.15)" strokeWidth="2" />
                      <line x1="40" y1="30" x2="40" y2="80" stroke="rgba(255,184,106,0.12)" strokeWidth="1" />
                    </svg>

                    {/* Nodes */}
                    <div className="absolute top-[20px] left-[30px] flex items-center gap-1 bg-[#121415] border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-mono text-amber-300">
                      <span className="w-1 h-1 bg-amber-400 rounded-full" /> LCI core
                    </div>
                    
                    <div className="absolute top-[20px] right-[25px] flex items-center gap-1 bg-[#121415] border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-mono text-sky-400">
                      <span className="w-1 h-1 bg-sky-400 rounded-full" /> ATS Sweep
                    </div>

                    <div className="absolute bottom-[48px] left-[78px] flex items-center gap-1 bg-sky-500/10 border border-sky-400/30 px-2 py-1 rounded text-[9px] font-mono text-sky-300 font-bold shadow-[0_0_10px_rgba(137,206,255,0.15)] animate-pulse">
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" /> Target Role
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-1.5 text-[11px]">
                  <span className="text-[9px] font-mono text-[#87929c] block uppercase">Optimized Compatibility Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">96.8 / 100</span>
                    <span className="text-[#87929c] font-medium">(Highly Aligned to Fortune 500 Benchmarks)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

interface LandingPageProps {
  onGoogleLogin: () => void;
  onGuestLogin: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function LandingPage({ 
  onGoogleLogin, 
  onGuestLogin, 
  darkMode, 
  setDarkMode 
}: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 selection:bg-cyan-500/20 selection:text-cyan-400 font-sans relative overflow-x-hidden ${darkMode ? "bg-[#0c0f0f] text-[#e2e2e2]" : "bg-slate-50 text-slate-800"}`}>
      {/* Dynamic Background Noise & Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-sky-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-[100px] right-[10%] w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* FIXED TOP NAVIGATION BAR */}
      <nav className={`fixed top-0 w-full backdrop-blur-xl border-b transition-colors duration-300 z-50 ${darkMode ? "bg-[#0c0f0f]/85 border-white/5" : "bg-white/85 border-slate-200"}`}>
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          {/* Logo Brand click to scroll to top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
            title="Scroll to Top"
          >
            <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border transition-colors ${darkMode ? "border-sky-400/30 bg-[#0c0f0f]" : "border-slate-300 bg-white"} p-1.5 focus-indigo-glow`}>
              <img src="/src/assets/logo.svg" alt="CareerLens AI Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className={`font-sans text-[1.25rem] font-bold tracking-tight ${darkMode ? "text-sky-400" : "text-indigo-600"}`}>CareerLens <span className={darkMode ? "text-white" : "text-slate-900"}>AI</span></span>
              <p className={`text-[8px] font-mono tracking-widest leading-none font-bold ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>EXECUTIVE SUITE</p>
            </div>
          </button>

           {/* Links */}
          <div className={`hidden md:flex items-center gap-8 text-[13px] font-mono tracking-wider uppercase transition-colors ${darkMode ? "text-[#bdc8d2]" : "text-slate-600"}`}>
            <button 
              onClick={() => scrollToSection("features")} 
              className={`transition-colors cursor-pointer ${darkMode ? "hover:text-sky-450 hover:text-sky-400" : "hover:text-indigo-600"}`}
            >
              Toolkit
            </button>
            <button 
              onClick={() => scrollToSection("details")} 
              className={`transition-colors cursor-pointer ${darkMode ? "hover:text-sky-455 hover:text-sky-400" : "hover:text-indigo-600"}`}
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection("metrics")} 
              className={`transition-colors cursor-pointer ${darkMode ? "hover:text-sky-350 hover:text-sky-300" : "hover:text-indigo-600"}`}
            >
              Metrics
            </button>
          </div>

          {/* CTAs & Theme Mode */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${darkMode ? "bg-white/5 border-white/5 hover:bg-white/10 text-[#bdc8d2] hover:text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-205 text-slate-700 hover:text-slate-900 hover:bg-slate-200"}`}
              title="Toggle theme atmosphere"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button 
              onClick={() => setShowAuthModal(true)}
              className={`hidden sm:block text-sm font-medium transition-colors cursor-pointer ${darkMode ? "hover:text-white text-[#bdc8d2]" : "hover:text-slate-900 text-slate-600"}`}
            >
              Sign In
            </button>

            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs font-mono uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.97] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden max-w-7xl mx-auto">
        <div className="relative z-10 max-w-4xl text-center space-y-8">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${darkMode ? "border-sky-400/20 bg-sky-400/5" : "border-indigo-100 bg-indigo-50"}`}
          >
            <Sparkles className={`w-3.5 h-3.5 animate-pulse ${darkMode ? "text-sky-400" : "text-indigo-600"}`} />
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-sky-300" : "text-indigo-700"}`}>
              Next-Gen Career Optimization Engine
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Bridge the Gap to Your <br />
            <span className={`bg-gradient-to-r text-transparent bg-clip-text drop-shadow-sm font-extrabold ${darkMode ? "from-sky-400 via-indigo-300 to-sky-300" : "from-indigo-600 via-sky-600 to-indigo-700"}`}>
              Next Big Role
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-sans transition-colors ${darkMode ? "text-[#bdc8d2]" : "text-slate-600"}`}
          >
            Experience high-fidelity resume ATS matching and interactive biometric mock interview prep. 
            CareerLens AI leverages state-of-the-art language models and custom telemetry metrics to make 
            sure you bypass recruiter filters and land premium offers.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => setShowAuthModal(true)}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-[14px] text-center shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onGuestLogin}
              className={`w-full sm:w-auto border px-8 py-3.5 rounded-xl font-medium text-[14px] text-center transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${darkMode ? "border-white/10 hover:border-white/20 hover:bg-white/5 text-white" : "border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-700"}`}
            >
              <span>Instantly Launch Demo Dashboard</span>
            </button>
          </motion.div>
        </div>

        {/* Advanced 3D Telemetry HUD Dashboard Simulator - Replaces static image */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl relative z-10 flex justify-center"
        >
          <AIDashboard3DSimulator darkMode={darkMode} />
        </motion.div>
      </section>

      {/* CORE TOOLKIT SHOWCASE - BENTO GRID WITH PORT SCROLL REVEAL */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h2 className={`text-3xl font-bold tracking-tight font-headline-lg transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
            The Executive Toolkit
          </h2>
          <p className={`max-w-xl mx-auto text-sm sm:text-base transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-500"}`}>
            Precision-engineered utilities designed to give you an unfair advantage in a saturated executive market.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Resume */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`transition-all duration-300 p-8 rounded-2xl flex flex-col justify-between group relative overflow-hidden border ${darkMode ? "bg-[#121414] border-white/5 hover:border-sky-400/30" : "bg-white border-slate-205 border-slate-200 hover:border-indigo-400/50 shadow-sm hover:shadow-md"}`}
          >
            <div className="absolute top-[-100px] left-[-100px] w-48 h-48 bg-sky-500/[0.02] rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-all duration-500" />
            <div className="space-y-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${darkMode ? "bg-sky-500/10 border-sky-400/20 group-hover:bg-sky-500/20" : "bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100"}`}>
                <FileText className={`w-5 h-5 ${darkMode ? "text-sky-400" : "text-indigo-600"}`} />
              </div>
              <h3 className={`text-xl font-bold font-headline-lg transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Resume Analysis Lab</h3>
              <p className={`text-sm leading-relaxed transition-colors ${darkMode ? "text-[#bdc8d2]" : "text-slate-600"}`}>
                Real-time detailed parsing, score reports, and thorough keyword gap maps. Identify missed qualifiers before submission.
              </p>
            </div>
            <div className={`mt-8 pt-6 relative z-10 flex items-center justify-between border-t transition-colors ${darkMode ? "border-white/5" : "border-slate-100"}`}>
              <span className={`text-[10px] font-mono tracking-wider font-bold transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>AVERAGE MATCH RANGE</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md transition-colors ${darkMode ? "text-sky-400 bg-sky-400/10" : "text-indigo-600 bg-indigo-50"}`}>92% - 98%</span>
            </div>
          </motion.div>

          {/* Feature 2: Interview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`transition-all duration-300 p-8 rounded-2xl flex flex-col justify-between group relative overflow-hidden border ${darkMode ? "bg-[#121414] border-sky-400/20 hover:border-sky-400/50 shadow-[0_0_15px_rgba(137,206,255,0.02)]" : "bg-white border-indigo-200 hover:border-indigo-400 shadow-sm"}`}
          >
            <div className="absolute top-[-100px] left-[-100px] w-48 h-48 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${darkMode ? "bg-sky-500/10 border-sky-400/20 group-hover:bg-sky-500/20" : "bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100"}`}>
                <VideoIcon className={`w-5 h-5 ${darkMode ? "text-sky-400" : "text-indigo-600"}`} />
              </div>
              <h3 className={`text-xl font-bold font-headline-lg transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Mock Prep Intelligence</h3>
              <p className={`text-sm leading-relaxed transition-colors ${darkMode ? "text-[#bdc8d2]" : "text-slate-600"}`}>
                Receive interactive interview questions matched to your role. Records your responses to calculate posture, speaking rate, and core delivery metrics.
              </p>
            </div>
            <div className={`mt-8 pt-6 relative z-10 flex items-center justify-between border-t transition-colors ${darkMode ? "border-white/5" : "border-slate-100"}`}>
              <span className={`text-[10px] font-mono tracking-wider font-bold flex items-center gap-1.5 transition-colors ${darkMode ? "text-sky-400" : "text-indigo-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${darkMode ? "bg-cyan-400" : "bg-indigo-500"}`}></span>
                LIVE BIOMETRIC TELEMETRY
              </span>
              <span className={`text-xs font-mono font-bold transition-colors ${darkMode ? "text-[#e2e2e2]" : "text-slate-800"}`}>READY</span>
            </div>
          </motion.div>

          {/* Feature 3: Archive */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`transition-all duration-300 p-8 rounded-2xl flex flex-col justify-between group relative overflow-hidden border ${darkMode ? "bg-[#121414] border-white/5 hover:border-sky-400/30" : "bg-white border-slate-205 border-slate-200 hover:border-indigo-400/50 shadow-sm hover:shadow-md"}`}
          >
            <div className="absolute top-[-100px] left-[-100px] w-48 h-48 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${darkMode ? "bg-sky-500/10 border-sky-400/20 group-hover:bg-sky-500/20" : "bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100"}`}>
                <LineChart className={`w-5 h-5 ${darkMode ? "text-sky-400" : "text-indigo-600"}`} />
              </div>
              <h3 className={`text-xl font-bold font-headline-lg transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Career Growth Telemetry</h3>
              <p className={`text-sm leading-relaxed transition-colors ${darkMode ? "text-[#bdc8d2]" : "text-slate-600"}`}>
                Keep historical scans, resume variations, and interview session transcripts perfectly synchronized for secure progress review.
              </p>
            </div>
            <div className={`mt-8 pt-6 relative z-10 flex items-center justify-between border-t transition-colors ${darkMode ? "border-white/5" : "border-slate-100"}`}>
              <span className={`text-[10px] font-mono tracking-wider font-bold transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>DATA REPOSITORY</span>
              <span className={`text-xs font-mono font-bold transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-800"}`}>SECURED</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION - VIEWPORT REVEAL */}
      <section id="details" className={`py-24 border-y relative transition-colors duration-300 ${darkMode ? "bg-[#080a0a]/70 border-white/5" : "bg-white border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Steps Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold font-headline-lg tracking-tight transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                Precision Optimization <br />
                <span className={darkMode ? "text-sky-400" : "text-indigo-600"}>In 3 Standard Steps</span>
              </h2>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all font-mono ${darkMode ? "border-sky-500/20 group-hover:border-sky-500/40 bg-[#0c0f0f] text-sky-400" : "border-slate-200 group-hover:border-slate-300 bg-slate-50 text-indigo-600"}`}>
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-lg font-bold font-sans transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Secure Profile Upload</h4>
                    <p className={`text-xs sm:text-sm transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-500"}`}>
                      Upload your current resume and paste target Job Descriptions. Our sandbox environment processes your document securely.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all font-mono ${darkMode ? "border-sky-500/20 group-hover:border-sky-500/40 bg-[#0c0f0f] text-sky-400" : "border-slate-200 group-hover:border-slate-300 bg-slate-50 text-indigo-600"}`}>
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-lg font-bold font-sans transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Intelligent Analysis & Insights</h4>
                    <p className={`text-xs sm:text-sm transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-500"}`}>
                      Our system dissects matching keywords, scores your layout, and highlights skill gaps based on the target requirements.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all font-mono ${darkMode ? "border-sky-500/20 group-hover:border-sky-500/40 bg-[#0c0f0f] text-sky-400" : "border-slate-200 group-hover:border-slate-300 bg-slate-50 text-indigo-600"}`}>
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-lg font-bold font-sans transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Simulated Training Delivery</h4>
                    <p className={`text-xs sm:text-sm transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-500"}`}>
                      Take simulated interview prompts specifically modeled on target questions. Get evaluated with robust feedback loops immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visual Telemetry Circle */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative flex justify-center items-center"
            >
              <div className="absolute -inset-4 bg-sky-500/[0.04] blur-3xl rounded-full" />
              <div className={`relative border p-8 rounded-full aspect-square w-72 sm:w-80 flex flex-col items-center justify-center text-center transition-all ${darkMode ? "bg-[#121414] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                <svg className="absolute w-[240px] h-[240px] -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeWidth="4" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={darkMode ? "#89ceff" : "#4f46e5"} strokeWidth="4" strokeDasharray="282.7" strokeDashoffset="75" strokeLinecap="round" />
                </svg>
                <div className="relative space-y-1 z-10">
                  <Cpu className={`w-8 h-8 mx-auto animate-pulse ${darkMode ? "text-sky-400" : "text-indigo-600"}`} />
                  <span className={`block text-3xl font-mono font-bold tracking-tight transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>ATS 94%</span>
                  <span className={`block text-[9px] font-mono tracking-widest font-bold uppercase transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>TRAJECTORY MATCH</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* METRICS & PROPOSITIONS - VIEWPORT REVEAL */}
      <section id="metrics" className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`border p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden transition-all duration-300 ${darkMode ? "bg-gradient-to-b from-[#121414] to-[#0c0f0f] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
        >
          <div className="absolute inset-0 bg-radial-gradient from-sky-500/[0.02] to-transparent pointer-events-none" />
          <h2 className={`text-2xl sm:text-3xl font-bold font-headline-lg transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
            Guaranteed Trackable Advancements
          </h2>
          <p className={`italic max-w-2xl mx-auto text-sm sm:text-base font-normal leading-relaxed transition-colors ${darkMode ? "text-[#bdc8d2]" : "text-slate-600"}`}>
            "Our vetted executive partners experience up to 40% higher response rates from Tier 1 technology & leadership recruiters within the first 30 days."
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 relative z-10">
            <div className={`p-4 border rounded-xl transition-colors ${darkMode ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold font-mono ${darkMode ? "text-sky-400" : "text-indigo-600"}`}>4.9/5</p>
              <p className={`text-[10px] font-mono tracking-wider uppercase mt-1 ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>USER SATISFACTION</p>
            </div>
            <div className={`p-4 border rounded-xl transition-colors ${darkMode ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold font-mono ${darkMode ? "text-sky-400" : "text-indigo-600"}`}>15k+</p>
              <p className={`text-[10px] font-mono tracking-wider uppercase mt-1 ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>PROFILES RATED</p>
            </div>
            <div className={`p-4 border rounded-xl transition-colors ${darkMode ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold font-mono ${darkMode ? "text-sky-400" : "text-indigo-600"}`}>94%</p>
              <p className={`text-[10px] font-mono tracking-wider uppercase mt-1 ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>REQUISITE SUCCESS</p>
            </div>
            <div className={`p-4 border rounded-xl transition-colors ${darkMode ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-3xl font-bold font-mono ${darkMode ? "text-sky-400" : "text-indigo-600"}`}>&lt; 10m</p>
              <p className={`text-[10px] font-mono tracking-wider uppercase mt-1 ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>AVERAGE REPORT SPEED</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t transition-colors duration-300 ${darkMode ? "border-white/5 bg-[#0c0f0f]" : "border-slate-200 bg-white"}`}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`font-bold text-base font-sans transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>CareerLens AI</span>
            </div>
            <p className={`text-xs font-mono transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-450 text-slate-500"}`}>© 2026 CareerLens AI. All rights reserved. Precision Executive Trajectory.</p>
          </div>

          <div className={`flex flex-wrap justify-center gap-6 text-xs font-sans transition-colors ${darkMode ? "text-[#87929c]" : "text-slate-500"}`}>
            <a href="#" className={`transition-colors ${darkMode ? "hover:text-sky-400" : "hover:text-indigo-600"}`}>Privacy Policy</a>
            <a href="#" className={`transition-colors ${darkMode ? "hover:text-sky-400" : "hover:text-indigo-600"}`}>Terms of Service</a>
            <a href="#" className={`transition-colors ${darkMode ? "hover:text-sky-400" : "hover:text-indigo-600"}`}>Enterprise Contact</a>
          </div>

          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${darkMode ? "border-white/5 text-[#87929c] hover:text-white hover:bg-white/5" : "border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
              <Globe className="w-4 h-4" />
            </div>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${darkMode ? "border-white/5 text-[#87929c] hover:text-white hover:bg-white/5" : "border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
              <Share2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>

      {/* GLOWING AUTHENTICATION OVERLAY MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-sm mx-4 border rounded-2xl p-8 flex flex-col justify-between shadow-2xl space-y-6 text-center transition-colors duration-300 ${darkMode ? "bg-[#0c0c0c] border-white/10" : "bg-white border-slate-200"}`}
            >
              {/* Header */}
              <div className="space-y-2">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 border p-2 flex items-center justify-center ${darkMode ? "border-white/10 bg-[#050606]" : "border-slate-200 bg-white shadow-sm"}`}>
                  <img src="/src/assets/logo.svg" alt="CareerLens AI Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <h3 className={`text-xl font-bold tracking-tight uppercase font-mono ${darkMode ? "text-white" : "text-slate-900"}`}>
                  CareerLens <span className={darkMode ? "text-sky-400" : "text-indigo-600"}>AI</span>
                </h3>
                <p className={`text-xs font-sans ${darkMode ? "text-[#87929c]" : "text-slate-500"}`}>
                  Connect to your premium sandbox or secure profile
                </p>
              </div>

              {/* Login Actions */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    onGoogleLogin();
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl shadow-md text-sm font-sans cursor-pointer transition-colors ${darkMode ? "bg-sky-400 hover:bg-sky-300 text-black" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                >
                  Sign In with Google
                </button>

                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    onGuestLogin();
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 border font-bold rounded-xl transition-all cursor-pointer text-sm font-sans ${darkMode ? "bg-white/5 hover:bg-white/10 border-white/5 text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"}`}
                >
                  Continue as Guest Sandbox
                </button>
              </div>

              {/* Compliance Footer */}
              <p className={`text-[10px] pt-2 flex items-center justify-center gap-1.5 font-mono ${darkMode ? "text-[#87929c]" : "text-slate-400"}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 
                SECURE AUTHENTICATED ACCESS
              </p>

              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className={`absolute top-4 right-4 transition-colors cursor-pointer text-sm font-mono p-1 ${darkMode ? "text-[#87929c] hover:text-white" : "text-slate-400 hover:text-slate-800"}`}
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
