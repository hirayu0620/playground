"use client";

import { useState, useCallback } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";

type Availability = "readily" | "after-download" | "no" | "unknown" | "checking";

export function LanguageDetectorPanel() {
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<LanguageDetectionResult[]>([]);
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async () => {
    setAvailability("checking");
    try {
      const caps = await window.ai.languageDetector.capabilities();
      setAvailability(caps.available as Availability);
    } catch {
      setAvailability("no");
    }
  }, []);

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const session = await window.ai.languageDetector.create();
      const detected = await session.detect(input);
      setResults(detected);
      session.destroy();
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Language Detector API</h2>
        <AvailabilityBadge availability={availability} />
        <button onClick={checkAvailability} className="text-xs text-blue-600 underline">確認</button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">テキスト</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="言語を検出したいテキストを入力してください"
          className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-50 hover:bg-blue-700"
      >
        {loading ? "検出中…" : "言語を検出"}
      </button>

      {results.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">検出結果</label>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">言語コード</th>
                  <th className="text-left px-3 py-2 font-medium">信頼度</th>
                  <th className="px-3 py-2">
                    <span className="sr-only">バー</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((r, i) => (
                  <tr key={i} className={i === 0 ? "bg-blue-50" : ""}>
                    <td className="px-3 py-2 font-mono">
                      {r.detectedLanguage ?? "不明"}
                    </td>
                    <td className="px-3 py-2">
                      {(r.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 w-40">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${r.confidence * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
