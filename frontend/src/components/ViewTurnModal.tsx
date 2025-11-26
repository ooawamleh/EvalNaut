// src/components/ViewTurnModal.tsx
import React, { useState, useEffect } from "react";
import EvaluationForm from "./EvaluationForm";

// This Evaluation type must match the one in App.tsx
interface Evaluation {
  selectedModel: string;
  failures: { A: boolean; B: boolean };
  betterResponses: { A: string; B: string };
  comment: string;
  ratings: { A: string; B: string };
}

interface ViewTurnModalProps {
  turnNumber: number;
  userPrompt: string;
  evaluation: Evaluation;
  onClose: () => void;
  onSave: (turnNumber: number, newEvaluation: Evaluation) => void;
  onRestart: (turnNumber: number) => void;
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
  promptBox: {
    background: '#f0fdf4',
    border: '1px solid #d1fae5',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    whiteSpace: 'pre-wrap' as 'pre-wrap',
    fontFamily: 'monospace',
    color: '#064e3b',
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
};

export default function ViewTurnModal({
  turnNumber,
  userPrompt,
  evaluation,
  onClose,
  onSave,
  onRestart,
}: ViewTurnModalProps) {
  // Create local state for editing. This is CRITICAL.
  // We don't want to edit the main app's 'currentEvaluation' state.
  const [editedEvaluation, setEditedEvaluation] = useState(evaluation);

  // Update local state if the prop changes (e.g., user opens a different turn)
  useEffect(() => {
    setEditedEvaluation(evaluation);
  }, [evaluation]);

  const handleSaveChanges = () => {
    onSave(turnNumber, editedEvaluation);
  };

  const handleRestart = () => {
    if (window.confirm(`Are you sure you want to restart the conversation from Turn ${turnNumber}? All progress from this turn forward will be lost.`)) {
      onRestart(turnNumber);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <span>Viewing Turn {turnNumber}</span>
          <button style={s.closeButton} onClick={onClose}>×</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={s.label}>User Prompt</label>
          <div style={s.promptBox}>{userPrompt}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #d1fae5', margin: '20px 0' }} />

        {/* We re-use the EvaluationForm, passing our local state to it */}
        <EvaluationForm
          turn={turnNumber}
          nudgeResponse="" // Nudge isn't saved, so we pass empty
          evaluation={editedEvaluation}
          setEvaluation={setEditedEvaluation}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            style={{ ...s.button, backgroundColor: '#dc2626', color: 'white' }}
            onClick={handleRestart}
          >
            Restart From This Turn
          </button>
          <button
            style={{ ...s.button, backgroundColor: '#10b981', color: 'white' }}
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}