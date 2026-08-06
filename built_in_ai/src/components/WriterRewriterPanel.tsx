"use client";

import { useState, useCallback } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";

type Availability = "readily" | "after-download" | "no" | "unknown" | "checking";

export function WriterRewriterPanel() {
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [mode, setMode] = useState<"writer" | "rewriter">("writer");
  const [tone, setTone] = useState<AIWriterTone | AIRewriterTone>("neutral");
  const [format, setFormat] = useState<AIWriterFormat | AIRewriterFormat>("plain-text");
  const [length, setLength] = useState<AIWriterLength | AIRewriterLength>("medium");
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async () => {
    setAvailability("checking");
    try {
      const api = mode === "writer" ? window.ai.writer : window.ai.rewriter;
      const caps = await api.capabilities();
      setAvailability(caps.available as Availability);
    } catch {
      setAvailability("no");
    }
  }, [mode]);

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      if (mode === "writer") {
        const session = await window.ai.writer.create({
          tone: tone as AIWriterTone,
          format: format as AIWriterFormat,
          length: length as AIWriterLength,
          sharedContext: context,
        });
        const result = await session.write(input);
        setOutput(result);
        session.destroy();
      } else {
        const session = await window.ai.rewriter.create({
          tone: tone as AIRewriterTone,
          format: format as AIRewriterFormat,
          length: length as AIRewriterLength,
          sharedContext: context,
        });
        const result = await session.rewrite(input);
        setOutput(result);
        session.destroy();
      }
    } catch (e: unknown) {
      setOutput(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [mode, tone, format, length, input, context]);

  const writerTones: AIWriterTone[] = ["formal", "neutral", "casual"];
  const rewriterTones: AIRewriterTone[] = ["as-is", "more-formal", "more-casual"];
  const writerLengths: AIWriterLength[] = ["short", "medium", "long"];
  const rewriterLengths: AIRewriterLength[] = ["as-is", "shorter", "longer"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Writer / Rewriter API</h2>
        <AvailabilityBadge availability={availability} />
        <button onClick={checkAvailability} className="text-xs text-blue-600 underline">確認</button>
      </div>

      <div className="flex gap-2">
        {(["writer", "rewriter"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setTone(m === "writer" ? "neutral" : "as-is"); setLength(m === "writer" ? "medium" : "as-is"); }}
            className={`px-3 py-1 text-sm rounded border ${mode === m ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">トーン</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as AIWriterTone)} className="w-full border rounded px-2 py-1.5 text-sm">
            {(mode === "writer" ? writerTones : rewriterTones).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">フォーマット</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as AIWriterFormat)} className="w-full border rounded px-2 py-1.5 text-sm">
            {(mode === "writer" ? ["plain-text", "markdown"] : ["as-is", "plain-text", "markdown"]).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">長さ</label>
          <select value={length} onChange={(e) => setLength(e.target.value as AIWriterLength)} className="w-full border rounded px-2 py-1.5 text-sm">
            {(mode === "writer" ? writerLengths : rewriterLengths).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">共有コンテキスト（任意）</label>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="例: 技術ブログの記事"
          className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {mode === "writer" ? "書いてほしいこと" : "書き直したいテキスト"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={mode === "writer" ? "例: AIの未来について短く書いて" : "書き直したいテキストを入力"}
          className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-50 hover:bg-blue-700"
      >
        {loading ? "処理中…" : mode === "writer" ? "書く" : "書き直す"}
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
