"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { MiniPopup } from "@/components/popup/mini-popup";
import { PopupToggle } from "@/components/popup/popup-toggle";

export default function Home() {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface />
      </main>
      <MiniPopup />
      <PopupToggle />
    </div>
  );
}
