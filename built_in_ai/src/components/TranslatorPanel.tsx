"use client";

import { useState, useCallback } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";

type Availability = "readily" | "after-download" | "no" | "unknown" | "checking";

const LANGUAGES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "英語" },
  { code: "zh", label: "中国語（簡体字）" },
  { code: "ko", label: "韓国語" },
  { code: "fr", label: "フランス語" },
  { code: "de", label: "ドイツ語" },
  { code: "es", label: "スペイン語" },
];

export function TranslatorPanel() {
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ja");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async () => {
    setAvailability("checking");
    try {
      const caps = await window.ai.translator.capabilities();
      const pairAvail = caps.languagePairAvailable(sourceLang, targetLang);
      setAvailability(pairAvail as Availability);
    } catch {
      setAvailability("no");
    }
  }, [sourceLang, targetLang]);

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const session = await window.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      const result = await session.translate(input);
      setOutput(result);
      session.destroy();
    } catch (e: unknown) {
      setOutput(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [input, sourceLang, targetLang]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-lg">Translator API</h2>
        <AvailabilityBadge availability={availability} />
        <button onClick={checkAvailability} className="text-xs text-blue-600 underline">確認</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">翻訳元</label>
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <span className="mt-4 text-gray-400">→</span>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">翻訳先</label>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">テキスト</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="翻訳するテキストを入力してください"
          className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-50 hover:bg-blue-700"
      >
        {loading ? "翻訳中…" : "翻訳する"}
      </button>

      {output && (
        <div>
          <label className="block text-sm font-medium mb-1">翻訳結果</label>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-3 max-h-64 overflow-y-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}
