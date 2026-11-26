// Annnimate starter pack components, with what the Playwright tests found (2026-11-24/25).
// status: "in-use" | "passed" | "fix" | "failed" | "untested"
export const components = [
  { slug: "process-rail", name: "Process rail", status: "in-use", note: "On the Home and Journey pages now (the stages line)." },
  { slug: "curtain-slider", name: "Curtain slider", status: "in-use", note: "On the Gallery page now (featured artwork)." },
  { slug: "accordion", name: "Accordion", status: "in-use", note: "Donate page questions, with accessibility fixes." },
  { slug: "stacking-cards", name: "Stacking cards", status: "passed", note: "Worked well; taken off Home because it repeated the same pictures." },
  { slug: "elastic-divider", name: "Elastic divider", status: "passed", note: "Cheap and safe. Only reacts to a mouse, so phones see a plain line." },
  { slug: "diagonal-gallery", name: "Diagonal gallery", status: "fix", note: "Works, but its headline is hard-coded; needs a small change." },
  { slug: "text-reveal", name: "Text reveal", status: "failed", note: "Text stays invisible with reduced motion, and it switches off other scroll effects." },
  { slug: "floating-navbar", name: "Floating navbar", status: "failed", note: "On phones it shows only the logo and one button: no menu." },
  { slug: "rotating-words", name: "Rotating words", status: "failed", note: "About ten times the scrolling work of the rest of the page." },
  { slug: "gooey-preloader", name: "Gooey preloader", status: "failed", note: "Holds the page for at least 2 seconds before anything shows." },
  { slug: "dual-scramble", name: "Dual scramble", status: "untested", note: "Text scrambles through a colour, then settles." },
  { slug: "echo-headline", name: "Echo headline", status: "untested", note: "A one-word headline grows 3D echoes as you scroll." },
  { slug: "feature-dialog", name: "Feature dialog", status: "untested", note: "A tile that opens a tall dialog with the page dimmed behind." },
  { slug: "hover-index", name: "Hover index", status: "untested", note: "A list where hovering a row shows its picture." },
  { slug: "image-fly-in", name: "Image fly-in", status: "untested", note: "Pictures fly toward you from deep in the page around a clear centre." },
  { slug: "magnetic-tag-cloud", name: "Magnetic tag cloud", status: "untested", note: "Tags knocked aside by the mouse, then pulled back into place." },
  { slug: "multi-level-drawer-menu", name: "Multi-level drawer menu", status: "untested", note: "A slide-in menu with a second panel for sub-pages." },
  { slug: "pricing", name: "Pricing", status: "untested", note: "Monthly/yearly switch with rolling numbers (could suit membership tiers)." },
  { slug: "scale-slider", name: "Scale slider", status: "untested", note: "A row of photos that shrink toward one edge; drag or let it drift." },
  { slug: "split-flap-board", name: "Split-flap board", status: "untested", note: "A station-style flip board that riffles to new words." },
  { slug: "ascii-overlay", name: "ASCII overlay", status: "untested", note: "Characters bloom over a photo as you scroll (uses three.js, heavy)." },
];

export const statusLabel = {
  "in-use": "In use on the site",
  passed: "Passed tests",
  fix: "Needs a small fix",
  failed: "Failed tests",
  untested: "Not tested yet",
};
