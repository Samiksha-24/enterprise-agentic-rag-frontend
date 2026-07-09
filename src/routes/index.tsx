import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  BarChart3,
  Quote,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Agentic RAG — Enterprise AI Document Intelligence Platform" },
      {
        name: "description",
        content:
          "Chat with your documents using an agentic RAG platform with retrieval, reranking, verification, and cited answers.",
      },
    ],
  }),
});

const features = [
  { icon: Search, title: "Agentic retrieval", desc: "Query rewriter, retriever, reranker and verifier agents collaborate for precise answers." },
  { icon: ShieldCheck, title: "Verified citations", desc: "Every claim is grounded in your documents with page-level source previews." },
  { icon: Zap, title: "Sub-second latency", desc: "Optimized vector search and streaming generation for real-time conversations." },
  { icon: FileText, title: "Multi-format ingest", desc: "PDF, DOCX, TXT, Markdown — chunked, embedded and indexed automatically." },
  { icon: BarChart3, title: "Analytics built-in", desc: "Track retrieval quality, latency, usage trends and user engagement." },
  { icon: Sparkles, title: "Any LLM", desc: "Switch between GPT-4o, Claude, Llama 3 and local models without lock-in." },
];

const testimonials = [
  { name: "Priya Shah", role: "Head of Research, Northwind", quote: "Cut our internal knowledge search time by 80%. The citation panel is a game changer." },
  { name: "Marcus Lee", role: "CTO, Vector Labs", quote: "Finally an RAG platform that shows its work. Our compliance team approved it in a week." },
  { name: "Sara Ortiz", role: "PhD Candidate, MIT", quote: "I fed it three years of papers. It reasons across them like a co-author." },
];

const tiers = [
  { name: "Starter", price: "$0", desc: "For individuals exploring RAG.", features: ["3 documents", "100 queries / mo", "Community support"], cta: "Start free" },
  { name: "Pro", price: "$29", desc: "For power users and small teams.", features: ["Unlimited documents", "10k queries / mo", "Analytics dashboard", "Priority models"], cta: "Upgrade to Pro", featured: true },
  { name: "Enterprise", price: "Custom", desc: "For regulated organizations.", features: ["SSO & RBAC", "Private deployment", "Audit logs", "Dedicated SLA"], cta: "Contact sales" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Now with multi-agent verification
            </Badge>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Enterprise AI{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Document Intelligence
              </span>{" "}
              Platform
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Agentic RAG turns your files into a reasoning engine. Upload documents, ask anything,
              and get verified answers with citations you can trust.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/chat">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant">
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/documents">
                <Button size="lg" variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Upload documents
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Demo preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="glass rounded-2xl p-2 shadow-elegant">
              <div className="rounded-xl bg-background/80 p-6">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/70" />
                  <div className="h-3 w-3 rounded-full bg-warning/80" />
                  <div className="h-3 w-3 rounded-full bg-success/80" />
                  <span className="ml-3 text-xs text-muted-foreground">agentic-rag.app / chat</span>
                </div>
                <div className="mt-6 space-y-4 text-left">
                  <div className="flex justify-end">
                    <div className="max-w-md rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground">
                      Summarize the key findings from the Q3 research papers.
                    </div>
                  </div>
                  <div className="max-w-2xl space-y-2">
                    <p className="text-sm">
                      Across the three uploaded papers, the retriever surfaced consistent evidence
                      that agentic pipelines outperform single-shot RAG by <strong>34%</strong> on
                      grounded QA benchmarks
                      <sup className="text-primary">[1]</sup>. Verification reduces hallucination by
                      an additional <strong>21%</strong>
                      <sup className="text-primary">[2]</sup>.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" /> dspy.pdf · p.12
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" /> ragas.pdf · p.4
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Everything a serious RAG needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From ingestion to verification, we handle the hard parts so you can focus on the
            questions.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-elegant">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Loved by teams that read a lot</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="glass">
                <CardContent className="pt-6">
                  <Quote className="h-6 w-6 text-primary/60" />
                  <p className="mt-4 text-sm leading-relaxed">{t.quote}</p>
                  <div className="mt-6">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Scale when you need to.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.featured
                  ? "relative border-primary/40 shadow-elegant"
                  : "relative"
              }
            >
              {tier.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{tier.desc}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    tier.featured
                      ? "w-full bg-gradient-primary text-primary-foreground shadow-elegant"
                      : "w-full"
                  }
                  variant={tier.featured ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Agentic RAG. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
            <a href="#">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
