import React from 'react';
import { Problem, Diagnosis } from '../api/chatAPI';
import { useTranslation } from 'react-i18next';
import DiagnosisLayout from './problem-diagnosis/DiagnosisLayout';
import ExistingSolutionsDisplay from './problem-diagnosis/ExistingSolutionsDisplay';
import AIDiagnosisDisplay from './problem-diagnosis/AIDiagnosisDisplay';
import EmptyStateDisplay from './problem-diagnosis/EmptyStateDisplay';

interface ProblemDiagnosisDisplayProps {
  diagnosisType: 'existing_solutions' | 'ai_diagnosis' | 'issue_matches' | 'problem_matches';
  problems?: Problem[];
  diagnosis?: Diagnosis;
  currentBusinessId: number;
  onSolutionSelect?: (problem: Problem) => void;
  onRequestMoreInfo?: () => void;
  onAssignToTechnician?: () => void;
  handleGetAISolutions?: () => void;
  onSolutionHelped?: (solutionId: number, problemDescription: string) => void;
  isLoadingAI?: boolean;
}

const ProblemDiagnosisDisplay: React.FC<ProblemDiagnosisDisplayProps> = ({
  diagnosisType,
  problems = [],
  diagnosis,
  currentBusinessId,
  onSolutionSelect,
  onRequestMoreInfo,
  onAssignToTechnician,
  handleGetAISolutions,
  onSolutionHelped,
  isLoadingAI,
}) => {
  const { t } = useTranslation();

  if (diagnosisType === 'existing_solutions') {
    if (problems && problems.length >0) {
      return (
        <DiagnosisLayout icon="magnify" title={t('diagnosis.similarProblems.title')}>
          <ExistingSolutionsDisplay
            problems={problems}
            currentBusinessId={currentBusinessId}
            onSolutionSelect={onSolutionSelect}
            onRequestMoreInfo={onRequestMoreInfo}
            onAssignToTechnician={onAssignToTechnician}
            onGetAISolutions={handleGetAISolutions}
            onSolutionHelped={onSolutionHelped}
            isLoadingAI={isLoadingAI}
          />
        </DiagnosisLayout>
      );
    }
    return (
      <DiagnosisLayout icon="help-circle-outline" title={t('diagnosis.similarProblems.empty')}>
        <EmptyStateDisplay 
          onRequestMoreInfo={onRequestMoreInfo} 
          onGetAISolutions={handleGetAISolutions}
        />
      </DiagnosisLayout>
    );
  }

  if (diagnosisType === 'ai_diagnosis' && diagnosis) {
    return (
      <DiagnosisLayout icon="robot" title={t('diagnosis.aiDiagnosis.title')}>
        <AIDiagnosisDisplay diagnosis={diagnosis} />
      </DiagnosisLayout>
    );
  }

  return null;
};

export default ProblemDiagnosisDisplay;
