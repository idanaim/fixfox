import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { chatApi, Equipment } from '../api/chatAPI';

interface UseFollowUpQuestionsProps {
  sessionId: number | null;
  equipment: Equipment | null;
  enabled?: boolean;
}

// Define an interface for the answer object
export interface QuestionAnswer {
  question: string;
  answer: string;
}

export const useFollowUpQuestions = ({
  sessionId,
  equipment,
  enabled = true,
}: UseFollowUpQuestionsProps) => {

  // Local state for storing answers - changed from Record to array of objects
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isReadyForDiagnosis, setIsReadyForDiagnosis] = useState(false);

  // Fetch follow-up questions
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['followUpQuestions', sessionId, equipment?.id],
    queryFn: async () => {
      if (!sessionId || !equipment) {
        throw new Error('Session ID and equipment are required');
      }
      return await chatApi.followUpQuestions(sessionId, equipment);
    },
    enabled: !!sessionId && !!equipment && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Record an answer locally
  const recordAnswer = useCallback(
    (answer: string, questionType: string) => {
      // Get the current question object
      const currentQuestion = data?.followUpQuestions?.[currentQuestionIndex];

      if (currentQuestion) {
        // Add the new answer to the array
        setAnswers((prev) => [
          ...prev.filter(qa => qa.question !== questionType), // Remove any existing answer for this question
          {
            question: questionType,
            answer: answer,
          }
        ]);
      }

      // If we have more questions available, move to the next one
      if (
        data?.followUpQuestions &&
        currentQuestionIndex < data.followUpQuestions.length - 1
      ) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Generate a summary from the collected answers
        const answerSummary = answers
          .map(({question, answer}) => `${question}: ${answer}`)
          .join('\n');

        setSummary(`Based on your answers:\n${answerSummary}`);
        setIsReadyForDiagnosis(true);
      }
    },
    [data?.followUpQuestions, currentQuestionIndex, answers]
  );

  // Submit all answers to the backend when completed
  const submitAllAnswers = useCallback(async () => {
    if (!sessionId || answers.length === 0) return;

    setIsSubmitting(true);

    try {
      // Here you would implement the logic to submit all answers at once
      // For now, we'll just simulate it with a delay
      const allAnswersData = {
        sessionId,
        answers,
      };

      console.log('Submitting all answers:', allAnswersData);

      const response = await chatApi.addMessage(
        sessionId,
        'add follow-up-questions',
        'user',
        {followupQuestions: answers}
      );

      console.log('Response from submitting answers:', response);
      // setIsReadyForDiagnosis(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, answers]);

  // Get the current follow-up question based on our index
  const currentQuestion =
    data?.followUpQuestions?.[currentQuestionIndex] || null;

  // If we have a current question, add the current answer to it for UI
  const currentQuestionWithAnswer = currentQuestion
    ? {
        ...currentQuestion,
        answer: answers.find(qa => qa.question === currentQuestion.type)?.answer || '',
      }
    : null;

  return {
    // Query data
    followUpQuestions: data?.followUpQuestions || [],
    currentQuestion: currentQuestionWithAnswer,
    confidence: data?.confidence || 'low',
    isReadyForDiagnosis,
    summary,
    answers,

    // Query states
    isLoading,
    isError,
    error,
    refetch,

    // Actions
    recordAnswer,
    submitAllAnswers,
    isSubmitting,

    // Helper properties
    hasQuestions: (data?.followUpQuestions?.length || 0) > 0,
    progress: {
      current: currentQuestionIndex + 1,
      total: data?.followUpQuestions?.length || 0,
      percentage: data?.followUpQuestions
        ? ((currentQuestionIndex + 1) / data.followUpQuestions.length) * 100
        : 0,
    },
  };
};
