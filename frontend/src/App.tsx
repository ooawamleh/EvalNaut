import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import FinalSummary from './components/FinalEvaluation';
import EvaluationForm from "./components/EvaluationForm"; 
import ProgressSidebar from './components/ProgressSidebar';
import ViewTurnModal from "./components/ViewTurnModal"; 
import ViewConfigModal from "./components/ViewConfigModal";

const MAX_TURNS = 5;

type FailureMode = "course_correction" | "instruction_retention" | "task_continuation";
type Intent =
  | "informational"
  | "discovery"
  | "writing_tasks"
  | "skill_acquisition"
  | "reasoning_exercise"
  | "personal_advice_seeking" 
  | "coding"; 

const intentCategories = {
  informational: ["Factual Queries", "Concept Explanation", "General Conversation", "Biography", "Other"],
  discovery: ["Experiences", "Entertainment", "Other"],
  writing_tasks: ["Editing & Proofreading", "Summarizing", "Translation", "E-mail writing", "Other"],
  skill_acquisition: ["Language Learning", "Translation", "Other"],
  reasoning_exercise: ["Logic and Reasoning Problems", "Exam & Quiz Answering", "Maths & Physics problems", "Other"],
  personal_advice_seeking: ["Symptom Checking & Medical Advice", "Tax Advice", "Legal Advice", "Parenting Advice, etc.", "Other"],
  coding: ["Code Generation", "Code Understanding", "Code Testing", "Code Debugging", "Other"],
};

// --- NEW: Helper for Failure Mode Descriptions ---
const failureModeDescriptions = {
  course_correction: "Use underspecified prompts throughout the entire intent scenario.",
  instruction_retention: "Avoid underspecified prompts. Use clearer prompts throughout the intent scenario.",
  task_continuation: "After you've established a clear context, use underspecified prompts."
};
// --- END NEW HELPER ---

