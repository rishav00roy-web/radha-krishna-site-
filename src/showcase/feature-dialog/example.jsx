// Demo images are from Arqe (arqe.ai). They are placeholders: swap them for your own before going live. Using them in your own product needs your own Arqe plan.
'use client';

import FeatureDialog from './feature-dialog';

/**
 * Demo for FeatureDialog
 *
 * This file provides example prop values for testing the React component.
 * Content matches the HTML demo file.
 */
export default function FeatureDialogDemo() {
  return (
    <FeatureDialog
      duration={0.7}
      ease="annnimate"
      label="Night ball, 01"
      title="Game leather"
      tileImage={{
        src: '/art/peacock-feather.jpg',
        alt: 'A dark leather football on a black studio ground',
      }}
      sheetTitle="Broken in by hand"
      sheetText="Full-grain leather, worked in by hand before it ships, so the first touch feels like the hundredth."
      actionLabel="Explore the story"
      mediaImages={[
        {
          src: '/art/hero/radha-krishna-1280.jpg',
          alt: 'An aerial view of a turquoise river in a rust canyon',
        },
        {
          src: '/art/hanging-diya.jpg',
          alt: 'A wave rolling in across a slate sea at dusk',
        },
      ]}
      stats={[
        { num: '430 g', label: 'Weighed to the gram' },
        { num: '68 cm', label: 'Circumference, size 5' },
        { num: '0.8 bar', label: 'Playing pressure' },
      ]}
      sheetImage={{
        src: '/art/temple-concept.jpg',
        alt: 'A bird over a green valley',
      }}
      outro="Made for the pitch behind the gym, in January, with cold hands."
    />
  );
}
