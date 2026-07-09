import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  FileText,
  ChevronDown,
  Search,
  BookOpen,
  ShieldCheck,
  Wand2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  sendChatMessage,
  getSessionId,
  ApiError,
  type SourceItem as ApiSource,
  type TraceStep as ApiTraceStep,
} from "@/lib/api-client";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "Chat — Agentic RAG" }] }),
});

type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  confidence?: number;
  trace?: ApiTraceStep[];
  retrievalMs?: number | null;
  generationMs?: number | null;
};
type Source = { doc: string; page: number; score: number; preview: string };

const suggestions = [
  { icon: BookOpen, text: "Summarize the key findings across my uploaded research papers" },
  { icon: Search, text: "What are the main risks discussed in the Q3 report?" },
  { icon: Sparkles, text: "Compare the two proposed architectures side by side" },
  { icon: MessageSquare, text: "Draft an executive summary from the compliance policy" },
];

const stages = [
  { label: "Query Rewriter", icon: Wand2 },
  { label: "Retriever Agent", icon: Search },
  { label: "Reranker", icon: BookOpen },
  { label: "Verifier Agent", icon: ShieldCheck },
  { label: "Response Generator", icon: Sparkles },
] as const;

function toDisplaySource(s: ApiSource): Source {
  return {
    doc: s.doc || s.label || "Unknown source",
    page: s.page ?? 0,
    score: s.score ?? 0,
    preview: s.preview || "",
  };
}

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  // `stage` drives the pipeline animation shown while a request is in
  // flight. The backend runs the pipeline synchronously (no streaming yet),
  // so this cycles through the known stages as a "working on it" indicator
  // rather than tracking exact real-time backend progress — the real,
  // per-stage trace is rendered from the API response once it lands.
  const [stage, setStage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, stage]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    let cycle = 0;
    setStage(0);
    const stageInterval = setInterval(() => {
      cycle = (cycle + 1) % stages.length;
      setStage(cycle);
    }, 900);

    try {
      const response = await sendChatMessage(text, { sessionId: getSessionId() });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources
            .filter((s) => s.type !== "none")
            .map(toDisplaySource),
          confidence: response.confidence ?? undefined,
          trace: response.trace,
          retrievalMs: response.retrieval_latency_ms,
          generationMs: response.generation_latency_ms,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the Agentic RAG backend. Is it running?";
      toast.error(message);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, something went wrong: ${message}` },
      ]);
    } finally {
      clearInterval(stageInterval);
      setStage(null);
      setIsLoading(false);
    }
  };

  const last = messages[messages.length - 1];
  const activeSources = last?.role === "assistant" ? last.sources : undefined;
  const activeConfidence = last?.role === "assistant" ? last.confidence : undefined;
  const activeRetrievalMs = last?.role === "assistant" ? last.retrievalMs : undefined;
  const activeGenerationMs = last?.role === "assistant" ? last.generationMs : undefined;
  const activeChunkCount = activeSources?.length ?? 0;

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[1fr_340px]">
      {/* Chat column */}
      <div className="flex min-w-0 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
            {messages.length === 0 ? (
              <WelcomeScreen onPick={send} />
            ) : (
              <div className="space-y-6">
                {messages.map((m, i) => (
                  <MessageBubble key={i} msg={m} />
                ))}
                <AnimatePresence>
                  {stage !== null && <StagePipeline stage={stage} />}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-4 md:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="relative"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your documents…"
                className="min-h-[56px] resize-none rounded-2xl border-border/80 bg-card pr-14 shadow-sm focus-visible:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute bottom-2 right-2 h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Agentic RAG can make mistakes. Verify important information from cited sources.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="hidden border-l bg-muted/20 lg:block">
        <div className="h-full overflow-y-auto p-4">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Answer insights
          </h3>
          {activeConfidence !== undefined && activeConfidence !== null ? (
            <ConfidenceCard value={activeConfidence} />
          ) : (
            <EmptyPanel />
          )}
          {activeSources && activeSources.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Retrieved sources
              </h4>
              {activeSources.map((s, i) => (
                <SourceCard key={i} source={s} rank={i + 1} />
              ))}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Retrieval stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Passages returned</span>
                    <span className="font-mono text-foreground">{activeChunkCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retrieval latency</span>
                    <span className="font-mono text-foreground">
                      {activeRetrievalMs != null ? `${activeRetrievalMs} ms` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generation latency</span>
                    <span className="font-mono text-foreground">
                      {activeGenerationMs != null ? `${activeGenerationMs} ms` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function WelcomeScreen({ onPick }: { onPick: (t: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
        <Sparkles className="h-7 w-7 text-primary-foreground" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight md:text-4xl">
        How can I help you today?
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Ask a question or pick a suggestion below to get started.
      </p>
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <motion.button
            key={s.text}
            whileHover={{ y: -2 }}
            onClick={() => onPick(s.text)}
            className="group rounded-xl border border-border bg-card p-4 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/30"
          >
            <s.icon className="mb-2 h-4 w-4 text-primary" />
            {s.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={isUser ? "flex justify-end" : ""}
    >
      {isUser ? (
        <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground">
          {msg.content}
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="prose prose-sm whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {msg.content}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(msg.content);
                  toast.success("Answer copied");
                }}
              >
                <Copy className="h-3 w-3" /> Copy
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <ThumbsDown className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs">
                <RotateCcw className="h-3 w-3" /> Regenerate
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StagePipeline({ stage }: { stage: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="rounded-xl border border-border bg-card/60 p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
        </div>
        Processing your query
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {stages.map((s, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "pending";
          return (
            <div key={s.label} className="flex items-center gap-2">
              <motion.div
                animate={
                  state === "active"
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
                }
                transition={{ repeat: state === "active" ? Infinity : 0, duration: 1 }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                  state === "done"
                    ? "border-success/40 bg-success/10 text-success"
                    : state === "active"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </motion.div>
              {i < stages.length - 1 && (
                <span className="text-muted-foreground/40">→</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ConfidenceCard({ value }: { value: number }) {
  const level = value >= 85 ? "High" : value >= 65 ? "Medium" : "Low";
  const color = value >= 85 ? "text-success" : value >= 65 ? "text-warning" : "text-destructive";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Confidence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-display text-3xl font-bold">{value}%</span>
          <span className={`text-xs font-medium ${color}`}>{level} confidence</span>
        </div>
        <Progress value={value} className="h-2" />
      </CardContent>
    </Card>
  );
}

function SourceCard({ source, rank }: { source: Source; rank: number }) {
  return (
    <Collapsible>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 p-3 text-left hover:bg-accent/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            {rank}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate text-sm font-medium">
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{source.doc}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>p.{source.page}</span>
              <span>·</span>
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {(source.score * 100).toFixed(0)}% match
              </Badge>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t bg-muted/30 p-3 text-xs italic leading-relaxed text-muted-foreground">
            "{source.preview}"
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function EmptyPanel() {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
      <p className="mt-3 text-sm font-medium">No answer yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ask a question to see retrieved sources and confidence.
      </p>
    </div>
  );
}