const s = {
  page: { 
    maxWidth: 1400,
    margin: "28px auto", 
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", 
    padding: 16,
    display: 'grid', 
    gridTemplateColumns: '280px 1fr',
    gap: '20px',
  },
  card: { border: "1px solid #d1fae5", borderRadius: 12, padding: 16, marginBottom: 20, background: "#f0fdf4" },
  summaryCard: { border: "1px solid #10b981", borderRadius: 12, padding: 16, marginTop: 20, background: "#ecfdf5" },
  checklistCard: { border: "1px solid #fbbf24", borderRadius: 12, padding: 16, marginTop: 16, background: "#fffbeb" },
  h1: { fontSize: 28, fontWeight: 800, marginBottom: 10, color: "#065f46" },
  textarea: { width: "100%", minHeight: 90, padding: 10, borderRadius: 8, border: "1px solid #d1fae5", background: "#ffffff", fontSize: 14 },
  button: { padding: "8px 14px", borderRadius: 6, border: "none", backgroundColor: "#10b981", color: "white", fontWeight: 600, cursor: "pointer", marginTop: 10 },
  buttonDisabled: { padding: "8px 14px", borderRadius: 6, border: "none", backgroundColor: "#9ca3af", color: "white", fontWeight: 600, cursor: "not-allowed", marginTop: 10 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  modelBox: { minHeight: 80, padding: 10, borderRadius: 8, border: "1px solid #34d399", background: "#ffffff", whiteSpace: "pre-wrap", fontSize: 14 },
  label: { display: "block", fontWeight: 600, marginBottom: 6, color: "#065f46" },
  select: { padding: "8px 12px", borderRadius: 6, border: "1px solid #d1fae5", width: "100%", background: "#ffffff" },
  input: { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1fae5", background: "#ffffff", fontSize: 14 },
  nudgeButton: { padding: "4px 8px", borderRadius: 4, border: "none", backgroundColor: "#f59e0b", color: "white", fontWeight: 500, cursor: "pointer", marginTop: 0, marginBottom: 4, fontSize: 12 },
  nudgeBox: { marginTop: 12, border: "1px solid #fbbf24", borderRadius: 8, padding: 12, background: "#fffbeb" },
  nudgeResponseBox: { minHeight: 60, padding: 10, borderRadius: 8, border: "1px solid #f59e0b", background: "#ffffff", whiteSpace: "pre-wrap", fontSize: 14, marginTop: 10 },
  evaluationHeader: { fontWeight: 700, fontSize: 16, cursor: 'pointer', background: "#d9f0e0", padding: 8, borderRadius: 6, marginTop: 12, userSelect: 'none' as React.CSSProperties['userSelect'], },
  evaluationContent: { padding: 10, display: 'flex', flexDirection: 'column' as 'column', gap: 10, background: "#e6f6e9", borderRadius: 6, marginTop: 6 },
  checklistButton: { padding: "6px 12px", borderRadius: 6, border: "none", backgroundColor: "#a3e4b0", color: "#065f46", fontWeight: 600, cursor: "pointer", marginTop: 8 },
  optionDescription: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '4px 0 0 4px', // Adjusted padding
    marginTop: '4px', // Added margin top
  }
};

interface Evaluation {
  selectedModel: string;
  failures: { A: boolean; B: boolean };
  betterResponses: { A: string; B: string };
  comment: string;
  ratings: { A: string; B: string };
}

export default function App() {
  const [step, setStep] = useState<"opening" | "conversation">("opening");

  const [failureMode, setFailureMode] = useState<FailureMode>("course_correction");
  const [intent, setIntent] = useState<Intent>("informational"); 
  const [subCategory, setSubCategory] = useState(intentCategories[intent][0]);

  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [userPromptConfirmed, setUserPromptConfirmed] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(1);

  const [historyWeak, setHistoryWeak] = useState<{ user_prompt: string; model_response: string }[]>([]);
  const [historyStrong, setHistoryStrong] = useState<{ user_prompt: string; model_response: string }[]>([]);

  const [modelResponses, setModelResponses] = useState({ weak: "", strong: "" });
  const [generating, setGenerating] = useState(false);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showEvaluation, setShowEvaluation] = useState(false); 

  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation>({
    selectedModel: "",
    failures: { A: false, B: false },
    betterResponses: { A: "", B: "" },
    comment: "",
    ratings: { A: "", B: "" },
  });

  const [showChecklist, setShowChecklist] = useState(false);

  const [showNudgeBox, setShowNudgeBox] = useState(false);
  const [nudgeInput, setNudgeInput] = useState("");
  const [nudgeResponse, setNudgeResponse] = useState("");
  const [nudgeLoading, setNudgeLoading] = useState(false);

  const [evaluationExpanded, setEvaluationExpanded] = useState(false);
  const [viewingTurn, setViewingTurn] = useState<number | null>(null);
  const [viewingConfig, setViewingConfig] = useState(false);

  /** ----------------- Validation ----------------- */
  const getChecklist = () => [
    { label: "System prompt is provided", valid: systemPrompt.trim() !== "" },
    { label: "User prompt is provided", valid: userPrompt.trim() !== "" },
    { label: "User prompt confirmed", valid: userPromptConfirmed },
    { label: "Model A response generated", valid: modelResponses.weak !== "" },
    { label: "Model B response generated", valid: modelResponses.strong !== "" },
    { label: "Model selected to continue", valid: currentEvaluation.selectedModel !== "" },
    { label: "Failure comment provided (if failures tagged)", valid: (currentEvaluation.failures.A || currentEvaluation.failures.B) ? currentEvaluation.comment.trim() !== "" : true },
    { label: "Rating for Model A selected", valid: currentEvaluation.ratings.A !== "" },
    { label: "Rating for Model B selected", valid: currentEvaluation.ratings.B !== "" },
  ];

  const isChecklistValid = () => getChecklist().every(c => c.valid);

  /** ----------------- Handlers ----------------- */
  const handleStartConversation = () => {
    if (!systemPrompt.trim()) return alert("System prompt is required!");
    setStep("conversation");
  };

  const handleSaveConfig = (newConfig: {
    failureMode: FailureMode,
    intent: Intent,
    subCategory: string, 
  }) => {
    setFailureMode(newConfig.failureMode);
    setIntent(newConfig.intent);
    setSubCategory(newConfig.subCategory); 
    setViewingConfig(false);
    alert("Configuration updated. It will be used for the *next* turn.");
  };

  const handleContinueUser = () => {
    if (!userPrompt.trim()) return alert("User prompt cannot be empty!");
    setUserPromptConfirmed(true);
  };

  const handleGenerateModels = async () => {
    setGenerating(true);
    setModelResponses({ weak: "Generating response...", strong: "Generating response..." });

    setShowNudgeBox(false);
    setNudgeInput("");
    setNudgeResponse("");

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          user_prompt: userPrompt,
          history_weak: historyWeak,
          history_strong: historyStrong,
        }),
      });
      const data = await res.json();
      setModelResponses({ weak: data.weak, strong: data.strong });
    } catch (error) {
      alert("Error generating responses.");
      setModelResponses({ weak: "", strong: "" });
    }

    setShowEvaluation(true); 
    setEvaluationExpanded(true); 
    setGenerating(false);
  };

  const handleSubmitEvaluation = () => {
    if (!currentEvaluation.selectedModel) return alert("Please select which model is better!");
    setEvaluations([...evaluations, currentEvaluation]);
    setShowEvaluation(false);
    setCurrentEvaluation({
      selectedModel: "",
      failures: { A: false, B: false },
      betterResponses: { A: "", B: "" },
      comment: "",
      ratings: { A: "", B: "" },
    });
    setCurrentTurn(prev => prev + 1);
  };

  const handleGenerateNudge = async () => {
    if (!nudgeInput.trim()) return alert("Nudge input cannot be empty!");
    setNudgeLoading(true);
    setNudgeResponse("Generating nudge response...");

    try {
      const res = await fetch("http://localhost:8000/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          user_prompt: nudgeInput,
          history_weak: [...historyWeak, { user_prompt: userPrompt, model_response: modelResponses.weak }],
          history_strong: [...historyStrong, { user_prompt: userPrompt, model_response: modelResponses.strong }],
        }),
      });
      const data = await res.json();
      setNudgeResponse(data.nudge_response);
    } catch (error) {
      alert("Error generating nudge response.");
      setNudgeResponse("");
    }
    setNudgeLoading(false);
  };

  const handleCompleteTurn = () => {
    if (!isChecklistValid()) return alert("Please complete all items in the checklist.");

    setEvaluations([...evaluations, currentEvaluation]);
    setHistoryWeak([...historyWeak, { user_prompt: userPrompt, model_response: modelResponses.weak }]);
    setHistoryStrong([...historyStrong, { user_prompt: userPrompt, model_response: modelResponses.strong }]);

    setUserPrompt("");
    setUserPromptConfirmed(false);
    setModelResponses({ weak: "", strong: "" });
    setCurrentEvaluation({
      selectedModel: "",
      failures: { A: false, B: false },
      betterResponses: { A: "", B: "" },
      comment: "",
      ratings: { A: "", B: "" },
    });
    setShowChecklist(false);
    setShowNudgeBox(false);
    setNudgeInput("");
    setNudgeResponse("");
    setEvaluationExpanded(false);
    setCurrentTurn(prev => prev + 1);
  };

  const handleEndConversation = () => {
    if (!isChecklistValid()) return alert("Please complete all items in the checklist.");
    setEvaluations([...evaluations, currentEvaluation]);
    setHistoryWeak([...historyWeak, { user_prompt: userPrompt, model_response: modelResponses.weak }]);
    setHistoryStrong([...historyStrong, { user_prompt: userPrompt, model_response: modelResponses.strong }]);
    setCurrentTurn(MAX_TURNS + 1);
  };

  const handleRestartFromTurn = (turnNum: number) => {
    setViewingTurn(null);

    const restartingFromConfig = turnNum === 1;

    setCurrentTurn(turnNum);
    setHistoryWeak(historyWeak.slice(0, turnNum - 1));
    setHistoryStrong(historyStrong.slice(0, turnNum - 1));
    setEvaluations(evaluations.slice(0, turnNum - 1));

    setUserPrompt("");
    setUserPromptConfirmed(false);
    setModelResponses({ weak: "", strong: "" });
    setCurrentEvaluation({
      selectedModel: "",
      failures: { A: false, B: false },
      betterResponses: { A: "", B: "" },
      comment: "",
      ratings: { A: "", B: "" },
    });
    setShowChecklist(false);
    setShowNudgeBox(false);
    setNudgeInput("");
    setNudgeResponse("");
    setNudgeLoading(false);
    setEvaluationExpanded(false);

    if (restartingFromConfig) {
      setStep("opening");
      setSystemPrompt(""); 
      alert(`Restarting from Configuration. Please enter a new System Prompt.`);
    } else {
      setStep("conversation");
      alert(`Restarting conversation from Turn ${turnNum}. Data for subsequent turns has been cleared.`);
    }
  };

  const handleViewTurn = (turnNum: number) => {
    if (turnNum <= historyWeak.length && turnNum <= evaluations.length) {
      setViewingTurn(turnNum);
    } else {
      alert(`Error: Cannot find data for Turn ${turnNum}.`);
    }
  };

  const handleUpdateHistoricalEvaluation = (turnNum: number, newEvaluation: Evaluation) => {
    const newEvaluations = [...evaluations]; 
    newEvaluations[turnNum - 1] = newEvaluation; 
    setEvaluations(newEvaluations);
    setViewingTurn(null); 
    alert(`Turn ${turnNum} evaluation has been updated.`);
  };

  const handleIntentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIntent = e.target.value as Intent;
    setIntent(newIntent);
    setSubCategory(intentCategories[newIntent][0]); 
  };

  return (
    <div style={s.page}>
      <ProgressSidebar
        step={step}
        currentTurn={currentTurn}
        maxTurns={MAX_TURNS}
        evaluations={evaluations}
        setStep={setStep}
        onRestartTurn={handleRestartFromTurn}
        onViewTurn={handleViewTurn} 
        onViewConfig={() => setViewingConfig(true)} 
      />

      <div>
        <h1 style={s.h1}>EvalNaut – Progressive Flow</h1>
        
        {step === "opening" && (
          <div style={s.card}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#065f46" }}>Select Task Type and Categories</h2>
            
            {/* --- UPDATED Failure Mode Dropdown --- */}
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Failure Mode</label>
              <select style={s.select} value={failureMode} onChange={e => setFailureMode(e.target.value as FailureMode)}>
                <option value="course_correction">Course Correction</option>
                <option value="instruction_retention">Instruction Retention</option>
                <option value="task_continuation">Task Continuation</option>
              </select>
              {/* Dynamically show description based on selected failureMode */}
              <div style={s.optionDescription}>
                {failureModeDescriptions[failureMode]}
              </div>
            </div>
            {/* --- END UPDATED Failure Mode --- */}

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Intent</label>
              <select style={s.select} value={intent} onChange={handleIntentChange}>
                <option value="informational">Informational</option>
                <option value="discovery">Discovery</option>
                <option value="writing_tasks">Writing Tasks</option>
                <option value="skill_acquisition">Skill Acquisition</option>
                <option value="reasoning_exercise">Reasoning Exercise</option>
                <option value="personal_advice_seeking">Personal Advice Seeking</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Sub-Category</label>
              <select style={s.select} value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                {intentCategories[intent].map(subCat => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>System Prompt</label>
              <textarea style={s.textarea} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="Enter system prompt here..." />
            </div>

            <button style={s.button} onClick={handleStartConversation}>Start Conversation</button>
          </div>
        )}

        {step === "conversation" && currentTurn <= MAX_TURNS && (
          <div style={s.card}>
             <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#065f46" }}>User Prompt – Turn {currentTurn}</h2>
            <textarea
              style={s.textarea}
              value={userPrompt}
              onChange={e => { setUserPrompt(e.target.value); setUserPromptConfirmed(false); }}
              placeholder="Enter user prompt here..."
              disabled={userPromptConfirmed}
            />
            {!userPromptConfirmed && <button style={s.button} onClick={handleContinueUser}>Continue</button>}

            {userPromptConfirmed && (
              <>
                <button style={generating ? s.buttonDisabled : s.button} onClick={handleGenerateModels} disabled={generating}>
                  {generating ? "Generating..." : "Run Models / Generate Responses"}
                </button>

                {modelResponses.weak && modelResponses.strong && (
                  <> 
                    <div style={{ ...s.grid2, marginTop: 12 }}>
                      <div>
                        <h4 style={{ fontWeight: 600, marginBottom: 8, color: "#065f46" }}>Model A</h4>
                        <div style={s.modelBox}>{modelResponses.weak}</div>
                      </div>
                      
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={{ fontWeight: 600, marginBottom: 8, color: "#065f46" }}>Model B</h4>
                          {!showNudgeBox && (
                            <button style={s.nudgeButton} onClick={() => setShowNudgeBox(true)}>Nudge</button>
                          )}
                        </div>
                        <div style={s.modelBox}>{modelResponses.strong}</div>

                        {showNudgeBox && (
                          <div style={s.nudgeBox}>
                            <label style={{...s.label, color: "#92400e", fontSize: 14}}>Nudge Model B</label>
                            <textarea style={{...s.textarea, minHeight: 60}} value={nudgeInput} onChange={e => setNudgeInput(e.target.value)} placeholder="What should Model B have done differently?" disabled={nudgeLoading} />
                            <button style={nudgeLoading ? s.buttonDisabled : {...s.button, backgroundColor: "#f59e0b"}} onClick={handleGenerateNudge} disabled={nudgeLoading}>
                              {nudgeLoading ? "Generating..." : "Generate Nudge"}
                            </button>
                            {nudgeResponse && <div style={s.nudgeResponseBox}>{nudgeResponse}</div>}
                          </div>
                        )}
                      </div>
                    </div> 

                    <div>
                      <div style={s.evaluationHeader} onClick={() => setEvaluationExpanded(prev => !prev)}>
                        Evaluation Form {evaluationExpanded ? "▲" : "▼"}
                      </div>
                      {evaluationExpanded && (
                        <div style={s.evaluationContent}>
                          <EvaluationForm
                            turn={currentTurn}
                            evaluation={currentEvaluation}
                            setEvaluation={setCurrentEvaluation}
                            nudgeResponse={nudgeResponse}
                          />
                          
                          <button style={s.checklistButton} onClick={() => setShowChecklist(prev => !prev)}>
                            {showChecklist ? "Hide Checklist" : "Show Checklist"}
                          </button>
                          
                          {showChecklist && (
                            <div style={{ marginTop: 6 }}>
                              {getChecklist().map((c, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                                  {c.valid ? <CheckCircle2 color="#10b981" size={16} /> : <AlertCircle color="#f59e0b" size={16} />}
                                  <span style={{ marginLeft: 6, fontSize: 14 }}>{c.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                            <button
                              style={isChecklistValid() ? s.button : s.buttonDisabled}
                              onClick={handleCompleteTurn}
                              disabled={!isChecklistValid()}
                            >
                              Complete Turn & Continue
                            </button>
                            
                            {currentTurn < MAX_TURNS && (
                              <button
                                style={isChecklistValid() ? { ...s.button, backgroundColor: "#dc2626" } : s.buttonDisabled}
                                onClick={handleEndConversation}
                                disabled={!isChecklistValid()}
                              >
                                End Conversation Early
                              </button>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {step === "conversation" && currentTurn > MAX_TURNS && (
          <FinalSummary 
            systemPrompt={systemPrompt} 
            historyWeak={historyWeak} 
            historyStrong={historyStrong} 
            evaluations={evaluations}
            // --- ADD THESE NEW PROPS ---
            failureMode={failureMode}
            intent={intent}
            subCategory={subCategory}
            // --- END OF NEW PROPS ---
          />
        )}
      </div>

      {viewingTurn !== null && (
        <ViewTurnModal
          turnNumber={viewingTurn}
          userPrompt={historyWeak[viewingTurn - 1].user_prompt}
          evaluation={evaluations[viewingTurn - 1]}
          onClose={() => setViewingTurn(null)}
          onSave={handleUpdateHistoricalEvaluation}
          onRestart={handleRestartFromTurn}
        />
      )}

      {viewingConfig && (
        <ViewConfigModal
          initialConfig={{ failureMode, intent, subCategory, systemPrompt }} 
          onSave={handleSaveConfig} 
          onClose={() => setViewingConfig(false)}
        />
      )}
    </div>
  );
}
