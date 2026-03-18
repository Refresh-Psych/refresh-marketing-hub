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
const CREAM = "#FFF9EE";
const LIGHT_BLUE = "#EBF4FF";

const HEADING_FONT = "'Montserrat', 'Poppins', sans-serif";
const BODY_FONT = "'DM Sans', 'Poppins', sans-serif";

// ─── Safe interpolate helper ─────────────────────────────────────────
const safe = (
  f: number,
  s: number,
  e: number,
  from = 0,
  to = 1
): number =>
  s >= e
    ? to
    : interpolate(f, [s, e], [from, to], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

// ─── Scene boundaries ────────────────────────────────────────────────
const SCENES = {
  hook:        { start: 0,   end: 80  },
  step1:       { start: 80,  end: 180 },
  step2:       { start: 180, end: 280 },
  step3:       { start: 280, end: 380 },
  step4:       { start: 380, end: 480 },
  reassurance: { start: 480, end: 630 },
  cta:         { start: 630, end: 750 },
};

// ─── Floating background circles ─────────────────────────────────────
const FloatingCircles: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
}> = ({ count = 6, color = BLUE, opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const circles = React.useMemo(() => {
    const seed: { x: number; y: number; r: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      seed.push({
        x: (i * 137.5) % 100,
        y: (i * 241.3) % 100,
        r: 60 + ((i * 73) % 140),
        speed: 0.2 + (i % 4) * 0.1,
        phase: i * 2.1,
      });
    }
    return seed;
  }, [count]);

  return (
    <>
      {circles.map((c, i) => {
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
              background: color,
              opacity,
              transform: `translate(${dx}px, ${dy}px)`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

// ─── SVG Icons ───────────────────────────────────────────────────────
const ClipboardIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 64,
  color = BLUE,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="14" y="10" width="36" height="48" rx="4" stroke={color} strokeWidth="3" fill="none" />
    <rect x="22" y="4" width="20" height="12" rx="3" stroke={color} strokeWidth="3" fill={WHITE} />
    <line x1="22" y1="30" x2="42" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="38" x2="38" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="46" x2="34" y2="46" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ClockIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 64,
  color = BLUE,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="3" fill="none" />
    <line x1="32" y1="32" x2="32" y2="16" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="32" x2="44" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="32" r="3" fill={color} />
  </svg>
);

const PlanIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 64,
  color = BLUE,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="10" y="8" width="44" height="50" rx="4" stroke={color} strokeWidth="3" fill="none" />
    <path d="M20 28 L28 36 L44 20" stroke={YELLOW} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="20" y1="44" x2="44" y2="44" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="50" x2="36" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CalendarIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 64,
  color = BLUE,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="14" width="48" height="42" rx="4" stroke={color} strokeWidth="3" fill="none" />
    <line x1="8" y1="26" x2="56" y2="26" stroke={color} strokeWidth="3" />
    <line x1="22" y1="8" x2="22" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="42" y1="8" x2="42" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="40" r="6" fill={YELLOW} />
  </svg>
);

// ─── Progress Bar ────────────────────────────────────────────────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { label: "Before", sceneStart: 80, sceneEnd: 180, y: 420 },
    { label: "Evaluation", sceneStart: 180, sceneEnd: 280, y: 660 },
    { label: "Plan", sceneStart: 280, sceneEnd: 380, y: 900 },
    { label: "Follow-Up", sceneStart: 380, sceneEnd: 480, y: 1140 },
  ];

  // Show progress bar only during steps (scenes 2-5)
  const barOpacity = safe(frame, 70, 90) * (1 - safe(frame, 470, 490));

  // How far along the line has filled
  const lineProgress =
    frame < 80 ? 0 :
    frame < 180 ? safe(frame, 80, 180, 0, 0.25) :
    frame < 280 ? 0.25 + safe(frame, 180, 280, 0, 0.25) :
    frame < 380 ? 0.5 + safe(frame, 280, 380, 0, 0.25) :
    0.75 + safe(frame, 380, 480, 0, 0.25);

  const trackTop = 400;
  const trackHeight = 760;

  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        top: 0,
        width: 60,
        height: "100%",
        opacity: barOpacity,
        pointerEvents: "none",
      }}
    >
      {/* Track background */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: trackTop,
          width: 6,
          height: trackHeight,
          borderRadius: 3,
          background: "rgba(43,108,176,0.15)",
        }}
      />
      {/* Track fill */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: trackTop,
          width: 6,
          height: trackHeight * lineProgress,
          borderRadius: 3,
          background: BLUE,
          transition: "height 0.1s",
        }}
      />
      {/* Step dots */}
      {steps.map((step, i) => {
        const isActive = frame >= step.sceneStart;
        const dotScale = isActive
          ? spring({ frame: frame - step.sceneStart, fps, config: { damping: 12, stiffness: 120 } })
          : 0;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: 14,
                top: step.y - 14,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: isActive ? BLUE : "rgba(43,108,176,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${0.6 + dotScale * 0.4})`,
                boxShadow: isActive ? `0 0 20px rgba(43,108,176,0.3)` : "none",
              }}
            >
              <span
                style={{
                  color: WHITE,
                  fontFamily: HEADING_FONT,
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {i + 1}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Step Card ───────────────────────────────────────────────────────
const StepCard: React.FC<{
  stepNum: number;
  title: string;
  bullets: string[];
  icon: React.ReactNode;
  sceneStart: number;
  sceneEnd: number;
}> = ({ stepNum, title, bullets, icon, sceneStart, sceneEnd }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame: frame - sceneStart,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const exitProgress = safe(frame, sceneEnd - 20, sceneEnd);

  const opacity = Math.min(enterProgress, 1 - exitProgress);
  const slideY = interpolate(enterProgress, [0, 1], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Icon entrance with bounce
  const iconScale = spring({
    frame: frame - (sceneStart + 10),
    fps,
    config: { damping: 10, stiffness: 150, mass: 0.8 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 320,
        left: 120,
        right: 60,
        opacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: YELLOW,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: HEADING_FONT,
            fontWeight: 800,
            fontSize: 24,
            color: CHARCOAL,
          }}
        >
          {stepNum}
        </div>
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: 22,
            fontWeight: 600,
            color: BLUE,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Step {stepNum}
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 32,
          transform: `scale(${iconScale})`,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: LIGHT_BLUE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(43,108,176,0.12)",
          }}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 52,
          fontWeight: 800,
          color: CHARCOAL,
          lineHeight: 1.2,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      {/* Bullets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {bullets.map((bullet, i) => {
          const bulletDelay = sceneStart + 20 + i * 12;
          const bulletSpring = spring({
            frame: frame - bulletDelay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });
          const bulletSlideX = interpolate(bulletSpring, [0, 1], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: bulletSpring,
                transform: `translateX(${bulletSlideX}px)`,
                background: WHITE,
                padding: "22px 28px",
                borderRadius: 18,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: YELLOW,
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
                {bullet}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Composition ────────────────────────────────────────────────
export const V5_FirstAppointment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene 1: Hook ──────────────────────────────────────────────
  const hookOpacity = safe(frame, 0, 15) * (1 - safe(frame, 65, 80));

  const hookTitleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 60 },
  });

  const hookSubSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 60 },
  });

  // ── Scene 6: Reassurance ───────────────────────────────────────
  const reassEnter = spring({
    frame: frame - SCENES.reassurance.start,
    fps,
    config: { damping: 14, stiffness: 70 },
  });
  const reassExit = safe(frame, SCENES.reassurance.end - 20, SCENES.reassurance.end);
  const reassOpacity = Math.min(reassEnter, 1 - reassExit);

  // ── Scene 7: CTA ──────────────────────────────────────────────
  const ctaEnter = spring({
    frame: frame - SCENES.cta.start,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Pulsing phone glow
  const ctaPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${CREAM} 0%, ${WHITE} 40%, ${LIGHT_BLUE} 100%)`,
        overflow: "hidden",
      }}
    >
      <FloatingCircles />

      {/* ── Progress Bar (visible during steps) ── */}
      <ProgressBar />

      {/* ══════════════ SCENE 1: HOOK ══════════════ */}
      {frame < SCENES.hook.end + 10 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: hookOpacity,
            padding: "0 60px",
          }}
        >
          {/* Decorative soft circle behind text */}
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(43,108,176,0.08) 0%, transparent 70%)`,
            }}
          />
          <h1
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 72,
              fontWeight: 800,
              color: CHARCOAL,
              textAlign: "center",
              lineHeight: 1.15,
              transform: `translateY(${interpolate(hookTitleSpring, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              opacity: hookTitleSpring,
              marginBottom: 32,
            }}
          >
            Nervous About{"\n"}Your First Visit?
          </h1>
          <div
            style={{
              width: 80,
              height: 5,
              borderRadius: 3,
              background: YELLOW,
              marginBottom: 32,
              opacity: hookSubSpring,
              transform: `scaleX(${hookSubSpring})`,
            }}
          />
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: 38,
              fontWeight: 500,
              color: BLUE,
              textAlign: "center",
              opacity: hookSubSpring,
              transform: `translateY(${interpolate(hookSubSpring, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            }}
          >
            Here's exactly what to expect
          </p>
        </div>
      )}

      {/* ══════════════ SCENE 2: STEP 1 ══════════════ */}
      {frame >= SCENES.step1.start - 5 && frame < SCENES.step1.end + 10 && (
        <StepCard
          stepNum={1}
          title="Before Your Visit"
          bullets={[
            "Complete intake forms online",
            "List your medications",
            "Write down your concerns",
          ]}
          icon={<ClipboardIcon size={64} color={BLUE} />}
          sceneStart={SCENES.step1.start}
          sceneEnd={SCENES.step1.end}
        />
      )}

      {/* ══════════════ SCENE 3: STEP 2 ══════════════ */}
      {frame >= SCENES.step2.start - 5 && frame < SCENES.step2.end + 10 && (
        <StepCard
          stepNum={2}
          title="The Evaluation"
          bullets={[
            "Thorough conversation about your symptoms",
            "Medical & family history review",
            "No judgment, just understanding",
          ]}
          icon={<ClockIcon size={64} color={BLUE} />}
          sceneStart={SCENES.step2.start}
          sceneEnd={SCENES.step2.end}
        />
      )}

      {/* Duration badge for Step 2 */}
      {frame >= SCENES.step2.start && frame < SCENES.step2.end && (
        <div
          style={{
            position: "absolute",
            top: 270,
            left: "50%",
            transform: "translateX(-50%)",
            background: YELLOW,
            padding: "8px 24px",
            borderRadius: 30,
            opacity: safe(frame, SCENES.step2.start + 5, SCENES.step2.start + 20) *
                     (1 - safe(frame, SCENES.step2.end - 20, SCENES.step2.end)),
          }}
        >
          <span
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 22,
              fontWeight: 700,
              color: CHARCOAL,
            }}
          >
            60 minutes
          </span>
        </div>
      )}

      {/* ══════════════ SCENE 4: STEP 3 ══════════════ */}
      {frame >= SCENES.step3.start - 5 && frame < SCENES.step3.end + 10 && (
        <StepCard
          stepNum={3}
          title="Your Treatment Plan"
          bullets={[
            "Personalized medication options",
            "Therapy recommendations",
            "Lifestyle strategies",
          ]}
          icon={<PlanIcon size={64} color={BLUE} />}
          sceneStart={SCENES.step3.start}
          sceneEnd={SCENES.step3.end}
        />
      )}

      {/* ══════════════ SCENE 5: STEP 4 ══════════════ */}
      {frame >= SCENES.step4.start - 5 && frame < SCENES.step4.end + 10 && (
        <StepCard
          stepNum={4}
          title="Follow-Up"
          bullets={[
            "Check-in within 2\u20134 weeks",
            "Adjust as needed",
            "Ongoing support",
          ]}
          icon={<CalendarIcon size={64} color={BLUE} />}
          sceneStart={SCENES.step4.start}
          sceneEnd={SCENES.step4.end}
        />
      )}

      {/* ══════════════ SCENE 6: REASSURANCE ══════════════ */}
      {frame >= SCENES.reassurance.start - 5 && frame < SCENES.reassurance.end + 10 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: reassOpacity,
            padding: "0 70px",
          }}
        >
          {/* Warm glow background */}
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(246,199,68,0.15) 0%, transparent 70%)`,
            }}
          />

          <h2
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 64,
              fontWeight: 800,
              color: CHARCOAL,
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: 48,
              transform: `translateY(${interpolate(reassEnter, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            }}
          >
            You're not alone.
          </h2>

          {/* Stats card */}
          <div
            style={{
              background: WHITE,
              borderRadius: 24,
              padding: "40px 50px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
              transform: `scale(${interpolate(reassEnter, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            }}
          >
            {/* Animated counter */}
            <span
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 80,
                fontWeight: 800,
                color: BLUE,
                lineHeight: 1,
              }}
            >
              {Math.round(
                interpolate(
                  Math.min(reassEnter, 1),
                  [0, 1],
                  [0, 4820],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )
              ).toLocaleString()}
            </span>
            <span
              style={{
                fontFamily: BODY_FONT,
                fontSize: 30,
                fontWeight: 500,
                color: CHARCOAL,
                textAlign: "center",
              }}
            >
              patients trust Refresh Psychiatry
            </span>
          </div>

          {/* Same-week badge */}
          <div
            style={{
              background: `linear-gradient(135deg, ${BLUE}, #3B82C4)`,
              borderRadius: 20,
              padding: "20px 36px",
              opacity: safe(frame, SCENES.reassurance.start + 30, SCENES.reassurance.start + 50),
            }}
          >
            <span
              style={{
                fontFamily: BODY_FONT,
                fontSize: 28,
                fontWeight: 600,
                color: WHITE,
              }}
            >
              Same-week appointments available
            </span>
          </div>
        </div>
      )}

      {/* ══════════════ SCENE 7: CTA ══════════════ */}
      {frame >= SCENES.cta.start - 5 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: ctaEnter,
            padding: "0 60px",
          }}
        >
          {/* Gradient backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(170deg, ${BLUE} 0%, #1A4A7A 100%)`,
              opacity: ctaEnter,
            }}
          />

          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -50,
              left: -80,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              transform: `translateY(${interpolate(ctaEnter, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            }}
          >
            {/* Yellow accent line */}
            <div
              style={{
                width: 60,
                height: 5,
                borderRadius: 3,
                background: YELLOW,
                marginBottom: 8,
              }}
            />

            <h2
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 60,
                fontWeight: 800,
                color: WHITE,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Refresh Psychiatry
            </h2>

            <p
              style={{
                fontFamily: BODY_FONT,
                fontSize: 34,
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Book your first appointment
            </p>

            {/* Phone number button */}
            <div
              style={{
                background: YELLOW,
                borderRadius: 20,
                padding: "22px 48px",
                boxShadow: `0 0 ${30 * ctaPulse}px rgba(246,199,68,${0.4 * ctaPulse})`,
              }}
            >
              <span
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 42,
                  fontWeight: 800,
                  color: CHARCOAL,
                }}
              >
                (954) 603-4081
              </span>
            </div>

            {/* Weekend badge */}
            <div
              style={{
                marginTop: 12,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: "14px 30px",
                border: "1px solid rgba(255,255,255,0.2)",
                opacity: safe(frame, SCENES.cta.start + 20, SCENES.cta.start + 40),
              }}
            >
              <span
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 26,
                  fontWeight: 600,
                  color: WHITE,
                }}
              >
                Weekend appointments available
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent top bar (during steps) ── */}
      {frame >= SCENES.step1.start && frame < SCENES.reassurance.start && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "50px 60px 30px 120px",
            opacity:
              safe(frame, SCENES.step1.start, SCENES.step1.start + 15) *
              (1 - safe(frame, SCENES.step4.end - 15, SCENES.step4.end)),
          }}
        >
          <h3
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 30,
              fontWeight: 700,
              color: BLUE,
              lineHeight: 1.3,
            }}
          >
            Your First Appointment
          </h3>
          <div
            style={{
              width: 50,
              height: 4,
              borderRadius: 2,
              background: YELLOW,
              marginTop: 10,
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
