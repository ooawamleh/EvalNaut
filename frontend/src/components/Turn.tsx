import React, { useState } from "react";
import EvaluationForm from "./EvaluationForm";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define the Evaluation type to match what EvaluationForm expects
interface Evaluation {
  selectedModel: string;
  failures: { A: boolean; B: boolean };
  betterResponses: { A: string; B: string };
  comment: string;
  ratings: { A: string; B: string };
}

export default function Turn({
  turnNumber,
  systemPrompt,
  onSubmitNextTurn,
  isLastTurn,
  conversationEnded,
  historyWeak,
  historyStrong,
  updateHistory,
}: any) {
  const [open, setOpen] = useState(true);
  const [userPrompt, setUserPrompt] = useState("");
  const [responses, setResponses] = useState({ weak: "", strong: "", nudge: "" });
  const [loading, setLoading] = useState(false);
  const [nudgeReason, setNudgeReason] = useState("");
  const [showNudgeBox, setShowNudgeBox] = useState(false);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  
  // UPDATED: Expanded state to match the new EvaluationForm props
  const [evaluation, setEvaluation] = useState<Evaluation>({
    selectedModel: "",
    failures: { A: false, B: false },
    betterResponses: { A: "", B: "" },
    comment: "",
    ratings: { A: "", B: "" },
  });

  const [turnCompleted, setTurnCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sendPrompt = async () => {
    setLoading(true);
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
    setResponses({ ...responses, weak: data.weak, strong: data.strong });
    updateHistory(userPrompt, data.weak, data.strong);
    setLoading(false);
  };

  const sendNudge = async () => {
    setNudgeLoading(true);
    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_prompt: systemPrompt,
        user_prompt: nudgeReason,
        history_weak: historyWeak,
        history_strong: historyStrong,
      }),
    });
    const data = await res.json();
    setResponses({ ...responses, nudge: data.strong });
    setNudgeLoading(false);
  };

  const validateTurn = () => {
    if (!systemPrompt.trim()) return "System prompt is missing.";
    if (!userPrompt.trim()) return "User prompt is missing.";
    if (!responses.weak || !responses.strong) return "Model responses are missing.";
    if (!evaluation.selectedModel) return "Please select which model to continue with.";
    // Added validation for new required fields
    if (!evaluation.ratings.A || !evaluation.ratings.B) return "Please rate both models.";
    if ((evaluation.failures.A || evaluation.failures.B) && !evaluation.comment.trim()) {
      return "Failure comment is required when tagging a failure.";
    }
    return null;
  };

  const handleCompleteTurn = () => {
    const error = validateTurn();
    if (error) {
      setErrorMessage(error);
      setTurnCompleted(false);
    } else {
      setErrorMessage("");
      setTurnCompleted(true);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between bg-green-100 px-6 py-4 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-lg font-semibold text-green-800">Turn {turnNumber}</h2>
        {open ? (
          <ChevronUp className="text-green-700 w-5 h-5" />
        ) : (
          <ChevronDown className="text-green-700 w-5 h-5" />
        )}
      </div>

      {open && (
        <div className="p-6 bg-gray-50">
          {/* User Prompt */}
          <label className="block font-semibold mb-2 text-green-700">User Prompt</label>
          <textarea
            className="w-full p-3 border border-green-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Enter user prompt"
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={sendPrompt}
          >
            Submit Prompt
          </button>
          {loading && <p className="text-sm text-green-600 mt-2">Generating responses...</p>}

          {/* Model Responses */}
          {responses.weak && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded bg-white shadow-sm">
                <h3 className="font-semibold text-green-700 mb-2">Model A Response</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{responses.weak}</p>
              </div>
              <div className="p-4 border rounded bg-white shadow-sm relative">
                <h3 className="font-semibold text-green-700 mb-2">Model B Response</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{responses.strong}</p>
                {!responses.nudge && (
                  <button
                    className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => setShowNudgeBox(true)}
                  >
                    Nudge
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Nudge Box */}
          {showNudgeBox && (
            <div className="mt-6 p-4 border rounded bg-green-50">
              <label className="block font-semibold mb-2 text-green-700">
                Explain Model B's Mistake
              </label>
              <textarea
                className="w-full p-2 border border-green-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={nudgeReason}
                onChange={(e) => setNudgeReason(e.target.value)}
                placeholder="Describe where Model B went wrong"
              />
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={sendNudge}
              >
                Generate Enhanced Response
              </button>
              {nudgeLoading && (
                <p className="text-sm text-green-600 mt-2">Generating enhanced response...</p>
              )}
              {responses.nudge && (
                <div className="mt-4 p-2 border rounded bg-white shadow-sm">
                  <h4 className="font-semibold mb-1 text-green-700">Enhanced Model B Response</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{responses.nudge}</p>
                </div>
              )}
            </div>
          )}

          {/* Evaluation Form */}
          <div className="mt-6">
            {/* UPDATED: Changed props from onComplete to evaluation/setEvaluation */}
            <EvaluationForm
              turn={turnNumber}
              nudgeResponse={responses.nudge}
              evaluation={evaluation}
              setEvaluation={setEvaluation}
            />
          </div>

          {/* Completion & Navigation */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              className={`px-4 py-2 rounded text-white transition ${
                turnCompleted ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={handleCompleteTurn}
            >
              {turnCompleted ? "Turn Completed ✅" : "Complete Turn"}
            </button>

            {errorMessage && (
              <p className="text-sm text-red-600 font-semibold">{errorMessage}</p>
            )}

            {isLastTurn && !conversationEnded && turnCompleted && (
              <button
                className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900 transition"
                onClick={onSubmitNextTurn}
              >
                Continue Conversation →
              </button>
            )}

            {isLastTurn && conversationEnded && (
              <p className="text-sm text-green-700 font-semibold">
                Conversation ended. No more turns allowed.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
