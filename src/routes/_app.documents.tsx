import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Loader2,
  FileType2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  listDocuments,
  uploadDocuments,
  deleteDocument,
  ApiError,
  type DocumentInfo,
  type DocumentListResponse,
} from "@/lib/api-client";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentsPage,
  head: () => ({ meta: [{ title: "Documents — Agentic RAG" }] }),
});

function docType(name: string): "pdf" | "docx" | "txt" | "csv" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "docx" || ext === "txt" || ext === "csv") return ext;
  return "txt";
}

function DocumentsPage() {
  const [q, setQ] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents"],
    queryFn: listDocuments,
    refetchInterval: 15000, // background documents may finish indexing between visits
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocuments,
    onSuccess: (res) => {
      queryClient.setQueryData<DocumentListResponse>(["documents"], {
        documents: res.documents,
        total_documents: res.documents.length,
        total_chunks: res.documents.reduce((sum, d) => sum + d.chunks, 0),
      });
      if (res.uploaded.length > 0) {
        toast.success(`Indexed ${res.uploaded.length} file${res.uploaded.length > 1 ? "s" : ""}`);
      }
      res.skipped.forEach((s) => toast.error(`Skipped: ${s}`));
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onMutate: async (name: string) => {
      await queryClient.cancelQueries({ queryKey: ["documents"] });
      const previous = queryClient.getQueryData<DocumentListResponse>(["documents"]);
      queryClient.setQueryData<DocumentListResponse>(["documents"], (old) =>
        old
          ? {
              ...old,
              documents: old.documents.filter((d) => d.name !== name),
              total_documents: old.total_documents - 1,
            }
          : old,
      );
      return { previous };
    },
    onError: (err, _name, context) => {
      if (context?.previous) queryClient.setQueryData(["documents"], context.previous);
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const docs: DocumentInfo[] = data?.documents ?? [];
  const filtered = docs.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    toast.info(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`);
    uploadMutation.mutate(Array.from(files));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDFs, DOCX, TXT, CSV. They're chunked, embedded and made searchable
            (dense + BM25 hybrid index).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search documents…"
              className="w-64 pl-9"
            />
          </div>
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.csv"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mb-8 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"
        }`}
      >
        <motion.div animate={dragging ? { scale: 1.05 } : { scale: 1 }}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
            <Upload className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="mt-4 font-medium">Drop files here or click to browse</p>
          <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX, TXT, CSV</p>
        </motion.div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-dashed border-destructive/40 p-16 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive/60" />
          <p className="mt-4 font-medium">Couldn't reach the backend</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof ApiError ? error.message : "Is the FastAPI server running?"}
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse">
              <CardContent className="p-5" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyDocs />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <motion.div key={d.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout>
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary/10">
                      <FileType2 className="h-5 w-5 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(d.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-3 truncate font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Indexed at {d.indexed_at} · {docType(d.name).toUpperCase()}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{d.chunks} chunks</span>
                    <Badge variant="secondary" className="gap-1 border-success/30 bg-success/10 text-success">
                      <CheckCircle2 className="h-3 w-3" /> Indexed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyDocs() {
  return (
    <div className="rounded-2xl border border-dashed p-16 text-center">
      <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
      <p className="mt-4 font-medium">No documents yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload your first document to start chatting with it.
      </p>
    </div>
  );
}
