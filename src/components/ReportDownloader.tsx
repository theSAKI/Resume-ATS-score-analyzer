import { Download, FileText, Code, Globe2 } from "lucide-react";
import { ResumeAnalysisResult } from "../types";

interface ReportDownloaderProps {
  fileName: string;
  analysis: ResumeAnalysisResult;
}

export default function ReportDownloader({ fileName, analysis }: ReportDownloaderProps) {
  
  // Format report as dynamic Plain Text
  const handleDownloadText = () => {
    let reportDoc = `=====================================================
          AI RESUME ANALYZER DIAGNOSTIC REPORT
=====================================================
Target File: ${fileName}
Parsed Candidate: ${analysis.candidateInfo.name || "Unknown"}
Email: ${analysis.candidateInfo.email || "Unknown"}
Phone: ${analysis.candidateInfo.phone || "Unknown"}
Location: ${analysis.candidateInfo.location || "Unknown"}
Headline/Title: ${analysis.candidateInfo.currentTitle || "N/A"}

-----------------------------------------------------
SCORING BREAKDOWN
-----------------------------------------------------
Overall ATS Score: ${analysis.atsScore}/100
Job Description Match Score: ${analysis.matchScore > 0 ? analysis.matchScore + "%" : "Not measured (No job description supplied)"}

Section Sub-Scores:
 - Work Experience: ${analysis.sectionScores.experience}/100
 - Keyword Compatibility: ${analysis.sectionScores.skills}/100
 - Education completeness: ${analysis.sectionScores.education}/100
 - Layout & Formatting: ${analysis.sectionScores.formatting}/100

-----------------------------------------------------
PROFILE SUMMARY
-----------------------------------------------------
${analysis.summary}

-----------------------------------------------------
EXTRACTED PRIMARY KEYWORDS & SKILLS
-----------------------------------------------------
${analysis.keySkillsExtracted?.join(", ") || "None"}

-----------------------------------------------------
KEYWORD GAP ANALYSIS
-----------------------------------------------------
Matched Keywords: ${analysis.matchedKeywords?.join(", ") || "None"}
Missing Keywords: ${analysis.missingKeywords?.join(", ") || "None"}

-----------------------------------------------------
STRENGTHS
-----------------------------------------------------
${analysis.strengths?.map((s) => `[+] ${s}`).join("\n") || "None listed"}

-----------------------------------------------------
AREAS FOR IMPROVEMENT
-----------------------------------------------------
${analysis.weaknesses?.map((w) => `[-] ${w}`).join("\n") || "None listed"}

-----------------------------------------------------
PROFESSIONAL BULLET POINT IMPROVEMENTS
-----------------------------------------------------
${
  analysis.improvementSuggestions?.map((s, idx) => `
Suggestion #${idx + 1} (${s.section})
- [BEFORE] ${s.before}
- [AFTER]  ${s.after}
- [STRATEGY] ${s.explanation}
`).join("\n") || "None provided"
}

-----------------------------------------------------
ATS PARSING REMARKS
-----------------------------------------------------
${analysis.atsBreakdown}

Generated via AI Resume Analyzer on ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([reportDoc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ATS_Analysis_Report_${analysis.candidateInfo.name.replace(/\s+/g, "_") || "Candidate"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format report as Printable HTML
  const handleDownloadHtml = () => {
    let suggestionsHtml = analysis.improvementSuggestions?.map((s, idx) => `
      <div class="suggestion-card">
        <div class="section-tag">${s.section}</div>
        <div class="bullet-grid">
          <div class="before-box"><strong>Original:</strong> <span class="strike">"${s.before}"</span></div>
          <div class="after-box"><strong>ATS Polished:</strong> <span class="highlight">"${s.after}"</span></div>
        </div>
        <p class="explanation"><strong>ATS Strategy:</strong> ${s.explanation}</p>
      </div>
    `).join("") || "<p>No current changes advised.</p>";

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ATS Optimization Diagnostic - ${analysis.candidateInfo.name || "Candidate"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 40px; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; mb: 30px; }
    .title { font-weight: 800; font-size: 28px; margin: 0; color: #0f172a; }
    .subtitle { color: #64748b; font-size: 14px; margin: 5px 0 0 0; }
    .badge-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 30px 0; }
    .badge { border: 1px solid #cbd5e1; background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
    .badge-num { font-size: 32px; font-weight: 800; color: #4f46e5; margin: 0; }
    .badge-label { text-transform: uppercase; font-size: 10px; font-weight: 700; tracking: 1px; color: #64748b; margin-top: 5px; }
    .info-pane { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { font-size: 13px; }
    h2 { border-left: 4px solid #4f46e5; padding-left: 10px; font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #0f172a; }
    .list-flex { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { background: #e0e7ff; color: #4338ca; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; }
    .pill-missing { background: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; }
    .suggestion-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background: #ffffff; margin-bottom: 20px; }
    .section-tag { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .bullet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 12px; }
    .before-box { font-size: 13px; border: 1px solid #fecaca; background: #fef2f2; padding: 12px; border-radius: 6px; }
    .after-box { font-size: 13px; border: 1px solid #a7f3d0; background: #ecfdf5; padding: 12px; border-radius: 6px; }
    .strike { text-decoration: line-through; color: #991b1b; }
    .highlight { font-weight: 700; color: #065f46; }
    .explanation { font-size: 13px; margin: 0; background: #f8fafc; padding: 10px; border-radius: 4px; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    @media print {
      body { padding: 0; background: #fff; }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">ATS COMPLIANCE CLINICAL SUMMARY</h1>
      <p class="subtitle">Personalized Optimization Diagnostic Report</p>
    </div>

    <div class="info-pane">
      <div class="info-item"><strong>Applicant:</strong> ${analysis.candidateInfo.name || "Unknown"}</div>
      <div class="info-item"><strong>Target Title:</strong> ${analysis.candidateInfo.currentTitle || "N/A"}</div>
      <div class="info-item"><strong>Email:</strong> ${analysis.candidateInfo.email || "Unknown"}</div>
      <div class="info-item"><strong>Contact:</strong> ${analysis.candidateInfo.phone || "Unknown"}</div>
      <div class="info-item"><strong>Location:</strong> ${analysis.candidateInfo.location || "Unknown"}</div>
      <div class="info-item"><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="badge-grid">
      <div class="badge">
        <p class="badge-num">${analysis.atsScore}</p>
        <p class="badge-label">Overall ATS Score</p>
      </div>
      <div class="badge">
        <p class="badge-num">${analysis.matchScore > 0 ? analysis.matchScore + "%" : "N/A"}</p>
        <p class="badge-label">Job Description Match</p>
      </div>
    </div>

    <h2>Executive Executive Assessment</h2>
    <p style="font-size: 14px; color: #334155;">${analysis.summary}</p>

    <h2>Primary Extracted Tech Stack & Skills</h2>
    <div class="list-flex">
      ${analysis.keySkillsExtracted?.map((s) => `<span class="pill">${s}</span>`).join("") || "None detected"}
    </div>

    <h2>Job Keyword Gap Analysis</h2>
    <h3 style="font-size:13px; margin-bottom:5px;">Matched Terms</h3>
    <div class="list-flex" style="margin-bottom: 15px;">
      ${analysis.matchedKeywords?.map((s) => `<span class="pill">${s}</span>`).join("") || "None"}
    </div>
    <h3 style="font-size:13px; margin-bottom:5px; color:#b91c1c;">Missing/Recommended Keywords</h3>
    <div class="list-flex">
      ${analysis.missingKeywords?.map((s) => `<span class="pill-missing">${s}</span>`).join("") || "None"}
    </div>

    <h2>Strengths Identified</h2>
    <ul style="font-size: 14px; margin-left: 20px;">
      ${analysis.strengths?.map((s) => `<li>${s}</li>`).join("") || "<li>None</li>"}
    </ul>

    <h2>Resume Weaknesses / Formatting Risks</h2>
    <ul style="font-size: 14px; margin-left: 20px;">
      ${analysis.weaknesses?.map((w) => `<li>${w}</li>`).join("") || "<li>None</li>"}
    </ul>

    <h2>Impact-Driven Resume Improvement Suggestions</h2>
    ${suggestionsHtml}

    <h2>Diagnostic Technical Findings</h2>
    <p style="font-size: 13px; white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 6px; border:1px solid #e2e8f0;">${analysis.atsBreakdown}</p>

    <div class="footer">
      Generated automatically by AI Resume Analyzer. Formatted for immediate search crawler indexing.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ATS_Optimization_Report_${analysis.candidateInfo.name.replace(/\s+/g, "_") || "Candidate"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format report as structured JSON
  const handleDownloadJson = () => {
    const jsonContent = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ATS_Diagnostic_Data_${analysis.candidateInfo.name.replace(/\s+/g, "_") || "Candidate"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate and print high-fidelity PDF report vector layout
  const handleDownloadPdf = () => {
    const suggestionsHtml = analysis.improvementSuggestions?.map((s, idx) => `
      <div class="suggestion-card">
        <div class="section-tag">${s.section}</div>
        <div class="bullet-grid">
          <div class="before-box"><strong>Original:</strong> <span class="strike">"${s.before}"</span></div>
          <div class="after-box"><strong>ATS Polished:</strong> <span class="highlight">"${s.after}"</span></div>
        </div>
        <p class="explanation"><strong>ATS Strategy:</strong> ${s.explanation}</p>
      </div>
    `).join("") || "<p>No current changes advised.</p>";

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ATS Optimization Diagnostic - ${analysis.candidateInfo.name || "Candidate"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff; margin: 0; padding: 20px; line-height: 1.5; font-size: 13px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border: none; padding: 10px; }
    .header { border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-weight: 800; font-size: 22px; margin: 0; color: #0f172a; text-transform: uppercase; tracking: -0.5px; }
    .subtitle { color: #64748b; font-size: 12px; margin: 4px 0 0 0; font-weight: 500; }
    .badge-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .badge { border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px 15px; border-radius: 6px; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge-num { font-size: 26px; font-weight: 800; color: #0284c7; margin: 0; line-height: 1; }
    .badge-label { text-transform: uppercase; font-size: 9px; font-weight: 700; tracking: 0.5px; color: #475569; margin-top: 4px; }
    .info-pane { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .info-item { font-size: 11px; color: #334155; }
    h2 { border-left: 3px solid #0284c7; padding-left: 8px; font-size: 14px; margin-top: 25px; margin-bottom: 10px; color: #0f172a; text-transform: uppercase; font-weight: 700; }
    .list-flex { display: flex; flex-wrap: wrap; gap: 6px; }
    .pill { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pill-skill { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pill-missing { background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .suggestion-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; background: #ffffff; margin-bottom: 15px; page-break-inside: avoid; }
    .section-tag { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1px 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .bullet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
    .before-box { font-size: 11px; border: 1px solid #fecaca; background: #fff5f5; padding: 8px; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .after-box { font-size: 11px; border: 1px solid #a7f3d0; background: #f0fdf4; padding: 8px; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .strike { text-decoration: line-through; color: #991b1b; }
    .highlight { font-weight: 700; color: #166534; }
    .explanation { font-size: 11px; margin: 0; background: #f8fafc; padding: 8px; border-radius: 4px; color: #475569; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    ul { padding-left: 15px; margin: 5px 0; }
    li { font-size: 12px; color: #334155; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Resume ATS Audit Report</h1>
        <p class="subtitle">Systematic scoring, extraction index & keyword coverage analysis</p>
      </div>
      <div style="font-size: 10px; color: #64748b; font-family: monospace;">CODE: ${analysis.atsScore}-${analysis.matchScore > 0 ? analysis.matchScore : 'GEN'}</div>
    </div>

    <div class="info-pane">
      <div class="info-item"><strong>Applicant Name:</strong> ${analysis.candidateInfo.name || "Unknown Candidate"}</div>
      <div class="info-item"><strong>Target Job Title:</strong> ${analysis.candidateInfo.currentTitle || "General Profile"}</div>
      <div class="info-item"><strong>Email Address:</strong> ${analysis.candidateInfo.email || "Unknown"}</div>
      <div class="info-item"><strong>Contact Number:</strong> ${analysis.candidateInfo.phone || "Unknown"}</div>
      <div class="info-item"><strong>Location Basis:</strong> ${analysis.candidateInfo.location || "Unknown"}</div>
      <div class="info-item"><strong>Evaluation Date:</strong> ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

    <div class="badge-grid">
      <div class="badge">
        <p class="badge-num">${analysis.atsScore}/100</p>
        <p class="badge-label">Overall ATS Score</p>
      </div>
      <div class="badge">
        <p class="badge-num">${analysis.matchScore > 0 ? analysis.matchScore + "%" : "N/A"}</p>
        <p class="badge-label">Role Keyword Compatibility</p>
      </div>
    </div>

    <h2>Executive Overview Assessment</h2>
    <p style="font-size: 12px; color: #334155; line-height: 1.6; margin: 0 0 15px 0;">${analysis.summary}</p>

    <h2>Section Sub-scores Diagnostics</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
      <div class="badge" style="padding: 10px 5px;">
        <strong style="font-size: 15px; color: #0284c7;">${analysis.sectionScores.experience}%</strong>
        <div style="font-size: 8px; color: #64748b; text-transform: uppercase; margin-top: 2px;">Experience Matrix</div>
      </div>
      <div class="badge" style="padding: 10px 5px;">
        <strong style="font-size: 15px; color: #10b981;">${analysis.sectionScores.skills}%</strong>
        <div style="font-size: 8px; color: #64748b; text-transform: uppercase; margin-top: 2px;">Skills Compliance</div>
      </div>
      <div class="badge" style="padding: 10px 5px;">
        <strong style="font-size: 15px; color: #0284c7;">${analysis.sectionScores.education}%</strong>
        <div style="font-size: 8px; color: #64748b; text-transform: uppercase; margin-top: 2px;">Education Depth</div>
      </div>
      <div class="badge" style="padding: 10px 5px;">
        <strong style="font-size: 15px; color: #0284c7;">${analysis.sectionScores.formatting}%</strong>
        <div style="font-size: 8px; color: #64748b; text-transform: uppercase; margin-top: 2px;">Structure/Layout</div>
      </div>
    </div>

    <h2>Extracted Core Skills Index</h2>
    <div class="list-flex" style="margin-bottom: 15px;">
      ${analysis.keySkillsExtracted?.map((s) => `<span class="pill-skill">${s}</span>`).join("") || "None detected"}
    </div>

    ${analysis.matchedKeywords?.length > 0 || analysis.missingKeywords?.length > 0 ? `
    <h2>Keyword Gap Audit</h2>
    ${analysis.matchedKeywords?.length > 0 ? `
      <div style="margin-bottom: 10px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #166534; margin-bottom: 4px;">Matched Keywords (${analysis.matchedKeywords.length})</div>
        <div class="list-flex">
          ${analysis.matchedKeywords.map((s) => `<span class="pill">${s}</span>`).join("")}
        </div>
      </div>
    ` : ''}
    ${analysis.missingKeywords?.length > 0 ? `
      <div>
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9f1239; margin-bottom: 4px;">Missing Recommended Keywords (${analysis.missingKeywords.length})</div>
        <div class="list-flex">
          ${analysis.missingKeywords.map((s) => `<span class="pill-missing">${s}</span>`).join("")}
        </div>
      </div>
    ` : ''}
    ` : ''}

    <h2>Identified Record Strengths</h2>
    <ul>
      ${analysis.strengths?.map((s) => `<li>${s}</li>`).join("") || "<li>No major compliance errors detected.</li>"}
    </ul>

    <h2>Formatting Liabilities & Structure Risks</h2>
    <ul>
      ${analysis.weaknesses?.map((w) => `<li>${w}</li>`).join("") || "<li>No major visual parser blocks detected.</li>"}
    </ul>

    <div style="page-break-before: always;"></div>

    <h2>Professional Action Bullet Point Enhancements</h2>
    ${suggestionsHtml}

    <h2 style="margin-top: 25px;">ATS Machine Parsing Log Insights</h2>
    <p style="font-size: 10px; font-family: monospace; white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #cbd5e1; color: #475569; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact;">${analysis.atsBreakdown}</p>

    <div class="footer">
      Generated automatically by ResumeIQ Pro ATS Analyzer. For professional physical and electronic submissions.
    </div>
  </div>
</body>
</html>`;

    // Create an invisible iframe to write and run browser print command
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (printError) {
          console.error("Iframe printing failed, fallback to direct print window", printError);
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 3000);
        }
      }, 600);
    }
  };

  return (
    <div id="report-downloader" className="mt-6 p-5 bg-slate-950/60 rounded-2xl border border-sky-500/10">
      <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
        <Download className="w-4 h-4 text-sky-400" />
        Export Evaluation Reports
      </h4>
      <p className="text-xxs text-slate-400 leading-relaxed mb-4">
        Save the complete evaluation in your preferred document style. The PDF format delivers a high-fidelity vector layout that is printer-ready and fully optimized for local recordkeeping.
      </p>

      <div className="space-y-3.5">
        <button
          onClick={handleDownloadPdf}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-505 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md outline-none"
        >
          <Download className="w-4 h-4" />
          Download PDF Audit Report
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadHtml}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-700/50 rounded-lg text-xxs transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            Save HTML Page
          </button>

          <button
            onClick={handleDownloadText}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-700/50 rounded-lg text-xxs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Plain Text File
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-300 rounded-lg text-xxs transition-colors border border-slate-700/50"
            title="Export Raw JSON"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            Raw JSON
          </button>
        </div>
      </div>
    </div>
  );
}
