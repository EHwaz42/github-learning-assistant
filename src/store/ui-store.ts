import { create } from "zustand";

type Panel = "chat" | "discovery" | "learning";

function getDefaultPosition() {
  if (typeof window !== "undefined") {
    return { x: window.innerWidth - 420, y: 100 };
  }
  return { x: 100, y: 100 };
}

interface UIState {
  sidebarOpen: boolean;
  activePanel: Panel;
  popupVisible: boolean;
  popupMinimized: boolean;
  popupPosition: { x: number; y: number };
  popupSize: { width: number; height: number };

  toggleSidebar: () => void;
  setActivePanel: (panel: Panel) => void;
  setPopupVisible: (visible: boolean) => void;
  setPopupMinimized: (minimized: boolean) => void;
  setPopupPosition: (pos: { x: number; y: number }) => void;
  setPopupSize: (size: { width: number; height: number }) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePanel: "chat",
  popupVisible: false,
  popupMinimized: false,
  popupPosition: getDefaultPosition(),
  popupSize: { width: 380, height: 500 },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActivePanel: (activePanel) => set({ activePanel }),
  setPopupVisible: (popupVisible) => set({ popupVisible }),
  setPopupMinimized: (popupMinimized) => set({ popupMinimized }),
  setPopupPosition: (popupPosition) => set({ popupPosition }),
  setPopupSize: (popupSize) => set({ popupSize }),
}));
