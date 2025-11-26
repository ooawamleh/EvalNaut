import React, { useEffect } from "react";

// This Evaluation type must match the one in App.tsx
interface Evaluation {
  selectedModel: string;
  failures: { A: boolean; B: boolean };
  betterResponses: { A: string; B: string };
  comment: string;
  ratings: { A: string; B: string };
}

interface EvaluationFormProps {
  turn: number;
  nudgeResponse: string;
  evaluation: Evaluation;
  setEvaluation: (evaluation: Evaluation) => void;
}

export default function EvaluationForm({ turn, nudgeResponse, evaluation, setEvaluation }: EvaluationFormProps) {
  
  // Update betterResponse.B if nudgeResponse changes and it hasn't been manually edited
  useEffect(() => {
    // Only set if nudgeResponse exists and the B response is still empty
    if (nudgeResponse && evaluation.betterResponses.B === "") {
      setEvaluation({ ...evaluation, betterResponses: { ...evaluation.betterResponses, B: nudgeResponse }});
    }
  }, [nudgeResponse, evaluation, setEvaluation]); // Added dependencies

  const ratingOptions = ["Horrible", "Pretty Bad", "Okay", "Pretty Good", "Excellent"];

  return (
    <div className="w-full space-y-6"> {/* Increased base spacing */}
      
      <h3 className="font-semibold text-green-800 text-xl border-b border-green-200 pb-2">
        Evaluation – Turn {turn}
      </h3>

      {/* --- Section 1: Main Choice & Failures --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Which Model? */}
        <div className="flex flex-col gap-2">
          <label className="text-green-700 font-bold">Which model to continue?</label>
          <select
            className="border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
            value={evaluation.selectedModel}
            onChange={(e) => setEvaluation({ ...evaluation, selectedModel: e.target.value })}
          >
            <option value="">-- Select --</option>
            <option value="A">Model A</option>
            <option value="B">Model B</option>
          </select>
        </div>

        {/* Column 2: Failures */}
        <div className="flex flex-col gap-2">
          <label className="text-green-700 font-bold">Tag Failures</label>
          <div className="flex gap-4 items-center p-3 bg-green-50 rounded-md border border-green-200 h-full"> {/* Grouped box */}
            <label className="flex items-center gap-2 text-green-700 cursor-pointer text-base">
              <input
                type="checkbox"
                checked={evaluation.failures.A}
                onChange={(e) => setEvaluation({ ...evaluation, failures: { ...evaluation.failures, A: e.target.checked } })}
                className="accent-green-600 w-5 h-5"
              />
              Model A Failed
            </label>
            <label className="flex items-center gap-2 text-green-700 cursor-pointer text-base">
              <input
                type="checkbox"
                checked={evaluation.failures.B}
                onChange={(e) => setEvaluation({ ...evaluation, failures: { ...evaluation.failures, B: e.target.checked } })}
                className="accent-green-600 w-5 h-5"
              />
              Model B Failed
            </label>
          </div>
        </div>
      </div>

      {/* Failure comment (spans full width) */}
      {(evaluation.failures.A || evaluation.failures.B) && (
        <div className="flex flex-col gap-2">
          <label className="text-green-700 font-bold">Failure Comment (Required):</label>
          <input
            type="text"
            className="border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full bg-white shadow-sm"
            placeholder="Explain the failure..."
            value={evaluation.comment}
            onChange={(e) => setEvaluation({ ...evaluation, comment: e.target.value })}
          />
        </div>
      )}

      {/* --- Section 2: Ratings --- */}
      <div>
        <h4 className="text-green-700 font-bold mb-3">Model Ratings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-green-700 font-medium">Model A Response:</label>
            <select
              className="border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
              value={evaluation.ratings.A}
              onChange={(e) => setEvaluation({ ...evaluation, ratings: { ...evaluation.ratings, A: e.target.value } })}
            >
              <option value="">-- Select Rating --</option>
              {ratingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-green-700 font-medium">Model B Response:</label>
            <select
              className="border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
              value={evaluation.ratings.B}
              onChange={(e) => setEvaluation({ ...evaluation, ratings: { ...evaluation.ratings, B: e.target.value } })}
            >
              <option value="">-- Select Rating --</option>
              {ratingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- Section 3: Better Responses --- */}
      <div>
        <h4 className="text-green-700 font-bold mb-3">Better Responses (Optional)</h4>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-green-700 font-medium">Better response for Model A:</label>
            <input
              type="text"
              placeholder="Suggest a better response..."
              value={evaluation.betterResponses.A}
              onChange={(e) => setEvaluation({ ...evaluation, betterResponses: { ...evaluation.betterResponses, A: e.target.value } })}
              className="border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full bg-white shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-green-700 font-medium">Better response for Model B:</label>
            <input
              type="text"
              placeholder="Suggest a better response (from nudge or manual)"
              value={evaluation.betterResponses.B}
              onChange={(e) => setEvaluation({ ...evaluation, betterResponses: { ...evaluation.betterResponses, B: e.target.value } })}
              className="border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
