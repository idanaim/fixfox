import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../../store/fixfox-provider';

export const useChatContext = (adminId: number) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery({
    queryKey: ['chatContext', adminId],
    queryFn: async () => {
      const response = await serverApi.postCall('chat/context', { adminId });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    onError: (error) => {
      console.error('Error fetching chat context:', error);
    },
  });
};
export const useGetChatResolve = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: async (query: { adminId: number; problem: string }) => {
      return serverApi.postCall('chat/resolve', {
        adminId: query?.adminId,
        problem: query.problem,
      }).then((response) => response.data);
    },
    onError: (error) => {
      console.error('Error fetching chat context:', error);
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
        console.error(
          'Error generating solution with GPT:',
          error.response?.data || error.message
        );
        throw new Error('Failed to generate solution. Please try again later.');
      }
    },
    onError: (error) => {
      console.error('Error generating solution with GPT:', error.message);
      throw new Error('Failed to generate solution. Please try again later.');
    },
  });
};
