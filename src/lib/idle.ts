/**
 * Runs `cb` once the page has loaded and the browser is idle, so decorative canvas loops never compete
 * with the first paint and hydration. Returns a cancel function.
 */
export function afterLoad(cb: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const go = () => {
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(cb, { timeout: 2500 });
    else timer = window.setTimeout(cb, 1200); // Safari has no requestIdleCallback
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    if (idle) window.cancelIdleCallback?.(idle);
    if (timer) window.clearTimeout(timer);
  };
}
