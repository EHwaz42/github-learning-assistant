export interface RepoRecommendation {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  url: string;
  beginnerFriendly: "高" | "中" | "低";
  matchReason: string;
}
