import React, { useState } from "react";

// Types to match App.tsx
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

interface Config {
  failureMode: FailureMode;
  intent: Intent;
  subCategory: string; 
  systemPrompt: string;
}

type EditableConfig = Omit<Config, 'systemPrompt'>;

interface ViewConfigModalProps {
  initialConfig: Config;
  onSave: (newConfig: EditableConfig) => void;
  onClose: () => void;
}

// Styles for the modal
const s = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto' as 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  header: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#065f46',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 6,
    color: '#065f46',
    fontSize: '16px',
  },
  select: { padding: "8px 12px", borderRadius: 6, border: "1px solid #d1fae5", width: "100%", background: "#ffffff", marginBottom: 16 },
  textarea: { width: "100%", minHeight: 120, padding: 10, borderRadius: 8, border: "1px solid #d1fae5", background: "#ffffff", fontSize: 14, marginBottom: 16 },
  textareaDisabled: { 
    width: "100%", 
    minHeight: 120, 
    padding: 10, 
    borderRadius: 8, 
    border: "1px solid #e5e7eb", 
    background: "#f9fafb",
    fontSize: 14, 
    marginBottom: 16,
    color: "#6b7280",
    cursor: "not-allowed",
  },
  button: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#9ca3af',
  },
  // Style for descriptions
  optionDescription: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '4px 0 0 4px',
    marginTop: '-12px', // Pulls it up closer to the dropdown
    marginBottom: '16px', // Keeps spacing for next element
  }
};

export default function ViewConfigModal({
  initialConfig,
  onSave,
  onClose,
}: ViewConfigModalProps) {
  
  const [config, setConfig] = useState(initialConfig);

  const handleSave = () => {
    const { failureMode, intent, subCategory } = config;
    onSave({ failureMode, intent, subCategory }); 
  };

  const handleIntentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIntent = e.target.value as Intent;
    setConfig({
        ...config,
        intent: newIntent,
        subCategory: intentCategories[newIntent][0] 
    });
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <span>Edit Task Configuration</span>
          <button style={s.closeButton} onClick={onClose}>×</button>
        </div>

        <div>
          {/* --- UPDATED Failure Mode Dropdown --- */}
          <label style={s.label}>Failure Mode</label>
          <select 
            style={{...s.select, marginBottom: 0}} // Remove margin-bottom to keep description close
            value={config.failureMode} 
            onChange={e => setConfig({...config, failureMode: e.target.value as FailureMode})}
          >
            <option value="course_correction">Course Correction</option>
            <option value="instruction_retention">Instruction Retention</option>
            <option value="task_continuation">Task Continuation</option>
          </select>
          <div style={s.optionDescription}>
            {failureModeDescriptions[config.failureMode]}
          </div>
          {/* --- END UPDATED Failure Mode --- */}


          <label style={s.label}>Intent</label>
          <select style={s.select} value={config.intent} onChange={handleIntentChange}>
            <option value="informational">Informational</option>
            <option value="discovery">Discovery</option>
            <option value="writing_tasks">Writing Tasks</option>
            <option value="skill_acquisition">Skill Acquisition</option>
            <option value="reasoning_exercise">Reasoning Exercise</option>
            <option value="personal_advice_seeking">Personal Advice Seeking</option>
            <option value="coding">Coding</option>
          </select>

          <div>
            <label style={s.label}>Sub-Category</label>
            <select 
              style={s.select} 
              value={config.subCategory} 
              onChange={e => setConfig({...config, subCategory: e.target.value})}
            >
              {intentCategories[config.intent].map(subCat => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
          </div>

          <label style={s.label}>System Prompt (Read-Only)</label>
          <textarea
            style={s.textareaDisabled}
            value={config.systemPrompt}
            disabled={true}
            readOnly={true}
          />
          <small style={{ color: '#6b7280', marginTop: '-12px', display: 'block', marginBottom: '16px' }}>
            To edit the System Prompt, you must "Restart" from the sidebar.
          </small>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            style={{ ...s.button, backgroundColor: '#10b981', color: 'white' }}
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
