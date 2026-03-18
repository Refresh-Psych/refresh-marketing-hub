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
const DEEP_BLUE = "#1a3a5c";
const DARK_NAVY = "#0a1628";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const RED = "#e53e3e";
const TIKTOK_CYAN = "#25F4EE";
const TIKTOK_RED = "#FE2C55";

const FONT_FAMILY = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

// Google Font import
const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');`;

// ============================================================
// HELPER COMPONENTS
// ============================================================

/** Word that slams in with spring scale-up */
const SlamWord: React.FC<{
  text: string;
  frame: number;
  delay: number;
  fontSize?: number;
  color?: string;
  glow?: string | null;
  fps: number;
}> = ({ text, frame, delay, fontSize = 120, color = WHITE, glow = null, fps }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.6 },
  });

  const scale = interpolate(s, [0, 1], [3, 1]);
  const opacity = interpolate(s, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (frame < delay) return null;

  return (
    <div
      style={{
        fontSize,
        fontWeight: 900,
        fontFamily: FONT_FAMILY,
        color,
        transform: `scale(${scale})`,
        opacity,
        textAlign: "center",
        lineHeight: 1.1,
        textShadow: glow ? `0 0 60px ${glow}, 0 0 120px ${glow}` : "none",
        letterSpacing: "-2px",
      }}
    >
      {text}
    </div>
  );
};

/** Fade-in text element */
const FadeText: React.FC<{
  text: string;
  frame: number;
  delay: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, frame, delay, duration = 15, fontSize = 28, color = WHITE, style = {} }) => {
  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < delay) return null;

  return (
    <div
      style={{
        fontSize,
        fontWeight: 600,
        fontFamily: FONT_FAMILY,
        color,
        opacity,
        textAlign: "center",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Slide-in item from left or right */
const SlideItem: React.FC<{
  text: string;
  frame: number;
  delay: number;
  direction: "left" | "right";
  color?: string;
  strikethrough?: boolean;
  fontSize?: number;
  fps: number;
}> = ({ text, frame, delay, direction, color = WHITE, strikethrough = false, fontSize = 38, fps }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
  });

  const translateX = interpolate(s, [0, 1], [direction === "left" ? -600 : 600, 0]);
  const opacity = interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  if (frame < delay) return null;

  return (
    <div
      style={{
        fontSize,
        fontWeight: 700,
        fontFamily: FONT_FAMILY,
        color,
        transform: `translateX(${translateX}px)`,
        opacity,
        textAlign: "center",
        textDecoration: strikethrough ? "line-through" : "none",
        textDecorationColor: strikethrough ? RED : undefined,
        textDecorationThickness: strikethrough ? 4 : undefined,
        marginBottom: 14,
        lineHeight: 1.3,
      }}
    >
      {text}
    </div>
  );
};

/** Animated counter that counts up from 0 */
const AnimatedCounter: React.FC<{
  label: string;
  emoji: string;
  value: number;
  suffix: string;
  frame: number;
  delay: number;
  color?: string;
  fontSize?: number;
  isHero?: boolean;
  fps: number;
}> = ({ label, emoji, value, suffix, frame, delay, color = WHITE, fontSize = 48, isHero = false, fps }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1 },
  });

  const currentValue = Math.round(interpolate(s, [0, 1], [0, value]));
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const opacity = interpolate(s, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });

  if (frame < delay) return null;

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toString();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        transform: `scale(${scale})`,
        opacity,
        marginBottom: isHero ? 30 : 20,
      }}
    >
      <span style={{ fontSize: isHero ? 60 : 44 }}>{emoji}</span>
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: isHero ? fontSize * 1.5 : fontSize,
            fontWeight: 900,
            fontFamily: FONT_FAMILY,
            color,
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          {formatNumber(currentValue)}{suffix && !formatNumber(currentValue).includes("+") ? suffix : ""}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            fontFamily: FONT_FAMILY,
            color: "rgba(255,255,255,0.6)",
            marginTop: 4,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

/** Subtle background grid */
const GridBackground: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
    }}
  />
);

/** Pulsing dot */
const PulsingDot: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const pulse = Math.sin((frame / fps) * Math.PI * 2) * 0.3 + 0.7;
  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        backgroundColor: YELLOW,
        opacity: pulse,
        boxShadow: `0 0 20px ${YELLOW}, 0 0 40px ${YELLOW}`,
        display: "inline-block",
        marginRight: 12,
      }}
    />
  );
};

// ============================================================
// SCENE COMPONENTS
// ============================================================

