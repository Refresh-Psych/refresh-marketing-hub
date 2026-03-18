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
const CHARCOAL = "#2D3748";

const FONT_FAMILY = "'DM Sans', 'Poppins', 'Montserrat', sans-serif";

// ─── Floating Background Circles ───────────────────────────────────────
const FloatingCircles: React.FC<{
  count?: number;
  color?: string;
  maxSize?: number;
  opacity?: number;
}> = ({ count = 8, color = "#ffffff", maxSize = 180, opacity = 0.08 }) => {
  const frame = useCurrentFrame();
  const circles = React.useMemo(() => {
    const seed: { x: number; y: number; r: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      seed.push({
        x: ((i * 137.5) % 100),
        y: ((i * 241.3) % 100),
        r: 40 + ((i * 73) % (maxSize - 40)),
        speed: 0.3 + (i % 5) * 0.15,
        phase: (i * 1.8),
      });
    }
    return seed;
  }, [count, maxSize]);

  return (
    <>
      {circles.map((c, i) => {
        const dx = Math.sin(frame * 0.01 * c.speed + c.phase) * 30;
        const dy = Math.cos(frame * 0.013 * c.speed + c.phase) * 25;
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

// ─── Big Countdown Number Background ───────────────────────────────────
const BigNumber: React.FC<{
  num: number;
  color?: string;
  glow?: boolean;
  delay?: number;
}> = ({ num, color = YELLOW, glow = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.2 },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 0.12], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        fontSize: 500,
        fontWeight: 900,
        fontFamily: FONT_FAMILY,
        color,
        opacity,
        lineHeight: 1,
        pointerEvents: "none",
        ...(glow
          ? {
              textShadow: `0 0 80px ${color}, 0 0 160px ${color}`,
              opacity: opacity * 1.5,
            }
          : {}),
      }}
    >
      {num}
    </div>
  );
};

// ─── Yellow Divider Line ───────────────────────────────────────────────
const YellowLine: React.FC<{ width?: number; mt?: number; mb?: number }> = ({
  width = 200,
  mt = 20,
  mb = 20,
}) => (
  <div
    style={{
      width,
      height: 4,
      borderRadius: 2,
      background: `linear-gradient(90deg, transparent, ${YELLOW}, transparent)`,
      margin: `${mt}px auto ${mb}px`,
    }}
  />
);

// ─── Scene 1: Hook ─────────────────────────────────────────────────────
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 100 } });
  const subtitleSpring = spring({ frame: frame - 25, fps, config: { damping: 14, stiffness: 100 } });
  const yellowSpring = spring({ frame: frame - 40, fps, config: { damping: 14, stiffness: 100 } });
  const badgeOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0d9488 0%, #2B6CB0 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#ffffff" opacity={0.06} count={10} />

      <div style={{ textAlign: "center", zIndex: 1, padding: "0 60px" }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            transform: `translateY(${(1 - titleSpring) * 40}px)`,
            opacity: titleSpring,
            marginBottom: 16,
          }}
        >
          5 Ways to
        </div>
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.1,
            transform: `translateY(${(1 - subtitleSpring) * 40}px)`,
            opacity: subtitleSpring,
            marginBottom: 20,
          }}
        >
          Reset Your Nervous System
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: YELLOW,
            transform: `translateY(${(1 - yellowSpring) * 30}px)`,
            opacity: yellowSpring,
          }}
        >
          in 60 seconds or less
        </div>
      </div>

      {/* Badge */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: badgeOpacity,
          background: "rgba(0,0,0,0.25)",
          borderRadius: 40,
          padding: "16px 36px",
          zIndex: 1,
        }}
      >
        <span style={{ color: WHITE, fontSize: 30, fontWeight: 600 }}>
          30M+ people saved these techniques
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: #5 Physiological Sigh ────────────────────────────────────
const ScenePhysiologicalSigh: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 100 } });
  const descOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const footerOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Breathing animation for lungs
  const breathCycle = Math.sin(frame * 0.06) * 0.5 + 0.5; // 0..1
  const lungScale = 0.85 + breathCycle * 0.25;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #065f46 0%, #0d9488 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#34d399" opacity={0.05} count={6} />
      <BigNumber num={5} color={YELLOW} delay={0} />

      <div style={{ zIndex: 1, textAlign: "center", padding: "0 60px" }}>
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: WHITE,
            opacity: titleSpring,
            transform: `scale(${titleSpring})`,
            marginBottom: 30,
          }}
        >
          The Physiological Sigh
        </div>

        <YellowLine width={160} />

        <div style={{ opacity: descOpacity, marginBottom: 40 }}>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.9)", fontWeight: 600, lineHeight: 1.5 }}>
            Double inhale through nose
          </div>
          <div style={{ fontSize: 42, color: YELLOW, fontWeight: 700, margin: "8px 0" }}>→</div>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.9)", fontWeight: 600, lineHeight: 1.5 }}>
            Long exhale through mouth
          </div>
        </div>

        {/* Simple lungs SVG */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <svg
            width={180}
            height={160}
            viewBox="0 0 180 160"
            style={{ transform: `scale(${lungScale})`, transition: "transform 0.1s" }}
          >
            {/* Left lung */}
            <rect x={20} y={20} width={55} height={110} rx={28} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            {/* Right lung */}
            <rect x={105} y={20} width={55} height={110} rx={28} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            {/* Trachea */}
            <rect x={78} y={0} width={24} height={60} rx={12} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
          </svg>
        </div>

        <div style={{ opacity: footerOpacity, fontSize: 28, color: "rgba(255,255,255,0.7)", fontWeight: 500, lineHeight: 1.6 }}>
          Discovered by Stanford researchers
          <br />
          Reduces stress in one breath
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: #4 Cold Water Reset ──────────────────────────────────────
const SceneColdWater: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 100 } });
  const descOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Water droplets
  const droplets = React.useMemo(() => {
    const d: { x: number; delay: number; size: number }[] = [];
    for (let i = 0; i < 12; i++) {
      d.push({
        x: 10 + ((i * 83) % 80),
        delay: (i * 11) % 40,
        size: 12 + (i % 4) * 6,
      });
    }
    return d;
  }, []);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1e40af 0%, #3b82f6 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#93c5fd" opacity={0.06} count={7} />
      <BigNumber num={4} color="#93c5fd" delay={0} />

      {/* Falling droplets */}
      {droplets.map((d, i) => {
        const t = ((frame + d.delay * 3) % 80) / 80;
        const y = -50 + t * 2050;
        const opacity = t < 0.1 ? t * 10 : t > 0.85 ? (1 - t) * 6.67 : 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: y,
              width: d.size,
              height: d.size * 1.4,
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              background: "rgba(147,197,253,0.35)",
              opacity,
              pointerEvents: "none",
            }}
          />
        );
      })}

      <div style={{ zIndex: 1, textAlign: "center", padding: "0 60px" }}>
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: WHITE,
            opacity: titleSpring,
            transform: `scale(${titleSpring})`,
            marginBottom: 30,
          }}
        >
          Cold Water on Face
        </div>

        <YellowLine width={160} />

        <div style={{ opacity: descOpacity, marginBottom: 30 }}>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.9)", fontWeight: 600, lineHeight: 1.6 }}>
            Triggers the mammalian
            <br />
            dive reflex
          </div>
        </div>

        <div
          style={{
            opacity: statOpacity,
            background: "rgba(0,0,0,0.2)",
            borderRadius: 24,
            padding: "24px 40px",
            display: "inline-block",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 900, color: YELLOW }}>10–25%</div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.8)", fontWeight: 500, marginTop: 4 }}>
            instant heart rate reduction
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: #3 Humming ───────────────────────────────────────────────
const SceneHumming: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 100 } });
  const descOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const footerOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sine wave animation
  const waveProgress = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const wavePath = React.useMemo(() => {
    const points: string[] = [];
    const totalPoints = 200;
    for (let i = 0; i <= totalPoints; i++) {
      const x = (i / totalPoints) * 800;
      const y = 50 + Math.sin((i / totalPoints) * Math.PI * 6 + frame * 0.08) * 30;
      points.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
    }
    return points.join(" ");
  }, [frame]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #5b21b6 0%, #7c3aed 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#c4b5fd" opacity={0.06} count={7} />
      <BigNumber num={3} color="#c4b5fd" delay={0} />

      <div style={{ zIndex: 1, textAlign: "center", padding: "0 60px", width: "100%" }}>
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: WHITE,
            opacity: titleSpring,
            transform: `scale(${titleSpring})`,
            marginBottom: 30,
          }}
        >
          Humming Vibration
        </div>

        <YellowLine width={160} />

        <div style={{ opacity: descOpacity, marginBottom: 40 }}>
          <div style={{ fontSize: 34, color: "rgba(255,255,255,0.9)", fontWeight: 600, lineHeight: 1.6 }}>
            Activates the vagus nerve through
            <br />
            vocal cord vibration
          </div>
        </div>

        {/* Sound wave SVG */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40, padding: "0 20px" }}>
          <svg width={800} height={100} viewBox="0 0 800 100" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={YELLOW} />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <clipPath id="waveClip">
                <rect x={0} y={0} width={800 * waveProgress} height={100} />
              </clipPath>
            </defs>
            <path
              d={wavePath}
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth={4}
              strokeLinecap="round"
              clipPath="url(#waveClip)"
            />
          </svg>
        </div>

        <div style={{ opacity: footerOpacity }}>
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: 24,
              padding: "20px 36px",
              display: "inline-block",
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 700, color: YELLOW }}>30 seconds</span>
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              {" "}of humming = measurable parasympathetic activation
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: #2 Box Breathing ─────────────────────────────────────────
const SceneBoxBreathing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 100 } });
  const footerOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Box drawing animation — traces all 4 sides over frames 20-100
  const boxSize = 340;
  const boxProgress = interpolate(frame, [20, 100], [0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Build the path segments
  const buildBoxPath = (progress: number): string => {
    const s = boxSize;
    const segments: [number, number][] = [
      [s, 0],   // top: left→right
      [s, s],   // right: top→bottom
      [0, s],   // bottom: right→left
      [0, 0],   // left: bottom→top
    ];
    const points: string[] = [`M 0 0`];
    for (let i = 0; i < Math.min(4, Math.floor(progress) + 1); i++) {
      const seg = segments[i];
      if (i < Math.floor(progress)) {
        points.push(`L ${seg[0]} ${seg[1]}`);
      } else {
        const frac = progress - i;
        const prev = i === 0 ? [0, 0] : segments[i - 1];
        const x = prev[0] + (seg[0] - prev[0]) * frac;
        const y = prev[1] + (seg[1] - prev[1]) * frac;
        points.push(`L ${x} ${y}`);
      }
    }
    return points.join(" ");
  };

  const labels = [
    { text: "Inhale 4s", x: boxSize / 2, y: -30, side: 0 },
    { text: "Hold 4s", x: boxSize + 30, y: boxSize / 2, side: 1 },
    { text: "Exhale 4s", x: boxSize / 2, y: boxSize + 50, side: 2 },
    { text: "Hold 4s", x: -30, y: boxSize / 2, side: 3 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1e3a5f 0%, #2B6CB0 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#60a5fa" opacity={0.05} count={6} />
      <BigNumber num={2} color="#60a5fa" delay={0} />

      <div style={{ zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: WHITE,
            opacity: titleSpring,
            transform: `scale(${titleSpring})`,
            marginBottom: 50,
          }}
        >
          Box Breathing
        </div>

        {/* Animated box */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 50,
            position: "relative",
          }}
        >
          <div style={{ position: "relative", width: boxSize, height: boxSize }}>
            {/* Faint guide box */}
            <svg
              width={boxSize}
              height={boxSize}
              viewBox={`0 0 ${boxSize} ${boxSize}`}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <rect
                x={0} y={0}
                width={boxSize} height={boxSize}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={3}
                rx={16}
              />
            </svg>

            {/* Glowing traced box */}
            <svg
              width={boxSize}
              height={boxSize}
              viewBox={`0 0 ${boxSize} ${boxSize}`}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d={buildBoxPath(boxProgress)}
                fill="none"
                stroke={YELLOW}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            </svg>

            {/* Labels */}
            {labels.map((l, i) => {
              const labelOpacity = interpolate(boxProgress, [i, i + 0.3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const isVertical = i === 1 || i === 3;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: l.x,
                    top: l.y,
                    transform: `translate(-50%, -50%) ${isVertical ? "rotate(0deg)" : ""}`,
                    fontSize: 26,
                    fontWeight: 700,
                    color: YELLOW,
                    opacity: labelOpacity,
                    whiteSpace: "nowrap",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {l.text}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ opacity: footerOpacity, fontSize: 28, color: "rgba(255,255,255,0.7)", fontWeight: 500, lineHeight: 1.6, padding: "0 60px" }}>
          310K saves on Instagram
          <br />
          The most bookmarked breathing technique
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: #1 Vagus Nerve Full Reset ────────────────────────────────
const SceneVagusNerve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 100 } });
  const subtitleOpacity = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const checkItems = [
    "Cold water splash",
    "3 physiological sighs",
    "30 seconds humming",
    "2 minutes box breathing",
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #92400e 0%, #f59e0b 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#fde68a" opacity={0.07} count={8} />
      <BigNumber num={1} color={YELLOW} glow delay={0} />

      <div style={{ zIndex: 1, textAlign: "center", padding: "0 60px" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: WHITE,
            opacity: titleSpring,
            transform: `scale(${titleSpring})`,
            marginBottom: 20,
          }}
        >
          The Full Vagus
          <br />
          Nerve Reset
        </div>

        <YellowLine width={160} />

        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 40,
            opacity: subtitleOpacity,
          }}
        >
          Combine all techniques:
        </div>

        {/* Checklist */}
        <div style={{ textAlign: "left", display: "inline-block", marginBottom: 40 }}>
          {checkItems.map((item, i) => {
            const itemDelay = 35 + i * 15;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemSlide = interpolate(frame, [itemDelay, itemDelay + 12], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 20,
                  opacity: itemOpacity,
                  transform: `translateX(${itemSlide}px)`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "#22c55e" }}>&#10003;</span>
                </div>
                <span style={{ fontSize: 34, fontWeight: 600, color: WHITE }}>{item}</span>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div
          style={{
            opacity: interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: 24,
              padding: "20px 40px",
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 900, color: WHITE }}>Total time: </span>
            <span style={{ fontSize: 36, fontWeight: 900, color: YELLOW }}>under 5 minutes</span>
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", fontWeight: 500, marginTop: 12 }}>
            30M+ people can't be wrong
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 7: CTA ──────────────────────────────────────────────────────
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Spring = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 100 } });
  const line2Opacity = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brandSpring = spring({ frame: frame - 42, fps, config: { damping: 14, stiffness: 100 } });
  const contactOpacity = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: BLUE,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <FloatingCircles color="#ffffff" opacity={0.04} count={5} />

      <div style={{ zIndex: 1, textAlign: "center", padding: "0 60px" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: WHITE,
            opacity: line1Spring,
            transform: `translateY(${(1 - line1Spring) * 30}px)`,
            marginBottom: 16,
          }}
        >
          These tools are powerful.
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            opacity: line2Opacity,
            marginBottom: 40,
            lineHeight: 1.4,
          }}
        >
          But if anxiety still
          <br />
          controls your life...
        </div>

        <YellowLine width={300} mt={0} mb={40} />

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: WHITE,
            opacity: brandSpring,
            transform: `scale(${brandSpring})`,
            marginBottom: 30,
          }}
        >
          Refresh Psychiatry
        </div>

        <div style={{ opacity: contactOpacity, marginBottom: 30 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: YELLOW, marginBottom: 8 }}>
            (954) 603-4081
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
            refreshpsychiatry.com
          </div>
        </div>

        <div
          style={{
            opacity: taglineOpacity,
            background: "rgba(0,0,0,0.2)",
            borderRadius: 20,
            padding: "20px 36px",
            display: "inline-block",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            Medication + therapy + techniques = real relief
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
export const V3_Countdown: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Scene 1: Hook (0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <SceneHook />
      </Sequence>

      {/* Scene 2: #5 Physiological Sigh (90-210) */}
      <Sequence from={90} durationInFrames={120}>
        <ScenePhysiologicalSigh />
      </Sequence>

      {/* Scene 3: #4 Cold Water Reset (210-330) */}
      <Sequence from={210} durationInFrames={120}>
        <SceneColdWater />
      </Sequence>

      {/* Scene 4: #3 Humming (330-450) */}
      <Sequence from={330} durationInFrames={120}>
        <SceneHumming />
      </Sequence>

      {/* Scene 5: #2 Box Breathing (450-570) */}
      <Sequence from={450} durationInFrames={120}>
        <SceneBoxBreathing />
      </Sequence>

      {/* Scene 6: #1 Vagus Nerve Full Reset (570-690) */}
      <Sequence from={570} durationInFrames={120}>
        <SceneVagusNerve />
      </Sequence>

      {/* Scene 7: CTA (690-780) */}
      <Sequence from={690} durationInFrames={90}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
