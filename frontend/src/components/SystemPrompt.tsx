import React from 'react';

export default function SystemPrompt({ onSet }: { onSet: (prompt: string) => void }) {
  return (
    <div className="mb-6 p-4 border rounded bg-white shadow">
      <label className="block font-semibold mb-2 text-gray-700">System Prompt</label>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter system prompt once for the whole conversation"
        onBlur={(e) => onSet(e.target.value)}
      />
    </div>
  );
}
