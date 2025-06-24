/* eslint-disable-next-line */
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';

export interface ReactQueryWrapperProps {
  children: ReactNode;
  onMfeRender: boolean;
  whiteList?: string[];
}

export function ReactQueryWrapper({ children, onMfeRender, whiteList }: ReactQueryWrapperProps) {
  const [noAuthStatus, setNoAuthStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (noAuthStatus) {
      setNoAuthStatus(undefined);
    }
  }, [onMfeRender]);
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryOnMount: false,
          refetchOnWindowFocus: false,
          staleTime: 1000 * 60 * 5
        }
      }
    });

    client.getQueryCache().subscribe((event) => {
      const stringQueryKey = JSON.stringify(event.query.queryKey);
      if (
        event.type === 'updated' &&
        event.query.state.status === 'error' &&
        whiteList &&
        !whiteList?.some((item) => stringQueryKey.includes(item))
      ) {
      }
    });
    return client;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/*<View style={{height:'100%'}}>*/}
      {children}
      {/*</View>*/}
    </QueryClientProvider>
  );
}

export default ReactQueryWrapper;
