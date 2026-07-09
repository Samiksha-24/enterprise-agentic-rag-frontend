import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BrandMark } from "@/components/site-header";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link to="/">
          <BrandMark />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8 space-y-4">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </motion.div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Agentic RAG</p>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-primary lg:block">
        <div className="absolute inset-0 bg-gradient-glow opacity-40" />
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-primary-foreground">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 shadow-glow"
          >
            <Sparkles className="h-16 w-16" />
          </motion.div>
          <h2 className="mt-10 max-w-md text-center font-display text-4xl font-bold leading-tight">
            Reasoning-grade answers, grounded in your documents.
          </h2>
          <p className="mt-4 max-w-md text-center text-primary-foreground/80">
            Join thousands of teams using Agentic RAG to search, cite, and understand their
            knowledge at scale.
          </p>
        </div>
      </div>
    </div>
  );
}
