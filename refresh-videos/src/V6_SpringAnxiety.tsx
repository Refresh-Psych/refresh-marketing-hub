import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

// ============================================================
// BRAND COLORS
// ============================================================
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const SPRING_GREEN = "#48BB78";
const LIGHT_BLUE = "#EBF8FF";

const HEADING_FONT = "'Montserrat', 'Poppins', sans-serif";
const BODY_FONT = "'DM Sans', 'Poppins', sans-serif";

// ============================================================
// SAFE INTERPOLATE HELPER
// ============================================================
const safe = (
  f: number,
  s: number,
  e: number,
  from: number = 0,
  to: number = 1
): number => {
  if (s >= e) return to;
  return interpolate(f, [s, e], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ============================================================
// FLOATING PETALS (background decoration)
// ============================================================
const FloatingPetals: React.FC<{ frame: number; opacity?: number }> = ({
  frame,
  opacity = 0.08,
}) => {
  const petals = React.useMemo(() => {
    const items: {
      x: number;
      y: number;
      size: number;
      speed: number;
      phase: number;
      color: string;
    }[] = [];
    const colors = [SPRING_GREEN, BLUE, YELLOW, "#A3D9A5"];
    for (let i = 0; i < 10; i++) {
      items.push({
        x: (i * 173.7) % 100,
        y: (i * 237.1) % 100,
        size: 30 + ((i * 67) % 80),
        speed: 0.15 + (i % 5) * 0.08,
        phase: i * 1.8,
        color: colors[i % colors.length],
      });
    }
    return items;
  }, []);

  return (
    <>
      {petals.map((p, i) => {
        const dx = Math.sin(frame * 0.006 * p.speed + p.phase) * 25;
        const dy = Math.cos(frame * 0.008 * p.speed + p.phase) * 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50% 0 50% 0",
              background: p.color,
              opacity,
              transform: `translate(${dx}px, ${dy}px) rotate(${frame * 0.3 + i * 45}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

// ============================================================
// SUN COMPONENT (CSS only, no SVG paths)
// ============================================================
const Sun: React.FC<{ frame: number; rise: number }> = ({ frame, rise }) => {
  const rayCount = 12;
  return (
    <div
      style={{
        position: "absolute",
        right: 160,
        top: interpolate(rise, [0, 1], [400, 80], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        width: 180,
        height: 180,
        opacity: rise,
      }}
    >
      {/* Rays */}
      {Array.from({ length: rayCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 4,
            height: 40,
            background: YELLOW,
            borderRadius: 2,
            opacity: 0.5 + Math.sin(frame * 0.08 + i) * 0.3,
            transformOrigin: "center -50px",
            transform: `translate(-50%, -50%) rotate(${(360 / rayCount) * i + frame * 0.5}deg)`,
          }}
        />
      ))}
      {/* Core */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${YELLOW}, #F6A623)`,
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 60px ${YELLOW}66`,
        }}
      />
    </div>
  );
};

// ============================================================
// SCENE 1: TITLE (0-90)
// ============================================================
const Scene1Title: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safe(frame, 0, 25);
  const fadeOut = safe(frame, 70, 90, 1, 0);
  const opacity = fadeIn * fadeOut;

  const titleIn = safe(frame, 5, 35);
  const subtitleIn = safe(frame, 20, 50);
  const sunRise = safe(frame, 5, 60);
  const accentLine = safe(frame, 25, 55);

  // Background gradient: winter blue to spring green
  const seasonShift = safe(frame, 0, 90);
  const bg =
    seasonShift < 0.5
      ? `linear-gradient(135deg, #C3DAFE 0%, ${LIGHT_BLUE} 50%, #E2E8F0 100%)`
      : `linear-gradient(135deg, ${LIGHT_BLUE} 0%, #C6F6D5 50%, #FEFCBF 100%)`;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background gradient */}
      <div style={{ position: "absolute", inset: 0, background: bg }} />

      <FloatingPetals frame={frame} />
      <Sun frame={frame} rise={sunRise} />

      {/* Decorative leaf cluster */}
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 80,
          opacity: safe(frame, 20, 50) * 0.15,
        }}
      >
        {[0, 40, -30].map((rot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 60 + i * 20,
              height: 60 + i * 20,
              borderRadius: "50% 0 50% 0",
              background: SPRING_GREEN,
              transform: `rotate(${rot}deg) translate(${i * 30}px, ${-i * 20}px)`,
            }}
          />
        ))}
      </div>

      {/* Title text */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 92,
            fontWeight: 800,
            color: CHARCOAL,
            lineHeight: 1.1,
            transform: `translateY(${(1 - titleIn) * 60}px)`,
            opacity: titleIn,
          }}
        >
          Spring <span style={{ color: SPRING_GREEN }}>Anxiety</span>
        </div>
        <div
          style={{
            fontSize: 34,
            fontFamily: BODY_FONT,
            color: BLUE,
            marginTop: 24,
            fontWeight: 500,
            opacity: subtitleIn,
            transform: `translateY(${(1 - subtitleIn) * 30}px)`,
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Why Seasonal Changes Affect Your Mental Health
        </div>
        {/* Accent underline */}
        <div
          style={{
            marginTop: 28,
            width: accentLine * 200,
            height: 5,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${SPRING_GREEN}, ${YELLOW})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: COMMON SPRING TRIGGERS (90-210)
// ============================================================
const Scene2Triggers: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = safe(frame, 90, 110);
  const fadeOut = safe(frame, 190, 210, 1, 0);
  const opacity = fadeIn * fadeOut;

  const triggers = [
    { label: "Daylight\nChanges", color: YELLOW, shape: "circle" as const },
    { label: "Social\nPressure", color: BLUE, shape: "square" as const },
    { label: "Allergy-Mood\nConnection", color: SPRING_GREEN, shape: "leaf" as const },
    { label: "Schedule\nDisruptions", color: "#E53E3E", shape: "diamond" as const },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(135deg, ${LIGHT_BLUE} 0%, #C6F6D5 50%, #FEFCBF 100%)`,
      }}
    >
      <FloatingPetals frame={frame} opacity={0.05} />

      {/* Section title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 54,
            fontWeight: 700,
            color: CHARCOAL,
            opacity: safe(frame, 92, 110),
            transform: `translateY(${(1 - safe(frame, 92, 110)) * 30}px)`,
          }}
        >
          Common Spring <span style={{ color: BLUE }}>Triggers</span>
        </div>
      </div>

      {/* Trigger cards */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 36,
          zIndex: 2,
        }}
      >
        {triggers.map((t, i) => {
          const delay = i * 12;
          const cardIn = safe(frame, 100 + delay, 120 + delay);
          const shapeStyle: React.CSSProperties =
            t.shape === "circle"
              ? { borderRadius: "50%" }
              : t.shape === "square"
              ? { borderRadius: 6 }
              : t.shape === "leaf"
              ? { borderRadius: "50% 0 50% 0" }
              : { borderRadius: 4, transform: "rotate(45deg)" };

          return (
            <div
              key={i}
              style={{
                width: 340,
                background: WHITE,
                borderRadius: 24,
                padding: "44px 28px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                opacity: cardIn,
                transform: `translateY(${(1 - cardIn) * 50}px) scale(${0.9 + cardIn * 0.1})`,
                borderTop: `5px solid ${t.color}`,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `${t.color}18`,
                  border: `3px solid ${t.color}`,
                  margin: "0 auto 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: t.color,
                    ...shapeStyle,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 22,
                  fontWeight: 700,
                  color: CHARCOAL,
                  whiteSpace: "pre-line",
                  lineHeight: 1.3,
                }}
              >
                {t.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: STATISTICS (210-360)
// ============================================================
const Scene3Stats: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = safe(frame, 210, 235);
  const fadeOut = safe(frame, 340, 360, 1, 0);
  const opacity = fadeIn * fadeOut;

  const percentCount = Math.round(safe(frame, 230, 310) * 40);
  const barGrow = safe(frame, 240, 320);

  const bars = [
    { label: "Spring", pct: 0.4, color: SPRING_GREEN },
    { label: "Fall", pct: 0.32, color: YELLOW },
    { label: "Winter", pct: 0.28, color: BLUE },
    { label: "Summer", pct: 0.18, color: "#E53E3E" },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(160deg, ${WHITE} 0%, ${LIGHT_BLUE} 100%)`,
      }}
    >
      <FloatingPetals frame={frame} opacity={0.04} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
          zIndex: 2,
        }}
      >
        {/* Large percentage */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 180,
            fontWeight: 900,
            color: BLUE,
            lineHeight: 1,
            opacity: safe(frame, 215, 240),
            transform: `scale(${0.7 + safe(frame, 215, 250) * 0.3})`,
          }}
        >
          {percentCount}
          <span style={{ fontSize: 100, color: YELLOW }}>%</span>
        </div>

        {/* Description */}
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 32,
            fontWeight: 500,
            color: CHARCOAL,
            textAlign: "center",
            maxWidth: 800,
            marginTop: 20,
            lineHeight: 1.5,
            opacity: safe(frame, 240, 265),
          }}
        >
          of people report increased anxiety
          <br />
          during seasonal transitions
        </div>

        {/* Bar chart */}
        <div
          style={{
            display: "flex",
            gap: 30,
            marginTop: 60,
            alignItems: "flex-end",
            height: 200,
          }}
        >
          {bars.map((bar, i) => {
            const barIn = safe(frame, 255 + i * 15, 300 + i * 15);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {/* Percentage label */}
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 18,
                    fontWeight: 700,
                    color: CHARCOAL,
                    opacity: barIn,
                  }}
                >
                  {Math.round(bar.pct * 100 * barIn)}%
                </div>
                {/* Bar */}
                <div
                  style={{
                    width: 100,
                    height: bar.pct * 200 * barGrow,
                    background: `linear-gradient(180deg, ${bar.color}, ${bar.color}AA)`,
                    borderRadius: "12px 12px 4px 4px",
                    minHeight: 4,
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 16,
                    fontWeight: 600,
                    color: CHARCOAL,
                    opacity: barIn,
                  }}
                >
                  {bar.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: COPING STRATEGIES (360-510)
// ============================================================
const Scene4Coping: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = safe(frame, 360, 385);
  const fadeOut = safe(frame, 490, 510, 1, 0);
  const opacity = fadeIn * fadeOut;

  const tips = [
    "Maintain Sleep Schedule",
    "Gradual Exposure to Social Events",
    "Mindfulness & Grounding",
    "Talk to a Professional",
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(160deg, #F0FFF4 0%, #C6F6D5 60%, ${LIGHT_BLUE} 100%)`,
      }}
    >
      <FloatingPetals frame={frame} opacity={0.05} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 100px",
          zIndex: 2,
        }}
      >
        {/* Section title */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 54,
            fontWeight: 700,
            color: CHARCOAL,
            marginBottom: 50,
            opacity: safe(frame, 362, 385),
            transform: `translateY(${(1 - safe(frame, 362, 385)) * 30}px)`,
          }}
        >
          Coping <span style={{ color: SPRING_GREEN }}>Strategies</span>
        </div>

        {/* Tip rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: "100%",
            maxWidth: 1100,
          }}
        >
          {tips.map((tip, i) => {
            const tipDelay = i * 20;
            const tipIn = safe(frame, 380 + tipDelay, 405 + tipDelay);
            const checkIn = safe(frame, 400 + tipDelay, 420 + tipDelay);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  background: WHITE,
                  borderRadius: 20,
                  padding: "28px 40px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  opacity: tipIn,
                  transform: `translateX(${(1 - tipIn) * 120}px)`,
                  borderLeft: `6px solid ${SPRING_GREEN}`,
                }}
              >
                {/* Number circle */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    minWidth: 52,
                    borderRadius: "50%",
                    background: SPRING_GREEN,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: HEADING_FONT,
                    fontSize: 24,
                    fontWeight: 800,
                    color: WHITE,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 30,
                    fontWeight: 600,
                    color: CHARCOAL,
                  }}
                >
                  {tip}
                </div>
                {/* CSS checkmark */}
                <div
                  style={{
                    marginLeft: "auto",
                    width: 32,
                    height: 18,
                    borderBottom: `4px solid ${SPRING_GREEN}`,
                    borderLeft: `4px solid ${SPRING_GREEN}`,
                    transform: "rotate(-45deg)",
                    opacity: checkIn,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: YOU'RE NOT ALONE (510-630)
// ============================================================
const Scene5Support: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = safe(frame, 510, 540);
  const fadeOut = safe(frame, 610, 630, 1, 0);
  const opacity = fadeIn * fadeOut;

  const heartScale =
    0.5 + safe(frame, 520, 550) * 0.5 + Math.sin(frame * 0.08) * 0.05;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(135deg, ${LIGHT_BLUE} 0%, #EBF4FF 50%, ${WHITE} 100%)`,
      }}
    >
      <FloatingPetals frame={frame} opacity={0.04} />

      {/* Decorative expanding circles */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 200 + i * 120,
            height: 200 + i * 120,
            borderRadius: "50%",
            border: `2px solid ${BLUE}`,
            opacity:
              0.06 + safe(frame, 550 + i * 15, 580 + i * 15) * 0.06,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 140px",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        {/* CSS heart */}
        <div
          style={{
            position: "relative",
            width: 80,
            height: 80,
            marginBottom: 40,
            opacity: safe(frame, 520, 545),
            transform: `scale(${heartScale})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 20,
              width: 40,
              height: 64,
              borderRadius: "40px 40px 0 0",
              background: BLUE,
              transform: "rotate(-45deg)",
              transformOrigin: "0 100%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 20,
              width: 40,
              height: 64,
              borderRadius: "40px 40px 0 0",
              background: BLUE,
              transform: "rotate(45deg)",
              transformOrigin: "100% 100%",
            }}
          />
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 68,
            fontWeight: 800,
            color: CHARCOAL,
            lineHeight: 1.2,
            opacity: safe(frame, 520, 545),
            transform: `translateY(${(1 - safe(frame, 520, 545)) * 40}px)`,
          }}
        >
          You're <span style={{ color: BLUE }}>Not Alone</span>
        </div>

        {/* Body text */}
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 30,
            color: CHARCOAL,
            marginTop: 30,
            lineHeight: 1.6,
            maxWidth: 850,
            opacity: safe(frame, 545, 575),
            fontWeight: 400,
          }}
        >
          Refresh Psychiatry specializes in anxiety treatment
          <br />
          with{" "}
          <span style={{ color: BLUE, fontWeight: 700 }}>
            personalized care plans
          </span>{" "}
          designed for you.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA (630-720)
// ============================================================
const Scene6CTA: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = safe(frame, 630, 655);
  const pulse = 1 + Math.sin(frame * 0.1) * 0.015;

  return (
    <AbsoluteFill
      style={{
        background: BLUE,
        opacity: fadeIn,
      }}
    >
      {/* Subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `radial-gradient(circle, ${WHITE} 1.5px, transparent 1.5px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner accents */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 60,
          height: 60,
          borderTop: `4px solid ${YELLOW}`,
          borderLeft: `4px solid ${YELLOW}`,
          borderRadius: "8px 0 0 0",
          opacity: safe(frame, 660, 685) * 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          width: 60,
          height: 60,
          borderBottom: `4px solid ${YELLOW}`,
          borderRight: `4px solid ${YELLOW}`,
          borderRadius: "0 0 8px 0",
          opacity: safe(frame, 660, 685) * 0.4,
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
          zIndex: 2,
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 64,
            fontWeight: 800,
            color: WHITE,
            textAlign: "center",
            opacity: safe(frame, 635, 660),
            transform: `translateY(${(1 - safe(frame, 635, 660)) * 40}px)`,
          }}
        >
          Start Your Spring <span style={{ color: YELLOW }}>Reset</span>
        </div>

        {/* Yellow CTA button */}
        <div
          style={{
            marginTop: 44,
            background: YELLOW,
            borderRadius: 60,
            padding: "22px 70px",
            opacity: safe(frame, 655, 680),
            transform: `scale(${(0.85 + safe(frame, 655, 680) * 0.15) * pulse})`,
            boxShadow: `0 6px 30px ${YELLOW}55`,
          }}
        >
          <div
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 36,
              fontWeight: 800,
              color: CHARCOAL,
            }}
          >
            (954) 603-4081
          </div>
        </div>

        {/* Website */}
        <div
          style={{
            marginTop: 28,
            fontFamily: BODY_FONT,
            fontSize: 28,
            fontWeight: 500,
            color: `${WHITE}CC`,
            opacity: safe(frame, 670, 695),
            letterSpacing: 1.5,
          }}
        >
          refreshpsychiatry.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const V6_SpringAnxiety: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: LIGHT_BLUE,
        fontFamily: BODY_FONT,
        overflow: "hidden",
      }}
    >
      {/* Scene layers — only the active scene renders */}
      {frame < 90 && <Scene1Title frame={frame} fps={fps} />}
      {frame >= 90 && frame < 210 && <Scene2Triggers frame={frame} fps={fps} />}
      {frame >= 210 && frame < 360 && <Scene3Stats frame={frame} fps={fps} />}
      {frame >= 360 && frame < 510 && <Scene4Coping frame={frame} fps={fps} />}
      {frame >= 510 && frame < 630 && <Scene5Support frame={frame} fps={fps} />}
      {frame >= 630 && <Scene6CTA frame={frame} fps={fps} />}

      {/* Progress bar (non-CTA scenes) */}
      {frame < 630 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            zIndex: 10,
            background: `${CHARCOAL}15`,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(frame / 720) * 100}%`,
              background: `linear-gradient(90deg, ${SPRING_GREEN}, ${BLUE}, ${YELLOW})`,
              borderRadius: "0 3px 3px 0",
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
