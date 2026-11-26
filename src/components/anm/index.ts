// Typed entry points for the vendored Annnimate components (free starter pack, annnimate.com).
// They were tested with Playwright against this site's Lenis + ScrollTrigger setup before use;
// see the PR description for what was changed from the originals.
import type { ComponentType } from "react";
import CurtainSliderJs from "./CurtainSlider";

type CurtainImage = { src: string; alt: string; title: string; label: string };
export const CurtainSlider = CurtainSliderJs as unknown as ComponentType<{
  images: CurtainImage[]; className?: string; duration?: number; columns?: number; auto?: number; drag?: boolean;
}>;

