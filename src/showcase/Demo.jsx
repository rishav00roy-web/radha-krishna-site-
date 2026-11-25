'use client';

import dynamic from 'next/dynamic';

// Each pack demo loads on its own page only, so their scroll effects never interfere with each other.
const demos = {
  'accordion': dynamic(() => import('./accordion/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'ascii-overlay': dynamic(() => import('./ascii-overlay/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'curtain-slider': dynamic(() => import('./curtain-slider/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'diagonal-gallery': dynamic(() => import('./diagonal-gallery/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'dual-scramble': dynamic(() => import('./dual-scramble/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'echo-headline': dynamic(() => import('./echo-headline/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'elastic-divider': dynamic(() => import('./elastic-divider/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'feature-dialog': dynamic(() => import('./feature-dialog/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'floating-navbar': dynamic(() => import('./floating-navbar/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'gooey-preloader': dynamic(() => import('./gooey-preloader/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'hover-index': dynamic(() => import('./hover-index/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'image-fly-in': dynamic(() => import('./image-fly-in/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'magnetic-tag-cloud': dynamic(() => import('./magnetic-tag-cloud/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'multi-level-drawer-menu': dynamic(() => import('./multi-level-drawer-menu/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'pricing': dynamic(() => import('./pricing/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'process-rail': dynamic(() => import('./process-rail/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'rotating-words': dynamic(() => import('./rotating-words/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'scale-slider': dynamic(() => import('./scale-slider/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'split-flap-board': dynamic(() => import('./split-flap-board/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'stacking-cards': dynamic(() => import('./stacking-cards/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
  'text-reveal': dynamic(() => import('./text-reveal/example'), { ssr: false, loading: () => <p className="sc-loading">Loading…</p> }),
};

export default function Demo({ slug }) {
  const C = demos[slug];
  return C ? <C /> : <p>Unknown component.</p>;
}
