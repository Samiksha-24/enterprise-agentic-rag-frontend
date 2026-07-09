import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Clock,
  Layers,
  Zap,
  Gauge,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";
import { getAnalytics, ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — Agentic RAG" }] }),
});

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

function AnalyticsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    refetchInterval: 20000,
  });

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-8">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive/60" />
        <p className="mt-4 font-medium">Couldn't reach the backend</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof ApiError ? error.message : "Is the FastAPI server running?"}
        </p>
      </div>
    );
  }

  const kpis = [
    { icon: FileText, label: "Documents indexed", value: data ? String(data.documents_indexed) : "—" },
    { icon: Layers, label: "Total chunks", value: data ? data.total_chunks.toLocaleString() : "—" },
    { icon: MessageSquare, label: "Total queries", value: data ? data.total_queries.toLocaleString() : "—" },
    { icon: Clock, label: "Avg. response time", value: data ? fmtMs(data.avg_response_time_ms) : "—" },
    { icon: Zap, label: "Retrieval latency", value: data ? fmtMs(data.avg_retrieval_latency_ms) : "—" },
    {
      icon: Gauge,
      label: "Avg. confidence",
      value: data && data.avg_confidence != null ? `${data.avg_confidence.toFixed(0)}%` : "—",
    },
  ];

  const usage = data?.query_volume_daily.map((p) => ({ day: p.date.slice(5), queries: p.queries })) ?? [];
  const latency = data?.latency_by_hour ?? [];
  const sessionsByDay = data?.new_sessions_by_day ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data
            ? `Model: ${data.active_model} (${data.active_llm_provider}) · Uptime: ${Math.round(
                data.uptime_seconds / 60,
              )} min`
            : "Track retrieval quality, latency and confidence across your workspace."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className={`transition-all hover:-translate-y-0.5 hover:shadow-elegant ${isLoading ? "animate-pulse" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary/10">
                    <k.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <p className="font-display text-2xl font-bold">{k.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Query volume (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {usage.length === 0 ? (
              <EmptyChart label="No queries recorded yet this process" />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={usage}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Area type="monotone" dataKey="queries" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latency by hour of day (ms)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {latency.length === 0 ? (
              <EmptyChart label="No latency data recorded yet this process" />
            ) : (
              <ResponsiveContainer>
                <LineChart data={latency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Line type="monotone" dataKey="retrieval_ms" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} name="Retrieval" />
                  <Line type="monotone" dataKey="generation_ms" stroke="var(--color-primary)" strokeWidth={2} dot={false} name="Generation" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">New sessions this week</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={sessionsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="sessions" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
