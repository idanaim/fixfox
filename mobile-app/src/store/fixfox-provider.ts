import { ServerApi } from '../queries/server-api';
import { createContext } from 'react';
interface ProvidersInterface {
  serverApi: ServerApi;
  user?: any;
}

const FixFoxProvidersContext = createContext<ProvidersInterface>({} as ProvidersInterface);

export type { ProvidersInterface };
export { FixFoxProvidersContext };
