import { createContext, useContext, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export const RouteReadyContext = createContext<(locationKey: string) => void>(() => undefined);
export function useRouteReady(ready = true) {
  const location = useLocation();
  const markReady = useContext(RouteReadyContext);

  useLayoutEffect(() => {
    if (ready) markReady(location.key);
  }, [location.key, markReady, ready]);
}
