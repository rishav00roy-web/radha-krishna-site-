'use client';

import HoverIndex from './hover-index';
import './hover-index.css';

export default function HoverIndexDemo() {
  return <div className="demo-container">
      <HoverIndex range={2} dim={14} follow={9} />
    </div>;
}
