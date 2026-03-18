import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  spring,
} from "remotion";

// -- Brand Colors --
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const DARK_BG = "#0a1628";
const GLOW_BLUE = "#4a9eff";
const GLOW_YELLOW = "#ffd966";

const HEADING_FONT = "'Montserrat', 'Poppins', sans-serif";
const BODY_FONT = "'DM Sans', 'Montserrat', sans-serif";

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

// Safe interpolate helper — never allows equal inputRange values
const safe = (
  f: number,
  s: number,
  e: number,
  from: number = 0,
  to: number = 1
): number => (s >= e ? to : interpolate(f, [s, e], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

// ============================================================
// DNA HELIX — sinusoidal circles
// ============================================================
const DNAHelix: React.FC<{
  frame: number;
  opacity?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  length?: number;
}> = ({ frame, opacity = 0.6, scale = 1, offsetX = 0, offsetY = 0, length = 24 }) => {
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    const phase = (frame * 0.04) + (i * 0.3);
    const x1 = Math.sin(phase) * 80;
    const x2 = Math.sin(phase + Math.PI) * 80;
    const y = i * 30 - (length * 15);
    const depthFront = (Math.cos(phase) + 1) / 2;
    const depthBack = (Math.cos(phase + Math.PI) + 1) / 2;

    // Connecting bar
    nodes.push(
      <line
        key={`bar-${i}`}
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={BLUE}
        strokeWidth={1.5}
        opacity={0.25}
      />
    );

    // Front strand node
    nodes.push(
      <circle
        key={`f-${i}`}
        cx={x1}
        cy={y}
        r={4 + depthFront * 4}
        fill={i % 4 === 0 ? YELLOW : GLOW_BLUE}
        opacity={0.4 + depthFront * 0.6}
      />
    );
    // Back strand node
    nodes.push(
      <circle
        key={`b-${i}`}
        cx={x2}
        cy={y}
        r={4 + depthBack * 4}
        fill={i % 4 === 2 ? YELLOW : BLUE}
        opacity={0.3 + depthBack * 0.5}
      />
    );
  }

  return (
    <svg
      width="300"
      height={length * 30 + 60}
      viewBox={`-150 ${-length * 15 - 30} 300 ${length * 30 + 60}`}
      style={{
        position: "absolute",
        left: `calc(50% - 150px + ${offsetX}px)`,
        top: `calc(50% - ${(length * 30 + 60) / 2}px + ${offsetY}px)`,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {nodes}
    </svg>
  );
};

// ============================================================
// FLOATING PARTICLES
// ============================================================
const Particles: React.FC<{ frame: number; count?: number; opacity?: number }> = ({
  frame,
  count = 40,
  opacity = 0.5,
}) => {
  const particles = React.useMemo(() => {
    const arr: { x: number; y: number; size: number; speed: number; phase: number; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (i * 137.508) % 100,
        y: (i * 211.7) % 100,
        size: 1.5 + (i % 4) * 1,
        speed: 0.3 + (i % 5) * 0.15,
        phase: (i * 73) % 360,
        color: i % 3 === 0 ? YELLOW : i % 3 === 1 ? GLOW_BLUE : BLUE,
      });
    }
    return arr;
  }, [count]);

  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const yPos = (p.y + frame * p.speed * 0.1) % 110 - 5;
        const xOff = Math.sin((frame * 0.02) + p.phase) * 15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x + xOff * 0.1}%`,
              top: `${yPos}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================================
// GLOW TEXT
// ============================================================
const GlowText: React.FC<{
  children: React.ReactNode;
  fontSize: number;
  color?: string;
  glow?: string;
  fontFamily?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
}> = ({ children, fontSize, color = WHITE, glow = GLOW_BLUE, fontFamily = HEADING_FONT, fontWeight = 800, style = {} }) => (
  <div
    style={{
      fontSize,
      fontWeight,
      fontFamily,
      color,
      textShadow: `0 0 30px ${glow}, 0 0 60px ${glow}40`,
      textAlign: "center",
      lineHeight: 1.15,
      ...style,
    }}
  >
    {children}
  </div>
);

// ============================================================
// SCENE 1: HOOK (frames 0-90)
// ============================================================
const SceneHook: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safe(frame, 0, 20);
  const textReveal = safe(frame, 10, 45);
  const subReveal = safe(frame, 40, 65);
  const fadeOut = safe(frame, 75, 90, 1, 0);
  const masterOpacity = fadeIn * fadeOut;

  const helixScale = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 40, mass: 1 } }),
    [0, 1],
    [0.5, 1.2]
  );

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <DNAHelix frame={frame} scale={helixScale} opacity={0.35} length={30} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <div style={{ opacity: textReveal, transform: `translateY(${(1 - textReveal) * 30}px)` }}>
          <GlowText fontSize={64} glow={GLOW_BLUE}>
            What if your DNA could tell us
          </GlowText>
        </div>
        <div style={{ height: 16 }} />
        <div style={{ opacity: subReveal, transform: `translateY(${(1 - subReveal) * 30}px)` }}>
          <GlowText fontSize={72} color={YELLOW} glow={GLOW_YELLOW}>
            the right medication?
          </GlowText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: THE PROBLEM (frames 90-210)
