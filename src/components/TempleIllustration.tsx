/**
 * Artistic concept illustration of the proposed temple at dawn.
 * A stand-in for the official 3D render (swap via Admin -> Website media -> Hero image).
 * Layers carry data-depth so the hero can parallax them; nothing is hidden without JS.
 */
export function TempleIllustration({ className, title }: { className?: string; title: string }) {
  const ribs = [-80, -48, -16, 16, 48, 80];
  const bands = [350, 318, 286, 254, 222, 192];
  const columns = Array.from({ length: 9 }, (_, i) => 440 + i * 40);
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d241c" />
          <stop offset="0.38" stopColor="#21402f" />
          <stop offset="0.66" stopColor="#8a7a45" />
          <stop offset="0.82" stopColor="#d9b46a" />
          <stop offset="1" stopColor="#f3dca0" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4cf" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#f4d488" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4d488" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9dfcb" />
          <stop offset="0.45" stopColor="#fbf7ee" />
          <stop offset="1" stopColor="#ddd0b6" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d58a" />
          <stop offset="1" stopColor="#a87a26" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d5e4c" />
          <stop offset="1" stopColor="#13291e" />
        </linearGradient>
        <linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe7a6" />
          <stop offset="1" stopColor="#d49a3a" />
        </linearGradient>
        <clipPath id="pondClip">
          <rect x="0" y="584" width="1200" height="216" />
        </clipPath>
      </defs>

      <rect width="1200" height="800" fill="url(#sky)" />

      <g data-depth="0.15" className="sun">
        <circle cx="600" cy="300" r="300" fill="url(#sun)" />
        <g className="rays" opacity="0.18" fill="#fff1c4">
          {[-60, -38, -18, 0, 18, 38, 60].map((a) => (
            <polygon key={a} points="600,300 590,-200 610,-200" transform={`rotate(${a} 600 300)`} />
          ))}
        </g>
      </g>

      <g data-depth="0.3">
        <path d="M0 520 C120 470 230 480 330 500 S520 470 640 495 S880 460 1000 488 S1150 470 1200 480 V600 H0Z" fill="#2c4a37" opacity="0.75" />
        <path d="M0 545 C160 515 300 530 420 540 S700 520 820 535 S1060 515 1200 530 V600 H0Z" fill="#203a2b" />
      </g>

      {/* Temple group, mirrored below into the pond */}
      <g id="temple" data-depth="0.5">
        {/* platform */}
        <rect x="330" y="540" width="540" height="22" fill="#d8ccb3" />
        <rect x="350" y="520" width="500" height="22" fill="#e6dcc7" />
        <rect x="370" y="500" width="460" height="22" fill="#f1e9d9" />
        <path d="M330 540h540M350 520h500M370 500h460" stroke="#b9a37a" strokeWidth="1" />

        {/* side wings */}
        <rect x="380" y="420" width="92" height="80" fill="url(#marble)" />
        <rect x="728" y="420" width="92" height="80" fill="url(#marble)" />
        <path d="M410 420 C413 382 430 352 446 336 L454 336 C470 352 487 382 490 420Z" fill="url(#marble)" stroke="#cdbb95" />
        <path d="M710 420 C713 382 730 352 746 336 L754 336 C770 352 787 382 790 420Z" fill="url(#marble)" stroke="#cdbb95" />
        <ellipse cx="450" cy="333" rx="11" ry="4.5" fill="url(#gold)" />
        <ellipse cx="750" cy="333" rx="11" ry="4.5" fill="url(#gold)" />
        <path d="M446 329c0-6 2-9 4-11 2 2 4 5 4 11z M746 329c0-6 2-9 4-11 2 2 4 5 4 11z" fill="url(#gold)" />

        {/* inner towers */}
        <path d="M470 380 C473 330 490 296 505 278 L515 278 C530 296 545 330 548 380Z" fill="url(#marble)" stroke="#cdbb95" />
        <path d="M652 380 C655 330 670 296 685 278 L695 278 C710 296 727 330 730 380Z" fill="url(#marble)" stroke="#cdbb95" />
        <ellipse cx="510" cy="275" rx="13" ry="5" fill="url(#gold)" />
        <ellipse cx="690" cy="275" rx="13" ry="5" fill="url(#gold)" />

        {/* main hall */}
        <rect x="420" y="380" width="360" height="120" fill="url(#marble)" />
        <rect x="414" y="374" width="372" height="12" fill="url(#gold)" opacity="0.9" />
        {columns.map((x) => (
          <g key={x}>
            <rect x={x - 4} y="398" width="8" height="102" fill="#efe6d3" stroke="#cdbb95" strokeWidth="0.8" />
            <rect x={x - 7} y="394" width="14" height="5" fill="url(#gold)" />
          </g>
        ))}
        <path d="M572 500 V448 a28 28 0 0 1 56 0 V500Z" fill="url(#doorGlow)" className="door" />
        <path d="M566 500 V446 a34 34 0 0 1 68 0 V500" fill="none" stroke="url(#gold)" strokeWidth="3" />

        {/* main shikhara */}
        <path d="M500 380 C505 300 540 214 586 164 L614 164 C660 214 695 300 700 380Z" fill="url(#marble)" stroke="#c9b68e" />
        {bands.map((y, i) => {
          const half = 100 - i * 13 - (i > 3 ? 6 : 0);
          return <path key={y} d={`M${600 - half} ${y} Q600 ${y + 7} ${600 + half} ${y}`} fill="none" stroke="#c9b68e" strokeWidth="1.1" />;
        })}
        {ribs.map((dx) => (
          <path key={dx} d={`M${600 + dx} 380 C${600 + dx * 0.9} 300 ${600 + dx * 0.45} 220 ${600 + dx * 0.12} 166`} fill="none" stroke="#d8c9a6" strokeWidth="1" />
        ))}
        <ellipse cx="600" cy="160" rx="27" ry="9" fill="url(#gold)" />
        <path d="M588 152 c0-12 5-20 12-26 7 6 12 14 12 26z" fill="url(#gold)" />
        <circle cx="600" cy="122" r="5" fill="url(#gold)" />
        <path d="M600 118 V70" stroke="#a87a26" strokeWidth="2" />
        <path d="M600 72 L634 82 L600 94Z" fill="#e0782f" className="flag" />
      </g>

      {/* gardens and bamboo */}
      <g data-depth="0.7" fill="#173022">
        {[[300, 566, 36], [262, 572, 28], [880, 566, 38], [924, 572, 28], [350, 574, 22], [842, 574, 22]].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g data-depth="0.85" stroke="#0f2219" strokeWidth="7" strokeLinecap="round" fill="none">
        {[60, 98, 132, 170, 1030, 1066, 1104, 1140].map((x, i) => (
          <path key={x} d={`M${x} 600 C${x + (i % 2 ? 8 : -6)} 440 ${x + (i % 2 ? -10 : 12)} 300 ${x + (i % 2 ? 6 : -4)} ${150 + (i % 3) * 30}`} />
        ))}
      </g>
      <g data-depth="0.85" fill="#0f2219">
        {[[70, 210], [120, 260], [150, 180], [40, 320], [175, 350], [1040, 220], [1090, 170], [1130, 280], [1160, 200], [1070, 340]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} q${i % 2 ? 34 : -34} -8 ${i % 2 ? 52 : -52} 10 q${i % 2 ? -26 : 26} 6 ${i % 2 ? -52 : 52} -10z`} />
        ))}
      </g>

      {/* pond with reflection */}
      <rect x="0" y="584" width="1200" height="216" fill="url(#water)" />
      <g clipPath="url(#pondClip)" opacity="0.28">
        <use href="#temple" transform="translate(0 1124) scale(1 -1)" />
      </g>
      <g stroke="#f3dca0" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round">
        <path d="M420 620h120M660 630h140M500 660h90M300 690h110M760 700h120M560 720h80" />
      </g>
      <g className="lotuses">
        {[[230, 690], [380, 740], [860, 680], [990, 735], [640, 770]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + (i % 3) * 0.2})`}>
            <ellipse cx="0" cy="8" rx="34" ry="7" fill="#24452f" />
            <path d="M0 4c-6-5-8-12-6-20 4 2 6 5 6 9 0-4 2-7 6-9 2 8 0 15-6 20z" fill="#f2c3cf" />
            <path d="M0 4c-10 0-17-5-20-13 6-1 12 1 15 6M0 4c10 0 17-5 20-13-6-1-12 1-15 6" fill="#e59bae" />
          </g>
        ))}
      </g>
      <rect x="0" y="582" width="1200" height="3" fill="#e6c77a" opacity="0.45" />
    </svg>
  );
}
