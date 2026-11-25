// Demo images are from Arqe (arqe.ai). They are placeholders: swap them for your own before going live. Using them in your own product needs your own Arqe plan.
'use client';

import { useRef } from 'react';
import FloatingNavbar from './floating-navbar';
import './floating-navbar.css';

export default function FloatingNavbarDemo() {
  const bodyRef = useRef(null);

  return (
    <div className="fnb_page">
      <FloatingNavbar
        threshold={80}
        duration={0.42}
        ease="annnimate"
        mode="toggle"
        offset={12}
        mark="M"
        hideStartRef={bodyRef}
      />

      <section className="fnb_hero">
        <img
          className="fnb_hero_img"
          src="/art/temple-concept.jpg"
          alt="A bird over a green valley"
          decoding="async"
        />
        <div className="fnb_hero_scrim" aria-hidden="true" />
        <h1 className="fnb_hero_title"><span className="fnb_hero_title_line">Ride the long way</span> <span className="fnb_hero_title_line fnb_hero_title_dim">home.</span></h1>
      </section>

      <section ref={bodyRef} className="fnb_body" data-anm-fnb-hide-start>
        <p className="fnb_text">Built for the early miles and the last ones, <b>tested on the same loop</b> in every weather.</p>

        <figure className="fnb_media fnb_media_wide">
          <img
            className="fnb_media_img"
            src="/art/hanging-diya.jpg"
            alt="Calm hazy sea at dawn"
            decoding="async"
          />
        </figure>

        <figure className="fnb_media fnb_media_tall">
          <img
            className="fnb_media_img"
            src="/art/peacock-feather.jpg"
            alt="Black towel on a pale ground"
            decoding="async"
          />
        </figure>
      </section>
    </div>
  );
}
