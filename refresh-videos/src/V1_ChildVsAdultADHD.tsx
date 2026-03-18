import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  spring,
} from "remotion";

// ── Brand Colors ──
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const CHARCOAL = "#2D3748";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#f0f7ff";
const SOFT_BLUE = "#e8f0fe";
const CHILD_BG = "#edf7ed";
const ADULT_BG = "#f0f0ff";

// ── Fonts ──
const HEADING_FONT = "'Montserrat', sans-serif";
const BODY_FONT = "'DM Sans', sans-serif";

// ── Safe interpolate helper ──
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

// ── Scene boundaries ──
const SCENE_1_START = 0;
const SCENE_1_END = 90;
const SCENE_2_START = 90;
const SCENE_2_END = 210;
const SCENE_3_START = 210;
const SCENE_3_END = 330;
const SCENE_4_START = 330;
const SCENE_4_END = 450;
const SCENE_5_START = 450;
const SCENE_5_END = 600;
const SCENE_6_START = 600;
const SCENE_6_END = 750;

// ── Fade between scenes ──
const FADE_DURATION = 15;

const sceneFade = (frame: number, start: number, end: number): number => {
  const fadeIn = safe(frame, start, start + FADE_DURATION);
  const fadeOut = safe(frame, end - FADE_DURATION, end, 1, 0);
  return Math.min(fadeIn, fadeOut);
};

// ────────────────────────────────────────────────────
// Brain Icon SVG
// ────────────────────────────────────────────────────
const BrainIcon: React.FC<{ size: number; color: string; opacity: number }> = ({
  size,
  color,
  opacity,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    style={{ opacity }}
  >
    {/* Left hemisphere */}
    <path
      d="M50 20 C35 20, 20 35, 22 50 C20 60, 25 75, 38 80 C42 82, 48 78, 50 75"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 35 C42 35, 30 40, 32 50"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 50 C42 48, 28 55, 30 65"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Right hemisphere */}
    <path
      d="M50 20 C65 20, 80 35, 78 50 C80 60, 75 75, 62 80 C58 82, 52 78, 50 75"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 35 C58 35, 70 40, 68 50"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 50 C58 48, 72 55, 70 65"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Center line */}
    <line
      x1="50"
      y1="18"
      x2="50"
      y2="82"
      stroke={color}
      strokeWidth="2"
      strokeDasharray="4 4"
    />
  </svg>
);

