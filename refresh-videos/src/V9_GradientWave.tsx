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
const REFRESH_BLUE = "#2B6CB0";
const REFRESH_YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";

// -- Fonts --
const SANS = "'Poppins', 'Montserrat', 'DM Sans', sans-serif";

// -- Helpers --
const smooth = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// -- Color interpolation helper --
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const lerpColor = (c1: string, c2: string, t: number) => {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
};

const lerpColor3 = (c1: string, c2: string, c3: string, t: number) => {
  if (t <= 0.5) return lerpColor(c1, c2, t * 2);
  return lerpColor(c2, c3, (t - 0.5) * 2);
};

// -- Floating Blob component --
const Blob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  blur?: number;
  frame: number;
  speed?: number;
  offsetX?: number;
  offsetY?: number;
}> = ({
  x,
  y,
  size,
  color,
  opacity,
  blur = 80,
  frame,
  speed = 0.3,
  offsetX = 0,
  offsetY = 0,
}) => {
  const driftX = Math.sin(frame * 0.008 * speed + offsetX) * 40;
  const driftY = Math.cos(frame * 0.006 * speed + offsetY) * 30;
  const scaleBreath = 1 + Math.sin(frame * 0.005 * speed + offsetX) * 0.08;

  return (
    <div
      style={{
        position: "absolute",
        left: x + driftX,
        top: y + driftY,
        width: size,
        height: size * 0.85,
        borderRadius: "50%",
        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
        opacity,
        filter: `blur(${blur}px)`,
        transform: `scale(${scaleBreath})`,
        pointerEvents: "none",
      }}
    />
  );
};

// -- Gradient background that shifts between 3 colors --
const GradientBg: React.FC<{
  c1: string;
  c2: string;
  c3: string;
  frame: number;
  angle?: number;
}> = ({ c1, c2, c3, frame, angle = 135 }) => {
  const shift = Math.sin(frame * 0.004) * 10;
  const a = angle + shift;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${a}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
      }}
    />
  );
};

// -- Frosted glass card --
const FrostedCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.2)",
      padding: "36px 48px",
      ...style,
    }}
  >
    {children}
  </div>
);

// -- Scene 1: Hook --
const Scene1Hook: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const titleY = interpolate(frame, [0, 40], [60, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleOp = smooth(frame, 0, 30);
  const subOp = smooth(frame, 20, 50);
  const subY = interpolate(frame, [20, 50], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const bottomOp = smooth(frame, 55, 85);

  return (
    <AbsoluteFill>
      <GradientBg c1="#7c3aed" c2="#ec4899" c3="#f43f5e" frame={frame} />

      <Blob x={-200} y={-100} size={700} color="#ec489980" opacity={0.5} frame={frame} speed={0.4} offsetX={0} offsetY={0} />
      <Blob x={1200} y={200} size={600} color="#7c3aed80" opacity={0.4} frame={frame} speed={0.3} offsetX={2} offsetY={1} />
      <Blob x={600} y={600} size={800} color="#f43f5e60" opacity={0.35} frame={frame} speed={0.25} offsetX={4} offsetY={3} />
      <Blob x={200} y={800} size={500} color="#ec489970" opacity={0.3} frame={frame} speed={0.35} offsetX={1} offsetY={5} />

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
        <div
          style={{
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            fontFamily: SANS,
            fontSize: 110,
            fontWeight: 800,
            color: WHITE,
            textAlign: "center",
            lineHeight: 1.1,
            textShadow: "0 4px 40px rgba(0,0,0,0.3)",
          }}
        >
          ADHD in Women
        </div>
        <div
          style={{
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontFamily: SANS,
            fontSize: 90,
            fontWeight: 700,
            color: WHITE,
            textAlign: "center",
            marginTop: 10,
            textShadow: "0 4px 40px rgba(0,0,0,0.3)",
          }}
        >
          Looks Different.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
          opacity: bottomOp,
          fontFamily: SANS,
          fontSize: 32,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: 1,
        }}
      >
        4.2M people needed to hear this.
      </div>
    </AbsoluteFill>
  );
};

