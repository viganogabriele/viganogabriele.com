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

export function useRouteReadyAfterImage(selector: string, required = true) {
  const location = useLocation();
  const markReady = useContext(RouteReadyContext);

  useLayoutEffect(() => {
    if (!required) {
      markReady(location.key);
      return;
    }
    const image = document.querySelector<HTMLImageElement>(selector);
    const ready = () => markReady(location.key);
    if (!image || (image.complete && image.naturalWidth > 0)) {
      ready();
      return;
    }
    image.addEventListener("load", ready, { once: true });
    image.addEventListener("error", ready, { once: true });
    return () => {
      image.removeEventListener("load", ready);
      image.removeEventListener("error", ready);
    };
  }, [location.key, markReady, required, selector]);
}
