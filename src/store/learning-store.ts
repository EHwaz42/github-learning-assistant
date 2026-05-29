import { create } from "zustand";
import { LearningStep } from "@/types";

interface LearningState {
  steps: LearningStep[];
  currentStepIndex: number;
  completedSteps: Set<number>;
  isGenerating: boolean;

  setSteps: (steps: LearningStep[]) => void;
  completeStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetProgress: () => void;
  setGenerating: (generating: boolean) => void;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  steps: [],
  currentStepIndex: 0,
  completedSteps: new Set(),
  isGenerating: false,

  setSteps: (steps) => set({ steps, currentStepIndex: 0, completedSteps: new Set() }),

  completeStep: (index) =>
    set((s) => {
      const next = new Set(s.completedSteps);
      next.add(index);
      return { completedSteps: next };
    }),

  nextStep: () =>
    set((s) => ({
      currentStepIndex: Math.min(s.currentStepIndex + 1, s.steps.length - 1),
    })),

  prevStep: () =>
    set((s) => ({
      currentStepIndex: Math.max(s.currentStepIndex - 1, 0),
    })),

  resetProgress: () => set({ steps: [], currentStepIndex: 0, completedSteps: new Set() }),

  setGenerating: (isGenerating) => set({ isGenerating }),
}));
