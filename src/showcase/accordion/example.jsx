'use client';

import Accordion from './accordion';
import './accordion.css';

export default function AccordionDemo() {
  const accordionItems = [
    {
      title: 'How long does a wheel take?',
      content: 'Three weeks from the fitting, laced and trued by hand in Vienna.',
      defaultOpen: true,
      enableStagger: true,
    },
    {
      title: 'Can I ride before I buy?',
      content: 'Every route weekend comes with a demo bike set up to your fit.',
      enableStagger: true,
    },
    {
      title: 'What if it does not fit?',
      content: 'We refit it once for free in the first season.',
      enableStagger: true,
    },
    {
      title: 'Do you ship outside Austria?',
      content: 'Across the EU, insured, in a box we take back.',
    },
    {
      title: 'How do I book a guide?',
      content: 'Pick a route and a date; we confirm within two days.',
    },
  ];

  return (
    <div className="accordion_demo_wrap">
      <h1 className="accordion_demo_title">Questions <span className="accordion_demo_title_grey">before you ride</span></h1>

      <div className="accordion_demo_content">
        <Accordion allowMultiple={false} duration={0.8} ease="expo.inOut" iconMode="both" iconRotation={-180}>
          {accordionItems.map((item, index) => (
            <Accordion.Item
              key={index}
              defaultOpen={item.defaultOpen || false}
              duration={0.8}
              ease="expo.inOut"
              iconMode="both"
              iconRotation={-180}
              enableStagger={item.enableStagger || false}
              staggerDuration={0.6}
              staggerDelay={0.15}
              staggerEase="expo.out"
              staggerYPercent={110}
              staggerStartDelay={200}
            >
              {({ toggle, isOpen, contentRef, iconRef, verticalBarRef }) => (
                <>
                  <button onClick={toggle} className="accordion_trigger">
                    <span className="accordion_title">{item.title}</span>
                    <svg ref={iconRef} className="accordion_icon" viewBox="0 0 16 16" fill="none">
                      <path
                        ref={verticalBarRef}
                        d="M8 1V15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M1 8H15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div ref={contentRef} className="accordion_content">
                    <p className="accordion_text">{item.content}</p>
                  </div>
                </>
              )}
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
