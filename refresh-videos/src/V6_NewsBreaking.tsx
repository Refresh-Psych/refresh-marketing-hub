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

// -- Brand & Theme Colors --
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const DARK_NAVY = "#0d1117";
const RED = "#dc2626";
const GREEN = "#22c55e";
const DARK_GREEN = "#166534";

const FONT_FAMILY = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

// Google Font import
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Courier+Prime:wght@400;700&display=swap');`;

// ════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════════════════

/** Lower-third banner that slides in from the left */
const LowerThird: React.FC<{
  text: string;
  bg: string;
  color?: string;
  frame: number;
  enterDelay: number;
  exitFrame?: number;
  y?: number;
  height?: number;
  fontSize?: number;
}> = ({
  text,
  bg,
  color = WHITE,
  frame,
  enterDelay,
  exitFrame = 9999,
  y = 920,
  height = 60,
  fontSize = 28,
}) => {
  const slideIn = interpolate(
    frame,
    [enterDelay, enterDelay + 18],
    [-1920, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const slideOut =
    frame >= exitFrame
      ? interpolate(frame, [exitFrame, exitFrame + 12], [0, -1920], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 0;

  if (frame < enterDelay) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        height,
        background: bg,
        transform: `translateX(${slideIn + slideOut}px)`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 40,
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 700,
          fontSize,
          color,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** Scrolling ticker tape at the very bottom */
const TickerTape: React.FC<{
  text: string;
  bg: string;
  color?: string;
  frame: number;
  speed?: number;
  y?: number;
}> = ({ text, bg, color = WHITE, frame, speed = 3, y = 1020 }) => {
  const repeatedText = `${text}     ●     `.repeat(8);
  const tx = -(frame * speed) % 3000;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        height: 60,
        background: bg,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        zIndex: 60,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 22,
          color,
          whiteSpace: "nowrap",
          transform: `translateX(${tx}px)`,
        }}
      >
        {repeatedText}
      </div>
    </div>
  );
};

/** News bulletin item with a yellow flash dot */
const BulletinItem: React.FC<{
  emoji: string;
  text: string;
  frame: number;
  delay: number;
  accentColor?: string;
}> = ({ emoji, text, frame, delay, accentColor = YELLOW }) => {
  const progress = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Yellow flash dot — bright for 4 frames then fades
  const flashOpacity =
    frame >= delay && frame < delay + 4
      ? 1
      : frame >= delay + 4
        ? interpolate(frame, [delay + 4, delay + 14], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : 0;

  if (frame < delay) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [40, 0])}px)`,
        marginBottom: 16,
      }}
    >
      {/* Flash dot */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: accentColor,
          boxShadow:
            flashOpacity > 0
              ? `0 0 20px 8px ${accentColor}, 0 0 40px 16px ${accentColor}88`
              : "none",
          opacity: 0.5 + flashOpacity * 0.5,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 32,
          color: WHITE,
          lineHeight: 1.4,
        }}
      >
        {emoji} {text}
      </span>
    </div>
  );
};

/** Checkmark item that animates in (for the NOW scene) */
const CheckItem: React.FC<{
  text: string;
  frame: number;
  delay: number;
  fps: number;
}> = ({ text, frame, delay, fps }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.5 },
  });

  if (frame < delay) return null;

  const checkScale = interpolate(s, [0, 1], [0, 1]);
  const textOpacity = interpolate(
    frame,
    [delay + 4, delay + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const textSlide = interpolate(textOpacity, [0, 1], [30, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${checkScale})`,
          flexShrink: 0,
        }}
      >
        <span style={{ color: WHITE, fontSize: 20, fontWeight: 900 }}>✓</span>
      </div>
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 30,
          color: WHITE,
          opacity: textOpacity,
          transform: `translateX(${textSlide}px)`,
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** Animated percentage bar */
const PercentBar: React.FC<{
  label: string;
  percent: number;
  frame: number;
  delay: number;
  color: string;
  width?: number;
}> = ({ label, percent, frame, delay, color, width = 700 }) => {
  const progress = interpolate(frame, [delay, delay + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const barWidth = progress * (percent / 100) * width;
  const displayPercent = Math.round(progress * percent);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 26,
          color: WHITE,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          width,
          height: 40,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: barWidth,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 6,
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 22,
            color: WHITE,
          }}
        >
          {displayPercent}%
        </span>
      </div>
    </div>
  );
};

