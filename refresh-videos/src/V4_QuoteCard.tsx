import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
  Sequence,
} from "remotion";

// -- Brand colors --
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const MUTED_RED = "#9b2c2c";

// -- Background tones --
const CREAM = "#faf5f0";
const WARM_DARK = "#f0e6d8";

// -- Fonts --
const SERIF = "'Georgia', 'Times New Roman', serif";
const SANS = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

// -- Helpers --
const smooth = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) => {
  if (start >= end) return to; // guard against equal inputRange
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
};

const gentleFade = (
  frame: number,
  start: number,
  duration = 30,
) => smooth(frame, start, start + duration, 0, 1);

// -- Radial glow helper --
const RadialGlow: React.FC<{
  color: string;
  x: string;
  y: string;
  size: number;
  opacity: number;
}> = ({ color, x, y, size, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  />
);

// -- Gold divider line --
const GoldLine: React.FC<{
  width: number;
  opacity?: number;
  marginTop?: number;
  marginBottom?: number;
}> = ({ width, opacity = 1, marginTop = 20, marginBottom = 20 }) => (
  <div
    style={{
      width,
      height: 2,
      background: `linear-gradient(90deg, transparent 0%, ${YELLOW} 20%, ${YELLOW} 80%, transparent 100%)`,
      margin: `${marginTop}px auto ${marginBottom}px`,
      borderRadius: 2,
      opacity,
    }}
  />
);

/* ================================================================
   SCENE 1 — Hook (frames 0–100)
   ================================================================ */
const Scene1_Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const labelOpacity = gentleFade(frame, 10, 40);
  const quoteOpacity = gentleFade(frame, 35, 45);
  const quoteY = smooth(frame, 35, 80, 12, 0);
  const glowOpacity = smooth(frame, 20, 80, 0, 0.35);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CREAM,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Warm golden glow */}
      <RadialGlow
        color="#f6c74455"
        x="50%"
        y="50%"
        size={800}
        opacity={glowOpacity}
      />

      {/* Reddit source label */}
      <div
        style={{
          position: "absolute",
          top: 220,
          width: "100%",
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 26,
          color: "#a0917e",
          letterSpacing: 1.5,
          opacity: labelOpacity,
          textTransform: "uppercase",
        }}
      >
        from r/ADHD · 54,000 upvotes
      </div>

      {/* Main quote */}
      <div
        style={{
          opacity: quoteOpacity,
          transform: `translateY(${quoteY}px)`,
          textAlign: "center",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 72,
          lineHeight: 1.35,
          color: CHARCOAL,
          maxWidth: 860,
        }}
      >
        "I was diagnosed at 37."
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================
   SCENE 2 — Quote 1: Late Diagnosis (frames 100–250)
   ================================================================ */
