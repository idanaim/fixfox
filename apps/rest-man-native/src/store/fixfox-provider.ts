import { ServerApi } from '../queries/server-api';
import { createContext } from 'react';
interface ProvidersInterface {
  serverApi: ServerApi;
  token: string;
}

const FixFoxProvidersContext = createContext<ProvidersInterface>({} as ProvidersInterface);

export { ProvidersInterface, FixFoxProvidersContext };
