"use client";

import { useUIStore } from "@/store/ui-store";
import { RepoPanel } from "@/components/repo/repo-panel";
import { DiscoveryPanel } from "@/components/discovery/discovery-panel";
import { LearningGuide } from "@/components/learning/learning-guide";
import { cn } from "@/lib/utils";
import { MessageSquare, Compass, GraduationCap, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const panels = [
  { id: "chat" as const, label: "聊天", icon: MessageSquare },
  { id: "discovery" as const, label: "发现", icon: Compass },
  { id: "learning" as const, label: "学习", icon: GraduationCap },
];

export function Sidebar() {
  const { sidebarOpen, activePanel, setActivePanel, toggleSidebar } = useUIStore();

  if (!sidebarOpen) {
    return (
      <div className="border-r bg-muted/20 flex flex-col items-center py-3 gap-2 w-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
        {panels.map((p) => (
          <Button
            key={p.id}
            variant={activePanel === p.id ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setActivePanel(p.id)}
            title={p.label}
          >
            <p.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-r bg-muted/20 flex flex-col w-72">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-semibold">GitHub 学习助手</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSidebar}>
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex border-b">
        {panels.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePanel(p.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors",
              activePanel === p.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <p.icon className="w-3.5 h-3.5" />
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activePanel === "chat" && <RepoPanel />}
        {activePanel === "discovery" && <DiscoveryPanel />}
        {activePanel === "learning" && <LearningGuide />}
      </div>
    </div>
  );
}
