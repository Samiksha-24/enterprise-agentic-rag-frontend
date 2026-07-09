/**
 * api-client.ts
 * ==============
 * Typed client for the Agentic RAG FastAPI backend
 * (src/agentic_rag/api on the Python side — see that package's README for
 * the full endpoint list and response shapes this file mirrors).
 *
 * Base URL comes from VITE_API_BASE_URL (see .env.example); defaults to
 * localhost:8000 for local dev against `uvicorn agentic_rag.api.main:app`.
 */

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8000";

const SESSION_STORAGE_KEY = "agentic_rag_session_id";

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setSessionId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, id);
}

export function clearSessionId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ---------------------------------------------------------------- types --- //

export interface SourceItem {
  type: string;
  label: string;
  score?: number | null;
  doc?: string | null;
  page?: number | null;
  preview?: string | null;
}

export interface TraceStep {
  icon: string;
  title: string;
  detail: string;
}

export interface ChatResponse {
  session_id: string;
  answer: string;
  sources: SourceItem[];
  trace: TraceStep[];
  research_mode: boolean;
  confidence: number | null;
  total_latency_ms: number;
  retrieval_latency_ms: number | null;
  generation_latency_ms: number | null;
  active_model: string;
}

export interface ChatHistoryMessage {
  role: string;
  content: string;
  sources?: SourceItem[] | null;
  confidence?: number | null;
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatHistoryMessage[];
}

export interface DocumentInfo {
  name: string;
  chunks: number;
  indexed_at: string;
}

export interface UploadResult {
  name: string;
  chunks_indexed: number;
  status: string;
}

export interface UploadResponse {
  uploaded: UploadResult[];
  skipped: string[];
  documents: DocumentInfo[];
}

export interface DocumentListResponse {
  documents: DocumentInfo[];
  total_documents: number;
  total_chunks: number;
}

export interface AnalyticsQueryVolumePoint {
  date: string;
  queries: number;
}

export interface AnalyticsLatencyPoint {
  hour: string;
  retrieval_ms: number | null;
  generation_ms: number | null;
}

export interface AnalyticsSessionsPoint {
  day: string;
  sessions: number;
}

export interface AnalyticsResponse {
  documents_indexed: number;
  total_chunks: number;
  total_queries: number;
  active_sessions: number;
  avg_response_time_ms: number | null;
  avg_retrieval_latency_ms: number | null;
  avg_generation_latency_ms: number | null;
  avg_confidence: number | null;
  active_model: string;
  active_llm_provider: string;
  research_mode_default: boolean;
  uptime_seconds: number;
  query_volume_daily: AnalyticsQueryVolumePoint[];
  latency_by_hour: AnalyticsLatencyPoint[];
  new_sessions_by_day: AnalyticsSessionsPoint[];
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  vector_store_ready: boolean;
  documents_indexed: number;
  active_llm_provider: string;
  active_model: string;
  warnings: string[];
}

// -------------------------------------------------------------- errors --- //

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = body?.detail || body?.error;
    } catch {
      // response body wasn't JSON — ignore
    }
    throw new ApiError(res.status, detail || `Request failed with status ${res.status}`, detail);
  }
  return res.json() as Promise<T>;
}

// ------------------------------------------------------------- requests --- //

export async function sendChatMessage(
  message: string,
  options?: { sessionId?: string | null; researchMode?: boolean },
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      session_id: options?.sessionId ?? getSessionId(),
      research_mode: options?.researchMode,
    }),
  });
  const data = await handleResponse<ChatResponse>(res);
  setSessionId(data.session_id);
  return data;
}

export async function getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
  const res = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(sessionId)}/history`);
  return handleResponse<ChatHistoryResponse>(res);
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  return handleResponse<DocumentListResponse>(res);
}

export async function uploadDocuments(files: File[]): Promise<UploadResponse> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: form });
  return handleResponse<UploadResponse>(res);
}

export async function deleteDocument(name: string): Promise<{ name: string; deleted: boolean }> {
  const res = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function getSources(sessionId?: string | null): Promise<SourceItem[]> {
  const url = new URL(`${API_BASE_URL}/sources`);
  if (sessionId) url.searchParams.set("session_id", sessionId);
  const res = await fetch(url.toString());
  return handleResponse<SourceItem[]>(res);
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE_URL}/analytics`);
  return handleResponse<AnalyticsResponse>(res);
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthResponse>(res);
}
