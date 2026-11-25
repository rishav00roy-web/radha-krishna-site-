import TextReveal from './text-reveal';
import './text-reveal.css';

export default function TextRevealDemo() {
  return (
    <TextReveal
      type="words"
      start="top 75%"
      stagger={0.1}
    >
      Every object we make is weighed by hand, ridden for a year and only then given
      a name. We build for people who ride <strong>past the last road</strong> and
      come back <strong>before the light goes</strong>.
    </TextReveal>
  );
}
