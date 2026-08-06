"use client";

import { useState } from "react";
import { PromptApiPanel } from "@/components/PromptApiPanel";
import { SummarizerPanel } from "@/components/SummarizerPanel";
import { WriterRewriterPanel } from "@/components/WriterRewriterPanel";
import { TranslatorPanel } from "@/components/TranslatorPanel";
import { LanguageDetectorPanel } from "@/components/LanguageDetectorPanel";

const TABS = [
  { id: "prompt", label: "Prompt API" },
  { id: "summarizer", label: "Summarizer" },
  { id: "writer", label: "Writer / Rewriter" },
  { id: "translator", label: "Translator" },
  { id: "detector", label: "Language Detector" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("prompt");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          Browser Built-in AI Playground
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Chrome の組み込み AI API を試すモックページです。Chrome 127+ (Canary / Dev) + フラグが必要です。
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          {activeTab === "prompt" && <PromptApiPanel />}
          {activeTab === "summarizer" && <SummarizerPanel />}
          {activeTab === "writer" && <WriterRewriterPanel />}
          {activeTab === "translator" && <TranslatorPanel />}
          {activeTab === "detector" && <LanguageDetectorPanel />}
        </div>

        {/* Note */}
        <div className="mt-6 text-xs text-gray-400 space-y-1">
          <p>
            ⚠️ <code>window.ai</code> が存在しない場合、各パネルの「確認」ボタンを押すと{" "}
            <strong>非対応</strong> と表示されます。
          </p>
          <p>
            Chrome で有効化するには{" "}
            <code>chrome://flags/#prompt-api-for-gemini-nano</code> などのフラグを Enabled にしてください。
          </p>
        </div>
      </div>
    </div>
  );
}
