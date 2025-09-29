import React, { createContext, useContext, useEffect, useState } from "react";
import type { MfeInjectorProps } from "./MfeInjector";

export interface MfeContextProps {
  baseUrl?: string;
  data: Record<string, MfeInjectorProps>;
}

export interface MfeProviderProps extends React.PropsWithChildren {
  jsonConfigurationUrl?: string;
  standardData?: Record<string, MfeInjectorProps>;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
}

const MfeProviderContext = createContext<MfeContextProps>({
  data: {},
});

export const MfeProvider: React.FC<MfeProviderProps> = ({
  children,
  jsonConfigurationUrl = "/mfe-configuration.json",
  standardData = {},
  loadingPlaceholder = <div>Loading...</div>,
  errorPlaceholder = <div>Error</div>,
}) => {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, MfeInjectorProps> | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(jsonConfigurationUrl);
      if (!response.ok) return undefined;
      const json = await response.json();
      if (!json) return;
      
      for (const key of Object.keys(json.data)) {
        if (!json.data[key].name) {
          json.data[key].name = key;
        }
      }
      return json;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching MFE data", error);
      throw error;
    }
  };

  useEffect(()=>{
    setLoading(true);
    fetchData().then((data)=>{
      setData(data || standardData);
    }).catch((error)=>{
      setError(error);
    }).finally(()=>{
      setLoading(false);
    })

  },[jsonConfigurationUrl])

  if(loading){
    return loadingPlaceholder
  }

  if(error){
    return errorPlaceholder
  }

  return (
      <MfeProviderContext.Provider value={{data: data || standardData}}>
        {children}
      </MfeProviderContext.Provider>
  );
};

export const useMFEContext = () => {
  return useContext<MfeContextProps>(MfeProviderContext);
};