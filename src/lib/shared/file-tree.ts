import { FileNode } from "@/types";

export const IGNORE_PATTERNS = [
  "node_modules", ".git", "dist", "build", "__pycache__",
  ".next", "vendor", ".cache", "coverage", ".nyc_output",
  "target", "out", ".turbo", ".idea", ".vscode",
];
export const MAX_FILES = 200;
export const MAX_DEPTH = 4;

export function buildFileTree(
  entries: { path: string; type: string; size?: number }[]
): FileNode[] {
  const root: FileNode[] = [];
  const dirMap = new Map<string, FileNode>();
  let fileCount = 0;

  const filtered = entries.filter((e) => {
    const parts = e.path.split("/");
    if (parts.length > MAX_DEPTH) return false;
    return !parts.some((p) => IGNORE_PATTERNS.includes(p));
  });

  for (const entry of filtered) {
    if (fileCount >= MAX_FILES) break;

    const parts = entry.path.split("/");
    if (parts.length === 1) {
      if (entry.type === "tree") {
        const dir: FileNode = {
          name: entry.path,
          type: "dir",
          path: entry.path,
          children: [],
        };
        root.push(dir);
        dirMap.set(entry.path, dir);
      } else {
        fileCount++;
        root.push({
          name: entry.path,
          type: "file",
          path: entry.path,
          size: entry.size,
        });
      }
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = dirMap.get(parentPath);
      if (!parent) continue;

      if (entry.type === "tree") {
        const dir: FileNode = {
          name: parts[parts.length - 1],
          type: "dir",
          path: entry.path,
          children: [],
        };
        parent.children = parent.children || [];
        parent.children.push(dir);
        dirMap.set(entry.path, dir);
      } else {
        fileCount++;
        parent.children = parent.children || [];
        parent.children.push({
          name: parts[parts.length - 1],
          type: "file",
          path: entry.path,
          size: entry.size,
        });
      }
    }
  }

  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => n.children && sortNodes(n.children));
  };
  sortNodes(root);

  return root;
}

export function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === "file") count++;
    if (n.children) count += countFiles(n.children);
  }
  return count;
}
