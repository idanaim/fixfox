export interface EnhancedDiagnosisResult {
  type: 'issue_matches' | 'problem_matches' | 'ai_diagnosis';
  source: 'current_business' | 'other_business' | 'ai_generated';
  message: string;
  issues?: any[];
  problems?: any[];
  diagnosis?: {
    possibleCauses: string[];
    suggestedSolutions: string[];
    estimatedCost: string;
    partsNeeded: string[];
    diagnosisConfidence: number;
  };
} 