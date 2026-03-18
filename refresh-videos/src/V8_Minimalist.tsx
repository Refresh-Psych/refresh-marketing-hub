import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
  spring,
} from "remotion";

// -- Brand Colors --
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const CHARCOAL = "#2D3748";
const LIGHT_GRAY = "#f8f9fa";
const GRAY = "#9CA3AF";

const FONT = "'Montserrat', 'Poppins', 'DM Sans', system-ui, sans-serif";

// Google Font import
const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&display=swap');`;

// Apple's standard easing
const APPLE_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ============================================================
// HELPERS
// ============================================================

/** Smooth interpolate with Apple easing, clamped */
const ease = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE_EASE,
  });

/** Fade in over duration frames starting at start */
const fadeIn = (frame: number, start: number, duration = 40) =>
  ease(frame, start, start + duration, 0, 1);

/** Fade out over duration frames starting at start */
const fadeOut = (frame: number, start: number, duration = 30) =>
  ease(frame, start, start + duration, 1, 0);

/** Fade in then out — for cinematic title cards */
const fadeInOut = (
  frame: number,
  start: number,
  hold: number,
  fadeDur = 15,
) => {
  const inVal = fadeIn(frame, start, fadeDur);
  const outVal = fadeOut(frame, start + hold - fadeDur, fadeDur);
  return Math.min(inVal, outVal);
};

// ============================================================
// SCENE 1 — The Question (0–90)
// ============================================================

const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const wordDelay = 20;
  const whyOpacity = fadeIn(frame, 0, 40);
  const didntOpacity = fadeIn(frame, wordDelay, 40);
  const itWorkOpacity = fadeIn(frame, wordDelay * 2, 40);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          fontFamily: FONT,
          color: BLACK,
          opacity: whyOpacity,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        Why
      </div>
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          fontFamily: FONT,
          color: BLACK,
          opacity: didntOpacity,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        didn't
      </div>
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          fontFamily: FONT,
          color: BLUE,
          opacity: itWorkOpacity,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        it work?
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2 — The Experience (90–210)
// ============================================================

const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const phrases = [
    "You tried the first medication.",
    "Side effects.",
    "You tried the second.",
    "Nothing.",
    "The third.",
    "Worse.",
  ];

  const totalFrames = 120; // 90–210
  const perPhrase = totalFrames / phrases.length; // 20 frames each

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {phrases.map((phrase, i) => {
        const start = i * perPhrase;
        const opacity = fadeInOut(frame, start, perPhrase, 8);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              fontSize: 48,
              fontWeight: 400,
              fontFamily: FONT,
              color: WHITE,
              opacity,
              textAlign: "center",
              padding: "0 80px",
              letterSpacing: "-0.02em",
              lineHeight: 1.4,
            }}
          >
            {phrase}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3 — The Discovery (210–330)
// ============================================================

const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
  const thenOpacity = fadeIn(frame, 0, 40);
  const dnaOpacity = fadeIn(frame, 20, 40);
  const answerOpacity = fadeIn(frame, 40, 40);
  const pgxOpacity = fadeIn(frame, 70, 40);

  // Yellow line draws across — width animates from 0 to 400
  const lineWidth = ease(frame, 80, 115, 0, 400);
  const lineOpacity = fadeIn(frame, 80, 30);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* Top text */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 300,
          fontFamily: FONT,
          color: GRAY,
          opacity: thenOpacity,
          marginBottom: 30,
          letterSpacing: "0.02em",
        }}
      >
        Then you discovered
      </div>

      {/* Massive DNA text */}
      <div
        style={{
          fontSize: 150,
          fontWeight: 900,
          fontFamily: FONT,
          color: BLACK,
          opacity: dnaOpacity,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        Your DNA
      </div>

      {/* Below text */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 300,
          fontFamily: FONT,
          color: GRAY,
          opacity: answerOpacity,
          marginTop: 20,
          letterSpacing: "0.02em",
        }}
      >
        has the answer.
      </div>

      {/* Pharmacogenomic Testing */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          fontFamily: FONT,
          color: BLUE,
          opacity: pgxOpacity,
          marginTop: 60,
          letterSpacing: "-0.01em",
        }}
      >
        Pharmacogenomic Testing
      </div>

      {/* Yellow line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: YELLOW,
          opacity: lineOpacity,
          marginTop: 16,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4 — What It Reveals (330–450)
// ============================================================

const DNAHelix: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    style={{ opacity, marginBottom: 30 }}
  >
    <path
      d="M15 5 Q30 15 15 25 Q0 35 15 45 Q30 55 15 55"
      fill="none"
      stroke={BLUE}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M45 5 Q30 15 45 25 Q60 35 45 45 Q30 55 45 55"
      fill="none"
      stroke={BLUE}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Rungs */}
    {[12, 20, 28, 36, 44].map((y, i) => (
      <line
        key={i}
        x1={18 + (i % 2 === 0 ? 0 : 5)}
        y1={y}
        x2={42 - (i % 2 === 0 ? 0 : 5)}
        y2={y}
        stroke={GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.4}
      />
    ))}
  </svg>
);

