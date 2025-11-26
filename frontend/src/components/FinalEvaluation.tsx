// src/components/FinalEvaluation.tsx
import React, { useState } from "react";

export default function FinalSummary({ 
  systemPrompt, 
  historyWeak, 
  historyStrong, 
  evaluations,
  failureMode,  // <-- New prop
  intent,         // <-- New prop
  subCategory     // <-- New prop
}: any) {
  const [overallFailure, setOverallFailure] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [conversationId, setConversationId] = useState("");

  const handleSubmit = async () => {
    if (!overallFailure) return alert("Please select a failure level first.");

    try {
      const res = await fetch("http://localhost:8000/save_conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          history_weak: historyWeak,
          history_strong: historyStrong,
          overall_failure: overallFailure, // This will be 'failure_rate'
          evaluations: evaluations,
          
          // --- ADDED NEW FIELDS ---
          failure_mode: failureMode,     // This will be 'failure_type'
          intent: intent,                // This will be 'category'
          sub_category: subCategory      // This will be 'sub_category'
          // --- END OF NEW FIELDS ---
        }),
      });

      const data = await res.json();
      setConversationId(data.conversation_id);
      setSubmitted(true);
      alert(`✅ Evaluation submitted! Conversation ID: ${data.conversation_id}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save conversation. Check backend connection.");
    }
  };

  const handleStartOver = () => window.location.reload();

  return (
    <div className="p-6 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Final Evaluation</h2>

      <label className="block mb-2 font-semibold">Overall Failure Level (Failure Rate):</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={overallFailure}
        onChange={(e) => setOverallFailure(e.target.value)}
        disabled={submitted}
      >
        <option value="">-- Select --</option>
        <option value="none">No Failure</option>
        <option value="minor">Minor Failure</option>
        <option value="moderate">Moderate Failure</option>
        <option value="severe">Severe Failure</option>
      </select>

      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={handleSubmit}
        disabled={!overallFailure || submitted}
      >
        {submitted ? "Submitted ✅" : "Submit Evaluation"}
      </button>

      {submitted && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded ml-3"
          onClick={handleStartOver}
        >
          Start Over
        </button>
      )}

      {conversationId && (
        <p className="mt-3 text-gray-600 text-sm">
          Saved as Conversation ID: <strong>{conversationId}</strong>
        </p>
      )}
    </div>
  );
}