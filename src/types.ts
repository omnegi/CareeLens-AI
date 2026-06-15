export interface Analysis {
  id: string;
  userId: string;
  roleName: string;
  companyName: string;
  jobDescription: string;
  resumeText: string;
  resumeFilename: string;
  atsScore: number;
  matchRateTechnical: number;
  matchRateExperience: number;
  matchRateEducation: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  gapsAndRecommendations: string;
  createdAt: string;
}

export interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export interface Interview {
  id: string;
  userId: string;
  roleName: string;
  jobDescription: string;
  resumeFilename?: string;
  score: number;
  status: "in-progress" | "completed" | "aborted";
  confidenceLevel: number;
  feedbackSummary: string;
  keywordsIdentified: string[];
  speechPaceWpm: number;
  chatHistory: ChatMessage[];
  createdAt: string;
}
