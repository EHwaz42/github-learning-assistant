import { create } from "zustand";
import { RepoInfo, FileNode } from "@/types";

interface RepoState {
  repo: RepoInfo | null;
  fileTree: FileNode[];
  activeFile: { path: string; content: string } | null;
  readme: string | null;
  isLoading: boolean;
  error: string | null;

  setRepo: (repo: RepoInfo) => void;
  setFileTree: (tree: FileNode[]) => void;
  setActiveFile: (file: { path: string; content: string } | null) => void;
  setReadme: (readme: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRepo: () => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repo: null,
  fileTree: [],
  activeFile: null,
  readme: null,
  isLoading: false,
  error: null,

  setRepo: (repo) => set({ repo }),
  setFileTree: (fileTree) => set({ fileTree }),
  setActiveFile: (activeFile) => set({ activeFile }),
  setReadme: (readme) => set({ readme }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearRepo: () =>
    set({
      repo: null,
      fileTree: [],
      activeFile: null,
      readme: null,
      error: null,
    }),
}));
