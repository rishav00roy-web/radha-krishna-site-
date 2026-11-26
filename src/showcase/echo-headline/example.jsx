'use client';

import EchoHeadline from './echo-headline';
import './echo-headline.css';

export default function EchoHeadlineDemo() {
  return (
    <div className="eh_page">
      <EchoHeadline
        copies={8}
        depth={1}
        rotateX={20}
        rotateY={20}
        rotateZ={0}
        fade="opacity"
        trigger="scrub"
        scrub={0.5}
        hold={0.2}
        once={false}
      >
        Distance
      </EchoHeadline>
      <div className="eh_cover" />
    </div>
  );
}