const Scene4: React.FC<{ frame: number }> = ({ frame }) => {
  const items = [
    { text: "Which medications your body metabolizes well", color: CHARCOAL, bold: false },
    { text: "Which ones cause side effects", color: CHARCOAL, bold: false },
    { text: "Which ones won't work for you", color: CHARCOAL, bold: false },
    { text: "Which ones will.", color: YELLOW, bold: true },
  ];

  const helixOpacity = fadeIn(frame, 0, 40);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: LIGHT_GRAY,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "0 70px",
      }}
    >
      <DNAHelix opacity={helixOpacity} />

      {items.map((item, i) => {
        const delay = 15 + i * 22;
        const opacity = fadeIn(frame, delay, 35);
        const translateY = ease(frame, delay, delay + 35, 30, 0);

        return (
          <div
            key={i}
            style={{
              fontSize: 38,
              fontWeight: item.bold ? 800 : 400,
              fontFamily: FONT,
              color: item.color,
              opacity,
              transform: `translateY(${translateY}px)`,
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {item.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5 — The Impact (450–560)
// ============================================================

const Scene5: React.FC<{ frame: number }> = ({ frame }) => {
  const millionOpacity = fadeIn(frame, 0, 40);
  const watchedOpacity = fadeIn(frame, 15, 40);
  const savedOpacity = fadeIn(frame, 45, 40);
  const doctorOpacity = fadeIn(frame, 55, 40);
  const commentOpacity = fadeIn(frame, 75, 40);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "0 70px",
      }}
    >
      {/* 3.1 MILLION */}
      <div
        style={{
          fontSize: 100,
          fontWeight: 900,
          fontFamily: FONT,
          color: YELLOW,
          opacity: millionOpacity,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        3.1 MILLION
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          fontFamily: FONT,
          color: WHITE,
          opacity: watchedOpacity,
          marginTop: 12,
          marginBottom: 50,
        }}
      >
        people watched this on TikTok.
      </div>

      {/* Saved */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 400,
          fontFamily: FONT,
          color: WHITE,
          opacity: savedOpacity,
        }}
      >
        88,000 saved it
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          fontFamily: FONT,
          color: YELLOW,
          opacity: doctorOpacity,
          marginTop: 8,
          marginBottom: 60,
        }}
      >
        to show their doctor.
      </div>

      {/* Comment */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 300,
          fontFamily: FONT,
          color: GRAY,
          opacity: commentOpacity,
          textAlign: "center",
          fontStyle: "italic",
          lineHeight: 1.5,
          maxWidth: 800,
        }}
      >
        The #1 comment: "Wait — this is real?{"\n"}My doctor never mentioned this."
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6 — Refresh Does This (560–640)
// ============================================================

const Scene6: React.FC<{ frame: number }> = ({ frame }) => {
  const nameOpacity = fadeIn(frame, 0, 40);
  const offersOpacity = fadeIn(frame, 15, 40);
  const beforeOpacity = fadeIn(frame, 40, 40);
  const testOpacity = fadeIn(frame, 55, 40);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          fontFamily: FONT,
          color: BLACK,
          opacity: nameOpacity,
          letterSpacing: "-0.02em",
        }}
      >
        Refresh Psychiatry
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          fontFamily: FONT,
          color: GRAY,
          opacity: offersOpacity,
          marginTop: 12,
          marginBottom: 60,
        }}
      >
        offers pharmacogenomic testing.
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 400,
          fontFamily: FONT,
          color: CHARCOAL,
          opacity: beforeOpacity,
        }}
      >
        Before we prescribe,
      </div>

      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          fontFamily: FONT,
          color: YELLOW,
          opacity: testOpacity,
          marginTop: 10,
        }}
      >
        we test.
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 7 — CTA (640–720)
// ============================================================