// ────────────────────────────────────────────────────
// Symptom Card
// ────────────────────────────────────────────────────
const SymptomCard: React.FC<{
  text: string;
  emoji: string;
  frame: number;
  delay: number;
  bgColor: string;
  accentColor: string;
  direction: "left" | "right";
}> = ({ text, emoji, frame, delay, bgColor, accentColor, direction }) => {
  const progress = safe(frame, delay, delay + 20);
  const eased = Easing.out(Easing.cubic)(progress);
  const slideX = (1 - eased) * (direction === "left" ? -120 : 120);

  return (
    <div
      style={{
        opacity: eased,
        transform: `translateX(${slideX}px)`,
        background: bgColor,
        borderRadius: 20,
        padding: "22px 28px",
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderLeft: `5px solid ${accentColor}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <span style={{ fontSize: 36 }}>{emoji}</span>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 30,
          color: CHARCOAL,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ────────────────────────────────────────────────────
// Animated Counter
// ────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{
  frame: number;
  start: number;
  end: number;
  targetValue: number;
  suffix: string;
}> = ({ frame, start, end, targetValue, suffix }) => {
  const progress = safe(frame, start, end);
  const eased = Easing.out(Easing.cubic)(progress);
  const value = Math.round(eased * targetValue);

  return (
    <span
      style={{
        fontFamily: HEADING_FONT,
        fontSize: 120,
        fontWeight: 900,
        color: YELLOW,
        textShadow: "0 4px 20px rgba(246,199,68,0.4)",
      }}
    >
      {value}
      {suffix}
    </span>
  );
};

// ────────────────────────────────────────────────────
// SCENE 1: Hook
// ────────────────────────────────────────────────────
const Scene1Hook: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneFade(frame, SCENE_1_START, SCENE_1_END);
  const localFrame = frame - SCENE_1_START;

  const brainScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  const titleReveal = safe(localFrame, 15, 45);
  const subtitleReveal = safe(localFrame, 35, 60);

  const brainRotate = Math.sin(localFrame * 0.06) * 4;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(170deg, ${BLUE} 0%, #1a4a80 100%)`,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background decoration circles */}
      <div
        style={{
          position: "absolute",
          top: 200,
          right: -80,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: -60,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }}
      />

      {/* Brain icon */}
      <div
        style={{
          transform: `scale(${brainScale}) rotate(${brainRotate}deg)`,
          marginBottom: 40,
        }}
      >
        <BrainIcon size={180} color={YELLOW} opacity={1} />
      </div>

      {/* Main title */}
      <div
        style={{
          opacity: titleReveal,
          transform: `translateY(${(1 - titleReveal) * 40}px)`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 72,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.15,
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          ADHD Looks{" "}
          <span style={{ color: YELLOW }}>Different</span>
          <br />
          at Every Age
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleReveal,
          transform: `translateY(${(1 - subtitleReveal) * 30}px)`,
          marginTop: 30,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          What Every Parent Should Know
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: safe(localFrame, 50, 80, 0, 600),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────
// SCENE 2: Child ADHD
// ────────────────────────────────────────────────────
const Scene2Child: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneFade(frame, SCENE_2_START, SCENE_2_END);
  const localFrame = frame - SCENE_2_START;

  const headerSlide = safe(localFrame, 0, 20);
  const headerEased = Easing.out(Easing.cubic)(headerSlide);

  const symptoms = [
    { text: "Can't sit still in class", emoji: "🪑" },
    { text: "Blurts out answers", emoji: "🗣️" },
    { text: "Loses homework constantly", emoji: "📝" },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(175deg, ${LIGHT_BG} 0%, ${WHITE} 100%)`,
        display: "flex",
        flexDirection: "column",
        padding: "0 60px",
      }}
    >
      {/* Left accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: `linear-gradient(180deg, ${BLUE}, ${YELLOW})`,
        }}
      />

      {/* Header */}
      <div
        style={{
          marginTop: 180,
          opacity: headerEased,
          transform: `translateY(${(1 - headerEased) * -30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: BLUE,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 10,
          }}
        >
          In Children
        </div>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 62,
            fontWeight: 900,
            color: CHARCOAL,
            lineHeight: 1.15,
          }}
        >
          Child <span style={{ color: BLUE }}>ADHD</span>
        </div>
        <div
          style={{
            width: safe(localFrame, 10, 35, 0, 200),
            height: 5,
            background: YELLOW,
            borderRadius: 3,
            marginTop: 16,
          }}
        />
      </div>

      {/* Symptom cards */}
      <div style={{ marginTop: 60 }}>
        {symptoms.map((s, i) => (
          <SymptomCard
            key={i}
            text={s.text}
            emoji={s.emoji}
            frame={localFrame}
            delay={25 + i * 22}
            bgColor={CHILD_BG}
            accentColor="#48bb78"
            direction="left"
          />
        ))}
      </div>

      {/* Playful decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          right: 60,
          opacity: safe(localFrame, 70, 90) * 0.6,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: BLUE,
            fontStyle: "italic",
            textAlign: "right",
            lineHeight: 1.5,
          }}
        >
          Often diagnosed between
          <br />
          <span style={{ fontWeight: 700, fontSize: 30 }}>ages 6-12</span>
        </div>
      </div>

      {/* Age indicator */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 60,
          opacity: safe(localFrame, 5, 25),
        }}
      >
        <div
          style={{
            background: BLUE,
            color: WHITE,
            fontFamily: HEADING_FONT,
            fontWeight: 800,
            fontSize: 22,
            padding: "12px 24px",
            borderRadius: 30,
          }}
        >
          👧 Children
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────
// SCENE 3: Adult ADHD
// ────────────────────────────────────────────────────
const Scene3Adult: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneFade(frame, SCENE_3_START, SCENE_3_END);
  const localFrame = frame - SCENE_3_START;

  const headerSlide = safe(localFrame, 0, 20);
  const headerEased = Easing.out(Easing.cubic)(headerSlide);

  const symptoms = [
    { text: "Misses deadlines at work", emoji: "⏰" },
    { text: "Trouble maintaining relationships", emoji: "💬" },
    { text: "Chronic procrastination", emoji: "📋" },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(175deg, #f8f6ff 0%, ${WHITE} 100%)`,
        display: "flex",
        flexDirection: "column",
        padding: "0 60px",
      }}
    >
      {/* Right accent stripe */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: `linear-gradient(180deg, ${YELLOW}, ${BLUE})`,
        }}
      />

      {/* Header */}
      <div
        style={{
          marginTop: 180,
          opacity: headerEased,
          transform: `translateY(${(1 - headerEased) * -30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: CHARCOAL,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 10,
          }}
        >
          In Adults
        </div>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 62,
            fontWeight: 900,
            color: CHARCOAL,
            lineHeight: 1.15,
          }}
        >
          Adult <span style={{ color: BLUE }}>ADHD</span>
        </div>
        <div
          style={{
            width: safe(localFrame, 10, 35, 0, 200),
            height: 5,
            background: YELLOW,
            borderRadius: 3,
            marginTop: 16,
          }}
        />
      </div>

      {/* Symptom cards */}
      <div style={{ marginTop: 60 }}>
        {symptoms.map((s, i) => (
          <SymptomCard
            key={i}
            text={s.text}
            emoji={s.emoji}
            frame={localFrame}
            delay={25 + i * 22}
            bgColor={ADULT_BG}
            accentColor={BLUE}
            direction="right"
          />
        ))}
      </div>

      {/* Note */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 60,
          right: 60,
          opacity: safe(localFrame, 70, 90) * 0.6,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: CHARCOAL,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          Symptoms shift from visible hyperactivity
          <br />
          to <span style={{ fontWeight: 700 }}>internal restlessness</span>
        </div>
      </div>

      {/* Age indicator */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 60,
          opacity: safe(localFrame, 5, 25),
        }}
      >
        <div
          style={{
            background: CHARCOAL,
            color: WHITE,
            fontFamily: HEADING_FONT,
            fontWeight: 800,
            fontSize: 22,
            padding: "12px 24px",
            borderRadius: 30,
          }}
        >
          🧑 Adults
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────
// SCENE 4: The Connection (60% stat)
// ────────────────────────────────────────────────────
const Scene4Connection: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneFade(frame, SCENE_4_START, SCENE_4_END);
  const localFrame = frame - SCENE_4_START;

  const statReveal = safe(localFrame, 10, 50);
  const lineGrow = safe(localFrame, 20, 55);
  const textReveal = safe(localFrame, 45, 70);
  const labelChildReveal = safe(localFrame, 55, 70);
  const labelAdultReveal = safe(localFrame, 65, 80);

  const pulse = Math.sin(localFrame * 0.1) * 0.03 + 1;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(170deg, #1a3a5c 0%, ${BLUE} 50%, #1a4a80 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(246,199,68,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Counter */}
      <div
        style={{
          transform: `scale(${pulse})`,
          textAlign: "center",
        }}
      >
        <AnimatedCounter
          frame={localFrame}
          start={10}
          end={50}
          targetValue={60}
          suffix="%"
        />
      </div>

      {/* Stat text */}
      <div
        style={{
          opacity: textReveal,
          transform: `translateY(${(1 - textReveal) * 20}px)`,
          textAlign: "center",
          padding: "0 80px",
          marginTop: 20,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 34,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.5,
          }}
        >
          of children with ADHD carry
          <br />
          symptoms into{" "}
          <span style={{ color: YELLOW, fontWeight: 700 }}>adulthood</span>
        </div>
      </div>

      {/* Connecting line visual */}
      <div
        style={{
          marginTop: 60,
          display: "flex",
          alignItems: "center",
          gap: 0,
          width: 700,
          justifyContent: "center",
        }}
      >
        {/* Child label */}
        <div
          style={{
            opacity: labelChildReveal,
            transform: `translateX(${(1 - labelChildReveal) * -30}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "16px 28px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <div
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 24,
                fontWeight: 700,
                color: WHITE,
              }}
            >
              👧 Child
            </div>
          </div>
        </div>

        {/* Connecting line */}
        <div
          style={{
            width: lineGrow * 200,
            height: 3,
            background: `linear-gradient(90deg, rgba(255,255,255,0.3), ${YELLOW}, rgba(255,255,255,0.3))`,
            margin: "0 16px",
            borderRadius: 2,
          }}
        />
        {/* Arrow */}
        <div
          style={{
            opacity: lineGrow,
            color: YELLOW,
            fontSize: 30,
            marginRight: 16,
          }}
        >
          →
        </div>

        {/* Adult label */}
        <div
          style={{
            opacity: labelAdultReveal,
            transform: `translateX(${(1 - labelAdultReveal) * 30}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "16px 28px",
              border: "2px solid rgba(246,199,68,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 24,
                fontWeight: 700,
                color: YELLOW,
              }}
            >
              🧑 Adult
            </div>
          </div>
        </div>
      </div>

      {/* DSM-5 footnote */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          opacity: safe(localFrame, 80, 100) * 0.5,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Based on DSM-5 diagnostic criteria
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────
// SCENE 5: Key Insight
// ────────────────────────────────────────────────────
const Scene5Insight: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneFade(frame, SCENE_5_START, SCENE_5_END);
  const localFrame = frame - SCENE_5_START;

  const line1 = safe(localFrame, 10, 35);
  const line2 = safe(localFrame, 40, 65);
  const doctorReveal = safe(localFrame, 70, 95);

  const pulseScale = 1 + Math.sin(localFrame * 0.08) * 0.015;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(175deg, ${WHITE} 0%, ${LIGHT_BG} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 70px",
      }}
    >
      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${BLUE}, ${YELLOW})`,
        }}
      />

      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `3px solid ${SOFT_BLUE}`,
          opacity: 0.3,
        }}
      />

      {/* Key insight 1 */}
      <div
        style={{
          opacity: line1,
          transform: `translateY(${(1 - line1) * 30}px) scale(${pulseScale})`,
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 56,
            fontWeight: 900,
            color: CHARCOAL,
            lineHeight: 1.2,
          }}
        >
          Early Diagnosis
          <br />
          <span style={{ color: BLUE }}>Changes Everything</span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: safe(localFrame, 30, 55, 0, 300),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
          marginBottom: 50,
        }}
      />

      {/* Key insight 2 */}
      <div
        style={{
          opacity: line2,
          transform: `translateY(${(1 - line2) * 30}px)`,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 38,
            fontWeight: 600,
            color: CHARCOAL,
            lineHeight: 1.4,
          }}
        >
          Comprehensive evaluation
          <br />
          matters for{" "}
          <span style={{ color: BLUE, fontWeight: 700 }}>every age</span>
        </div>
      </div>

      {/* Doctor mention */}
      <div
        style={{
          opacity: doctorReveal,
          transform: `translateY(${(1 - doctorReveal) * 20}px)`,
        }}
      >
        <div
          style={{
            background: SOFT_BLUE,
            borderRadius: 20,
            padding: "24px 40px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            border: `2px solid ${BLUE}20`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: BLUE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: WHITE,
                fontFamily: HEADING_FONT,
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              Dr
            </span>
          </div>
          <div>
            <div
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 26,
                fontWeight: 700,
                color: CHARCOAL,
              }}
            >
              Dr. Vadakkan
            </div>
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: 20,
                color: BLUE,
                fontWeight: 500,
              }}
            >
              Pediatric Fellowship Trained
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────
// SCENE 6: CTA
// ────────────────────────────────────────────────────
const Scene6CTA: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneFade(frame, SCENE_6_START, SCENE_6_END);
  const localFrame = frame - SCENE_6_START;

  const logoReveal = safe(localFrame, 5, 25);
  const serviceReveal = safe(localFrame, 20, 40);
  const phoneReveal = safe(localFrame, 35, 55);
  const locationsReveal = safe(localFrame, 50, 70);

  const logoScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });

  const phonePulse = 1 + Math.sin(localFrame * 0.12) * 0.03;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(170deg, ${BLUE} 0%, #1a3a5c 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background patterns */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.04,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${WHITE} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${WHITE} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo / Brand */}
      <div
        style={{
          opacity: logoReveal,
          transform: `scale(${logoScale})`,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 68,
            fontWeight: 900,
            color: WHITE,
            letterSpacing: -1,
          }}
        >
          Refresh
        </div>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 36,
            fontWeight: 600,
            color: YELLOW,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginTop: -4,
          }}
        >
          Psychiatry
        </div>
      </div>

      {/* Yellow divider */}
      <div
        style={{
          width: safe(localFrame, 15, 35, 0, 400),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
          marginBottom: 40,
        }}
      />

      {/* Service line */}
      <div
        style={{
          opacity: serviceReveal,
          transform: `translateY(${(1 - serviceReveal) * 20}px)`,
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 36,
            fontWeight: 600,
            color: WHITE,
            lineHeight: 1.5,
          }}
        >
          Child & Adult
          <br />
          <span style={{ color: YELLOW }}>ADHD Evaluations</span>
        </div>
      </div>

      {/* Phone */}
      <div
        style={{
          opacity: phoneReveal,
          transform: `translateY(${(1 - phoneReveal) * 20}px) scale(${phonePulse})`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            background: YELLOW,
            borderRadius: 40,
            padding: "20px 50px",
            boxShadow: "0 8px 30px rgba(246,199,68,0.35)",
          }}
        >
          <div
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 40,
              fontWeight: 800,
              color: CHARCOAL,
            }}
          >
            (954) 603-4081
          </div>
        </div>
      </div>

      {/* Locations */}
      <div
        style={{
          opacity: locationsReveal,
          transform: `translateY(${(1 - locationsReveal) * 20}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: "rgba(255,255,255,0.8)",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          16 Locations Across
        </div>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 30,
            color: WHITE,
            fontWeight: 700,
            letterSpacing: 3,
            marginTop: 6,
          }}
        >
          FL &middot; MA &middot; TX
        </div>
      </div>

      {/* Bottom brand bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: YELLOW,
        }}
      />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────
// MAIN COMPOSITION
// ────────────────────────────────────────────────────
export const V1_ChildVsAdultADHD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: CHARCOAL }}>
      {/* Scene 1: Hook */}
      {frame < SCENE_1_END + FADE_DURATION && (
        <Scene1Hook frame={frame} fps={fps} />
      )}

      {/* Scene 2: Child ADHD */}
      {frame >= SCENE_2_START - FADE_DURATION &&
        frame < SCENE_2_END + FADE_DURATION && (
          <Scene2Child frame={frame} fps={fps} />
        )}

      {/* Scene 3: Adult ADHD */}
      {frame >= SCENE_3_START - FADE_DURATION &&
        frame < SCENE_3_END + FADE_DURATION && (
          <Scene3Adult frame={frame} fps={fps} />
        )}

      {/* Scene 4: The Connection */}
      {frame >= SCENE_4_START - FADE_DURATION &&
        frame < SCENE_4_END + FADE_DURATION && (
          <Scene4Connection frame={frame} fps={fps} />
        )}

      {/* Scene 5: Key Insight */}
      {frame >= SCENE_5_START - FADE_DURATION &&
        frame < SCENE_5_END + FADE_DURATION && (
          <Scene5Insight frame={frame} fps={fps} />
        )}

      {/* Scene 6: CTA */}
      {frame >= SCENE_6_START - FADE_DURATION && (
        <Scene6CTA frame={frame} fps={fps} />
      )}
    </AbsoluteFill>
  );
};

export default V1_ChildVsAdultADHD;
