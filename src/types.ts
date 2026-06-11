export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
}

export interface SectionScores {
  experience: number;
  skills: number;
  education: number;
  formatting: number;
}

export interface ImprovementSuggestion {
  section: string;
  before: string;
  after: string;
  explanation: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  matchScore: number;
  summary: string;
  candidateInfo: CandidateInfo;
  sectionScores: SectionScores;
  keySkillsExtracted: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: ImprovementSuggestion[];
  atsBreakdown: string;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  jobDescriptionUsed: string;
  analysis: ResumeAnalysisResult;
}
