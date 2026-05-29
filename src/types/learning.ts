export interface LearningStep {
  step: number;
  title: string;
  description: string;
  relatedFiles: string[];
  completed: boolean;
}

export interface LearningGuide {
  steps: LearningStep[];
  totalSteps: number;
  repoName: string;
}
