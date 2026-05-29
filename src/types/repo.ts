export interface RepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  defaultBranch: string;
}

export interface FileNode {
  name: string;
  type: "file" | "dir";
  path: string;
  size?: number;
  children?: FileNode[];
}

export interface RepoContents {
  repo: RepoInfo;
  fileTree: FileNode[];
  readme: string;
  truncated: boolean;
  totalFiles?: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  language: string;
}
