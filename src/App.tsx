import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Briefcase, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  RotateCcw, 
  FileText, 
  RefreshCw, 
  Award, 
  Info,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ResumeAnalysisResult, AnalysisHistoryItem } from "./types";
import AtsGauge from "./components/AtsGauge";
import ScoreBreakdown from "./components/ScoreBreakdown";
import BeforeAfterSuggestion from "./components/BeforeAfterSuggestion";
import ReportDownloader from "./components/ReportDownloader";
import ResumeHistory from "./components/ResumeHistory";

const LOADING_STEPS = [
  "Reading PDF binary data...",
  "Running optical text analysis on typography...",
  "Parsing candidate contact information...",
  "Evaluating statement visual format standards...",
  "Aligning experience timelines and metrics...",
  "Evaluating keyword coverage against requirements...",
  "Engaging CPRW consulting engines...",
  "Synthesizing high-impact before-and-after bullet points..."
];

export default function App() {
  // Configured states
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("ats_analysis_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        if (parsed.length > 0) {
          // Select most recent scan
          setAnalysis(parsed[0].analysis);
          setFile(new File([], parsed[0].fileName));
          setCurrentHistoryId(parsed[0].id);
          if (parsed[0].jobDescriptionUsed) {
            setJobDescription(parsed[0].jobDescriptionUsed);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load search history from localStorage", e);
    }
  }, []);

  // Update localStorage when history changes
  const saveHistoryToStorage = (newHistory: AnalysisHistoryItem[]) => {
    try {
      localStorage.setItem("ats_analysis_history", JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error("Failed to save history to storage", e);
    }
  };

  // Rotate loading steps for visual realism
  useEffect(() => {
    if (isLoading) {
      setLoadingStepIndex(0);
      loadingIntervalRef.current = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 3000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading]);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setError("Please upload a PDF file only. Scanners and text parsers require native vectors.");
      return;
    }
    // Limit to 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("The PDF exceeds the 5MB ceiling. Please compile a lighter draft.");
      return;
    }
    setFile(selectedFile);
  };

  // Submit file for server-side extraction and AI synthesis
  const handleAnalyze = async () => {
    if (!file) {
      setError("Please drop or browse a PDF resume document first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      // If mock file from loaded history is found without content, just select it
      if (file.size === 0 && currentHistoryId) {
        const matchingItem = history.find(h => h.id === currentHistoryId);
        if (matchingItem) {
          setAnalysis(matchingItem.analysis);
          setIsLoading(false);
          return;
        }
      }

      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const parsedErr = await response.json().catch(() => ({}));
        throw new Error(parsedErr.error || `HTTP error! status: ${response.status}`);
      }

      const reportData: ResumeAnalysisResult = await response.json();
      setAnalysis(reportData);

      // Save to History stack
      const newHistoryItem: AnalysisHistoryItem = {
        id: "hist_" + Date.now().toString(),
        timestamp: new Date().toISOString(),
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(0) + " KB",
        jobDescriptionUsed: jobDescription,
        analysis: reportData
      };

      const updatedHistory = [newHistoryItem, ...history.filter(h => h.fileName !== file.name)].slice(0, 30);
      saveHistoryToStorage(updatedHistory);
      setCurrentHistoryId(newHistoryItem.id);

    } catch (err: any) {
      console.error("Analysis failure:", err);
      setError(err.message || "An unexpected parser error occurred. Please verify your internet connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // History Interaction handlers
  const handleSelectHistory = (item: AnalysisHistoryItem) => {
    setError(null);
    // Construct a placeholder empty File representing it
    setFile(new File([], item.fileName));
    setJobDescription(item.jobDescriptionUsed || "");
    setAnalysis(item.analysis);
    setCurrentHistoryId(item.id);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistoryToStorage(updated);
    if (currentHistoryId === id) {
      setFile(null);
      setAnalysis(null);
      setJobDescription("");
      setCurrentHistoryId(null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to erase all previously generated and saved resume evaluations?")) {
      saveHistoryToStorage([]);
      setFile(null);
      setAnalysis(null);
      setJobDescription("");
      setCurrentHistoryId(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setAnalysis(null);
    setError(null);
    setCurrentHistoryId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-purple-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Main navigation header */}
      <header id="app-navbar" className="relative z-10 border-b border-slate-700 bg-slate-900/60 backdrop-blur-md sticky top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/10">
              AI
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display text-white">
                Resume<span className="text-sky-400">IQ</span> Pro
              </h1>
              <p className="text-xxs text-slate-400 font-medium tracking-wide">
                High-Density ATS Processing & Extraction Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Processing Engine</p>
              <p className="text-xs font-mono text-sky-400 font-semibold">v2.4.0-stable</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-sky-400 font-bold">
              IQ
            </div>
          </div>
        </div>
      </header>

      {/* Primary Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Control Column */}
        <section id="analyzer-input-column" className="lg:col-span-5 space-y-5 flex flex-col">
          
          {/* File + Requirement Dropzones */}
          <div className="glass p-5 rounded-2xl space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                  Source Documents
                </h2>
                {file && (
                  <button
                    onClick={handleReset}
                    className="text-xxs text-sky-400 hover:text-sky-300 font-semibold font-mono tracking-wide uppercase flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset App
                  </button>
                )}
              </div>

              {/* PDF Dropzone */}
              <div
                id="doc-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] ${
                  isDragging
                    ? "border-sky-400 bg-sky-950/20 shadow-lg shadow-sky-500/5 scale-[1.01]"
                    : file
                    ? "border-emerald-600/60 bg-emerald-950/5 hover:border-slate-600 hover:bg-slate-900/30"
                    : "border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/30"
                }`}
              >
                <input
                  type="file"
                  id="resume-file-picker"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl inline-block border border-sky-500/10">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <p className="text-xs font-bold text-white max-w-[220px] truncate">
                        {file.name}
                      </p>
                      <span className="badge bg-sky-500/20 text-sky-400">Parsed</span>
                    </div>
                    <p className="text-3xs text-slate-500 font-mono">
                      {file.size > 0 ? `Uploaded • ${(file.size / 1024).toFixed(0)} KB` : "Saved Record Loaded"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 group-hover:border-slate-700 transition-colors inline-block text-slate-400 group-hover:text-slate-350">
                      <Upload className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Drag & Drop PDF Resume or click to browse
                      </p>
                      <p className="text-3xs text-slate-500 mt-1">
                        Only standard Vector format PDF documents are valid (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Paste Job Description */}
              <div className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                    Target Job Description Matcher
                  </label>
                  {jobDescription && <span className="badge bg-emerald-500/20 text-emerald-400">Configured</span>}
                </div>
                <textarea
                  id="job-desc-textarea"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste core requirements here to run keyword optimization, missing term gap analyses, and relevance scoring..."
                  className="w-full h-28 text-xs p-3 bg-slate-950/85 border border-slate-800 rounded-lg focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 text-slate-300 placeholder-slate-600 font-sans resize-none scrollbar-thin"
                />
              </div>

              {/* Pipeline diagnostic panel */}
              <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/80">
                <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Active Extraction Components</h3>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <span className="status-dot bg-emerald-500"></span> OCR parser ready
                  </li>
                  <li className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <span className="status-dot bg-emerald-500"></span> NLP keyword filter
                  </li>
                  <li className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <span className="status-dot bg-emerald-500"></span> KPI metric tracker
                  </li>
                  <li className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <span className="status-dot bg-sky-500"></span> Parser pipeline active
                  </li>
                </ul>
              </div>
            </div>

            {/* General Call to action */}
            <div className="pt-2 space-y-2">
              {error && (
                <div className="flex gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs leading-normal">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="cta-analyze-button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:bg-slate-800 border border-sky-400/10 hover:border-sky-400/20 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 disabled:hover:shadow-none text-slate-100 font-bold rounded-xl text-sm transition-all duration-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Processing Extracted Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Re-Analyze Selection</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History persistence logger logs */}
          <div className="glass p-5 rounded-2xl">
            <ResumeHistory
              history={history}
              selectedId={currentHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />
          </div>
        </section>

        {/* Right Dashboard Results Column */}
        <section id="results-dashboard-column" className="lg:col-span-7 flex flex-col min-h-[500px]">
          
          <AnimatePresence mode="wait">
            
            {/* Loading stage tracker */}
            {isLoading && (
              <motion.div
                key="loading-tracker"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center glass rounded-2xl p-6 text-center min-h-[500px]"
              >
                <div className="relative mb-6">
                  {/* Outer animated ripple */}
                  <div className="absolute inset-0 bg-sky-500/10 rounded-full animate-ping scale-[1.3] opacity-30" />
                  <div className="p-5 bg-sky-605 bg-sky-600 text-white rounded-3xl relative z-10">
                    <RefreshCw className="w-10 h-10 animate-spin" />
                  </div>
                </div>

                <h3 className="text-lg font-bold font-display text-white">
                  Scanning Compliance Profiles
                </h3>
                
                {/* Dynamically rotating sub-text step progress */}
                <div className="mt-4 max-w-sm h-6 overflow-hidden relative">
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={loadingStepIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="text-xs font-mono text-sky-450 text-sky-400 font-semibold uppercase tracking-wider"
                    >
                      {LOADING_STEPS[loadingStepIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                <p className="text-xxs text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Our algorithm extracts syntactic vectors, cross-checks semantic context parameters, and performs rigorous structural compatibility checks.
                </p>
              </motion.div>
            )}

            {/* Extracted diagnostic results view */}
            {analysis && !isLoading && (
              <motion.div
                key="analysis-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Top Profile Summary Card */}
                <div className="p-6 glass rounded-2xl shadow-lg border-slate-700/60">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-750 pb-5 mb-5">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-xxs font-extrabold text-sky-400 tracking-widest uppercase font-mono bg-sky-500/10 px-2.5 py-0.5 rounded">
                        Extracted Profile
                      </span>
                      <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2 truncate">
                        <User className="w-5 h-5 text-sky-400 flex-shrink-0" />
                        {analysis.candidateInfo.name || "Unknown Candidate"}
                      </h2>
                      <p className="text-xs text-sky-300 font-medium italic truncate">
                        {analysis.candidateInfo.currentTitle || "Title Undetected / General Profile"}
                      </p>
                    </div>

                    {/* Simple metadata info badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {analysis.candidateInfo.email && analysis.candidateInfo.email !== "Unknown" && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-900/60 px-2 py-1 rounded border border-slate-700" title={analysis.candidateInfo.email}>
                          <Mail className="w-3 h-3 text-sky-400" />
                          <span className="truncate max-w-[130px]">{analysis.candidateInfo.email}</span>
                        </span>
                      )}
                      {analysis.candidateInfo.phone && analysis.candidateInfo.phone !== "Unknown" && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-900/60 px-2 py-1 rounded border border-slate-700">
                          <Phone className="w-3 h-3 text-sky-400" />
                          {analysis.candidateInfo.phone}
                        </span>
                      )}
                      {analysis.candidateInfo.location && analysis.candidateInfo.location !== "Unknown" && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-900/60 px-2 py-1 rounded border border-slate-700">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          {analysis.candidateInfo.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-sky-400" /> Executive CPRW Assessment
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{analysis.summary}"
                    </p>
                  </div>
                </div>

                {/* Score Dial gauges segment */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <AtsGauge score={analysis.atsScore} label="ATS Optimization Score" />
                  {jobDescription ? (
                    <AtsGauge score={analysis.matchScore} label="Role Match Compatibility" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 glass rounded-2xl text-center border-dashed">
                      <Briefcase className="w-7 h-7 text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-400">Match Compatibility Disabled</p>
                      <p className="text-[10px] text-slate-500 max-w-[170px] mt-1 leading-normal mx-auto">
                        Provide a job requirements profile to run vector keyword coverage assessments.
                      </p>
                    </div>
                  )}
                </div>

                {/* Categories scores breakdown panel */}
                <div className="p-5 glass rounded-2xl">
                  <ScoreBreakdown scores={analysis.sectionScores} />
                </div>

                {/* extracted skills keyword pills */}
                <div className="p-5 glass rounded-2xl space-y-4">
                  
                  {/* Extracted Core resume skills */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                      Extracted Resume Core Skills ({analysis.keySkillsExtracted?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keySkillsExtracted?.length > 0 ? (
                        analysis.keySkillsExtracted.map((skill, idx) => (
                          <span key={idx} className="text-xxs px-2.5 py-1 bg-slate-950 text-sky-305 text-sky-300 font-semibold border border-sky-500/10 rounded-md">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xxs text-slate-500 font-mono">No specific technical tags detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Keyword alignment audits if Job description is supplied */}
                  {jobDescription && (
                    <div className="border-t border-slate-700/50 pt-4 grid sm:grid-cols-2 gap-4">
                      {/* Matched Keywords */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Matched Job Keywords ({analysis.matchedKeywords?.length || 0})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.matchedKeywords?.length > 0 ? (
                            analysis.matchedKeywords.map((tag, idx) => (
                              <span key={idx} className="text-3xs px-2 py-0.5 bg-emerald-550/10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded font-mono font-semibold">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <p className="text-3xs text-slate-500 italic mt-1 font-mono">No active matches identified.</p>
                          )}
                        </div>
                      </div>

                      {/* Missing Keywords */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          Missing Job Keywords ({analysis.missingKeywords?.length || 0})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.missingKeywords?.length > 0 ? (
                            analysis.missingKeywords.map((tag, idx) => (
                              <span key={idx} className="text-3xs px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-450 text-rose-400 rounded font-mono font-semibold animate-pulse">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <p className="text-3xs text-emerald-400 font-mono mt-1">Excellent! Maximum keyword coverage reached.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Strengths & weaknesses */}
                <div className="grid sm:grid-cols-2 gap-4">
                  
                  {/* Strengths list */}
                  <div className="p-5 glass rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Principal Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths?.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                          <span className="text-emerald-500 font-bold mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      )) || <p className="text-xs text-slate-500">None identified</p>}
                    </ul>
                  </div>

                  {/* Liabilities list */}
                  <div className="p-5 glass rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Formatting & Content Risks
                    </h4>
                    <ul className="space-y-2">
                      {analysis.weaknesses?.map((weak, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                          <span className="text-amber-500 font-bold mt-0.5">•</span>
                          <span>{weak}</span>
                        </li>
                      )) || <p className="text-xs text-slate-500">None identified</p>}
                    </ul>
                  </div>

                </div>

                {/* Professional Bullet Point Suggestions */}
                <div className="p-5 glass rounded-2xl">
                  <BeforeAfterSuggestion suggestions={analysis.improvementSuggestions} />
                </div>

                {/* Technical diagnostics statement log */}
                <div className="p-5 glass rounded-2xl space-y-3 text-slate-300">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 font-display">
                    <Info className="w-4 h-4 text-sky-400" /> ATS Machine Parsing Insights
                  </h4>
                  <p className="text-xxs leading-relaxed font-mono whitespace-pre-line text-slate-300 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                    {analysis.atsBreakdown}
                  </p>
                </div>

                {/* Download report panel */}
                <ReportDownloader fileName={file?.name || "Resume_Review.pdf"} analysis={analysis} />

              </motion.div>
            )}

            {/* Inactive introductory dashboard view */}
            {!analysis && !isLoading && (
              <motion.div
                key="dashboard-intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-center glass rounded-2xl p-6 sm:p-8 min-h-[500px]"
              >
                {/* Intro Hero Header */}
                <div className="max-w-md mx-auto text-center space-y-3">
                  <div className="inline-block p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-1">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold font-display text-white tracking-tight leading-tight">
                    Optimize Your ATS Compliance Profile
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Modern Applicant Tracking Systems (ATS) reject up to 75% of submissions due to bad encoding formats and keyword voids. Our certified processing engine scans vector text blocks instantly.
                  </p>
                </div>

                {/* Feature Grid illustration */}
                <div className="grid sm:grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                    <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      ATS compliance index
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Calculates parsing success, contact field validity, and structural compliance out of 100 points.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                    <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Role compatibility matrix
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Identifies missing terms in target job descriptions to boost indexing scores instantly.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                    <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-405 bg-amber-400" />
                      CPRW bullet optimization
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Provides realistic and contextually tailored replacement action bullet points with clear metric equations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                    <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Printable multi-formats
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Save complete compliance results in print-ready HTML, flat text files, or raw JSON structures.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* Footer copyright */}
      <footer id="app-footer" className="relative z-10 border-t border-slate-700 py-4 mt-8 bg-slate-900/80 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>System State: Operational</div>
          <div className="flex gap-6">
            <span>API Latency: 124ms</span>
            <span>Tokens Used: ~1.4k</span>
            <span>Session: #AZ-992</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