/** Scene 1 — Hook (frames 0-90) */
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SlamWord
        text="18 MILLION"
        frame={frame}
        delay={12}
        fontSize={140}
        color={WHITE}
        glow={YELLOW}
        fps={fps}
      />
      <FadeText
        text="people watched this."
        frame={frame}
        delay={45}
        fontSize={36}
        color="rgba(255,255,255,0.7)"
        style={{ marginTop: 30 }}
      />
    </AbsoluteFill>
  );
};

/** Scene 2 — The Problem (frames 90-210) */
const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = [
    { text: "ADHD", color: YELLOW, delay: 8 },
    { text: "looks", color: WHITE, delay: 25 },
    { text: "nothing", color: WHITE, delay: 40 },
    { text: "like", color: WHITE, delay: 52 },
    { text: "you", color: WHITE, delay: 62 },
    { text: "think", color: WHITE, delay: 72 },
  ];

  // Determine which word is currently active
  const activeIndex = words.reduce((acc, w, i) => (frame >= w.delay ? i : acc), -1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Show only the current active word */}
      {activeIndex >= 0 && (
        <SlamWord
          key={activeIndex}
          text={words[activeIndex].text}
          frame={frame}
          delay={words[activeIndex].delay}
          fontSize={words[activeIndex].text === "ADHD" ? 130 : 110}
          color={words[activeIndex].color}
          glow={words[activeIndex].color === YELLOW ? YELLOW : null}
          fps={fps}
        />
      )}
      <FadeText
        text="Most people get it wrong."
        frame={frame}
        delay={90}
        fontSize={30}
        color="rgba(255,255,255,0.5)"
        style={{ marginTop: 50, position: "absolute", bottom: 300 }}
      />
    </AbsoluteFill>
  );
};

/** Scene 3 — The Reveal (frames 210-360) */
const Scene3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DEEP_BLUE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 200,
      }}
    >
      <FadeText
        text="What it looks like:"
        frame={frame}
        delay={5}
        fontSize={34}
        color="rgba(255,255,255,0.6)"
        style={{ textTransform: "uppercase", letterSpacing: 4 }}
      />

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SlideItem text='"Just being lazy"' frame={frame} delay={20} direction="left" color={RED} strikethrough fontSize={40} fps={fps} />
        <SlideItem text='"Not trying hard enough"' frame={frame} delay={35} direction="left" color={RED} strikethrough fontSize={40} fps={fps} />
        <SlideItem text='"A made-up condition"' frame={frame} delay={50} direction="left" color={RED} strikethrough fontSize={40} fps={fps} />
      </div>

      <FadeText
        text="What it ACTUALLY is:"
        frame={frame}
        delay={72}
        fontSize={34}
        color="rgba(255,255,255,0.6)"
        style={{ marginTop: 60, textTransform: "uppercase", letterSpacing: 4 }}
      />

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SlideItem text="A neurological condition" frame={frame} delay={88} direction="right" color={YELLOW} fontSize={42} fps={fps} />
        <SlideItem text="Highly treatable" frame={frame} delay={103} direction="right" color={YELLOW} fontSize={42} fps={fps} />
        <SlideItem text="Often missed in women" frame={frame} delay={118} direction="right" color={YELLOW} fontSize={42} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

/** Scene 4 — The Stats (frames 360-510) */
const Scene4Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Platform badge spring
  const badgeS = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 100 } });
  const badgeScale = interpolate(badgeS, [0, 1], [0, 1]);
  const badgeOpacity = interpolate(badgeS, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GridBackground />

      {/* TikTok Platform Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 28px",
          borderRadius: 50,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: `2px solid rgba(255,255,255,0.15)`,
          marginBottom: 20,
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${TIKTOK_CYAN}, ${TIKTOK_RED})`,
          }}
        />
        <span style={{ fontFamily: FONT_FAMILY, fontWeight: 800, color: WHITE, fontSize: 22 }}>
          TikTok
        </span>
      </div>

      {/* Creator */}
      <FadeText
        text="@melrobbins feat. Dr. Tracey Marks"
        frame={frame}
        delay={18}
        fontSize={26}
        color="rgba(255,255,255,0.5)"
        style={{ marginBottom: 50 }}
      />

      {/* Stat counters */}
      <AnimatedCounter
        emoji="👁️"
        label="views"
        value={18000000}
        suffix="+"
        frame={frame}
        delay={30}
        color={YELLOW}
        fontSize={52}
        isHero
        fps={fps}
      />
      <AnimatedCounter
        emoji="❤️"
        label="likes"
        value={2100000}
        suffix=""
        frame={frame}
        delay={50}
        color={WHITE}
        fontSize={44}
        fps={fps}
      />
      <AnimatedCounter
        emoji="🔁"
        label="shares"
        value={380000}
        suffix=""
        frame={frame}
        delay={70}
        color={WHITE}
        fontSize={44}
        fps={fps}
      />
    </AbsoluteFill>
  );
};

