import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../../store/fixfox-provider';

export const useChatContext = (adminId: number) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery({
    queryKey: ['chatContext', adminId],
    queryFn: async () => {
      try {
        const response = await serverApi.postCall('chat/context', { adminId });
        return response.data;
      } catch (error: any) {
        console.error('Error fetching chat context:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
export const useGetChatResolve = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: async (query: { adminId: number; problem: string }) => {
      try {
        const response = await serverApi.postCall('chat/resolve', {
          adminId: query?.adminId,
          problem: query.problem,
        });
        return response.data;
      } catch (error: any) {
        console.error('Error fetching chat context:', error);
        throw error;
      }
    },
  });
};

export const useSendMessage = () => {
  const GPT_API_KEY =''
  const GPT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  return useMutation({
    mutationFn: async (problem: string) => {
      try {
        const response = await axios.post(
          GPT_ENDPOINT,
          {
            model: 'gpt-3.5-turbo', // or 'gpt-4' if available
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that provides solutions to problems.',
              },
              {
                role: 'user',
                content: problem,
              },
            ],
            max_tokens: 500, // Adjust as needed
            temperature: 0.7, // Adjust for creativity vs. determinism
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GPT_API_KEY}`,
            },
          }
        );

        return response.data.choices[0].message.content.trim();
      } catch (error) {
        const errorMsg = (error as any)?.response?.data || (error as any)?.message || 'Unknown error';
        console.error('Error generating solution with GPT:', errorMsg);
        throw new Error('Failed to generate solution. Please try again later.');
      }
    },
  });
};
