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

// -- Colors --
const DARK_BG = "#0f1419";
const DARK_BG_LIGHTER = "#151c23";
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CYAN = "#22d3ee";
const RED = "#ef4444";
const GREEN = "#22c55e";
const FB_BLUE = "#1877F2";
const CHARCOAL = "#2D3748";

const FONT_HEADER = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";
const FONT_MONO = "'Courier New', 'Consolas', monospace";

const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&display=swap');`;

// ============================================================
// HELPER COMPONENTS
// ============================================================

/** Dot grid background pattern */
const DotGrid: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => (
  <svg
    width="100%"
    height="100%"
    style={{ position: "absolute", top: 0, left: 0 }}
  >
    <defs>
      <pattern id="dotgrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1.5" fill={WHITE} opacity={opacity} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dotgrid)" />
  </svg>
);

/** Animated horizontal scan line */
const ScanLine: React.FC<{ frame: number; startFrame: number; duration: number }> = ({
  frame,
  startFrame,
  duration,
}) => {
  const progress = interpolate(frame - startFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  if (frame < startFrame || frame > startFrame + duration) return null;
  const x = progress * 1920;
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: x - 2,
        width: 4,
        height: "100%",
        background: `linear-gradient(to bottom, transparent, ${CYAN}44, ${CYAN}, ${CYAN}44, transparent)`,
        opacity,
        boxShadow: `0 0 30px ${CYAN}, 0 0 60px ${CYAN}66`,
      }}
    />
  );
};

/** Fade-in text */
const FadeText: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ children, frame, delay, duration = 20, style }) => {
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame - delay, [0, duration], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  if (frame < delay) return null;
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};

/** Animated horizontal bar chart bar */
const HBar: React.FC<{
  label: string;
  targetWidth: number; // percentage of max width
  color: string;
  frame: number;
  delay: number;
  fps: number;
  maxWidth?: number;
}> = ({ label, targetWidth, color, frame, delay, fps, maxWidth = 900 }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });
  const width = (targetWidth / 100) * maxWidth * Math.max(0, s);
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div style={{ marginBottom: 20, opacity }}>
      <div
        style={{
          fontFamily: FONT_HEADER,
          fontSize: 20,
          fontWeight: 600,
          color: WHITE,
          marginBottom: 8,
          letterSpacing: "1px",
        }}
      >
        {label}
      </div>
      <svg width={maxWidth + 20} height={32}>
        <rect
          x={0}
          y={0}
          width={maxWidth}
          height={32}
          rx={4}
          fill={WHITE}
          opacity={0.06}
        />
        <rect
          x={0}
          y={0}
          width={width}
          height={32}
          rx={4}
          fill={color}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
        <text
          x={Math.max(width - 10, 40)}
          y={22}
          textAnchor="end"
          fontFamily={FONT_MONO}
          fontSize={16}
          fontWeight={700}
          fill={DARK_BG}
        >
          {Math.round(targetWidth)}%
        </text>
      </svg>
    </div>
  );
};

/** Animated counting number */
const Counter: React.FC<{
  target: number;
  suffix?: string;
  prefix?: string;
  label: string;
  frame: number;
  delay: number;
  duration?: number;
  color?: string;
  decimals?: number;
}> = ({
  target,
  suffix = "",
  prefix = "",
  label,
  frame,
  delay,
  duration = 60,
  color = WHITE,
  decimals = 0,
}) => {
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const value = decimals > 0
    ? (target * progress).toFixed(decimals)
    : Math.floor(target * progress);
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame - delay, [0, 20], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        textAlign: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 72,
          fontWeight: 900,
          color,
          lineHeight: 1,
          textShadow: `0 0 30px ${color}44`,
        }}
      >
        {prefix}
        {value}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: FONT_HEADER,
          fontSize: 18,
          fontWeight: 600,
          color: `${WHITE}99`,
          marginTop: 10,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Circular stat badge with spring animation */