/** Scene 5 — Takeaway (frames 510-630) */
const Scene5Takeaway: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteS = spring({ frame: frame - 25, fps, config: { damping: 10, stiffness: 120, mass: 0.7 } });
  const quoteScale = interpolate(quoteS, [0, 1], [2.5, 1]);
  const quoteOpacity = interpolate(quoteS, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

  // Yellow underline
  const underlineWidth = interpolate(frame, [55, 85], [0, 780], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0a0a0a 0%, ${DARK_NAVY} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
      }}
    >
      <FadeText
        text="THE #1 HOOK THAT WORKS:"
        frame={frame}
        delay={8}
        fontSize={24}
        color="rgba(255,255,255,0.45)"
        style={{ letterSpacing: 6, textTransform: "uppercase", marginBottom: 40 }}
      />

      <div
        style={{
          transform: `scale(${quoteScale})`,
          opacity: quoteOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            fontFamily: FONT_FAMILY,
            color: WHITE,
            lineHeight: 1.2,
          }}
        >
          "I didn't know
          <br />
          that was{" "}
          <span style={{ color: YELLOW }}>ADHD</span>"
        </div>
      </div>

      {/* Yellow underline */}
      <div
        style={{
          width: underlineWidth,
          height: 5,
          backgroundColor: YELLOW,
          borderRadius: 3,
          marginTop: 30,
          boxShadow: `0 0 20px ${YELLOW}`,
        }}
      />

      <FadeText
        text="This single phrase drives more engagement than any other ADHD content."
        frame={frame}
        delay={75}
        duration={20}
        fontSize={24}
        color="rgba(255,255,255,0.5)"
        style={{ marginTop: 50, maxWidth: 700, lineHeight: 1.5 }}
      />
    </AbsoluteFill>
  );
};

/** Scene 6 — CTA (frames 630-750) */
const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main CTA slam
  const ctaS = spring({ frame: frame - 8, fps, config: { damping: 8, stiffness: 140, mass: 0.6 } });
  const ctaScale = interpolate(ctaS, [0, 1], [3, 1]);
  const ctaOpacity = interpolate(ctaS, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  // Separator line
  const lineWidth = interpolate(frame, [30, 55], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLUE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* "Get evaluated." slam */}
      <div
        style={{
          fontSize: 90,
          fontWeight: 900,
          fontFamily: FONT_FAMILY,
          color: WHITE,
          transform: `scale(${ctaScale})`,
          opacity: ctaOpacity,
          textAlign: "center",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        Get evaluated.
      </div>

      {/* Yellow separator */}
      <div
        style={{
          width: lineWidth,
          height: 5,
          backgroundColor: YELLOW,
          borderRadius: 3,
          marginTop: 40,
          marginBottom: 40,
          boxShadow: `0 0 15px ${YELLOW}`,
        }}
      />

      {/* Practice info */}
      <FadeText
        text="Refresh Psychiatry"
        frame={frame}
        delay={40}
        fontSize={48}
        color={WHITE}
        style={{ fontWeight: 800, letterSpacing: "-1px" }}
      />
      <FadeText
        text="(954) 603-4081"
        frame={frame}
        delay={52}
        fontSize={36}
        color={WHITE}
        style={{ marginTop: 20, fontWeight: 700 }}
      />
      <FadeText
        text="refreshpsychiatry.com"
        frame={frame}
        delay={62}
        fontSize={30}
        color="rgba(255,255,255,0.8)"
        style={{ marginTop: 12 }}
      />

      {/* Telehealth tagline with pulsing dot */}
      {frame >= 72 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 40,
            opacity: interpolate(frame, [72, 85], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <PulsingDot frame={frame} fps={fps} />
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Telehealth across Florida · 7 days/week
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const V1_KineticType: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <style>{fontStyle}</style>

      {/* Scene 1 — Hook (0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2 — The Problem (90-210) */}
      <Sequence from={90} durationInFrames={120}>
        <Scene2Problem />
      </Sequence>

      {/* Scene 3 — The Reveal (210-360) */}
      <Sequence from={210} durationInFrames={150}>
        <Scene3Reveal />
      </Sequence>

      {/* Scene 4 — The Stats (360-510) */}
      <Sequence from={360} durationInFrames={150}>
        <Scene4Stats />
      </Sequence>

      {/* Scene 5 — Takeaway (510-630) */}
      <Sequence from={510} durationInFrames={120}>
        <Scene5Takeaway />
      </Sequence>

      {/* Scene 6 — CTA (630-750) */}
      <Sequence from={630} durationInFrames={120}>
        <Scene6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