// ============================================================
const SceneProblem: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 90;
  const fadeIn = safe(localFrame, 0, 20);
  const fadeOut = safe(localFrame, 100, 120, 1, 0);
  const masterOpacity = fadeIn * fadeOut;

  const titleReveal = safe(localFrame, 5, 25);

  const pills = [
    { label: "Med A", crossFrame: 30, color: "#5a8fce" },
    { label: "Med B", crossFrame: 50, color: "#6e9fd4" },
    { label: "Med C", crossFrame: 70, color: "#82afda" },
  ];

  const subtitleReveal = safe(localFrame, 75, 95);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 140,
          width: "100%",
          textAlign: "center",
          opacity: titleReveal,
          transform: `translateY(${(1 - titleReveal) * 20}px)`,
        }}
      >
        <GlowText fontSize={56} color={WHITE} glow={`${BLUE}80`}>
          The old way: Trial and error
        </GlowText>
      </div>

      {/* Pill icons with cross-out */}
      <div
        style={{
          position: "absolute",
          top: 340,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 100,
        }}
      >
        {pills.map((pill, idx) => {
          const pillAppear = safe(localFrame, 15 + idx * 10, 25 + idx * 10);
          const crossProgress = safe(localFrame, pill.crossFrame, pill.crossFrame + 12);
          const shake = localFrame >= pill.crossFrame && localFrame < pill.crossFrame + 8
            ? Math.sin(localFrame * 3) * 4
            : 0;

          return (
            <div
              key={idx}
              style={{
                opacity: pillAppear,
                transform: `translateX(${shake}px) scale(${pillAppear * 0.3 + 0.7})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Pill capsule */}
                <rect x="25" y="15" width="70" height="90" rx="35" fill={pill.color} opacity={0.9} />
                <rect x="25" y="15" width="70" height="45" rx="35" fill={WHITE} opacity={0.15} />
                {/* X cross-out */}
                <line
                  x1="20" y1="20" x2={20 + 80 * crossProgress} y2={20 + 80 * crossProgress}
                  stroke="#ff4444" strokeWidth="6" strokeLinecap="round"
                />
                <line
                  x1="100" y1="20" x2={100 - 80 * crossProgress} y2={20 + 80 * crossProgress}
                  stroke="#ff4444" strokeWidth="6" strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: BODY_FONT,
                  color: WHITE,
                  fontSize: 22,
                  fontWeight: 600,
                  opacity: 0.7,
                }}
              >
                {pill.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          width: "100%",
          textAlign: "center",
          opacity: subtitleReveal,
          transform: `translateY(${(1 - subtitleReveal) * 20}px)`,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily: BODY_FONT,
            color: `${WHITE}cc`,
            fontWeight: 500,
            maxWidth: 900,
            margin: "0 auto",
            lineHeight: 1.4,
          }}
        >
          Average patient tries 2–3 medications{"\n"}before finding the right one
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: THE SCIENCE (frames 210-360)
// ============================================================
const SceneScience: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 210;
  const fadeIn = safe(localFrame, 0, 20);
  const fadeOut = safe(localFrame, 130, 150, 1, 0);
  const masterOpacity = fadeIn * fadeOut;

  const titleReveal = safe(localFrame, 5, 30);
  const helixReveal = safe(localFrame, 15, 45);
  const gene1Reveal = safe(localFrame, 40, 60);
  const gene2Reveal = safe(localFrame, 55, 75);
  const swabReveal = safe(localFrame, 80, 105);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          width: "100%",
          textAlign: "center",
          opacity: titleReveal,
          transform: `scale(${0.9 + titleReveal * 0.1})`,
        }}
      >
        <GlowText fontSize={62} color={YELLOW} glow={GLOW_YELLOW}>
          Pharmacogenomic Testing
        </GlowText>
      </div>

      {/* DNA Helix center */}
      <div style={{ opacity: helixReveal }}>
        <DNAHelix frame={frame} scale={1.0} opacity={0.5} offsetX={0} offsetY={-20} length={20} />
      </div>

      {/* Gene labels */}
      {[
        { label: "CYP2D6", reveal: gene1Reveal, x: -320, y: -30 },
        { label: "CYP2C19", reveal: gene2Reveal, x: 240, y: 40 },
      ].map((gene, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: `calc(50% + ${gene.x}px)`,
            top: `calc(50% + ${gene.y}px)`,
            opacity: gene.reveal,
            transform: `translateX(${(1 - gene.reveal) * (idx === 0 ? -40 : 40)}px)`,
          }}
        >
          <div
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: `linear-gradient(135deg, ${BLUE}40, ${BLUE}20)`,
              border: `2px solid ${GLOW_BLUE}60`,
              backdropFilter: "blur(8px)",
              boxShadow: `0 0 20px ${GLOW_BLUE}30`,
            }}
          >
            <span
              style={{
                fontFamily: "'Montserrat', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: GLOW_BLUE,
                letterSpacing: 2,
              }}
            >
              {gene.label}
            </span>
          </div>
        </div>
      ))}

      {/* Cheek swab line */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          width: "100%",
          textAlign: "center",
          opacity: swabReveal,
          transform: `translateY(${(1 - swabReveal) * 25}px)`,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontFamily: BODY_FONT,
            color: `${WHITE}dd`,
            fontWeight: 500,
            maxWidth: 800,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          A simple cheek swab reveals how{"\n"}your body processes medications
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: THE RESULTS (frames 360-480)
// ============================================================
const SceneResults: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 360;
  const fadeIn = safe(localFrame, 0, 15);
  const fadeOut = safe(localFrame, 100, 120, 1, 0);
  const masterOpacity = fadeIn * fadeOut;

  const cards = [
    { title: "Fewer Side Effects", icon: "shield", delay: 10 },
    { title: "Better Response Rates", icon: "chart", delay: 28 },
    { title: "Faster Relief", icon: "bolt", delay: 46 },
  ];

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
        }}
      >
        {cards.map((card, idx) => {
          const slideIn = safe(localFrame, card.delay, card.delay + 20);
          const checkPop = spring({
            frame: Math.max(0, localFrame - card.delay - 20),
            fps,
            config: { damping: 8, stiffness: 180, mass: 0.5 },
          });

          return (
            <div
              key={idx}
              style={{
                width: 340,
                height: 380,
                borderRadius: 24,
                background: `linear-gradient(180deg, ${BLUE}25, ${DARK_BG}90)`,
                border: `2px solid ${GLOW_BLUE}40`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
                opacity: slideIn,
                transform: `translateY(${(1 - slideIn) * 60}px)`,
                boxShadow: `0 0 40px ${GLOW_BLUE}15, inset 0 1px 0 ${WHITE}10`,
              }}
            >
              {/* Checkmark circle */}
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ marginBottom: 24 }}>
                <circle cx="45" cy="45" r="40" fill={`${BLUE}30`} stroke={GLOW_BLUE} strokeWidth="2.5" />
                <polyline
                  points="28,46 40,58 64,34"
                  fill="none"
                  stroke={YELLOW}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  strokeDashoffset={60 - 60 * checkPop}
                />
              </svg>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: HEADING_FONT,
                  color: WHITE,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: THE DIFFERENCE (frames 480-600)
// ============================================================
const SceneDifference: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 480;
  const fadeIn = safe(localFrame, 0, 15);
  const fadeOut = safe(localFrame, 100, 120, 1, 0);
  const masterOpacity = fadeIn * fadeOut;

  // Animated counter 0 -> 50
  const counterProgress = safe(localFrame, 10, 60);
  const counterValue = Math.round(counterProgress * 50);

  const labelReveal = safe(localFrame, 35, 55);
  const subReveal = safe(localFrame, 60, 80);

  // Pulsing ring
  const ringScale = 1 + Math.sin(localFrame * 0.08) * 0.05;

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Large counter */}
        <div style={{ position: "relative", marginBottom: 30 }}>
          {/* Glow ring behind */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: `3px solid ${GLOW_BLUE}40`,
              transform: `translate(-50%, -50%) scale(${ringScale})`,
              boxShadow: `0 0 60px ${GLOW_BLUE}25, inset 0 0 60px ${GLOW_BLUE}10`,
            }}
          />
          <div
            style={{
              fontSize: 160,
              fontWeight: 900,
              fontFamily: HEADING_FONT,
              color: YELLOW,
              textShadow: `0 0 40px ${GLOW_YELLOW}, 0 0 80px ${GLOW_YELLOW}60`,
              position: "relative",
              zIndex: 2,
              lineHeight: 1,
            }}
          >
            {counterValue}%
          </div>
        </div>

        {/* Label */}
        <div
          style={{
            opacity: labelReveal,
            transform: `translateY(${(1 - labelReveal) * 15}px)`,
          }}
        >
          <GlowText fontSize={44} glow={`${BLUE}80`}>
            Reduction in trial-and-error prescribing
          </GlowText>
        </div>

        <div style={{ height: 30 }} />

        {/* Sub label */}
        <div
          style={{
            opacity: subReveal,
            transform: `translateY(${(1 - subReveal) * 15}px)`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontFamily: BODY_FONT,
              fontWeight: 600,
              color: YELLOW,
              textAlign: "center",
              textShadow: `0 0 20px ${GLOW_YELLOW}40`,
            }}
          >
            Precision psychiatry — available now
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA (frames 600-720)
// ============================================================
const SceneCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 600;
  const fadeIn = safe(localFrame, 0, 15);
  const masterOpacity = fadeIn;

  const logoReveal = spring({
    frame: Math.max(0, localFrame - 5),
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.7 },
  });

  const line1Reveal = safe(localFrame, 15, 35);
  const line2Reveal = safe(localFrame, 30, 50);
  const line3Reveal = safe(localFrame, 45, 65);
  const line4Reveal = safe(localFrame, 55, 75);

  // Subtle pulse on the phone
  const phonePulse = 1 + Math.sin(localFrame * 0.12) * 0.03;

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      {/* Background subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, ${BLUE}20 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Brand Name */}
        <div
          style={{
            opacity: logoReveal,
            transform: `scale(${0.8 + logoReveal * 0.2})`,
          }}
        >
          <GlowText fontSize={72} color={WHITE} glow={GLOW_BLUE}>
            Refresh Psychiatry
          </GlowText>
        </div>

        <div style={{ height: 10 }} />

        {/* Ask about PGx */}
        <div
          style={{
            opacity: line1Reveal,
            transform: `translateY(${(1 - line1Reveal) * 15}px)`,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontFamily: BODY_FONT,
              fontWeight: 600,
              color: YELLOW,
              textAlign: "center",
              textShadow: `0 0 20px ${GLOW_YELLOW}50`,
            }}
          >
            Ask about pharmacogenomic testing
          </div>
        </div>

        <div style={{ height: 8 }} />

        {/* Phone */}
        <div
          style={{
            opacity: line2Reveal,
            transform: `scale(${phonePulse}) translateY(${(1 - line2Reveal) * 15}px)`,
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontFamily: HEADING_FONT,
              fontWeight: 800,
              color: WHITE,
              textAlign: "center",
              textShadow: `0 0 25px ${GLOW_BLUE}`,
              letterSpacing: 2,
            }}
          >
            (954) 603-4081
          </div>
        </div>

        <div style={{ height: 16 }} />

        {/* Locations */}
        <div
          style={{
            opacity: line3Reveal,
            transform: `translateY(${(1 - line3Reveal) * 15}px)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontFamily: BODY_FONT,
              fontWeight: 500,
              color: `${WHITE}bb`,
              textAlign: "center",
            }}
          >
            Available at all FL locations & via telehealth
          </div>
        </div>

        {/* Website */}
        <div
          style={{
            opacity: line4Reveal,
            transform: `translateY(${(1 - line4Reveal) * 15}px)`,
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontFamily: BODY_FONT,
              fontWeight: 500,
              color: `${GLOW_BLUE}cc`,
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            refreshpsychiatry.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const V2_Pharmacogenomics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        overflow: "hidden",
      }}
    >
      <style>{fontImport}</style>

      {/* Background particles — always visible */}
      <Particles frame={frame} count={50} opacity={0.35} />

      {/* Background subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${BLUE}08 1px, transparent 1px),
            linear-gradient(90deg, ${BLUE}08 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Ambient top/bottom gradient overlays */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(180deg, ${DARK_BG} 0%, transparent 100%)`,
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(0deg, ${DARK_BG} 0%, transparent 100%)`,
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Scenes */}
      {frame < 90 && <SceneHook frame={frame} fps={fps} />}
      {frame >= 90 && frame < 210 && <SceneProblem frame={frame} fps={fps} />}
      {frame >= 210 && frame < 360 && <SceneScience frame={frame} fps={fps} />}
      {frame >= 360 && frame < 480 && <SceneResults frame={frame} fps={fps} />}
      {frame >= 480 && frame < 600 && <SceneDifference frame={frame} fps={fps} />}
      {frame >= 600 && <SceneCTA frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
};