// -- Scene 2: The Masking --
const Scene2Masking: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const headerOp = smooth(frame, 0, 25);
  const headerY = interpolate(frame, [0, 25], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const items = [
    { text: "Internalized symptoms", y: 340, delay: 15, size: 52, op: 1, speed: 0.2 },
    { text: "Masking in social settings", y: 460, delay: 30, size: 46, op: 0.9, speed: 0.35 },
    { text: 'Diagnosed as "just anxiety"', y: 580, delay: 45, size: 42, op: 0.8, speed: 0.5 },
    { text: 'Called "too emotional"', y: 700, delay: 60, size: 38, op: 0.7, speed: 0.65 },
  ];

  return (
    <AbsoluteFill>
      <GradientBg c1="#3b82f6" c2="#14b8a6" c3="#22c55e" frame={frame} />

      <Blob x={100} y={0} size={650} color="#14b8a680" opacity={0.45} frame={frame} speed={0.3} offsetX={6} offsetY={2} />
      <Blob x={1100} y={400} size={700} color="#3b82f670" opacity={0.4} frame={frame} speed={0.25} offsetX={3} offsetY={7} />
      <Blob x={500} y={700} size={550} color="#22c55e60" opacity={0.35} frame={frame} speed={0.4} offsetX={0} offsetY={4} />

      <div
        style={{
          position: "absolute",
          top: 140,
          width: "100%",
          textAlign: "center",
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          fontFamily: SANS,
          fontSize: 72,
          fontWeight: 800,
          color: WHITE,
          textShadow: "0 4px 30px rgba(0,0,0,0.25)",
        }}
      >
        What gets MISSED:
      </div>

      {items.map((item, i) => {
        const itemOp = smooth(frame, item.delay, item.delay + 25);
        const parallaxX =
          Math.sin(frame * 0.003 * item.speed + i * 2) * 20 * item.speed;
        const itemX = interpolate(
          frame,
          [item.delay, item.delay + 30],
          [i % 2 === 0 ? -100 : 100, 0],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: item.y,
              width: "100%",
              textAlign: "center",
              opacity: itemOp * item.op,
              transform: `translateX(${itemX + parallaxX}px)`,
              fontFamily: SANS,
              fontSize: item.size,
              fontWeight: 600,
              color: WHITE,
              textShadow: "0 2px 20px rgba(0,0,0,0.2)",
            }}
          >
            {item.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// -- Scene 3: The Misdiagnosis --
const Scene3Misdiagnosis: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const circleScale = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const circleOp = smooth(frame, 0, 20);

  const stats = [
    { text: "Misdiagnosed as depression: 60%", angle: -40, delay: 25 },
    { text: "Misdiagnosed as anxiety: 75%", angle: 90, delay: 40 },
    { text: "Never diagnosed at all: 50-75%", angle: 210, delay: 55 },
  ];

  const orbitRadius = 380;

  return (
    <AbsoluteFill>
      <GradientBg c1="#f59e0b" c2="#f97316" c3="#ef4444" frame={frame} />

      <Blob x={0} y={-50} size={600} color="#f59e0b80" opacity={0.5} frame={frame} speed={0.3} offsetX={8} offsetY={1} />
      <Blob x={1300} y={500} size={500} color="#ef444470" opacity={0.4} frame={frame} speed={0.4} offsetX={5} offsetY={9} />
      <Blob x={600} y={800} size={700} color="#f9731660" opacity={0.35} frame={frame} speed={0.25} offsetX={2} offsetY={6} />

      {/* Central circle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: `translate(-50%, -50%) scale(${circleScale})`,
          opacity: circleOp,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(16px)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 80,
              fontWeight: 900,
              color: WHITE,
              lineHeight: 1,
            }}
          >
            15 years
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: SANS,
            fontSize: 34,
            fontWeight: 600,
            color: WHITE,
            textAlign: "center",
            textShadow: "0 2px 16px rgba(0,0,0,0.25)",
            maxWidth: 600,
          }}
        >
          Average delay in ADHD diagnosis for women
        </div>
      </div>

      {/* Orbiting stats */}
      {stats.map((stat, i) => {
        const statOp = smooth(frame, stat.delay, stat.delay + 25);
        const orbitSpeed = frame * 0.15;
        const angleRad =
          ((stat.angle + orbitSpeed) * Math.PI) / 180;
        const cx = 960 + Math.cos(angleRad) * orbitRadius;
        const cy = 440 + Math.sin(angleRad) * (orbitRadius * 0.55);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              transform: "translate(-50%, -50%)",
              opacity: statOp,
              fontFamily: SANS,
              fontSize: 30,
              fontWeight: 700,
              color: WHITE,
              textAlign: "center",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              padding: "16px 28px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            {stat.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// -- Scene 4: What ADHD Actually Looks Like --
const Scene4Symptoms: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const headerOp = smooth(frame, 0, 25);
  const headerY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const items = [
    { text: "Chronic overwhelm", delay: 15, angle: -15 },
    { text: "Emotional dysregulation", delay: 25, angle: 8 },
    { text: "Rejection sensitivity", delay: 35, angle: -5 },
    { text: "Difficulty with routine tasks", delay: 45, angle: 12 },
    { text: "Internal restlessness (not hyperactivity)", delay: 55, angle: -10 },
    { text: "Perfectionism as a coping mechanism", delay: 65, angle: 6 },
  ];

  const yPositions = [280, 380, 480, 580, 680, 780];

  return (
    <AbsoluteFill>
      <GradientBg c1="#5b21b6" c2="#2563eb" c3="#06b6d4" frame={frame} />

      <Blob x={-100} y={100} size={600} color="#5b21b680" opacity={0.5} frame={frame} speed={0.35} offsetX={10} offsetY={3} />
      <Blob x={1200} y={-50} size={550} color="#2563eb70" opacity={0.45} frame={frame} speed={0.3} offsetX={7} offsetY={8} />
      <Blob x={700} y={700} size={700} color="#06b6d460" opacity={0.35} frame={frame} speed={0.2} offsetX={1} offsetY={11} />

      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          fontFamily: SANS,
          fontSize: 64,
          fontWeight: 800,
          color: WHITE,
          textShadow: "0 4px 30px rgba(0,0,0,0.25)",
        }}
      >
        In Women, ADHD Looks Like:
      </div>

      {items.map((item, i) => {
        const itemOp = smooth(frame, item.delay, item.delay + 20);
        const drift = Math.sin(frame * 0.005 + i * 1.5) * 8;
        const fromX = (i % 2 === 0 ? -1 : 1) * 120;
        const slideX = interpolate(
          frame,
          [item.delay, item.delay + 25],
          [fromX, 0],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: yPositions[i],
              width: "100%",
              display: "flex",
              justifyContent: "center",
              opacity: itemOp,
              transform: `translateX(${slideX + drift}px)`,
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: 40,
                fontWeight: 600,
                color: WHITE,
                textShadow: `0 0 40px rgba(255,255,255,0.3), 0 2px 16px rgba(0,0,0,0.2)`,
                padding: "10px 36px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.08)",
              }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// -- Scene 5: Creator Credit --
const Scene5Creator: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = smooth(frame, 0, 25);
  const cardOp = smooth(frame, 40, 65);
  const cardY = interpolate(frame, [40, 65], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <GradientBg c1={REFRESH_BLUE} c2="#7c3aed" c3="#5b21b6" frame={frame} />

      <Blob x={200} y={100} size={500} color="#7c3aed70" opacity={0.4} frame={frame} speed={0.3} offsetX={12} offsetY={4} />
      <Blob x={1100} y={500} size={600} color="#2B6CB070" opacity={0.35} frame={frame} speed={0.25} offsetX={9} offsetY={13} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeIn,
        }}
      >
        {/* YouTube badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* YouTube play icon */}
          <svg width="56" height="40" viewBox="0 0 56 40">
            <rect width="56" height="40" rx="8" fill="#FF0000" />
            <polygon points="22,8 22,32 40,20" fill="#FFFFFF" />
          </svg>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 28,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            YouTube
          </span>
        </div>

        <div
          style={{
            fontFamily: SANS,
            fontSize: 44,
            fontWeight: 800,
            color: WHITE,
            textAlign: "center",
            textShadow: "0 2px 20px rgba(0,0,0,0.25)",
          }}
        >
          @drtraceym&auml;rks &middot; Dr. Tracey Marks, MD
        </div>

        <div
          style={{
            fontFamily: SANS,
            fontSize: 30,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            marginTop: 12,
          }}
        >
          2.3M YouTube subscribers
        </div>

        <div
          style={{
            fontFamily: SANS,
            fontSize: 28,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            marginTop: 10,
          }}
        >
          4.2M views &middot; 310K likes &middot; 82K comments
        </div>

        {/* Takeaway card */}
        <div
          style={{
            marginTop: 50,
            opacity: cardOp,
            transform: `translateY(${cardY}px)`,
          }}
        >
          <FrostedCard style={{ maxWidth: 900 }}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 30,
                fontWeight: 600,
                color: WHITE,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Content targeting &ldquo;ADHD in women&rdquo; captures an
              underserved audience actively seeking diagnosis
            </div>
          </FrostedCard>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -- Scene 6: CTA --
const Scene6CTA: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const fadeIn = smooth(frame, 0, 25);
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const detailsOp = smooth(frame, 20, 45);
  const pillsOp = smooth(frame, 40, 65);

  const insuranceList = [
    "Aetna",
    "United",
    "Cigna",
    "Humana",
    "Avmed",
    "UMR",
    "Oscar",
  ];

  // Blobs slow down / settle
  const blobOpacity = interpolate(frame, [0, 80], [0.4, 0.2], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBg c1={REFRESH_BLUE} c2="#1e3a5f" c3="#162a45" frame={frame} />

      <Blob x={100} y={200} size={500} color="#2B6CB060" opacity={blobOpacity} frame={frame} speed={0.15} offsetX={14} offsetY={5} blur={100} />
      <Blob x={1200} y={400} size={450} color="#1e3a5f70" opacity={blobOpacity} frame={frame} speed={0.1} offsetX={11} offsetY={15} blur={100} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 56,
            fontWeight: 700,
            color: WHITE,
            textAlign: "center",
            opacity: 0.9,
            marginBottom: 16,
          }}
        >
          You deserve answers.
        </div>

        <div
          style={{
            transform: `scale(${titleScale})`,
            fontFamily: SANS,
            fontSize: 72,
            fontWeight: 900,
            color: REFRESH_YELLOW,
            textAlign: "center",
            textShadow: "0 4px 30px rgba(246,199,68,0.3)",
            marginBottom: 20,
          }}
        >
          Refresh Psychiatry
        </div>

        <div
          style={{
            opacity: detailsOp,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 34,
              fontWeight: 600,
              color: WHITE,
            }}
          >
            Specializing in ADHD evaluation for women
          </div>

          <div
            style={{
              fontFamily: SANS,
              fontSize: 30,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              marginTop: 8,
            }}
          >
            (954) 603-4081 &middot; refreshpsychiatry.com
          </div>

          <div
            style={{
              fontFamily: SANS,
              fontSize: 26,
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              marginTop: 4,
            }}
          >
            Telehealth across Florida &middot; Same-week appointments
          </div>
        </div>

        {/* Insurance pills */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
            opacity: pillsOp,
            maxWidth: 900,
          }}
        >
          {insuranceList.map((ins, i) => (
            <div
              key={i}
              style={{
                fontFamily: SANS,
                fontSize: 22,
                fontWeight: 600,
                color: WHITE,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                padding: "10px 28px",
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {ins}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================
// MAIN COMPONENT
// ============================
export const V9_GradientWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Scene 1: Hook (0-105) */}
      <Sequence from={0} durationInFrames={105}>
        <Scene1Hook frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: The Masking (105-240) */}
      <Sequence from={105} durationInFrames={135}>
        <Scene2Masking frame={frame - 105} fps={fps} />
      </Sequence>

      {/* Scene 3: The Misdiagnosis (240-375) */}
      <Sequence from={240} durationInFrames={135}>
        <Scene3Misdiagnosis frame={frame - 240} fps={fps} />
      </Sequence>

      {/* Scene 4: What ADHD Actually Looks Like (375-510) */}
      <Sequence from={375} durationInFrames={135}>
        <Scene4Symptoms frame={frame - 375} fps={fps} />
      </Sequence>

      {/* Scene 5: Creator Credit (510-630) */}
      <Sequence from={510} durationInFrames={120}>
        <Scene5Creator frame={frame - 510} fps={fps} />
      </Sequence>

      {/* Scene 6: CTA (630-750) */}
      <Sequence from={630} durationInFrames={120}>
        <Scene6CTA frame={frame - 630} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
