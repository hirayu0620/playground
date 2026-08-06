// Chrome Built-in AI APIs (Prompt API, Summarizer API, etc.)
// https://developer.chrome.com/docs/ai/built-in

// ============================================================
// Shared
// ============================================================

type AICapabilityAvailability = "readily" | "after-download" | "no";

interface AICapabilities {
  available: AICapabilityAvailability;
}

// ============================================================
// Language Model (Prompt API)
// ============================================================

interface AILanguageModelCapabilities extends AICapabilities {
  defaultTopK: number | null;
  maxTopK: number | null;
  defaultTemperature: number | null;
  maxTemperature: number | null;
  supportsLanguage(languageTag: string): AICapabilityAvailability;
}

interface AILanguageModelCreateOptionsWithSystemPrompt {
  signal?: AbortSignal;
  monitor?: (m: EventTarget) => void;
  systemPrompt?: string;
  initialPrompts?: Array<{ role: "user" | "assistant"; content: string }>;
  topK?: number;
  temperature?: number;
}

interface AILanguageModelSession extends EventTarget {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming(
    input: string,
    options?: { signal?: AbortSignal }
  ): ReadableStream<string>;
  countPromptTokens(
    input: string,
    options?: { signal?: AbortSignal }
  ): Promise<number>;
  readonly maxTokens: number;
  readonly tokensSoFar: number;
  readonly tokensLeft: number;
  readonly topK: number;
  readonly temperature: number;
  clone(options?: { signal?: AbortSignal }): Promise<AILanguageModelSession>;
  destroy(): void;
}

interface AILanguageModel {
  capabilities(): Promise<AILanguageModelCapabilities>;
  create(
    options?: AILanguageModelCreateOptionsWithSystemPrompt
  ): Promise<AILanguageModelSession>;
}

// ============================================================
// Summarizer API
// ============================================================

type AISummarizerType = "tldr" | "key-points" | "teaser" | "headline";
type AISummarizerFormat = "plain-text" | "markdown";
type AISummarizerLength = "short" | "medium" | "long";

interface AISummarizerCapabilities extends AICapabilities {}

interface AISummarizerCreateOptions {
  signal?: AbortSignal;
  monitor?: (m: EventTarget) => void;
  sharedContext?: string;
  type?: AISummarizerType;
  format?: AISummarizerFormat;
  length?: AISummarizerLength;
}

interface AISummarizerSession {
  summarize(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): Promise<string>;
  summarizeStreaming(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): ReadableStream<string>;
  destroy(): void;
  readonly sharedContext: string;
  readonly type: AISummarizerType;
  readonly format: AISummarizerFormat;
  readonly length: AISummarizerLength;
}

interface AISummarizer {
  capabilities(): Promise<AISummarizerCapabilities>;
  create(options?: AISummarizerCreateOptions): Promise<AISummarizerSession>;
}

// ============================================================
// Writer API
// ============================================================

type AIWriterTone = "formal" | "neutral" | "casual";
type AIWriterFormat = "plain-text" | "markdown";
type AIWriterLength = "short" | "medium" | "long";

interface AIWriterCapabilities extends AICapabilities {}

interface AIWriterCreateOptions {
  signal?: AbortSignal;
  monitor?: (m: EventTarget) => void;
  sharedContext?: string;
  tone?: AIWriterTone;
  format?: AIWriterFormat;
  length?: AIWriterLength;
}

interface AIWriterSession {
  write(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): Promise<string>;
  writeStreaming(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): ReadableStream<string>;
  destroy(): void;
}

interface AIWriter {
  capabilities(): Promise<AIWriterCapabilities>;
  create(options?: AIWriterCreateOptions): Promise<AIWriterSession>;
}

// ============================================================
// Rewriter API
// ============================================================

type AIRewriterTone = "as-is" | "more-formal" | "more-casual";
type AIRewriterFormat = "as-is" | "plain-text" | "markdown";
type AIRewriterLength = "as-is" | "shorter" | "longer";

interface AIRewriterCapabilities extends AICapabilities {}

interface AIRewriterCreateOptions {
  signal?: AbortSignal;
  monitor?: (m: EventTarget) => void;
  sharedContext?: string;
  tone?: AIRewriterTone;
  format?: AIRewriterFormat;
  length?: AIRewriterLength;
}

interface AIRewriterSession {
  rewrite(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): Promise<string>;
  rewriteStreaming(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): ReadableStream<string>;
  destroy(): void;
}

interface AIRewriter {
  capabilities(): Promise<AIRewriterCapabilities>;
  create(options?: AIRewriterCreateOptions): Promise<AIRewriterSession>;
}

// ============================================================
// Translator API
// ============================================================

interface AITranslatorCapabilities extends AICapabilities {
  languagePairAvailable(
    source: string,
    target: string
  ): AICapabilityAvailability;
}

interface AITranslatorCreateOptions {
  signal?: AbortSignal;
  monitor?: (m: EventTarget) => void;
  sourceLanguage: string;
  targetLanguage: string;
}

interface AITranslatorSession {
  translate(
    input: string,
    options?: { signal?: AbortSignal }
  ): Promise<string>;
  destroy(): void;
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
}

interface AITranslator {
  capabilities(): Promise<AITranslatorCapabilities>;
  create(options: AITranslatorCreateOptions): Promise<AITranslatorSession>;
}

// ============================================================
// Language Detector API
// ============================================================

interface AILanguageDetectorCapabilities extends AICapabilities {}

interface AILanguageDetectorCreateOptions {
  signal?: AbortSignal;
  monitor?: (m: EventTarget) => void;
}

interface LanguageDetectionResult {
  detectedLanguage: string | null;
  confidence: number;
}

interface AILanguageDetectorSession {
  detect(
    input: string,
    options?: { signal?: AbortSignal }
  ): Promise<LanguageDetectionResult[]>;
  destroy(): void;
}

interface AILanguageDetector {
  capabilities(): Promise<AILanguageDetectorCapabilities>;
  create(
    options?: AILanguageDetectorCreateOptions
  ): Promise<AILanguageDetectorSession>;
}

// ============================================================
// Top-level window.ai
// ============================================================

interface AI {
  languageModel: AILanguageModel;
  summarizer: AISummarizer;
  writer: AIWriter;
  rewriter: AIRewriter;
  translator: AITranslator;
  languageDetector: AILanguageDetector;
}

interface Window {
  ai: AI;
}