const Scene7: React.FC<{ frame: number }> = ({ frame }) => {
  const phoneOpacity = fadeIn(frame, 0, 40);
  const urlOpacity = fadeIn(frame, 10, 40);
  const lineWidth = ease(frame, 15, 50, 0, 300);
  const lineOpacity = fadeIn(frame, 15, 30);
  const telehealthOpacity = fadeIn(frame, 25, 40);
  const insuranceOpacity = fadeIn(frame, 35, 40);
  const taglineOpacity = fadeIn(frame, 45, 40);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* Phone */}
      <div
        style={{
          fontSize: 54,
          fontWeight: 700,
          fontFamily: FONT,
          color: BLUE,
          opacity: phoneOpacity,
          letterSpacing: "-0.01em",
        }}
      >
        (954) 603-4081
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 400,
          fontFamily: FONT,
          color: CHARCOAL,
          opacity: urlOpacity,
          marginTop: 12,
        }}
      >
        refreshpsychiatry.com
      </div>

      {/* Yellow line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: YELLOW,
          opacity: lineOpacity,
          marginTop: 40,
          marginBottom: 40,
          borderRadius: 2,
        }}
      />

      {/* Telehealth */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          fontFamily: FONT,
          color: CHARCOAL,
          opacity: telehealthOpacity,
        }}
      >
        Telehealth across Florida
      </div>

      {/* Insurance */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 300,
          fontFamily: FONT,
          color: GRAY,
          opacity: insuranceOpacity,
          marginTop: 16,
          textAlign: "center",
          padding: "0 60px",
          lineHeight: 1.5,
        }}
      >
        Insurance: Aetna · United · Cigna · Humana · Avmed · UMR · Oscar
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          fontFamily: FONT,
          color: BLUE,
          opacity: taglineOpacity,
          marginTop: 50,
          textAlign: "center",
          letterSpacing: "0.01em",
        }}
      >
        DNA-guided psychiatry. Same-week appointments.
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================

export const V8_Minimalist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: WHITE }}>
      <style>{fontStyle}</style>

      {/* Scene 1 — The Question (0–90) */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1 frame={frame} />
      </Sequence>

      {/* Scene 2 — The Experience (90–210) */}
      <Sequence from={90} durationInFrames={120}>
        <Scene2 frame={frame - 90} />
      </Sequence>

      {/* Scene 3 — The Discovery (210–330) */}
      <Sequence from={210} durationInFrames={120}>
        <Scene3 frame={frame - 210} />
      </Sequence>

      {/* Scene 4 — What It Reveals (330–450) */}
      <Sequence from={330} durationInFrames={120}>
        <Scene4 frame={frame - 330} />
      </Sequence>

      {/* Scene 5 — The Impact (450–560) */}
      <Sequence from={450} durationInFrames={110}>
        <Scene5 frame={frame - 450} />
      </Sequence>

      {/* Scene 6 — Refresh Does This (560–640) */}
      <Sequence from={560} durationInFrames={80}>
        <Scene6 frame={frame - 560} />
      </Sequence>

      {/* Scene 7 — CTA (640–720) */}
      <Sequence from={640} durationInFrames={80}>
        <Scene7 frame={frame - 640} />
      </Sequence>
    </AbsoluteFill>
  );
};
