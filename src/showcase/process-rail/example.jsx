// Demo images are from Arqe (arqe.ai). They are placeholders: swap them for your own before going live. Using them in your own product needs your own Arqe plan.
'use client';

import ProcessRail from './process-rail';
import './process-rail.css';

const STEPS = [
  {
    num: '01',
    title: 'Scout',
    text: 'We walk every route before anyone rides it.',
    image: '/art/temple-concept.jpg',
    alt: 'Walker in a blue jacket above misty hills',
  },
  {
    num: '02',
    title: 'Map',
    text: 'Climbs, water and shelter marked to the metre.',
    image: '/art/hero/radha-krishna-1280.jpg',
    alt: 'Aerial view of a turquoise river through a rust canyon',
  },
  {
    num: '03',
    title: 'Camp',
    text: 'A tent pitched at the col before the group arrives.',
    image: '/art/temple-concept.jpg',
    alt: 'Open tent door onto snowy peaks',
  },
  {
    num: '04',
    title: 'Ride',
    text: 'Six riders, one guide, and the bikes already set up.',
    image: '/art/peacock-feather.jpg',
    alt: 'A bird over a deep green canyon',
  },
];

export default function ProcessRailDemo() {
  return (
    <ProcessRail
      steps={STEPS}
      scrub={0.6}
      beadSize={10}
      sticky
      stagger={0.08}
    />
  );
}
