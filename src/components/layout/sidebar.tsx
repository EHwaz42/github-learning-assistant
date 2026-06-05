"use client";

import { useUIStore } from "@/store/ui-store";
import { RepoPanel } from "@/components/repo/repo-panel";
import { DiscoveryPanel } from "@/components/discovery/discovery-panel";
import { LearningGuide } from "@/components/learning/learning-guide";
import { cn } from "@/lib/utils";
import { MessageSquare, Compass, GraduationCap, PanelLeftClose, PanelLeft, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";

const panels = [
  { id: "chat" as const, label: "聊天", icon: MessageSquare },
  { id: "discovery" as const, label: "发现", icon: Compass },
  { id: "learning" as const, label: "学习", icon: GraduationCap },
];

export function Sidebar() {
  const { sidebarOpen, activePanel, setActivePanel, toggleSidebar } = useUIStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const configured = useSettingsStore((s) => s.configured);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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
        <div className="mt-auto" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          onClick={() => setSettingsOpen(true)}
          title="API 配置"
        >
          <Settings className="w-4 h-4" />
          {!configured && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-400 rounded-full" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-r bg-muted/20 flex flex-col w-72">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-semibold">开源项目学习助手</span>
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

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-3.5 h-3.5" />
          API 调用
          {!configured && (
            <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
          )}
        </Button>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
