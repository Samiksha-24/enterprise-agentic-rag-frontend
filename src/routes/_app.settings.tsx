import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Key, User, Palette, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Agentic RAG" }] }),
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [model, setModel] = useState("gpt-4o");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace preferences and integrations.
        </p>
      </div>

      <div className="space-y-6">
        <Section icon={Cpu} title="Model" description="Choose the LLM for generation.">
          <div className="space-y-2">
            <Label>Default model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="claude-3.7-sonnet">Claude 3.7 Sonnet</SelectItem>
                <SelectItem value="llama-3.3-70b">Llama 3.3 70B</SelectItem>
                <SelectItem value="deepseek-r1">DeepSeek R1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section icon={Palette} title="Appearance" description="Customize the look and feel.">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark mode</Label>
              <p className="text-xs text-muted-foreground">Reduce eye strain in low light.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggle} />
          </div>
        </Section>

        <Section icon={Bell} title="Notifications" description="Manage how you're notified.">
          <ToggleRow label="Email notifications" desc="Weekly digest of your workspace activity." defaultChecked />
          <Separator />
          <ToggleRow label="Indexing complete" desc="Ping me when a document finishes indexing." defaultChecked />
          <Separator />
          <ToggleRow label="Product updates" desc="Occasional emails about new features." />
        </Section>

        <Section icon={User} title="Account" description="Update your profile information.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Ada Reyes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="ada@northwind.io" />
            </div>
          </div>
          <div>
            <Button
              className="bg-gradient-primary text-primary-foreground shadow-elegant"
              onClick={() => toast.success("Profile updated")}
            >
              Save changes
            </Button>
          </div>
        </Section>

        <Section icon={Key} title="API" description="Programmatic access to your workspace.">
          <div className="space-y-2">
            <Label>API key</Label>
            <div className="flex gap-2">
              <Input readOnly value="arg_sk_••••••••••••••••••••3f2a" className="font-mono" />
              <Button variant="outline" onClick={() => toast.success("Key copied")}>
                Copy
              </Button>
              <Button variant="outline">Rotate</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep this secret. Rotate immediately if exposed.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
