"use client";

import { MessageCircle, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export function PopupToggle() {
  const { popupVisible, setPopupVisible, setPopupMinimized } = useUIStore();

  if (popupVisible) return null;

  return (
    <button
      onClick={() => {
        setPopupVisible(true);
        setPopupMinimized(false);
      }}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      title="打开学习助手弹窗"
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
}
