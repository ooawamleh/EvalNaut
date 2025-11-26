// src/components/ProgressSidebar.tsx
import React from 'react';

// Define the types for the props this component will receive
interface ProgressSidebarProps {
  step: "opening" | "conversation";
  currentTurn: number;
  maxTurns: number;
  evaluations: any[]; 
  setStep: (s: "opening" | "conversation") => void;
  // Handler function to restart the conversation from a specific turn
  onRestartTurn: (turnNum: number) => void; 
  // Handler function to view a completed turn's history
  onViewTurn: (turnNum: number) => void; 
  // NEW: Handler function to view the config modal
  onViewConfig: () => void;
}

// --- Styles for the Sidebar ---
const sidebarStyles = {
  container: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    position: 'sticky' as 'sticky', 
    top: '20px',
    height: 'fit-content',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '10px',
    color: '#065f46',
  },
  item: {
    padding: '8px 12px',
    borderRadius: '4px',
    marginBottom: '6px',
    transition: 'background-color 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  active: {
    backgroundColor: '#d1fae5', // Light green for active step
    fontWeight: 600,
    color: '#065f46',
    border: '1px solid #34d399',
  },
  completed: {
    color: '#065f46', // Darker text for completed
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
  },
  disabled: {
    color: '#9ca3af', // Gray for future/disabled
    cursor: 'default',
  },
  button: {
    backgroundColor: '#34d399',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'background-color 0.2s',
  },
  buttonRestart: {
    backgroundColor: '#f59e0b',
  }
};

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ 
  step, 
  currentTurn, 
  maxTurns, 
  onRestartTurn,
  onViewTurn,
  onViewConfig // Destructure new prop
}) => {

  const turns = Array.from({ length: maxTurns }, (_, i) => i + 1);

  const getTurnStatus = (turnNum: number) => {
    if (turnNum === currentTurn && step === "conversation" && currentTurn <= maxTurns) {
      return 'active';
    }
    if (turnNum < currentTurn) {
      return 'completed';
    }
    return 'disabled';
  };

  const isFinalStepActive = step === "conversation" && currentTurn > maxTurns;
  const isConfigCompleted = step === "conversation";

  return (
    <div style={sidebarStyles.container}>
      <h3 style={sidebarStyles.header}>Conversation Flow</h3>
      
      {/* 1. Task Configuration Step */}
      <div 
        style={{
          ...sidebarStyles.item,
          ...(step === "opening" ? sidebarStyles.active : {}),
          ...(isConfigCompleted ? sidebarStyles.completed : {}),
        }}
      >
        <span>1. Task Config</span>
        {isConfigCompleted && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              style={sidebarStyles.button}
              title="View/Edit Configuration"
              onClick={onViewConfig} // NEW
            >
              View
            </button>
            <button
              style={{...sidebarStyles.button, ...sidebarStyles.buttonRestart}}
              title="Restart from Turn 1"
              onClick={() => onRestartTurn(1)} // Restarting from 1 IS restarting from config
            >
              Restart
            </button>
          </div>
        )}
      </div>

      {/* 2. Conversation Turns */}
      {turns.map((turnNum) => {
        const status = getTurnStatus(turnNum);
        let itemStyle: React.CSSProperties = { ...sidebarStyles.item };

        if (status === 'active') {
          itemStyle = { ...itemStyle, ...sidebarStyles.active };
        } else if (status === 'completed') {
          itemStyle = { ...itemStyle, ...sidebarStyles.completed };
        } else if (status === 'disabled') {
          itemStyle = { ...itemStyle, ...sidebarStyles.disabled };
        }

        return (
          <div 
            key={turnNum} 
            style={itemStyle}
          >
            <span>Turn {turnNum}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {status === 'completed' && (
                <>
                  <button
                    style={sidebarStyles.button}
                    title="View/Edit Turn"
                    onClick={() => onViewTurn(turnNum)}
                  >
                    View
                  </button>
                  <button
                    style={{...sidebarStyles.button, ...sidebarStyles.buttonRestart}}
                    title="Restart from this turn"
                    onClick={() => onRestartTurn(turnNum)}
                  >
                    Restart
                  </button>
                </>
              )}
              {status === 'active' && <span>▶️</span>}
            </div>
          </div>
        );
      })}

      {/* 3. Final Evaluation Step */}
      <div 
        style={{
          ...sidebarStyles.item,
          ...(isFinalStepActive ? sidebarStyles.active : {}),
          ...(!isFinalStepActive && currentTurn <= maxTurns ? sidebarStyles.disabled : {}),
        }}
      >
        Final Evaluation
        {isFinalStepActive && <span style={{ float: 'right' }}>✅</span>}
      </div>
    </div>
  );
};

export default ProgressSidebar;

