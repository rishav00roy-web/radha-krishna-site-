// Demo images are from Arqe (arqe.ai). They are placeholders: swap them for your own before going live. Using them in your own product needs your own Arqe plan.
'use client';

import DiagonalGallery from './diagonal-gallery';
import './diagonal-gallery.css';

const PHOTOS = [
  {
    title: 'Day one',
    text: 'Gravel out of Girona, ninety kilometres and <b>one long climb</b>.',
    image: '/art/hero/radha-krishna-1280.jpg',
    alt: 'A cyclist riding a cream gravel bike down a white stone track',
  },
  {
    title: 'Day two',
    text: 'A ridge walk above the cloud line, <b>bikes left at the hut</b>.',
    image: '/art/temple-concept.jpg',
    alt: 'A walker in a blue jacket looking across misty hills',
  },
  {
    title: 'Day three',
    text: 'Camp at the col, with dinner cooked <b>before the light goes</b>.',
    image: '/art/temple-concept.jpg',
    alt: 'The open door of a tent looking out over snowy peaks and clouds',
  },
  {
    title: 'Day four',
    text: 'Down the canyon road, the fastest descent of <b>the whole week</b>.',
    image: '/art/peacock-feather.jpg',
    alt: 'A bird crossing a green canyon seen from above',
  },
  {
    title: 'Day five',
    text: 'The coast by evening and <b>a swim before dinner</b>.',
    image: '/art/hanging-diya.jpg',
    alt: 'A sailboat alone on a calm sea',
  },
];

export default function DiagonalGalleryDemo() {
  return (
    <div className="demo-container">
      <DiagonalGallery step={110} duration={0.9} thumb={22} photos={PHOTOS} />
    </div>
  );
}
