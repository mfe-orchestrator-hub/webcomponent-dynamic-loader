import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useMFEContext } from "./MfeProvider";

export const ReleaseType = {
  UMD: "UMD",
  ES: "ES",
} as const;

export type ReleaseType = typeof ReleaseType[keyof typeof ReleaseType];

const getReleaseType = (release: ReleaseType) => {
  if (!release) return "umd";
  switch (release) {
    case ReleaseType.UMD:
      return "umd";
    case ReleaseType.ES:
      return "es";
    default:
      return "umd";
  }
};

export interface MfeInjectorProps {
  version: string;
  name: string;
  continuousIntegration: boolean;
  release?: ReleaseType;
  url?: string;
  
}

export interface MfeInjectorExtendedProps extends MfeInjectorProps{
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  children?: React.ReactNode;
  scriptType?: string;
  hideLoader?: boolean;
  baseUrl?: string;
}

export const MfeInjector: React.FC<MfeInjectorExtendedProps> = ({
  scriptType,
  version,
  name,
  children,
  continuousIntegration,
  release = ReleaseType.UMD,
  url: inputUrl,
  baseUrl: inputBaseUrl,
  hideLoader,
  loadingPlaceholder = <div>Loading...</div>,
  errorPlaceholder = <div>Error</div>,
}) => {
  const mfeContext = useMFEContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.React = React;
    window.ReactDOM = ReactDOM;
    const script = document.createElement("script");
    const baseUrl =
      inputBaseUrl ||
      mfeContext.baseUrl;
    let url =
      inputUrl ||
      `${baseUrl}/${name}/${version}/index.${getReleaseType(release)}.js`;
    if (continuousIntegration) {
      url += `?uid=${new Date().getTime()}`;
    }
    script.src = url;
    script.async = true;
    if (scriptType) script.type = scriptType;

    script.onload = () => {
      setLoading(false);
    };

    script.onerror = () => {
      setLoading(false);
      setError(`Failed to load ${url}`);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script); // Clean up the script
    };
  }, [
    name,
    version,
    continuousIntegration,
    inputBaseUrl,
    inputUrl,
    release,
    scriptType,
    mfeContext.baseUrl,
  ]);

  if(loading && !hideLoader){
    return loadingPlaceholder
  }

  if(error){
    return errorPlaceholder
  }

  

  return <>{children}</>;
};