const CircleBadge: React.FC<{
  value: string;
  label: string;
  frame: number;
  delay: number;
  fps: number;
  color?: string;
}> = ({ value, label, frame, delay, fps, color = YELLOW }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.7 },
  });
  const scale = interpolate(s, [0, 1], [0, 1]);
  const opacity = interpolate(s, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        textAlign: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: `0 0 25px ${color}33, inset 0 0 25px ${color}11`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 56,
            fontWeight: 900,
            color,
            textShadow: `0 0 20px ${color}44`,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          fontFamily: FONT_HEADER,
          fontSize: 16,
          fontWeight: 600,
          color: `${WHITE}bb`,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          maxWidth: 160,
          margin: "0 auto",
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Animated SVG line chart that draws itself */
const GrowthChart: React.FC<{
  frame: number;
  delay: number;
  duration?: number;
  width?: number;
  height?: number;
}> = ({ frame, delay, duration = 60, width = 700, height = 120 }) => {
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;

  // Growth curve points
  const points = [
    [0, 100], [70, 95], [140, 85], [210, 80], [280, 70],
    [350, 55], [420, 42], [490, 30], [560, 22], [630, 15], [700, 8],
  ];
  const totalLength = 900; // approximate
  const dashOffset = totalLength * (1 - progress);
  const pointsStr = points.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg width={width} height={height + 20} style={{ opacity }}>
      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={0}
          y1={(height / 3) * i}
          x2={width}
          y2={(height / 3) * i}
          stroke={WHITE}
          strokeOpacity={0.06}
          strokeWidth={1}
        />
      ))}
      {/* Gradient fill under line */}
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={FB_BLUE} stopOpacity={0.3} />
          <stop offset="100%" stopColor={FB_BLUE} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${pointsStr} ${width},${height}`}
        fill="url(#chartGrad)"
        opacity={progress}
      />
      {/* Main line */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke={FB_BLUE}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        style={{ filter: `drop-shadow(0 0 6px ${FB_BLUE}66)` }}
      />
      {/* End dot */}
      {progress > 0.9 && (
        <circle
          cx={700}
          cy={8}
          r={6}
          fill={FB_BLUE}
          style={{ filter: `drop-shadow(0 0 8px ${FB_BLUE})` }}
        />
      )}
    </svg>
  );
};

/** Comparison row for Scene 4 */
const CompRow: React.FC<{
  label: string;
  industryVal: string;
  refreshVal: string;
  industryColor: string;
  refreshColor: string;
  frame: number;
  delay: number;
  fps: number;
}> = ({ label, industryVal, refreshVal, industryColor, refreshColor, frame, delay, fps }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
  });
  const x = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(s, [0.8, 1], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 18,
        opacity,
        transform: `translateX(${x}px) scale(${scale})`,
      }}
    >
      {/* Label */}
      <div
        style={{
          width: 200,
          fontFamily: FONT_HEADER,
          fontSize: 18,
          fontWeight: 600,
          color: `${WHITE}aa`,
          textAlign: "right",
          paddingRight: 30,
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      {/* Industry */}
      <div
        style={{
          width: 320,
          fontFamily: FONT_MONO,
          fontSize: 22,
          fontWeight: 700,
          color: industryColor,
          textAlign: "center",
          padding: "10px 20px",
          background: `${industryColor}11`,
          borderRadius: 8,
          marginRight: 20,
        }}
      >
        {industryVal}
      </div>
      {/* Refresh */}
      <div
        style={{
          width: 320,
          fontFamily: FONT_MONO,
          fontSize: 22,
          fontWeight: 700,
          color: refreshColor,
          textAlign: "center",
          padding: "10px 20px",
          background: `${refreshColor}11`,
          borderRadius: 8,
          border: `1px solid ${refreshColor}44`,
          boxShadow: `0 0 15px ${refreshColor}22`,
        }}
      >
        {refreshVal}
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const V5_DataViz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene boundaries
  const S1 = 0;   // Hook: 0-90
  const S2 = 90;  // The Gap: 90-240
  const S3 = 240; // TherapyWorks: 240-390
  const S4 = 390; // Refresh vs Industry: 390-540
  const S5 = 540; // Solution: 540-650
  const S6 = 650; // CTA: 650-750

  // Glowing border animation for Scene 4
  const glowPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.8],
  );

  return (
    <AbsoluteFill
      style={{
        background: DARK_BG,
        overflow: "hidden",
      }}
    >
      <style>{fontStyle}</style>
      <DotGrid />

      {/* ================================================ */}
      {/* SCENE 1 — HOOK (0–90) */}
      {/* ================================================ */}
      <Sequence from={S1} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FadeText frame={frame} delay={S1 + 5} duration={15}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 42,
                fontWeight: 300,
                color: WHITE,
                letterSpacing: "12px",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              THE MENTAL HEALTH
            </div>
          </FadeText>
          <FadeText frame={frame} delay={S1 + 20} duration={15}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 220,
                fontWeight: 900,
                color: YELLOW,
                lineHeight: 1,
                textAlign: "center",
                textShadow: `0 0 60px ${YELLOW}44, 0 0 120px ${YELLOW}22`,
                letterSpacing: "-4px",
              }}
            >
              DATA
            </div>
          </FadeText>
          <FadeText frame={frame} delay={S1 + 40} duration={20}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 20,
                fontWeight: 400,
                color: `${WHITE}77`,
                letterSpacing: "3px",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              What the numbers actually tell us · March 2026
            </div>
          </FadeText>
          {/* Scan lines */}
          <ScanLine frame={frame} startFrame={S1 + 15} duration={40} />
          <ScanLine frame={frame} startFrame={S1 + 50} duration={35} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================ */}
      {/* SCENE 2 — THE GAP (90–240) */}
      {/* ================================================ */}
      <Sequence from={S2} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 120px",
          }}
        >
          <FadeText
            frame={frame}
            delay={S2 + 5}
            duration={15}
            style={{ marginBottom: 40 }}
          >
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 48,
                fontWeight: 800,
                color: WHITE,
                letterSpacing: "6px",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              THE DELIVERY GAP
            </div>
          </FadeText>

          {/* Bar chart */}
          <div style={{ width: 920, marginBottom: 30 }}>
            <HBar
              label="People who need care"
              targetWidth={90}
              color={CYAN}
              frame={frame}
              delay={S2 + 20}
              fps={fps}
            />
            <HBar
              label="People who receive care"
              targetWidth={35}
              color={YELLOW}
              frame={frame}
              delay={S2 + 32}
              fps={fps}
            />
            <HBar
              label="Wait time > 2 months"
              targetWidth={65}
              color={RED}
              frame={frame}
              delay={S2 + 44}
              fps={fps}
            />
            <HBar
              label="Same-week access"
              targetWidth={8}
              color={GREEN}
              frame={frame}
              delay={S2 + 56}
              fps={fps}
            />
          </div>

          {/* Quote */}
          <FadeText frame={frame} delay={S2 + 80} duration={25}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 26,
                fontWeight: 600,
                fontStyle: "italic",
                color: `${WHITE}dd`,
                textAlign: "center",
                maxWidth: 800,
                lineHeight: 1.5,
              }}
            >
              &ldquo;We don&rsquo;t have a diagnosis problem. We have a delivery
              problem.&rdquo;
            </div>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 16,
                fontWeight: 500,
                color: `${YELLOW}cc`,
                textAlign: "center",
                marginTop: 12,
                letterSpacing: "1px",
              }}
            >
              — Dr. Eric Arzubi, LinkedIn · 18K reactions · 2,100 comments ·
              4,800 reposts
            </div>
          </FadeText>
        </AbsoluteFill>
      </Sequence>

      {/* ================================================ */}
      {/* SCENE 3 — #TherapyWorks (240–390) */}
      {/* ================================================ */}
      <Sequence from={S3} durationInFrames={150}>
        <AbsoluteFill
          style={{
            background: DARK_BG_LIGHTER,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 100px",
          }}
        >
          <DotGrid opacity={0.08} />

          <FadeText frame={frame} delay={S3 + 5} duration={15}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 72,
                fontWeight: 900,
                color: FB_BLUE,
                textAlign: "center",
                textShadow: `0 0 40px ${FB_BLUE}44`,
                letterSpacing: "-1px",
              }}
            >
              #TherapyWorks
            </div>
          </FadeText>

          {/* Counter row */}
          <div
            style={{
              display: "flex",
              gap: 120,
              marginTop: 50,
              marginBottom: 50,
            }}
          >
            <Counter
              target={54}
              suffix="M"
              label="Views"
              frame={frame}
              delay={S3 + 25}
              duration={50}
              color={CYAN}
            />
            <Counter
              target={2.3}
              suffix="M"
              label="Shares"
              frame={frame}
              delay={S3 + 35}
              duration={50}
              color={FB_BLUE}
              decimals={1}
            />
            <Counter
              target={19}
              prefix="+"
              suffix="%"
              label="Referral Spike"
              frame={frame}
              delay={S3 + 45}
              duration={50}
              color={GREEN}
            />
          </div>

          {/* Growth chart */}
          <GrowthChart frame={frame} delay={S3 + 50} duration={70} />

          <FadeText frame={frame} delay={S3 + 90} duration={20}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 17,
                fontWeight: 500,
                color: `${WHITE}66`,
                textAlign: "center",
                marginTop: 30,
                letterSpacing: "2px",
              }}
            >
              Facebook creator campaign · BetterHelp partnership · 2026
            </div>
          </FadeText>
        </AbsoluteFill>
      </Sequence>

      {/* ================================================ */}
      {/* SCENE 4 — Refresh vs Industry (390–540) */}
      {/* ================================================ */}
      <Sequence from={S4} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px 100px",
          }}
        >
          <FadeText
            frame={frame}
            delay={S4 + 5}
            duration={15}
            style={{ marginBottom: 40 }}
          >
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 40,
                fontWeight: 800,
                color: WHITE,
                letterSpacing: "4px",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              REFRESH vs. INDUSTRY
            </div>
          </FadeText>

          {/* Column headers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 24,
              width: "100%",
              maxWidth: 900,
            }}
          >
            <div style={{ width: 200 }} />
            <div
              style={{
                width: 320,
                fontFamily: FONT_HEADER,
                fontSize: 20,
                fontWeight: 700,
                color: `${WHITE}88`,
                textAlign: "center",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginRight: 20,
              }}
            >
              Industry Average
            </div>
            <div
              style={{
                width: 320,
                fontFamily: FONT_HEADER,
                fontSize: 20,
                fontWeight: 700,
                color: YELLOW,
                textAlign: "center",
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "6px 0",
                borderRadius: 8,
                boxShadow: `0 0 ${20 * glowPulse}px ${YELLOW}${Math.round(glowPulse * 40).toString(16).padStart(2, "0")}`,
                border: `1px solid ${YELLOW}${Math.round(glowPulse * 80).toString(16).padStart(2, "0")}`,
              }}
            >
              Refresh Psychiatry
            </div>
          </div>

          {/* Rows */}
          <CompRow
            label="Wait Time"
            industryVal="2+ Months"
            refreshVal="Same Week"
            industryColor={RED}
            refreshColor={GREEN}
            frame={frame}
            delay={S4 + 25}
            fps={fps}
          />
          <CompRow
            label="Locations"
            industryVal="Single Office"
            refreshVal="16 Across 3 States"
            industryColor={`${WHITE}77`}
            refreshColor={YELLOW}
            frame={frame}
            delay={S4 + 38}
            fps={fps}
          />
          <CompRow
            label="Hours"
            industryVal="Mon–Fri 9–5"
            refreshVal="7 Days / Week"
            industryColor={`${WHITE}77`}
            refreshColor={YELLOW}
            frame={frame}
            delay={S4 + 51}
            fps={fps}
          />
          <CompRow
            label="Insurance"
            industryVal="Limited"
            refreshVal="7 Major Carriers"
            industryColor={`${WHITE}77`}
            refreshColor={YELLOW}
            frame={frame}
            delay={S4 + 64}
            fps={fps}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================ */}
      {/* SCENE 5 — The Solution (540–650) */}
      {/* ================================================ */}
      <Sequence from={S5} durationInFrames={110}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 100px",
          }}
        >
          <FadeText
            frame={frame}
            delay={S5 + 5}
            duration={15}
            style={{ marginBottom: 60 }}
          >
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 44,
                fontWeight: 800,
                color: WHITE,
                letterSpacing: "5px",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              SOLVING THE DELIVERY PROBLEM
            </div>
          </FadeText>

          {/* Circle badges */}
          <div
            style={{
              display: "flex",
              gap: 80,
              marginBottom: 60,
            }}
          >
            <CircleBadge
              value="16"
              label="Locations"
              frame={frame}
              delay={S5 + 20}
              fps={fps}
              color={YELLOW}
            />
            <CircleBadge
              value="3"
              label="States (FL, MA, TX)"
              frame={frame}
              delay={S5 + 30}
              fps={fps}
              color={CYAN}
            />
            <CircleBadge
              value="7"
              label="Days Per Week"
              frame={frame}
              delay={S5 + 40}
              fps={fps}
              color={GREEN}
            />
            <CircleBadge
              value="1"
              label="Week Max Wait"
              frame={frame}
              delay={S5 + 50}
              fps={fps}
              color={YELLOW}
            />
          </div>

          <FadeText frame={frame} delay={S5 + 65} duration={20}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 22,
                fontWeight: 600,
                color: `${WHITE}99`,
                letterSpacing: "4px",
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              Telehealth · Pharmacogenomics · Same-Week Access
            </div>
          </FadeText>
        </AbsoluteFill>
      </Sequence>

      {/* ================================================ */}
      {/* SCENE 6 — CTA (650–750) */}
      {/* ================================================ */}
      <Sequence from={S6} durationInFrames={100}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, ${DARK_BG} 0%, ${BLUE} 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 100px",
          }}
        >
          {/* Brand name with yellow underline */}
          <FadeText frame={frame} delay={S6 + 5} duration={15}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: FONT_HEADER,
                  fontSize: 56,
                  fontWeight: 900,
                  color: WHITE,
                  letterSpacing: "4px",
                }}
              >
                REFRESH PSYCHIATRY
              </span>
              <div
                style={{
                  height: 5,
                  background: YELLOW,
                  borderRadius: 3,
                  marginTop: 10,
                  width: "100%",
                  boxShadow: `0 0 15px ${YELLOW}66`,
                }}
              />
            </div>
          </FadeText>

          <FadeText frame={frame} delay={S6 + 15} duration={15}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 20,
                fontWeight: 500,
                color: `${WHITE}cc`,
                textAlign: "center",
                marginTop: 16,
                letterSpacing: "1px",
              }}
            >
              Dr. Justin Nepa, DO · Owner
            </div>
          </FadeText>

          <FadeText frame={frame} delay={S6 + 25} duration={15}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 26,
                fontWeight: 600,
                fontStyle: "italic",
                color: `${YELLOW}`,
                textAlign: "center",
                marginTop: 30,
                marginBottom: 30,
              }}
            >
              The future of psychiatric care delivery.
            </div>
          </FadeText>

          <FadeText frame={frame} delay={S6 + 35} duration={15}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 36,
                fontWeight: 700,
                color: WHITE,
                textAlign: "center",
                textShadow: `0 0 20px ${WHITE}33`,
              }}
            >
              refreshpsychiatry.com
            </div>
          </FadeText>

          <FadeText frame={frame} delay={S6 + 45} duration={15}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 30,
                fontWeight: 600,
                color: YELLOW,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              (954) 603-4081
            </div>
          </FadeText>

          <FadeText frame={frame} delay={S6 + 55} duration={20}>
            <div
              style={{
                fontFamily: FONT_HEADER,
                fontSize: 16,
                fontWeight: 500,
                color: `${WHITE}88`,
                textAlign: "center",
                marginTop: 30,
                letterSpacing: "3px",
              }}
            >
              Aetna · United · Cigna · Humana · Avmed · UMR · Oscar
            </div>
          </FadeText>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
