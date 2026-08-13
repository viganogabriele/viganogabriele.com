import { createContext, useContext, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export const RouteReadyContext = createContext<(locationKey: string) => void>(() => undefined);
// Fail open on a stalled portrait request: the image can still appear later,
// while the readable page should not remain inert behind the route preloader.
const IMAGE_READY_TIMEOUT_MS = 6_000;

export function useRouteReady(ready = true) {
  const location = useLocation();
  const markReady = useContext(RouteReadyContext);

  useLayoutEffect(() => {
    if (ready) markReady(location.key);
  }, [location.key, markReady, ready]);
}

export function useRouteReadyAfterImage(selector: string, required = true, active = true) {
  const location = useLocation();
  const markReady = useContext(RouteReadyContext);

  useLayoutEffect(() => {
    if (!active) return;
    let settled = false;
    const ready = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      markReady(location.key);
    };
    const timeout = window.setTimeout(ready, IMAGE_READY_TIMEOUT_MS);
    if (!required) {
      ready();
      return;
    }
    const image = document.querySelector<HTMLImageElement>(selector);
    if (!image || image.complete) {
      ready();
      return;
    }
    image.addEventListener("load", ready, { once: true });
    image.addEventListener("error", ready, { once: true });
    return () => {
      window.clearTimeout(timeout);
      image.removeEventListener("load", ready);
      image.removeEventListener("error", ready);
    };
  }, [active, location.key, markReady, required, selector]);
}
