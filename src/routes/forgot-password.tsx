import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Reset password — Agentic RAG" }] }),
});

function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Check your inbox
          </div>
          <p className="mt-1 text-muted-foreground">
            If an account exists we've sent reset instructions.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" required />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