/** Top-left scene label banner */
const SceneLabel: React.FC<{
  text: string;
  bg: string;
  frame: number;
  delay: number;
}> = ({ text, bg, frame, delay }) => {
  const slideIn = interpolate(frame, [delay, delay + 14], [-300, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 40,
        transform: `translateX(${slideIn}px)`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          background: bg,
          padding: "12px 40px 12px 50px",
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: 38,
          color: WHITE,
          letterSpacing: 4,
          textTransform: "uppercase",
          clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// SCENE 1 — Breaking Flash (0-75)
// ════════════════════════════════════════════════════════════
const Scene1_BreakingFlash: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Full red flash for first 2 frames
  if (frame < 2) {
    return (
      <AbsoluteFill style={{ background: RED }} />
    );
  }

  // "BREAKING" banner slides in
  const bannerSlide = interpolate(frame, [4, 22], [-1920, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle fade
  const subOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lower third
  const lowerSlide = interpolate(frame, [35, 50], [-1920, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Pulsing red glow on BREAKING
  const pulse = Math.sin(frame * 0.3) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ background: DARK_NAVY }}>
      {/* Subtle scan lines effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)",
          zIndex: 1,
        }}
      />

      {/* BREAKING banner */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 360,
          width: 1920,
          transform: `translateX(${bannerSlide}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: RED,
            display: "inline-block",
            padding: "20px 80px",
            boxShadow: `0 0 ${40 * pulse}px ${RED}88, 0 4px 30px rgba(0,0,0,0.5)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 900,
              fontSize: 96,
              color: WHITE,
              letterSpacing: 16,
              textTransform: "uppercase",
            }}
          >
            BREAKING
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 490,
          opacity: subOpacity,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Mental Health Report · 2026
        </span>
      </div>

      {/* Lower third bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 120,
          width: 1920,
          height: 4,
          background: RED,
          transform: `translateX(${lowerSlide}px)`,
          boxShadow: `0 0 20px ${RED}66`,
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 80,
          width: 1920,
          height: 36,
          background: "rgba(220,38,38,0.15)",
          transform: `translateX(${lowerSlide}px)`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 40,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 2,
          }}
        >
          REFRESH PSYCHIATRY · SPECIAL REPORT · REFRESHPSYCHIATRY.COM
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════
// SCENE 2 — Then: The 90s/2000s (75-225)
// ════════════════════════════════════════════════════════════
const Scene2_Then: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const thenItems = [
    { emoji: "📋", text: '"Just snap out of it" — the standard advice' },
    { emoji: "📋", text: '"Therapy = you\'re crazy"' },
    { emoji: "📋", text: '"ADHD isn\'t real, you just need discipline"' },
    { emoji: "📋", text: '"Medication = weakness"' },
    { emoji: "📋", text: "Average wait for a psychiatrist: 6+ months" },
  ];

  // Year typewriter effect
  const yearText = "1995–2010";
  const charsVisible = Math.min(
    yearText.length,
    Math.floor(interpolate(frame, [10, 40], [0, yearText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  return (
    <AbsoluteFill style={{ background: DARK_NAVY }}>
      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* THEN label */}
      <SceneLabel text="THEN" bg={RED} frame={frame} delay={4} />

      {/* Year */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 120,
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          fontWeight: 700,
          fontSize: 52,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 4,
        }}
      >
        {yearText.slice(0, charsVisible)}
        {charsVisible < yearText.length && (
          <span
            style={{
              opacity: Math.sin(frame * 0.4) > 0 ? 1 : 0,
              color: RED,
            }}
          >
            █
          </span>
        )}
      </div>

      {/* Bulletin items */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 220,
          width: 1600,
        }}
      >
        {thenItems.map((item, i) => (
          <BulletinItem
            key={i}
            emoji={item.emoji}
            text={item.text}
            frame={frame}
            delay={20 + i * 22}
            accentColor={YELLOW}
          />
        ))}
      </div>

      {/* Red lower-third banner */}
      <LowerThird
        text="@mammybanter · TikTok Viral"
        bg={RED}
        frame={frame}
        enterDelay={10}
        y={920}
        height={50}
        fontSize={24}
      />

      {/* Ticker */}
      <TickerTape
        text="5.1M views on TikTok · 620K likes · 145K shares · Mental Health Then vs Now"
        bg="rgba(220,38,38,0.9)"
        frame={frame}
        speed={3}
        y={970}
      />
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════
// SCENE 3 — Now: 2026 (225-375)
// ════════════════════════════════════════════════════════════
const Scene3_Now: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const nowItems = [
    "Therapy is self-care, not stigma",
    "ADHD recognized as neurological condition",
    "Medication saves lives — 83% improvement rate",
    "Telehealth makes care accessible anywhere",
    "Pharmacogenomic testing personalizes treatment",
  ];

  return (
    <AbsoluteFill style={{ background: DARK_NAVY }}>
      {/* Subtle green tint overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.06) 0%, transparent 70%)",
        }}
      />

      {/* NOW label */}
      <SceneLabel text="NOW" bg={GREEN} frame={frame} delay={4} />

      {/* Year */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 120,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 56,
            color: GREEN,
            letterSpacing: 6,
            opacity: interpolate(frame, [6, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          2026
        </span>
      </div>

      {/* Checkmark items */}
      <div style={{ position: "absolute", left: 100, top: 220, width: 1600 }}>
        {nowItems.map((text, i) => (
          <CheckItem
            key={i}
            text={text}
            frame={frame}
            delay={16 + i * 22}
            fps={fps}
          />
        ))}
      </div>

      {/* Green lower-third */}
      <LowerThird
        text="Mental health awareness at all-time high"
        bg={GREEN}
        frame={frame}
        enterDelay={10}
        y={920}
        height={50}
        fontSize={24}
      />

      {/* Ticker */}
      <TickerTape
        text="Mental health awareness at all-time high · Telepsychiatry adoption up 340% · Early intervention saves lives"
        bg="rgba(34,197,94,0.9)"
        frame={frame}
        speed={2.5}
        y={970}
      />
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════
// SCENE 4 — The Shift (375-495)
// ════════════════════════════════════════════════════════════
const Scene4_TheShift: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Big stat scale-in
  const statSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 100, mass: 0.7 },
  });

  const statScale = interpolate(statSpring, [0, 1], [0.6, 1]);
  const statOpacity = interpolate(statSpring, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle
  const subOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: DARK_NAVY }}>
      {/* Newsroom spotlight cone */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: 660,
          width: 600,
          height: 800,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
          clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Big stat */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          width: 1920,
          textAlign: "center",
          transform: `scale(${statScale})`,
          opacity: statOpacity,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: 110,
            color: YELLOW,
            letterSpacing: -2,
          }}
        >
          158%
        </span>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            fontSize: 30,
            color: "rgba(255,255,255,0.8)",
            marginTop: 10,
            letterSpacing: 2,
          }}
        >
          INCREASE IN MENTAL HEALTH CONTENT ENGAGEMENT SINCE 2020
        </div>
      </div>

      {/* Subtitle & bars */}
      <div
        style={{
          position: "absolute",
          top: 440,
          left: 0,
          width: 1920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: subOpacity,
        }}
      >
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: 28,
            color: WHITE,
            marginBottom: 30,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Americans who've accessed mental health care:
        </div>

        <PercentBar
          label="2019"
          percent={19}
          frame={frame}
          delay={40}
          color={RED}
        />
        <PercentBar
          label="2026"
          percent={42}
          frame={frame}
          delay={55}
          color={GREEN}
        />
      </div>

      {/* Source */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          width: 1920,
          textAlign: "center",
          opacity: interpolate(frame, [70, 85], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          @mammybanter · TikTok · 5.1M views
        </span>
      </div>

      {/* Bottom red accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          width: 1920,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${RED}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════
// SCENE 5 — Refresh in the Story (495-615)
// ════════════════════════════════════════════════════════════
const Scene5_Refresh: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const bullets = [
    { icon: "🏥", text: "16 locations across FL, MA, TX" },
    { icon: "📱", text: "Same-week telehealth appointments" },
    { icon: "🧬", text: "DNA-guided medication selection" },
    { icon: "💊", text: "ADHD, anxiety, depression specialists" },
    { icon: "📋", text: "7 insurance carriers accepted" },
  ];

  // Logo spring
  const logoSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
  });

  // Underline draw
  const underlineWidth = interpolate(frame, [20, 45], [0, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: DARK_NAVY }}>
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo treatment */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          opacity: logoSpring,
          transform: `translateY(${interpolate(logoSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: 60,
            color: WHITE,
            letterSpacing: 2,
          }}
        >
          REFRESH PSYCHIATRY
        </span>
        {/* Yellow underline */}
        <div
          style={{
            width: underlineWidth,
            height: 5,
            background: YELLOW,
            marginTop: 8,
            boxShadow: `0 0 20px ${YELLOW}66`,
          }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 100,
          opacity: interpolate(frame, [25, 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Part of the solution since 2018
        </span>
      </div>

      {/* Bullet points */}
      <div style={{ position: "absolute", top: 300, left: 120, width: 1600 }}>
        {bullets.map((b, i) => {
          const delay = 30 + i * 16;
          const progress = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          if (frame < delay) return null;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 28,
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [50, 0])}px)`,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "rgba(43,108,176,0.25)",
                  border: `2px solid ${BLUE}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {b.icon}
              </div>
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 600,
                  fontSize: 34,
                  color: WHITE,
                }}
              >
                {b.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ticker at bottom */}
      <TickerTape
        text="Now accepting new patients · (954) 603-4081 · refreshpsychiatry.com · Telehealth available in FL, MA, TX"
        bg={BLUE}
        frame={frame}
        speed={2}
        y={1020}
      />
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════
// SCENE 6 — CTA (615-720)
// ════════════════════════════════════════════════════════════
const Scene6_CTA: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Banner retract (red bar slides out from top)
  const bannerRetract = interpolate(frame, [0, 15], [0, -100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Main content fade-in
  const contentOpacity = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headlineSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  return (
    <AbsoluteFill style={{ background: BLUE }}>
      {/* Retracting red banner at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 80,
          background: RED,
          transform: `translateY(${bannerRetract}px)`,
          zIndex: 20,
        }}
      />

      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: contentOpacity,
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 58,
            color: WHITE,
            textAlign: "center",
            lineHeight: 1.2,
            opacity: headlineSpring,
            transform: `scale(${interpolate(headlineSpring, [0, 1], [0.9, 1])})`,
            marginBottom: 40,
          }}
        >
          The future of psychiatry is here.
        </div>

        {/* URL */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: 42,
            color: YELLOW,
            letterSpacing: 2,
            marginBottom: 16,
            opacity: interpolate(frame, [30, 42], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          refreshpsychiatry.com
        </div>

        {/* Phone */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            fontSize: 36,
            color: WHITE,
            marginBottom: 50,
            opacity: interpolate(frame, [38, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          (954) 603-4081
        </div>

        {/* Sign-off line */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 20,
            opacity: interpolate(frame, [50, 62], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          This has been a Refresh Psychiatry special report.
        </div>

        {/* Doctor credit */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 500,
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 2,
            opacity: interpolate(frame, [58, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Dr. Justin Nepa, DO · Board-Certified Psychiatrist
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════
export const V6_NewsBreaking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: DARK_NAVY,
        overflow: "hidden",
      }}
    >
      <style>{fontImport}</style>

      {/* Scene 1 — Breaking Flash (0–75) */}
      <Sequence from={0} durationInFrames={75}>
        <Scene1_BreakingFlash frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2 — Then: 90s/2000s (75–225) */}
      <Sequence from={75} durationInFrames={150}>
        <Scene2_Then frame={frame - 75} fps={fps} />
      </Sequence>

      {/* Scene 3 — Now: 2026 (225–375) */}
      <Sequence from={225} durationInFrames={150}>
        <Scene3_Now frame={frame - 225} fps={fps} />
      </Sequence>

      {/* Scene 4 — The Shift (375–495) */}
      <Sequence from={375} durationInFrames={120}>
        <Scene4_TheShift frame={frame - 375} fps={fps} />
      </Sequence>

      {/* Scene 5 — Refresh in the Story (495–615) */}
      <Sequence from={495} durationInFrames={120}>
        <Scene5_Refresh frame={frame - 495} fps={fps} />
      </Sequence>

      {/* Scene 6 — CTA (615–720) */}
      <Sequence from={615} durationInFrames={105}>
        <Scene6_CTA frame={frame - 615} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
