import type { IconKey } from "@/lib/types";
import { Icon } from "./Icon";
import { Embers } from "./Embers";
import { Mist, Rays } from "./home/art";
import { MaskWords } from "./MaskWords";
import { Flame, Moon, Ridges, Stars } from "./painting/scenery";

/** One piece of Rishav's art that stands for the page, painted into its night scene. */
export type IntroArt = "temple" | "hangingDiya" | "lotus" | "feather" | "clayDiya" | "radhaKrishna" | "moon";

const HERO_SRCSET = [828, 1280, 1920].map((w) => `/art/hero/radha-krishna-${w}.webp ${w}w`).join(", ");

function Art({ art }: { art: IntroArt }) {
  switch (art) {
    case "temple":
      // The daylight concept painting, dimmed and cooled so it reads as the temple under moonlight.
      return (
        // eslint-disable-next-line @next/next/no-img-element -- local art
        <img
          src="/art/temple-concept.jpg"
          alt=""
          width={984}
          height={1040}
          className="h-auto w-full [filter:brightness(0.62)_saturate(0.65)_sepia(0.15)_hue-rotate(185deg)_contrast(1.05)]"
          style={{ maskImage: "radial-gradient(46% 50% at 56% 46%, #000 40%, transparent 100%)" }}
        />
      );
    case "hangingDiya":
      return (
        <div className="diya-swing relative mx-auto w-[62%]">
          <span className="flame-glow absolute left-1/2 top-[57%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_110/0.5),rgb(197_139_67/0.12)_45%,transparent_70%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src="/art/hanging-diya.webp" alt="" width={640} height={770} className="relative h-auto w-full" style={{ maskImage: "linear-gradient(180deg, transparent 0%, #000 22%)" }} />
        </div>
      );
    case "lotus":
      return (
        <div className="relative mx-auto mt-[30%] w-[72%]">
          <span className="sun-glow absolute inset-[-20%] rounded-full bg-[radial-gradient(closest-side,rgb(217_121_143/0.22),transparent)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src="/art/lotus-float.webp" alt="" width={800} height={800} className="relative h-auto w-full" />
        </div>
      );
    case "feather":
      return (
        // eslint-disable-next-line @next/next/no-img-element -- local art
        <img src="/art/peacock-feather.webp" alt="" width={800} height={685} className="mt-[18%] h-auto w-full rotate-[-12deg]" />
      );
    case "clayDiya":
      return (
        <div className="relative mx-auto mt-[38%] w-[52%]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src="/art/diya-float.webp" alt="" width={600} height={600} className="relative h-auto w-full" />
          <Flame className="left-[80%] top-[8%] h-[18%] w-[9%]" />
        </div>
      );
    case "radhaKrishna":
      return (
        // eslint-disable-next-line @next/next/no-img-element -- local art
        <img
          src="/art/hero/radha-krishna-1280.webp"
          srcSet={HERO_SRCSET}
          sizes="40vw"
          alt=""
          width={2272}
          height={1536}
          className="mt-[12%] h-auto w-full"
          style={{ maskImage: "radial-gradient(46% 52% at 50% 45%, #000 35%, transparent 100%)" }}
        />
      );
    default:
      return null;
  }
}

/**
 * Opening scene for every inner page, a chapter of the same painting as Home: a night sky with
 * stars and a moon, faint rays, the page's own piece of art on the right, layered hills, and mist
 * that rises into the page's paper. Title and intro sit on the left. All scenery is aria-hidden.
 */
export function PageIntro({
  title,
  intro,
  icon,
  art = "moon",
  children,
}: {
  title: string;
  intro: string;
  icon?: IconKey;
  art?: IntroArt;
  children?: React.ReactNode;
}) {
  return (
    <section data-parallax className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#0d1622_0%,#101b29_40%,#1a283a_78%,#22324a_100%)] pb-32 pt-24 text-forest-ink md:pb-40 md:pt-28">
      <Stars className="absolute inset-x-0 top-0 h-[70%] w-full opacity-70" count={55} seed={title.length + 3} />
      {/* Rays fall from the upper right, over the art, so they never wash over the text. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -scale-x-100"><Rays className="h-full w-full opacity-20 md:opacity-30" /></div>
      <div data-speed="0.25" className={`absolute h-14 w-14 md:h-20 md:w-20 ${art === "moon" ? "right-[12%] top-[22%] md:right-[18%]" : "right-[6%] top-[12%] md:right-[44%] md:top-[14%]"}`}>
        <Moon className="absolute inset-0" />
      </div>
      <Embers className="absolute inset-0 h-full w-full" density={0.35} />

      {art !== "moon" ? (
        <div data-speed="0.12" aria-hidden className="pointer-events-none absolute bottom-[10%] right-0 hidden w-[min(40vw,520px)] md:right-[2%] md:block lg:right-[5%]">
          <Art art={art} />
        </div>
      ) : null}

      <div data-speed="-0.2" className="container-x relative z-10">
        <div className="md:max-w-[56%]">
          {icon ? <span data-intro-line className="block"><Icon name={icon} size={48} className="mb-5 text-gold-bright" /></span> : null}
          <h1 data-intro-title className="display-lg max-w-[18ch]"><MaskWords text={title} /></h1>
          <p data-intro-line className="lede measure mt-6 !text-forest-soft">{intro}</p>
          {children}
        </div>
      </div>

      {/* Hills, far to near, then the mist that becomes the page. */}
      <div data-speed="0.06" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]">
        <Ridges
          height={260}
          className="h-[110px] md:h-[170px]"
          layers={[
            { seed: title.length + 11, base: 150, amp: 40, freq: 0.7, fill: "#2c3d53", opacity: 0.7 },
            { kind: "trees", seed: title.length + 23, base: 200, amp: 30, freq: 26, fill: "#1d2b3c" },
            { seed: title.length + 37, base: 235, amp: 14, freq: 0.5, fill: "#2a3445" },
          ]}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-24 md:h-32">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(248_241_228/0.4)_55%,var(--marble)_100%)]" />
        <Mist className="absolute inset-0 h-full w-full" color="#f8f1e4" />
      </div>
    </section>
  );
}
