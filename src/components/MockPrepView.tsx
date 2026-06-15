import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Interview, ChatMessage, Analysis } from "../types";
import { 
  Play, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  Zap,
  Check,
  Star,
  Activity,
  History,
  MessageSquare
} from "lucide-react";

interface MockPrepViewProps {
  onSaveInterview: (interview: Interview) => void;
  selectedInterview: Interview | null;
  onClearSelected: () => void;
  userId: string;
  analyses: Analysis[]; // Pass analyses so they can easily bootstrap their target
}

export default function MockPrepView({
  onSaveInterview,
  selectedInterview,
  onClearSelected,
  userId,
  analyses,
}: MockPrepViewProps) {
  // Step 1: Session Config
  const [roleName, setRoleName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFilename, setResumeFilename] = useState("");

  // Step 2: Live Simulator states
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");

  // Live feedback widgets
  const [liveConfidence, setLiveConfidence] = useState<number | null>(null);
  const [livePace, setLivePace] = useState<string | null>(null);
  const [liveTip, setLiveTip] = useState<string | null>(null);
  const [liveKeywords, setLiveKeywords] = useState<string[]>([]);
  const [recentRating, setRecentRating] = useState<number | null>(null);

  // State metrics trackers for multi-turn sessions (guarantees accurate cumulative average calculations)
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [sessionConfidences, setSessionConfidences] = useState<number[]>([]);
  const [sessionTips, setSessionTips] = useState<string[]>([]);

  // Audio / Mic simulated interactions
  const [micActive, setMicActive] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioVisualizer, setAudioVisualizer] = useState<number[]>(Array(12).fill(10));
  const visualIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio & Permission Debug info
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);

  // Hands-Free Speech Automation states and refs
  const [handsFree, setHandsFree] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const handsFreeRef = useRef(handsFree);
  const shouldBeListeningRef = useRef(false);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resetSilenceTimerRef = useRef<(() => void) | undefined>(undefined);
  const userAnswerRef = useRef(userAnswer);

  const activeInterview = selectedInterview;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state with refs to prevent stale closures inside speech-recognition listeners
  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  useEffect(() => {
    userAnswerRef.current = userAnswer;
  }, [userAnswer]);

  const resetSilenceCountdown = () => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
    }
    setSilenceCountdown(3);
    
    silenceIntervalRef.current = setInterval(() => {
      setSilenceCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (silenceIntervalRef.current) {
            clearInterval(silenceIntervalRef.current);
            silenceIntervalRef.current = null;
          }
          // Only auto-submit if text isn't empty and simulator isn't already submitting
          if (userAnswerRef.current.trim() && !submittingAnswer) {
            console.log("Hands-free: Silence countdown reached 0. Submitting answer...");
            handleSubmitAnswer();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    resetSilenceTimerRef.current = resetSilenceCountdown;
  });

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentWords = finalTranscript || interimTranscript;
          if (currentWords.trim()) {
            setUserAnswer(currentWords);
            setShowTextInput(true);
            // If hands-free is enabled, notify/reset the silence countdown
            if (handsFreeRef.current && resetSilenceTimerRef.current) {
              resetSilenceTimerRef.current();
            }
          }
        };

        rec.onstart = () => {
          setIsPermissionGranted(true);
          setSpeechError(null);
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setSpeechError(event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setIsPermissionGranted(false);
          }
        };

        rec.onend = () => {
          setMicActive(false);
          // If hands-free is enabled and we are expecting to listen, attempt a hot-restart
          if (handsFreeRef.current && shouldBeListeningRef.current) {
            console.log("Speech recognition stopped unexpectedly; restarting in hands-free mode.");
            setTimeout(() => {
              if (handsFreeRef.current && shouldBeListeningRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  setMicActive(true);
                } catch (e) {
                  console.warn("Speech recognition warm restart failed:", e);
                }
              }
            }, 300);
          }
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Failed to initialize speech recognition object:", err);
        setSpeechError("initialization-failed");
        setIsPermissionGranted(false);
      }
    } else {
      console.warn("Browser SpeechRecognition class not available.");
      setSpeechError("not-supported");
      setIsPermissionGranted(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = () => {
    if (submittingAnswer) return;
    shouldBeListeningRef.current = true;

    // Reset silence visual state immediately when mic is requested 
    setSilenceCountdown(null);
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    
    // Reset any ongoing typing simulation
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        setMicActive(true);
        setUserAnswer(""); 
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Error starting speech recognition, attempting restart:", err);
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setMicActive(true);
              } catch (retryErr) {
                console.error("Retry start failed:", retryErr);
              }
            }
          }, 100);
        } catch (stopErr) {}
      }
    } else {
      // Secure non-hijacking fallback: Simply flag support status so they type manually
      setMicActive(false);
      setSpeechError("not-supported");
      console.log("No reactive microphone parser detected. Keyboard typing input activated fallback.");
      setShowTextInput(true);
    }
  };

  const triggerDemoVoiceSimulation = () => {
    if (submittingAnswer) return;
    setMicActive(true);
    setUserAnswer("Simulating voice candidate response...");
    let progressText = "";
    const sentences = [
      "Based on our target design constraints,",
      " I developed a multi-tenant client-side architecture with background local state storage.",
      " This optimized cold launches by 40% and prevented race conditions entirely",
      " while synchronizing with the centralized server endpoint logs."
    ];
    let partIdx = 0;

    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }

    const timer = setInterval(() => {
      if (partIdx < sentences.length) {
        progressText += sentences[partIdx];
        setUserAnswer(progressText);
        setShowTextInput(true);
        partIdx++;
        if (handsFreeRef.current && resetSilenceTimerRef.current) {
          resetSilenceTimerRef.current();
        }
      } else {
        setMicActive(false);
        clearInterval(timer);
        simulationTimerRef.current = null;
      }
    }, 1000);

    simulationTimerRef.current = timer;
  };

  const stopListening = () => {
    shouldBeListeningRef.current = false;
    setMicActive(false);
    setSilenceCountdown(null);
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, currentQuestion]);

  // Session Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (interviewStarted) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [interviewStarted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Audio visualizer wave simulation
  useEffect(() => {
    if (micActive) {
      visualIntervalRef.current = setInterval(() => {
        setAudioVisualizer(() => 
          Array(16).fill(0).map(() => Math.floor(Math.random() * 40) + 5)
        );
      }, 120);
    } else {
      if (visualIntervalRef.current) clearInterval(visualIntervalRef.current);
      setAudioVisualizer(Array(16).fill(8));
    }
    return () => {
      if (visualIntervalRef.current) clearInterval(visualIntervalRef.current);
    };
  }, [micActive]);

  // Help user auto-select target if they have past analysis
  const handleSelectPastProfile = (analysis: Analysis) => {
    setRoleName(analysis.roleName);
    setCompanyNameLocal(analysis.companyName);
    setJobDescription(analysis.jobDescription);
    setResumeText(analysis.resumeText);
    setResumeFilename(analysis.resumeFilename);
  };

  const [companyNameLocal, setCompanyNameLocal] = useState("");

  // Speech button manual toggling handler
  const toggleMic = () => {
    if (!micActive) {
      startListening();
    } else {
      stopListening();
    }
  };

  // Start the Interview
  const handleStartInterview = async () => {
    if (!roleName) {
      alert("Please fill out the Target Job Role.");
      return;
    }
    setLoading(true);
    setChatHistory([]);
    setLiveConfidence(null);
    setLivePace(null);
    setLiveTip(null);
    setLiveKeywords([]);
    setRecentRating(null);

    const initialAiMsg = `Hello! Thank you for meeting with me today for the ${roleName} role. Let's delve into your credentials. Could you share your professional background and walk me through your key technical focus areas?`;

    setCurrentQuestion(initialAiMsg);
    setChatHistory([
      {
        sender: "ai",
        text: initialAiMsg,
        timestamp: new Date().toISOString()
      }
    ]);
    setInterviewStarted(true);
    setLoading(false);
    
    // Play initial introduction and automatically open microphone once completed
    setTimeout(() => {
      triggerSpeechSynthesis(initialAiMsg);
    }, 150);
  };

  // Submit Answer to AI
  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || submittingAnswer) return;

    // Transition state: stop recording during processing of the next answer
    stopListening();

    const answer = userAnswer;
    setUserAnswer("");
    setSubmittingAnswer(true);

    // 1. Add user reply to chat list
    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      {
        sender: "user",
        text: answer,
        timestamp: new Date().toISOString()
      }
    ];
    setChatHistory(updatedHistory);

    try {
      // 2. Fetch realtime analysis of user answer parallel to obtaining next question.
      const analysisPromise = fetch("/api/mock-prep/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastQuestion: currentQuestion,
          userAnswer: answer,
          jobDescription,
          roleName,
          provider
        })
      });

      // 3. Fetch next question
      const questionPromise = fetch("/api/mock-prep/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName,
          jobDescription,
          resumeText,
          chatHistory: updatedHistory,
          provider
        })
      });

      // Execute APIs
      const [analysisRes, questionRes] = await Promise.all([analysisPromise, questionPromise]);
      const analysisData = await analysisRes.json();
      const questionData = await questionRes.json();

      if (!analysisRes.ok || !questionRes.ok) {
        throw new Error("Failed to process conversational feedback.");
      }

      // Update realtime co-pilot sliders
      setLiveConfidence(analysisData.confidenceLevel);
      setLivePace(analysisData.paceAssessment);
      setLiveTip(analysisData.analysisTip);
      setRecentRating(analysisData.ratingScore);
      if (analysisData.keywordsIdentified) {
        setLiveKeywords((prev) => Array.from(new Set([...prev, ...analysisData.keywordsIdentified])));
      }

      // Record Turn metrics for accurate aggregate calculations
      if (typeof analysisData.ratingScore === "number") {
        setSessionScores((prev) => [...prev, analysisData.ratingScore]);
      }
      if (typeof analysisData.confidenceLevel === "number") {
        setSessionConfidences((prev) => [...prev, analysisData.confidenceLevel]);
      }
      if (analysisData.analysisTip) {
        setSessionTips((prev) => [...prev, analysisData.analysisTip]);
      }

      // Add speech synthesis playback simulation - this will automatically open the mic after completion!
      triggerSpeechSynthesis(questionData.question);

      // Append new AI question to chat
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: questionData.question,
          timestamp: new Date().toISOString()
        }
      ]);
      setCurrentQuestion(questionData.question);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Conversational response failed.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Web Speech TTS playback - Automatically triggers startListening microphone once the audio speaking has ended
  const triggerSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn("SpeechSynthesis not supported; opening mic immediately.");
      startListening();
      return;
    }

    if (audioMuted) {
      console.log("Audio is muted; opening mic immediately.");
      startListening();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        // Automatically start recording when AI finishes speaking
        console.log("AI voice playback finished. Opening mic automatically for candidate response.");
        startListening();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error, auto-starting mic fallback", e);
        startListening();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis initialization failed; opening mic as fallback.", e);
      startListening();
    }
  };

  // End and Save entire session
  const handleFinishSession = async () => {
    // If they haven't submitted any replies yet, confirm if they want to exit
    const totalAnswers = chatHistory.filter(c => c.sender === "user").length;
    if (totalAnswers === 0) {
      const confirmEnd = window.confirm("You have not answered any questions yet. Do you want to end and save this session as incomplete?");
      if (!confirmEnd) return;
    }

    // Mathematically accurate global average calculations of turn scores and confidence indicators
    const avgScore = sessionScores.length > 0
      ? Math.round(sessionScores.reduce((sum, s) => sum + s, 0) / sessionScores.length)
      : (recentRating || 0);

    const avgConfidence = sessionConfidences.length > 0
      ? Math.round(sessionConfidences.reduce((sum, c) => sum + c, 0) / sessionConfidences.length)
      : (liveConfidence || 0);

    // Highly professional synthesis of turn-by-turn critiques and coaching takeaways
    let feedbackSummary = "";
    if (sessionTips.length > 0) {
      feedbackSummary = `## Performance Feedback Recap\nYour average interview suitability performance is scored at **${avgScore}%** with an average confidence presence of **${avgConfidence}%** across **${totalAnswers}** active conversational turns.\n\n` +
        sessionTips.map((tip, idx) => `### Response Turn ${idx + 1} Review\n${tip}`).join("\n\n");
    } else {
      feedbackSummary = "Incomplete Session. No candidate voice or text responses were submitted during this mock simulation, leading to a zero-point score evaluation.";
    }

    const sessionObj: Interview = {
      id: "int_" + Math.random().toString(36).substring(2, 11),
      userId: userId,
      roleName: roleName,
      jobDescription: jobDescription,
      resumeFilename: resumeFilename || "Integrated Profile",
      score: avgScore,
      status: "completed",
      confidenceLevel: avgConfidence,
      feedbackSummary: feedbackSummary,
      keywordsIdentified: liveKeywords,
      speechPaceWpm: 125, // default
      chatHistory: chatHistory,
      createdAt: new Date().toISOString()
    };

    try {
      await onSaveInterview(sessionObj);
      alert("Mock Session successfully evaluated and recorded in database!");
      onClearSelected();
      resetMockWorkspace();
    } catch (err) {
      console.error(err);
      alert("Error saving session logs.");
    }
  };

  const resetMockWorkspace = () => {
    onClearSelected(); // Cleanly resets active historic selections first
    setInterviewStarted(false);
    setCurrentQuestion("");
    setUserAnswer("");
    setChatHistory([]);
    setLiveConfidence(null);
    setLivePace(null);
    setLiveTip(null);
    setLiveKeywords([]);
    setRecentRating(null);
    setRoleName("");
    setCompanyNameLocal("");
    setJobDescription("");
    setResumeText("");
    setResumeFilename("");
    setSessionScores([]);
    setSessionConfidences([]);
    setSessionTips([]);
  };

  // Render Historic selected interview results
  if (activeInterview) {
    return (
      <div className="space-y-6 animate-fade-in" id="interview-past-report">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-slate-200 pb-5">
          <div>
            <button 
              onClick={onClearSelected}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-2 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Workspace
            </button>
            <h1 className="font-headline text-2xl text-slate-900 font-bold">
              Prep Log Report: {activeInterview.roleName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Conducted on {new Date(activeInterview.createdAt).toLocaleDateString()} at {new Date(activeInterview.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <button 
            onClick={resetMockWorkspace}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-750 bg-white rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-sm font-semibold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reset Simulator
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-5 rounded-xl text-center shadow-sm">
            <Star className="w-7 h-7 text-amber-500 mx-auto mb-2" />
            <h4 className="text-slate-450 text-[10px] uppercase tracking-wider font-bold text-slate-500">Evaluation Score</h4>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{activeInterview.score}%</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl text-center shadow-sm">
            <Activity className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-slate-450 text-[10px] uppercase tracking-wider font-bold text-slate-500">Confidence Estimate</h4>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{activeInterview.confidenceLevel}%</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl text-center shadow-sm">
            <Clock className="w-7 h-7 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-slate-450 text-[10px] uppercase tracking-wider font-bold text-slate-500">Pace Assessment</h4>
            <div className="text-sm font-extrabold text-slate-800 mt-3 bg-indigo-50 py-0.5 rounded-full inline-block px-3">Steady / 125 WPM</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl text-center shadow-sm">
            <Zap className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
            <h4 className="text-slate-450 text-[10px] uppercase tracking-wider font-bold text-slate-500">Concept Highlights</h4>
            <div className="text-3xl font-extrabold text-indigo-600 mt-1">
              {activeInterview.keywordsIdentified?.length || 0} hits
            </div>
          </div>
        </div>

        {/* Summary Feedback */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-headline text-base text-slate-900 font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Recruiter's Performance Feedback
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {activeInterview.feedbackSummary}
          </p>

          {activeInterview.keywordsIdentified && activeInterview.keywordsIdentified.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mentioned Capabilities</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeInterview.keywordsIdentified.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-mono font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat History Transcript */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-headline text-base text-slate-900 font-bold flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <History className="w-5 h-5 text-slate-400" /> Chat History Transcript ({activeInterview.chatHistory?.length || 0} turns)
          </h3>
          <div className="space-y-4 pt-2">
            {activeInterview.chatHistory?.map((msg, i) => (
              <div 
                key={i}
                className={`flex gap-4 p-4 rounded-lg leading-relaxed ${
                  msg.sender === "ai" ? "bg-slate-50 border border-slate-150 mr-12" : "bg-white border border-slate-200 ml-12 flex-row-reverse shadow-xs"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  msg.sender === "ai" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                }`}>
                  {msg.sender === "ai" ? "AI" : "YOU"}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {msg.sender === "ai" ? "AI Interviewer" : "Candidate Response"}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active in-progress Simulation
  if (interviewStarted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="interview-simulation-active">
        {/* Left Column: Interview Canvas (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 px-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 leading-tight">
                Mock Interview: {roleName}
              </h1>
              <p className="font-sans text-xs text-slate-500 mt-1">
                Session duration: <span className="font-mono font-bold text-slate-700">{formatDuration(sessionTimer)}</span> / 30:00
              </p>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse">
                LIVE SESSION
              </span>
            </div>
          </div>

          {/* AI Interviewer Video/Avatar Container */}
          <div className="aspect-video bg-gradient-to-br from-[#131b2e] to-[#191c1e] rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-300 shadow-md p-4 group select-none">
            {/* Overlay Grid Pattern for technical corporate look */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            
            {/* Audio Muted State Notification Layer */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button 
                type="button"
                onClick={() => setAudioMuted(!audioMuted)}
                className={`p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                  audioMuted 
                    ? "bg-rose-500/90 text-white" 
                    : "bg-white/10 text-white/85 hover:bg-white/20"
                }`}
                title={audioMuted ? "Unmute AI Voice Synth" : "Mute AI Voice Synth"}
              >
                {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Diagnostic Alert Block for Microphone if frame permission or browser errors strike */}
            {speechError && (
              <div className="absolute top-3 left-3 right-12 bg-amber-50/95 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-950 flex items-center gap-2 z-20 shadow-lg backdrop-blur-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping flex-shrink-0"></div>
                <div className="leading-tight text-left">
                  <span className="font-bold block mb-0.5">Microphone Status ({speechError})</span>
                  <span>
                    {speechError === "not-allowed" 
                      ? "Iframe blocked audio access. Click browser's lock/settings icon to allow microphone, or press the 'KEY' button to type responses." 
                      : "Speech recognition error detected. Try refreshing or typing responses manually."}
                  </span>
                </div>
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
              {/* Circular Avatar of AI recruiter with custom teal pulsing borders */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0c9488] p-1 animate-pulse relative overflow-hidden bg-slate-950">
                <img 
                  alt="AI Interviewer Avatar" 
                  className="w-full h-full rounded-full object-cover select-none pointer-events-none" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd9bHwZ8MngtVB1krwuYu5QwPVQ0YpaFlF3ke_15TdFlLXgu8kGBhZR958GOGRfvbqEGd07dv-WIyzv-8xhKRCCv6XAXePkL53htZlz00oK1xRHdqTxaovzJgl4Ydbo99Xi7tZK90NALBc991nVFsNP3f6QkeGuOw8C7Dg0SqhxLI7Ynab2BCKNorxZk8yrfU4HG7RcVxMU5WtZXMiGr_77SCu1YWj42hJuVsFimoPQyQyT7lEnNv1Esg5QZ_U14ic8dQfguPm9Me2"
                />
              </div>

              {/* Speaker Status Sub-badge */}
              <div className="mt-4 px-4 py-1 bg-[#131b2e] text-white border border-slate-700 rounded-full flex items-center gap-2 text-xs font-semibold shadow-xs">
                <div className={`w-2 h-2 rounded-full ${micActive ? "bg-amber-400" : "bg-[#0c9488] animate-ping"}`}></div>
                <span>{micActive ? "Speech Recognition Listening..." : "AI Interviewer Ready"}</span>
              </div>
            </div>
          </div>

          {/* Chat Transcript Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm h-[320px] overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 items-start ${msg.sender === "user" ? "justify-end" : ""}`}>
                  {msg.sender === "ai" ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#131b2e] text-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-extrabold uppercase select-none">
                        AI
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none max-w-[80%] border border-slate-200">
                        <p className="text-sm text-slate-850 text-slate-800 font-sans leading-relaxed">{msg.text}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#0c9488] text-white p-3 rounded-xl rounded-tr-none max-w-[80%] shadow-xs">
                        <p className="text-sm font-sans leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                        <img 
                          alt="User icon avatar" 
                          className="w-full h-full object-cover select-none pointer-events-none" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD45SJxA3eGzLFwp1cuhViuG9IPSiYEg4Du9I8fhlM5ypAliCuOXUnNcyeHlcPc4GswjG0kKYl1wpaKR_n_ih0csdNuzcR64WkeJ7Z6F6DEOViynQbn5eaCzrS3eGM9t2tPwbQNgG6NK2iOqJEpLeu8C89n_mCAO2kQmeLc2OUcVU2nycU0Ulv1HrjeePhYfWgw8mTpZrL5kQhuLqy0WLdfH6nxMlFiezsh6-vWqbiJgLqXoGR1xd4XlccaqdzLl6O5g9ObsCr3UtR_" 
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Transient transcript preview if listening and user hasn't typed anything yet */}
              {micActive && !userAnswer.trim() && (
                <div className="flex gap-3 items-start justify-end flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-teal-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0c9488] animate-ping"></span>
                  </div>
                  <div className="bg-[#0c9488]/15 border border-[#0c9488]/20 text-[#0c9488] p-3 rounded-xl rounded-tr-none max-w-[80%] mr-3">
                    <p className="text-sm italic font-sans animate-pulse">Listening... start talking now.</p>
                  </div>
                </div>
              )}

              {/* Real-time draft transcript displaying exact text being written while speaking */}
              {micActive && userAnswer.trim() && (
                <div className="flex gap-3 items-start justify-end flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 border border-teal-200 overflow-hidden">
                    <Mic className="w-3.5 h-3.5 text-[#0c9488] animate-pulse" />
                  </div>
                  <div className="bg-[#0c9488]/10 border border-[#0c9488]/20 text-slate-800 p-3 rounded-xl rounded-tr-none max-w-[80%] mr-3 relative shadow-xs">
                    <p className="text-sm font-sans leading-relaxed text-slate-800 italic pr-4">
                      {userAnswer}
                      <span className="inline-block w-1.5 h-4 bg-[#0c9488] ml-1 animate-pulse">|</span>
                    </p>
                    <div className="text-[10px] text-teal-700 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0c9488] animate-ping"></span>
                      Voice Transcript Preview
                    </div>
                  </div>
                </div>
              )}

              {/* Loading AI feedback loader */}
              {submittingAnswer && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs uppercase animate-pulse select-none">
                    AI
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl rounded-tl-none max-w-[80%] flex items-center gap-2">
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-[#0c9488] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-[#0c9488] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-[#0c9488] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </span>
                    <span className="text-xs text-slate-500 font-bold">Evaluating response...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* User Response Interaction Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            {/* Hands-Free mode utility controller bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHandsFree(!handsFree)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                    handsFree 
                      ? "bg-teal-50 border-teal-200 text-teal-700 shadow-xs" 
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 shadow-xs hover:border-slate-300"
                  }`}
                  title="Persistent hands-free loop. 3 seconds of silence auto-submits answer."
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${handsFree ? "bg-[#0c9488] animate-ping" : "bg-slate-400"}`}></span>
                  Hands-Free Mode: <span className="uppercase">{handsFree ? "ON" : "OFF"}</span>
                </button>
                {handsFree && (
                  <span className="text-slate-400 font-semibold text-[10px]">
                    (Silent 3s auto-submits)
                  </span>
                )}
              </div>

              {silenceCountdown !== null && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Auto-submitting in {silenceCountdown}s...
                </div>
              )}
            </div>

            {/* Interaction Row Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                disabled={submittingAnswer}
                className={`flex-grow flex items-center justify-center gap-3 text-white px-5 py-3 rounded-full font-bold shadow-md hover:opacity-95 transition-all text-xs uppercase tracking-wider cursor-pointer select-none ${
                  micActive 
                    ? "bg-[#0c9488] ring-4 ring-teal-100 animate-pulse" 
                    : "bg-[#131b2e] hover:bg-[#1a253e]"
                }`}
              >
                <Mic className={`w-4 h-4 ${micActive ? "animate-bounce" : ""}`} />
                <span>{micActive ? "Recording Response Active" : "Activate Microphone to Speak"}</span>

                {micActive && (
                  <div className="flex items-center gap-0.5 ml-2">
                    {audioVisualizer.slice(0, 5).map((val, idx) => (
                      <div 
                        key={idx}
                        className="w-0.5 bg-white rounded-full transition-all duration-100"
                        style={{ height: `${Math.max(4, val / 2)}px` }}
                      ></div>
                    ))}
                  </div>
                )}
              </button>

              {/* Show/Hide Keyboard Input toggle */}
              <button 
                type="button"
                onClick={() => setShowTextInput(!showTextInput)}
                title="Toggle Keyboard Input Panel"
                className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all cursor-pointer ${
                  showTextInput 
                    ? "bg-teal-50 border-[#0c9488] text-[#0c9488]" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className="font-extrabold text-[10px] uppercase tracking-wide">KEY</span>
              </button>

              {/* Finish/End Session button */}
              <button 
                type="button"
                onClick={handleFinishSession}
                className="text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 text-xs font-bold pl-2 cursor-pointer uppercase tracking-wider font-sans"
              >
                <span>End Session</span>
              </button>
            </div>

            {/* Microphone diagnostic sandbox warnings & demo trigger */}
            {(!isPermissionGranted || speechError) && (
              <div className="text-slate-500 text-xs px-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-slate-200 pt-2.5 mt-1 animate-fade-in bg-slate-100/50 p-2 rounded-lg">
                <span className="font-semibold text-slate-500">
                  {speechError === "not-supported" 
                    ? "🎤 Mic access is restricted inside preview sandboxes." 
                    : "🎤 No active voice recording received."}
                </span>
                <button
                  type="button"
                  onClick={triggerDemoVoiceSimulation}
                  className="text-[#0c9488] hover:underline font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                  title="Force a simulation of spoken candidate content"
                >
                  ⚡ Trigger Demo Voice Simulation
                </button>
              </div>
            )}

            {/* Inline typing controller panel */}
            {(showTextInput || !micActive) && (
              <form onSubmit={handleSubmitAnswer} className="flex gap-2 items-center mt-1 animate-fade-in">
                <input 
                  id="answer-speaking-bar"
                  type="text"
                  disabled={submittingAnswer}
                  placeholder={micActive ? "Listening to your voice... Speak or make manual typing refinements..." : "Type your manual answer text here..."}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-grow bg-white border border-slate-200 focus:border-[#0c9488] focus:ring-1 focus:ring-[#0c9488] text-slate-900 px-4 py-2.5 rounded-lg outline-none text-sm transition-colors shadow-xs font-medium placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={submittingAnswer || !userAnswer.trim()}
                  className="p-3 bg-[#0c9488] hover:bg-[#0c9488]/95 text-white rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Live Feedback Panel (4 columns) */}
        <aside className="lg:col-span-4 bg-[#eceef0]/30 border-l border-slate-200 p-5 rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1 text-slate-900">
            <Zap className="w-4 h-4 text-[#0c9488] fill-current animate-pulse" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Live Feedback Loop</h2>
          </div>

          {/* Confidence Metric card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confidence Level</span>
              <span className="text-[11px] font-bold text-[#0c9488]">
                {liveConfidence !== null 
                  ? `${liveConfidence >= 85 ? "Excellent" : liveConfidence >= 70 ? "High" : liveConfidence >= 55 ? "Moderate" : "Low"} (${liveConfidence}%)` 
                  : "Waiting for response..."}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#0c9488] h-full rounded-full transition-all duration-1000" 
                style={{ width: `${liveConfidence || 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic leading-relaxed">
              {liveConfidence !== null 
                ? `"Your tone is steady and authoritative. Excellent vocal presence."` 
                : `"Speak response or type input to update interactive audio analysis estimates."`}
            </p>
          </div>

          {/* Keywords Identified card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Keywords Identified</span>
            {liveKeywords.length === 0 ? (
              <span className="text-xs text-slate-400 font-semibold block">Concepts will list here as you respond...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {liveKeywords.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-teal-50 text-[#0c9488] border border-teal-100 rounded text-[10px] font-mono font-bold animate-fade-in">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 p-2 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <p className="text-[11px] text-slate-500 font-medium">
                Recommendation: try to mention: <strong className="text-[#0c9488] font-bold">Quantifiable Impact</strong> or <strong className="text-[#0c9488] font-bold">Scalability</strong>.
              </p>
            </div>
          </div>

          {/* Speech Pace simulation chart */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Speech Pace</span>
              <span className="text-[11px] font-bold text-[#0c9488]">{livePace || "Steady / Optimal"}</span>
            </div>
            
            <div className="flex items-end justify-between h-10 px-1 pt-1">
              {audioVisualizer.slice(0, 10).map((val, i) => {
                const ht = Math.min(95, Math.max(15, (val * 2) + (i % 2 === 0 ? 12 : 28)));
                return (
                  <div 
                    key={i} 
                    className={`w-2 rounded-t-xs transition-all duration-300 ${i >= 3 && i <= 7 ? "bg-[#0c9488]" : "bg-slate-200"}`}
                    style={{ height: `${ht}%` }}
                  ></div>
                );
              })}
            </div>

            <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Slow</span>
              <span className="text-[#0c9488]">Optimal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* STAR Method Real-time guide card */}
          <div className="bg-[#131b2e] p-5 text-white rounded-xl shadow-md max-h-[380px] overflow-y-auto prose prose-invert prose-sm">
            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-700/50 pb-2">
              <Sparkles className="w-4 h-4 text-teal-350 text-teal-300 animate-pulse" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-300">STAR Copilot Guidance</h3>
            </div>
            {liveTip ? (
              <div className="text-xs font-sans text-slate-200 leading-relaxed space-y-2 markdown-body overflow-x-hidden">
                <Markdown>{liveTip}</Markdown>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">
                "Use the STAR framework (Situation, Task, Action, Result). State the exact constraint first, before jumping into technical highlights."
              </p>
            )}
          </div>
        </aside>
      </div>
    );
  }

  // Config View
  const listPastAts = analyses || [];

  return (
    <div className="space-y-6 animate-fade-in" id="interview-simulation-config">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-headline text-3xl text-slate-900 font-bold">Mock Resume Interview Prep</h1>
        <p className="text-slate-500 text-sm mt-1">
          Run high-fidelity interactive chat interview simulations matching your candidate resume profile and targeted job requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-md pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Simulator Configuration Settings
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Target Interview Role Position
            </label>
            <input 
              id="input-inter-role"
              type="text"
              placeholder="e.g. Senior Frontend Architect"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-605 focus:border-indigo-605 focus:border-indigo-600 text-slate-900 px-4 py-2.5 rounded-lg outline-none text-sm transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Target Job Description requirements
            </label>
            <textarea 
              id="input-inter-jd"
              rows={4}
              placeholder="Paste target job listing instructions details... (optional but highly recommended)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-600 text-slate-900 px-4 py-2.5 rounded-lg outline-none text-sm transition-all font-sans shadow-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Candidate Resume/Bio Context
            </label>
            <textarea 
              id="input-inter-resume"
              rows={4}
              placeholder="Paste your resume summary or background key experiences highlights here to let the AI Interviewer base questions on your background..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-600 text-slate-905 text-slate-900 px-4 py-2.5 rounded-lg outline-none text-sm transition-all font-sans shadow-sm"
            ></textarea>
          </div>

          {/* Intelligence Engine Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Intelligence Engine</h4>
                <p className="text-xs text-slate-400 mt-0.5">Choose the AI brain powering your recruiter simulation.</p>
              </div>
              <div className="flex bg-white p-1 rounded-lg border border-slate-200 self-start sm:self-center shadow-xs">
                <button
                  type="button"
                  onClick={() => setProvider("gemini")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    provider === "gemini"
                      ? "bg-indigo-50 text-indigo-700"
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
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Groq LLaMA-3.3
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              id="btn-trigger-mock-start"
              onClick={handleStartInterview}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-md hover:shadow-indigo-600/10 transform active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                "Building interactive co-pilot simulator..."
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Interview Prep
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Link logs bootstrap (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Import Past Scan Alignment</h4>
            {listPastAts.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">Perform a Resume Lab ATS scan first, and you can instantly import the target details with one-click setup here!</p>
            ) : (
              <div className="space-y-3">
                {listPastAts.map((a) => (
                  <div 
                    key={a.id}
                    onClick={() => handleSelectPastProfile(a)}
                    className="p-3 bg-slate-50 hover:bg-white hover:border-indigo-600 border border-slate-200 rounded cursor-pointer transition-colors text-xs text-slate-805 text-slate-800 shadow-sm"
                  >
                    <div className="font-extrabold text-sm text-indigo-600 truncate">{a.roleName}</div>
                    <div className="text-slate-450 text-slate-500 mt-2 flex justify-between font-bold text-[11px]">
                      <span>{a.companyName || "Acme"}</span>
                      <span className="text-emerald-600 font-extrabold">{a.atsScore}% Match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-50/40 border border-indigo-150 border-indigo-100 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Simulation Guidelines</h4>
            <ul className="text-xs text-slate-605 space-y-1.5 list-disc pl-4 leading-relaxed font-semibold">
              <li>Interactive recruitment engine models custom dialog based on targeting data.</li>
              <li>Toggle speech synth audio controls using the volume action.</li>
              <li>Simulate voice responses via the mic simulation logs.</li>
              <li><strong>Hands-Free Dialogue Loop:</strong> Shift "Hands-Free Mode" ON to enable automatic 3-second silence detector auto-submits, for seamless spoken-only interview practice.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
