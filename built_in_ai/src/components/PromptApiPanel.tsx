"use client";

import { useState, useRef, useCallback } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";

type Availability = "readily" | "after-download" | "no" | "unknown" | "checking";

export function PromptApiPanel() {
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [systemPrompt, setSystemPrompt] = useState("あなたは親切なAIアシスタントです。");
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<AILanguageModelSession | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkAvailability = useCallback(async () => {
    setAvailability("checking");
    try {
      const caps = await window.ai.languageModel.capabilities();
      setAvailability(caps.available as Availability);
    } catch {
      setAvailability("no");
    }
  }, []);

  const createSession = useCallback(async () => {
    sessionRef.current?.destroy();
    sessionRef.current = await window.ai.languageModel.create({
      systemPrompt,
    });
  }, [systemPrompt]);

  const run = useCallback(async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setOutput("");
    abortRef.current = new AbortController();
    try {
      if (!sessionRef.current) await createSession();
      if (streaming) {
        const stream = sessionRef.current!.promptStreaming(userInput, {
          signal: abortRef.current.signal,
        });
        const reader = stream.getReader();
        let result = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result = value; // Prompt API returns cumulative chunks
          setOutput(result);
        }
      } else {
        const result = await sessionRef.current!.prompt(userInput, {
          signal: abortRef.current.signal,
        });
        setOutput(result);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setOutput(`エラー: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [userInput, streaming, createSession]);

  const stop = () => abortRef.current?.abort();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Prompt API (Language Model)</h2>
        <AvailabilityBadge availability={availability} />
        <button
          onClick={checkAvailability}
          className="text-xs text-blue-600 underline"
        >
          確認
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">システムプロンプト</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => {
            setSystemPrompt(e.target.value);
            sessionRef.current = null; // reset session
          }}
          rows={2}
          className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ユーザー入力</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={3}
          placeholder="質問や指示を入力してください"
          className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
            className="w-4 h-4"
          />
          ストリーミング
        </label>
        <button
          onClick={run}
          disabled={loading || !userInput.trim()}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-50 hover:bg-blue-700"
        >
          送信
        </button>
        {loading && (
          <button
            onClick={stop}
            className="px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            停止
          </button>
        )}
      </div>

      {output && (
        <div>
          <label className="block text-sm font-medium mb-1">レスポンス</label>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-3 min-h-16 max-h-80 overflow-y-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
