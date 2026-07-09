import { Link, useRouterState } from "@tanstack/react-router";
import {
  MessageSquarePlus,
  History,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./site-header";

const nav = [
  { title: "Chat", url: "/chat", icon: MessageSquarePlus },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

const recentChats = [
  "Q3 revenue analysis",
  "DSPy vs LangChain",
  "Compliance policy summary",
  "Product roadmap draft",
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="px-2 py-1.5">
          <BrandMark />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Link to="/chat">
              <Button className="w-full justify-start gap-2 bg-gradient-primary text-primary-foreground shadow-elegant">
                <Sparkles className="h-4 w-4" />
                New Chat
              </Button>
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <History className="h-3.5 w-3.5" /> Recent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentChats.map((c) => (
                <SidebarMenuItem key={c}>
                  <SidebarMenuButton asChild>
                    <Link to="/chat" className="truncate text-sm">
                      {c}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
              AR
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Ada Reyes</p>
            <p className="truncate text-xs text-muted-foreground">Pro plan</p>
          </div>
          <Link to="/login">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
