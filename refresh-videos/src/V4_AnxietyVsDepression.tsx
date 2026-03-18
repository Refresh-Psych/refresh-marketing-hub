import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  spring,
} from "remotion";

// ─── Brand Colors ────────────────────────────────────────────────────────────
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const AMBER = "#D97706";
const CREAM = "#FFF8F0";
const LIGHT_BLUE = "#EBF4FF";
const LIGHT_AMBER = "#FEF3C7";
const OVERLAP_COLOR = "#8B6F47";

const HEADING_FONT = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";
const BODY_FONT = "'DM Sans', 'Poppins', sans-serif";

// ─── Safe interpolate helper ─────────────────────────────────────────────────
const safe = (
  f: number,
  s: number,
  e: number,
  from: number = 0,
  to: number = 1
): number =>
  s >= e
    ? to
    : interpolate(f, [s, e], [from, to], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

// ─── Floating Background Particles ──────────────────────────────────────────
const FloatingParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => {
    const seed: {
      x: number;
      y: number;
      r: number;
      speed: number;
      phase: number;
      color: string;
    }[] = [];
    for (let i = 0; i < 12; i++) {
      seed.push({
        x: (i * 137.5) % 100,
        y: (i * 241.3) % 100,
        r: 30 + ((i * 53) % 100),
        speed: 0.2 + (i % 5) * 0.1,
        phase: i * 1.5,
        color: i % 2 === 0 ? BLUE : AMBER,
      });
    }
    return seed;
  }, []);

  return (
    <>
      {particles.map((c, i) => {
        const dx = Math.sin(frame * 0.008 * c.speed + c.phase) * 20;
        const dy = Math.cos(frame * 0.01 * c.speed + c.phase) * 18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.r,
              height: c.r,
              borderRadius: "50%",
              background: c.color,
              opacity: 0.04,
              transform: `translate(${dx}px, ${dy}px)`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

// ─── Symptom Item ────────────────────────────────────────────────────────────
const SymptomItem: React.FC<{
  text: string;
  delay: number;
  color: string;
  align?: "left" | "right" | "center";
}> = ({ text, delay, color, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = safe(frame, delay, delay + 15);
  const slideY = safe(frame, delay, delay + 20, 20, 0);
  const scaleVal = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px) scale(${scaleVal})`,
        display: "flex",
        alignItems: "center",
        justifyContent:
          align === "right"
            ? "flex-end"
            : align === "center"
            ? "center"
            : "flex-start",
        gap: 14,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 32,
          fontWeight: 500,
          color: CHARCOAL,
          lineHeight: 1.3,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Venn Diagram Component ──────────────────────────────────────────────────
const VennDiagram: React.FC<{
  anxietyX: number;
  depressionX: number;
  anxietyOpacity: number;
  depressionOpacity: number;
  overlapGlow: number;
  circleSize: number;
}> = ({
  anxietyX,
  depressionX,
  anxietyOpacity,
  depressionOpacity,
  overlapGlow,
  circleSize,
}) => {
  const frame = useCurrentFrame();
  const pulseScale = 1 + Math.sin(frame * 0.06) * 0.015 * overlapGlow;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: circleSize + 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Anxiety Circle (Blue) */}
      <div
        style={{
          position: "absolute",
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 40%, ${LIGHT_BLUE}, ${BLUE}40)`,
          border: `3px solid ${BLUE}60`,
          opacity: anxietyOpacity,
          transform: `translateX(${anxietyX}px) scale(${pulseScale})`,
          boxShadow:
            overlapGlow > 0
              ? `0 0 ${30 * overlapGlow}px ${BLUE}30`
              : "none",
        }}
      />
      {/* Depression Circle (Amber) */}
      <div
        style={{
          position: "absolute",
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          background: `radial-gradient(circle at 60% 40%, ${LIGHT_AMBER}, ${AMBER}40)`,
          border: `3px solid ${AMBER}60`,
          opacity: depressionOpacity,
          transform: `translateX(${depressionX}px) scale(${pulseScale})`,
          boxShadow:
            overlapGlow > 0
              ? `0 0 ${30 * overlapGlow}px ${AMBER}30`
              : "none",
        }}
      />
      {/* Overlap glow */}
      {overlapGlow > 0 && (
        <div
          style={{
            position: "absolute",
            width: circleSize * 0.45,
            height: circleSize * 0.7,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${YELLOW}${Math.round(
              overlapGlow * 40
            )
              .toString(16)
              .padStart(2, "0")}, transparent)`,
            opacity: overlapGlow,
            transform: `scale(${pulseScale})`,
          }}
        />
      )}
      {/* Labels */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: `translateX(${anxietyX - circleSize * 0.22}px)`,
          fontFamily: HEADING_FONT,
          fontSize: 26,
          fontWeight: 700,
          color: BLUE,
          opacity: anxietyOpacity * 0.9,
          textAlign: "center",
        }}
      >
        Anxiety
      </span>
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: `translateX(${depressionX + circleSize * 0.08}px)`,
          fontFamily: HEADING_FONT,
          fontSize: 26,
          fontWeight: 700,
          color: AMBER,
          opacity: depressionOpacity * 0.9,
          textAlign: "center",
        }}
      >
        Depression
      </span>
    </div>
  );
};

// ─── Main Composition ────────────────────────────────────────────────────────
export const V4_AnxietyVsDepression: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE 1: HOOK (0-100) ──────────────────────────────────────────────
  const hookTitleOp = safe(frame, 10, 40);
  const hookTitleFadeOut = safe(frame, 85, 100, 1, 0);
  const hookSubOp = safe(frame, 30, 55);

  // Circles approach each other during hook
  const hookAnxietyX = safe(frame, 0, 90, -350, -160);
  const hookDepressionX = safe(frame, 0, 90, 350, 160);
  const hookCircleOp = safe(frame, 5, 35);

  // ─── SCENE 2: ANXIETY SIDE (100-230) ────────────────────────────────────
  const scene2Op = safe(frame, 100, 115);
  const scene2FadeOut = safe(frame, 215, 230, 1, 0);
  const anxietyHighlight = safe(frame, 100, 120);

  // ─── SCENE 3: DEPRESSION SIDE (230-360) ─────────────────────────────────
  const scene3Op = safe(frame, 230, 245);
  const scene3FadeOut = safe(frame, 345, 360, 1, 0);
  const depressionHighlight = safe(frame, 230, 250);

  // ─── SCENE 4: THE OVERLAP (360-500) ─────────────────────────────────────
  const scene4Op = safe(frame, 360, 380);
  const scene4FadeOut = safe(frame, 485, 500, 1, 0);
  const mergeProgress = safe(frame, 360, 420);
  const overlapGlow = safe(frame, 400, 440);
  const mergedAnxietyX = interpolate(mergeProgress, [0, 1], [-160, -100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mergedDepressionX = interpolate(mergeProgress, [0, 1], [160, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── SCENE 5: WHY IT MATTERS (500-630) ──────────────────────────────────
  const scene5Op = safe(frame, 500, 520);
  const scene5FadeOut = safe(frame, 615, 630, 1, 0);
  const pulseIntensity =
    frame >= 500 && frame <= 630
      ? 0.5 + Math.sin(frame * 0.08) * 0.5
      : 0;

  // ─── SCENE 6: CTA (630-750) ─────────────────────────────────────────────
  const ctaOp = safe(frame, 630, 660);
  const ctaScale = spring({
    frame: Math.max(0, frame - 640),
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.9 },
  });

  // Determine which scene we're in for Venn positioning
  let vennAnxietyX = hookAnxietyX;
  let vennDepressionX = hookDepressionX;
  let vennAnxietyOp = hookCircleOp;
  let vennDepressionOp = hookCircleOp;
  let vennOverlapGlow = 0;
  const circleSize = 320;

  if (frame >= 100 && frame < 230) {
    vennAnxietyX = -160;
    vennDepressionX = 160;
    vennAnxietyOp = 1;
    vennDepressionOp = 0.35;
  } else if (frame >= 230 && frame < 360) {
    vennAnxietyX = -160;
    vennDepressionX = 160;
    vennAnxietyOp = 0.35;
    vennDepressionOp = 1;
  } else if (frame >= 360 && frame < 500) {
    vennAnxietyX = mergedAnxietyX;
    vennDepressionX = mergedDepressionX;
    vennAnxietyOp = 1;
    vennDepressionOp = 1;
    vennOverlapGlow = overlapGlow;
  } else if (frame >= 500 && frame < 630) {
    vennAnxietyX = -100;
    vennDepressionX = 100;
    vennAnxietyOp = 0.7;
    vennDepressionOp = 0.7;
    vennOverlapGlow = 0.6 + pulseIntensity * 0.4;
  } else if (frame >= 630) {
    const ctaVennOp = safe(frame, 630, 660, 0.7, 0.3);
    vennAnxietyX = -100;
    vennDepressionX = 100;
    vennAnxietyOp = ctaVennOp;
    vennDepressionOp = ctaVennOp;
    vennOverlapGlow = ctaVennOp;
  }

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${CREAM} 0%, #FFF5EB 30%, ${WHITE} 60%, ${LIGHT_BLUE}40 100%)`,
        fontFamily: BODY_FONT,
      }}
    >
      <FloatingParticles />

      {/* Subtle top/bottom brand bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${BLUE}, ${YELLOW}, ${AMBER})`,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${AMBER}, ${YELLOW}, ${BLUE})`,
          opacity: 0.6,
        }}
      />

      {/* ═══════════════ SCENE 1: HOOK (0-100) ═══════════════ */}
      {frame < 100 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          {/* Venn Diagram at top */}
          <div style={{ marginBottom: 60 }}>
            <VennDiagram
              anxietyX={vennAnxietyX}
              depressionX={vennDepressionX}
              anxietyOpacity={vennAnxietyOp}
              depressionOpacity={vennDepressionOp}
              overlapGlow={0}
              circleSize={circleSize}
            />
          </div>

          {/* Title */}
          <div
            style={{
              opacity: hookTitleOp * hookTitleFadeOut,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 62,
                fontWeight: 800,
                color: CHARCOAL,
                lineHeight: 1.2,
                margin: 0,
                marginBottom: 24,
              }}
            >
              Anxiety and Depression
            </h1>
            <h2
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 52,
                fontWeight: 700,
                color: BLUE,
                lineHeight: 1.2,
                margin: 0,
                opacity: hookSubOp,
              }}
            >
              Often Come Together
            </h2>
          </div>
        </AbsoluteFill>
      )}

      {/* ═══════════════ SCENE 2: ANXIETY SIDE (100-230) ═══════════════ */}
      {frame >= 100 && frame < 230 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 60px 0",
            opacity: scene2Op * scene2FadeOut,
          }}
        >
          <VennDiagram
            anxietyX={vennAnxietyX}
            depressionX={vennDepressionX}
            anxietyOpacity={vennAnxietyOp}
            depressionOpacity={vennDepressionOp}
            overlapGlow={0}
            circleSize={280}
          />

          <div
            style={{
              marginTop: 60,
              width: "100%",
              padding: "0 40px",
            }}
          >
            <h2
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 46,
                fontWeight: 700,
                color: BLUE,
                textAlign: "center",
                marginBottom: 40,
                opacity: anxietyHighlight,
              }}
            >
              Anxiety Symptoms
            </h2>
            <div style={{ paddingLeft: 80 }}>
              <SymptomItem
                text="Racing thoughts"
                delay={120}
                color={BLUE}
              />
              <SymptomItem
                text="Constant worry"
                delay={145}
                color={BLUE}
              />
              <SymptomItem
                text="Physical tension"
                delay={170}
                color={BLUE}
              />
              <SymptomItem
                text="Trouble sleeping (too wired)"
                delay={195}
                color={BLUE}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ═══════════════ SCENE 3: DEPRESSION SIDE (230-360) ═══════════════ */}
      {frame >= 230 && frame < 360 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 60px 0",
            opacity: scene3Op * scene3FadeOut,
          }}
        >
          <VennDiagram
            anxietyX={vennAnxietyX}
            depressionX={vennDepressionX}
            anxietyOpacity={vennAnxietyOp}
            depressionOpacity={vennDepressionOp}
            overlapGlow={0}
            circleSize={280}
          />

          <div
            style={{
              marginTop: 60,
              width: "100%",
              padding: "0 40px",
            }}
          >
            <h2
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 46,
                fontWeight: 700,
                color: AMBER,
                textAlign: "center",
                marginBottom: 40,
                opacity: depressionHighlight,
              }}
            >
              Depression Symptoms
            </h2>
            <div style={{ paddingLeft: 80 }}>
              <SymptomItem
                text="Persistent sadness"
                delay={250}
                color={AMBER}
              />
              <SymptomItem
                text="Loss of interest"
                delay={275}
                color={AMBER}
              />
              <SymptomItem
                text="Fatigue"
                delay={300}
                color={AMBER}
              />
              <SymptomItem
                text="Trouble sleeping (too tired)"
                delay={325}
                color={AMBER}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ═══════════════ SCENE 4: THE OVERLAP (360-500) ═══════════════ */}
      {frame >= 360 && frame < 500 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 60px 0",
            opacity: scene4Op * scene4FadeOut,
          }}
        >
          <VennDiagram
            anxietyX={vennAnxietyX}
            depressionX={vennDepressionX}
            anxietyOpacity={vennAnxietyOp}
            depressionOpacity={vennDepressionOp}
            overlapGlow={vennOverlapGlow}
            circleSize={300}
          />

          <div
            style={{
              marginTop: 50,
              textAlign: "center",
            }}
          >
            {/* Stat */}
            <div
              style={{
                opacity: safe(frame, 410, 435),
                transform: `scale(${spring({
                  frame: Math.max(0, frame - 410),
                  fps,
                  config: { damping: 12, stiffness: 100, mass: 0.8 },
                })})`,
                marginBottom: 36,
              }}
            >
              <span
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 56,
                  fontWeight: 800,
                  color: CHARCOAL,
                  display: "block",
                }}
              >
                Nearly{" "}
                <span style={{ color: YELLOW, fontSize: 72 }}>60%</span>
              </span>
              <span
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 34,
                  color: CHARCOAL,
                  opacity: 0.8,
                }}
              >
                experience both conditions
              </span>
            </div>

            {/* Shared Symptoms */}
            <h3
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 36,
                fontWeight: 700,
                color: OVERLAP_COLOR,
                marginBottom: 28,
                opacity: safe(frame, 430, 450),
              }}
            >
              Shared Symptoms
            </h3>
            <div style={{ paddingLeft: 120 }}>
              <SymptomItem
                text="Difficulty concentrating"
                delay={440}
                color={YELLOW}
              />
              <SymptomItem
                text="Irritability"
                delay={460}
                color={YELLOW}
              />
              <SymptomItem
                text="Social withdrawal"
                delay={480}
                color={YELLOW}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ═══════════════ SCENE 5: WHY IT MATTERS (500-630) ═══════════════ */}
      {frame >= 500 && frame < 630 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 60px 0",
            opacity: scene5Op * scene5FadeOut,
          }}
        >
          <VennDiagram
            anxietyX={vennAnxietyX}
            depressionX={vennDepressionX}
            anxietyOpacity={vennAnxietyOp}
            depressionOpacity={vennDepressionOp}
            overlapGlow={vennOverlapGlow}
            circleSize={260}
          />

          <div
            style={{
              marginTop: 70,
              textAlign: "center",
              padding: "0 40px",
            }}
          >
            <h2
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 50,
                fontWeight: 800,
                color: CHARCOAL,
                lineHeight: 1.25,
                marginBottom: 40,
                opacity: safe(frame, 510, 535),
              }}
            >
              Why It Matters
            </h2>

            {/* Card 1 */}
            <div
              style={{
                background: `${WHITE}cc`,
                borderRadius: 24,
                padding: "32px 36px",
                marginBottom: 24,
                border: `2px solid ${BLUE}20`,
                boxShadow: `0 4px 20px ${BLUE}10`,
                opacity: safe(frame, 530, 555),
                transform: `translateY(${safe(frame, 530, 555, 20, 0)}px)`,
              }}
            >
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 34,
                  fontWeight: 600,
                  color: CHARCOAL,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                Accurate diagnosis{" "}
                <span style={{ color: BLUE }}>changes treatment</span>
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: `${WHITE}cc`,
                borderRadius: 24,
                padding: "32px 36px",
                border: `2px solid ${AMBER}20`,
                boxShadow: `0 4px 20px ${AMBER}10`,
                opacity: safe(frame, 565, 590),
                transform: `translateY(${safe(frame, 565, 590, 20, 0)}px)`,
              }}
            >
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 34,
                  fontWeight: 600,
                  color: CHARCOAL,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                When treated together, both conditions{" "}
                <span style={{ color: AMBER }}>respond better</span>
              </p>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ═══════════════ SCENE 6: CTA (630-750) ═══════════════ */}
      {frame >= 630 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            opacity: ctaOp,
          }}
        >
          {/* Faded Venn in background */}
          <div style={{ position: "absolute", top: 160, opacity: 0.2 }}>
            <VennDiagram
              anxietyX={-100}
              depressionX={100}
              anxietyOpacity={0.5}
              depressionOpacity={0.5}
              overlapGlow={0.4}
              circleSize={240}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              transform: `scale(${ctaScale})`,
              zIndex: 2,
            }}
          >
            {/* Brand Name */}
            <h1
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 64,
                fontWeight: 800,
                color: BLUE,
                margin: 0,
                marginBottom: 12,
                letterSpacing: -1,
              }}
            >
              Refresh Psychiatry
            </h1>

            {/* Divider */}
            <div
              style={{
                width: 120,
                height: 4,
                background: `linear-gradient(90deg, ${BLUE}, ${YELLOW})`,
                borderRadius: 2,
                margin: "0 auto 36px",
                opacity: safe(frame, 660, 680),
              }}
            />

            {/* Tagline */}
            <p
              style={{
                fontFamily: BODY_FONT,
                fontSize: 38,
                fontWeight: 600,
                color: CHARCOAL,
                margin: 0,
                marginBottom: 20,
                lineHeight: 1.4,
                opacity: safe(frame, 665, 690),
              }}
            >
              Comprehensive psychiatric evaluations
            </p>

            <p
              style={{
                fontFamily: BODY_FONT,
                fontSize: 32,
                fontWeight: 500,
                color: CHARCOAL,
                opacity: safe(frame, 680, 705) * 0.7,
                margin: 0,
                marginBottom: 50,
                lineHeight: 1.4,
              }}
            >
              We evaluate the full picture
            </p>

            {/* Phone CTA */}
            <div
              style={{
                background: BLUE,
                borderRadius: 60,
                padding: "24px 56px",
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                opacity: safe(frame, 695, 720),
                transform: `scale(${spring({
                  frame: Math.max(0, frame - 695),
                  fps,
                  config: { damping: 14, stiffness: 110, mass: 0.8 },
                })})`,
                boxShadow: `0 8px 32px ${BLUE}40`,
              }}
            >
              <span
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 40,
                  fontWeight: 700,
                  color: WHITE,
                  letterSpacing: 1,
                }}
              >
                (954) 603-4081
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ─── Source Badge (persistent, subtle) ─── */}
      {frame >= 360 && frame < 500 && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: safe(frame, 410, 440) * 0.5,
          }}
        >
          <span
            style={{
              fontFamily: BODY_FONT,
              fontSize: 20,
              color: CHARCOAL,
              opacity: 0.5,
            }}
          >
            Source: NIMH
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
