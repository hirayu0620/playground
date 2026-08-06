"use client";

import { useState, useCallback } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";

type Availability = "readily" | "after-download" | "no" | "unknown" | "checking";

export function SummarizerPanel() {
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [type, setType] = useState<AISummarizerType>("key-points");
  const [format, setFormat] = useState<AISummarizerFormat>("plain-text");
  const [length, setLength] = useState<AISummarizerLength>("medium");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async () => {
    setAvailability("checking");
    try {
      const caps = await window.ai.summarizer.capabilities();
      setAvailability(caps.available as Availability);
    } catch {
      setAvailability("no");
    }
  }, []);

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const session = await window.ai.summarizer.create({ type, format, length });
      const result = await session.summarize(input);
      setOutput(result);
      session.destroy();
    } catch (e: unknown) {
      setOutput(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [input, type, format, length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Summarizer API</h2>
        <AvailabilityBadge availability={availability} />
        <button onClick={checkAvailability} className="text-xs text-blue-600 underline">確認</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">タイプ</label>
          <select value={type} onChange={(e) => setType(e.target.value as AISummarizerType)} className="w-full border rounded px-2 py-1.5 text-sm">
            {(["tldr", "key-points", "teaser", "headline"] as AISummarizerType[]).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">フォーマット</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as AISummarizerFormat)} className="w-full border rounded px-2 py-1.5 text-sm">
            {(["plain-text", "markdown"] as AISummarizerFormat[]).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">長さ</label>
          <select value={length} onChange={(e) => setLength(e.target.value as AISummarizerLength)} className="w-full border rounded px-2 py-1.5 text-sm">
            {(["short", "medium", "long"] as AISummarizerLength[]).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">要約するテキスト</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="要約したいテキストを貼り付けてください"
          className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-50 hover:bg-blue-700"
      >
        {loading ? "処理中…" : "要約する"}
      </button>

      {output && (
        <div>
          <label className="block text-sm font-medium mb-1">結果</label>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-3 max-h-64 overflow-y-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}
