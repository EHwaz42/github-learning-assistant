"use client";

import { useCallback, useRef, useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

export function usePopup() {
  const {
    popupVisible, popupMinimized, popupPosition, popupSize,
    setPopupVisible, setPopupMinimized, setPopupPosition, setPopupSize,
  } = useUIStore();

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      dragOffset.current = {
        x: e.clientX - popupPosition.x,
        y: e.clientY - popupPosition.y,
      };

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        setPopupPosition({
          x: Math.max(0, Math.min(window.innerWidth - 100, ev.clientX - dragOffset.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dragOffset.current.y)),
        });
      };

      const onUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [popupPosition, setPopupPosition]
  );

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      isResizing.current = true;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: popupSize.width,
        h: popupSize.height,
      };

      const onMove = (ev: MouseEvent) => {
        if (!isResizing.current) return;
        setPopupSize({
          width: Math.max(300, Math.min(window.innerWidth * 0.8, resizeStart.current.w + (ev.clientX - resizeStart.current.x))),
          height: Math.max(200, Math.min(window.innerHeight * 0.8, resizeStart.current.h + (ev.clientY - resizeStart.current.y))),
        });
      };

      const onUp = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [popupSize, setPopupSize]
  );

  const toggle = useCallback(() => {
    if (popupVisible) {
      setPopupVisible(false);
    } else {
      setPopupVisible(true);
      setPopupMinimized(false);
    }
  }, [popupVisible, setPopupVisible, setPopupMinimized]);

  // Clamp position on window resize
  useEffect(() => {
    const onResize = () => {
      setPopupPosition({
        x: Math.min(popupPosition.x, window.innerWidth - 100),
        y: Math.min(popupPosition.y, window.innerHeight - 40),
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [popupPosition, setPopupPosition]);

  return {
    popupVisible, popupMinimized, popupPosition, popupSize,
    toggle, startDrag, startResize,
    minimize: () => setPopupMinimized(true),
    maximize: () => setPopupMinimized(false),
    close: () => setPopupVisible(false),
  };
}