const Scene2_Quote1: React.FC<{ frame: number }> = ({ frame }) => {
  const lines: { text: string; delay: number; highlight?: string }[] = [
    { text: "For 37 years...", delay: 10 },
    { text: "I thought I was lazy.", delay: 35, highlight: "lazy" },
    { text: "I thought I was broken.", delay: 65, highlight: "broken" },
    { text: "I thought everyone else", delay: 95 },
    { text: "just tried harder.", delay: 115 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CREAM,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        {lines.map((line, i) => {
          const opacity = gentleFade(frame, line.delay, 25);
          const y = smooth(frame, line.delay, line.delay + 35, 20, 0);

          // Render text with highlighted word
          const renderText = () => {
            if (!line.highlight) {
              return line.text;
            }
            const parts = line.text.split(line.highlight);
            return (
              <>
                {parts[0]}
                <span style={{ color: MUTED_RED, fontWeight: 600 }}>
                  {line.highlight}
                </span>
                {parts[1]}
              </>
            );
          };

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 62,
                lineHeight: 1.4,
                color: CHARCOAL,
                textAlign: "center",
              }}
            >
              {renderText()}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================
   SCENE 3 — Quote 2: Anxiety + Depression (frames 250–400)
   ================================================================ */
const Scene3_Quote2: React.FC<{ frame: number }> = ({ frame }) => {
  const labelOpacity = gentleFade(frame, 8, 35);

  const lines: { text: string; delay: number; effect?: string }[] = [
    { text: "Anxiety and depression", delay: 25 },
    { text: "at the same time", delay: 45 },
    { text: "feels like being scared", delay: 65, effect: "tremble" },
    { text: "and tired", delay: 90, effect: "droop" },
    { text: "simultaneously.", delay: 110 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WARM_DARK,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Reddit source label */}
      <div
        style={{
          position: "absolute",
          top: 220,
          width: "100%",
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 26,
          color: "#a0917e",
          letterSpacing: 1.5,
          opacity: labelOpacity,
          textTransform: "uppercase",
        }}
      >
        from r/mentalhealth · 48,000 upvotes
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {lines.map((line, i) => {
          const opacity = gentleFade(frame, line.delay, 25);
          const baseY = smooth(frame, line.delay, line.delay + 35, 20, 0);

          // Tremble effect for "scared"
          let extraTransform = "";
          if (line.effect === "tremble" && frame > line.delay + 25) {
            const tremblePhase = (frame - line.delay - 25) * 0.8;
            const trembleAmount =
              Math.sin(tremblePhase) * 1.8 * Math.max(0, 1 - (frame - line.delay - 25) / 100);
            extraTransform = `translateX(${trembleAmount}px)`;
          }

          // Droop effect for "tired"
          let droopY = 0;
          let droopOpacity = 1;
          if (line.effect === "droop" && frame > line.delay + 30) {
            droopY = smooth(frame, line.delay + 30, line.delay + 70, 0, 8);
            droopOpacity = smooth(frame, line.delay + 30, line.delay + 70, 1, 0.55);
          }

          // Render with word-level effects
          const renderText = () => {
            if (line.effect === "tremble") {
              const parts = line.text.split("scared");
              return (
                <>
                  {parts[0]}
                  <span
                    style={{
                      display: "inline-block",
                      transform: extraTransform,
                      color: "#8b5e3c",
                    }}
                  >
                    scared
                  </span>
                  {parts[1]}
                </>
              );
            }
            if (line.effect === "droop") {
              const parts = line.text.split("tired");
              return (
                <>
                  {parts[0]}
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${droopY}px)`,
                      opacity: droopOpacity,
                      color: "#7c6f64",
                    }}
                  >
                    tired
                  </span>
                  {parts[1]}
                </>
              );
            }
            return line.text;
          };

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${baseY}px)`,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 58,
                lineHeight: 1.4,
                color: CHARCOAL,
                textAlign: "center",
              }}
            >
              {renderText()}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================
   SCENE 4 — The Contradiction (frames 400–520)
   ================================================================ */
const Scene4_Contradiction: React.FC<{ frame: number }> = ({ frame }) => {
  const dividerOpacity = gentleFade(frame, 5, 30);

  // Left side text — typewriter
  const leftText = "Wanting friends\nbut hating\nto socialize";
  const rightText =
    "Wanting to sleep\nbut too scared\nto be alone with\nyour thoughts";

  const leftChars = Math.floor(
    smooth(frame, 15, 80, 0, leftText.length),
  );
  const rightChars = Math.floor(
    smooth(frame, 40, 105, 0, rightText.length),
  );

  const leftVisible = leftText.slice(0, leftChars);
  const rightVisible = rightText.slice(0, rightChars);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CREAM,
        flexDirection: "row",
      }}
    >
      {/* Left half — cool tone */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f0f0f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 48,
            lineHeight: 1.5,
            color: "#4a5568",
            textAlign: "center",
            whiteSpace: "pre-wrap",
          }}
        >
          {leftVisible}
          <span
            style={{
              opacity: frame % 30 < 18 ? 1 : 0,
              color: "#a0aec0",
            }}
          >
            |
          </span>
        </div>
      </div>

      {/* Golden divider line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "15%",
          bottom: "15%",
          width: 2,
          background: `linear-gradient(180deg, transparent 0%, ${YELLOW} 20%, ${YELLOW} 80%, transparent 100%)`,
          opacity: dividerOpacity,
          transform: "translateX(-50%)",
        }}
      />

      {/* Right half — warm tone */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f5efe6",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 48,
            lineHeight: 1.5,
            color: "#5d4e37",
            textAlign: "center",
            whiteSpace: "pre-wrap",
          }}
        >
          {rightVisible}
          <span
            style={{
              opacity: frame % 30 < 18 ? 1 : 0,
              color: "#c4b5a0",
            }}
          >
            |
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================
   SCENE 5 — The Hope (frames 520–620)
   ================================================================ */
const Scene5_Hope: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  const treatableOpacity = gentleFade(frame, 15, 30);
  const treatableScale = smooth(frame, 15, 50, 0.95, 1);

  // "Together." uses a spring for gentle bounce
  const togetherProgress = spring({
    frame: frame - 50,
    fps,
    config: {
      damping: 18,
      stiffness: 80,
      mass: 1.2,
    },
  });
  const togetherOpacity = frame >= 50 ? togetherProgress : 0;

  const communityOpacity = gentleFade(frame, 70, 30);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* "Both are treatable." */}
      <div
        style={{
          opacity: treatableOpacity,
          transform: `scale(${treatableScale})`,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 76,
          color: BLUE,
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Both are treatable.
      </div>

      {/* "Together." */}
      <div
        style={{
          opacity: togetherOpacity,
          transform: `scale(${togetherProgress})`,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 68,
          color: YELLOW,
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        Together.
      </div>

      {/* Community note */}
      <div
        style={{
          opacity: communityOpacity,
          fontFamily: SANS,
          fontSize: 28,
          color: "#718096",
          textAlign: "center",
          maxWidth: 750,
          lineHeight: 1.6,
        }}
      >
        6,200 people found community in the comments.
        <br />
        You're not alone.
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================
   SCENE 6 — CTA (frames 620–720)
   ================================================================ */
const Scene6_CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const brandOpacity = gentleFade(frame, 8, 25);
  const taglineOpacity = gentleFade(frame, 25, 25);
  const lineOpacity = gentleFade(frame, 40, 20);
  const contactOpacity = gentleFade(frame, 50, 25);
  const servicesOpacity = gentleFade(frame, 65, 25);
  const insuranceOpacity = gentleFade(frame, 78, 25);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CREAM,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Brand name */}
      <div
        style={{
          opacity: brandOpacity,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 64,
          color: BLUE,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Refresh Psychiatry
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 36,
          color: CHARCOAL,
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Where understanding comes first.
      </div>

      {/* Gold divider */}
      <div style={{ opacity: lineOpacity, width: "100%" }}>
        <GoldLine width={400} marginTop={0} marginBottom={35} />
      </div>

      {/* Phone */}
      <div
        style={{
          opacity: contactOpacity,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 42,
          color: CHARCOAL,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        (954) 603-4081
      </div>

      {/* Website */}
      <div
        style={{
          opacity: contactOpacity,
          fontFamily: SANS,
          fontSize: 34,
          color: BLUE,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        refreshpsychiatry.com
      </div>

      {/* Services */}
      <div
        style={{
          opacity: servicesOpacity,
          fontFamily: SANS,
          fontSize: 28,
          color: "#718096",
          textAlign: "center",
          letterSpacing: 2,
          marginBottom: 24,
        }}
      >
        Anxiety · Depression · ADHD · Telehealth FL
      </div>

      {/* Insurance */}
      <div
        style={{
          opacity: insuranceOpacity,
          fontFamily: SANS,
          fontSize: 22,
          color: "#a0aec0",
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.5,
        }}
      >
        Insurance accepted: Aetna, United, Cigna, Humana, Avmed, UMR, Oscar
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================
   SCENE TRANSITIONS — Smooth cross-fade between scenes
   ================================================================ */
const SceneFade: React.FC<{
  frame: number;
  sceneStart: number;
  sceneEnd: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({ frame, sceneStart, sceneEnd, fadeIn = 15, fadeOut = 15, children }) => {
  const inOpacity = smooth(frame, sceneStart, sceneStart + fadeIn, 0, 1);
  const outOpacity = smooth(frame, sceneEnd - fadeOut, sceneEnd, 1, 0);
  const opacity = Math.min(inOpacity, outOpacity);

  if (frame < sceneStart - 1 || frame > sceneEnd + 1) return null;

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export const V4_QuoteCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      {/* Scene 1: Hook (0-100) */}
      <SceneFade frame={frame} sceneStart={0} sceneEnd={100} fadeIn={0}>
        <Scene1_Hook frame={frame} />
      </SceneFade>

      {/* Scene 2: Quote 1 — Late Diagnosis (100-250) */}
      <SceneFade frame={frame} sceneStart={100} sceneEnd={250}>
        <Scene2_Quote1 frame={frame - 100} />
      </SceneFade>

      {/* Scene 3: Quote 2 — Anxiety + Depression (250-400) */}
      <SceneFade frame={frame} sceneStart={250} sceneEnd={400}>
        <Scene3_Quote2 frame={frame - 250} />
      </SceneFade>

      {/* Scene 4: The Contradiction (400-520) */}
      <SceneFade frame={frame} sceneStart={400} sceneEnd={520}>
        <Scene4_Contradiction frame={frame - 400} />
      </SceneFade>

      {/* Scene 5: The Hope (520-620) */}
      <SceneFade frame={frame} sceneStart={520} sceneEnd={620}>
        <Scene5_Hope frame={frame - 520} fps={fps} />
      </SceneFade>

      {/* Scene 6: CTA (620-720) */}
      <SceneFade frame={frame} sceneStart={620} sceneEnd={720} fadeOut={0}>
        <Scene6_CTA frame={frame - 620} />
      </SceneFade>
    </AbsoluteFill>
  );
};
