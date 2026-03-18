import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from "remotion";

// -- Brand Colors --
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";

// -- Fonts --
const HEADER_FONT = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";
const BODY_FONT = "'DM Sans', 'Poppins', 'Montserrat', sans-serif";

// Google Fonts import
const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

// -- Helpers --
const clamp = (
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

const fadeIn = (frame: number, start: number, dur = 20) =>
  clamp(frame, start, start + dur, 0, 1);

// ============================================================
// SCENE DEFINITIONS
// ============================================================

interface SlideScene {
  startFrame: number;
  endFrame: number;
  activeSlide: number;
}

const SCENES: SlideScene[] = [
  { startFrame: 0, endFrame: 90, activeSlide: 0 },
  { startFrame: 90, endFrame: 180, activeSlide: 1 },
  { startFrame: 180, endFrame: 280, activeSlide: 2 },
  { startFrame: 280, endFrame: 380, activeSlide: 3 },
  { startFrame: 380, endFrame: 480, activeSlide: 4 },
  { startFrame: 480, endFrame: 570, activeSlide: 5 },
  { startFrame: 570, endFrame: 660, activeSlide: 6 },
  { startFrame: 660, endFrame: 750, activeSlide: 7 },
];

const TOTAL_SLIDES = 7;
const SWIPE_DURATION = 18; // frames for swipe animation

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Instagram-style profile bar at top */
const ProfileBar: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 140,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      padding: "0 48px",
      opacity,
      zIndex: 50,
    }}
  >
    {/* Profile pic */}
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${BLUE}, #4299e1)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: WHITE,
          fontFamily: HEADER_FONT,
          fontWeight: 800,
          fontSize: 28,
        }}
      >
        R
      </span>
    </div>
    {/* Username + verified */}
    <div style={{ marginLeft: 20, display: "flex", alignItems: "center" }}>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: 30,
          color: CHARCOAL,
        }}
      >
        @refreshpsychiatry
      </span>
      {/* Verified badge */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        style={{ marginLeft: 8 }}
      >
        <circle cx="12" cy="12" r="10" fill="#4299e1" />
        <path
          d="M9 12l2 2 4-4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

/** Carousel dots indicator */
const DotsIndicator: React.FC<{
  activeIndex: number;
  total: number;
  opacity: number;
}> = ({ activeIndex, total, opacity }) => (
  <div
    style={{
      position: "absolute",
      bottom: 180,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 12,
      opacity,
      zIndex: 50,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === activeIndex ? 24 : 10,
          height: 10,
          borderRadius: 5,
          background: i === activeIndex ? BLUE : "#d1d5db",
          transition: "all 0.3s ease",
        }}
      />
    ))}
  </div>
);

/** Swipe arrow animation */
const SwipeArrow: React.FC<{ frame: number }> = ({ frame }) => {
  const bounce = Math.sin(frame * 0.15) * 12;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 40,
      }}
    >
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 26,
          color: "rgba(255,255,255,0.8)",
          fontWeight: 500,
        }}
      >
        Swipe
      </span>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `translateX(${bounce}px)` }}
      >
        <path
          d="M5 12h14M12 5l7 7-7 7"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ============================================================
// INDIVIDUAL SLIDE CARDS
// ============================================================

const CoverSlide: React.FC<{ frame: number; localFrame: number }> = ({
  frame,
  localFrame,
}) => {
  const titleOpacity = fadeIn(localFrame, 10);
  const subtitleOpacity = fadeIn(localFrame, 25);
  const subtext2Opacity = fadeIn(localFrame, 35);
  const swipeOpacity = fadeIn(localFrame, 50);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(160deg, #7c3aed 0%, #a78bfa 50%, #c4b5fd 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
        borderRadius: 24,
      }}
    >
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 32,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: titleOpacity,
          marginBottom: 24,
        }}
      >
        5 Signs
      </span>
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 80,
          fontWeight: 900,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.1,
          opacity: subtitleOpacity,
        }}
      >
        Childhood{"\n"}Experiences
      </span>
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 38,
          fontWeight: 600,
          color: "rgba(255,255,255,0.9)",
          textAlign: "center",
          lineHeight: 1.3,
          marginTop: 20,
          opacity: subtext2Opacity,
        }}
      >
        Are Affecting Your{"\n"}Mental Health Today
      </span>
      <div style={{ opacity: swipeOpacity }}>
        <SwipeArrow frame={frame} />
      </div>
    </div>
  );
};

const ContentSlide: React.FC<{
  number: string;
  title: string;
  lines: string[];
  bg: string;
  textColor?: string;
  localFrame: number;
}> = ({ number, title, lines, bg, textColor = CHARCOAL, localFrame }) => {
  const numOpacity = fadeIn(localFrame, 8);
  const titleOpacity = fadeIn(localFrame, 16);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 70px",
        borderRadius: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large faded number */}
      <span
        style={{
          position: "absolute",
          top: 60,
          right: 60,
          fontFamily: HEADER_FONT,
          fontSize: 280,
          fontWeight: 900,
          color: textColor,
          opacity: numOpacity * 0.06,
          lineHeight: 1,
        }}
      >
        {number}
      </span>
      {/* Number label */}
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 28,
          fontWeight: 700,
          color: textColor,
          opacity: numOpacity * 0.5,
          letterSpacing: 3,
          marginBottom: 20,
        }}
      >
        {number}
      </span>
      {/* Title */}
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 56,
          fontWeight: 800,
          color: textColor,
          opacity: titleOpacity,
          lineHeight: 1.15,
          marginBottom: 36,
        }}
      >
        {title}
      </span>
      {/* Body lines */}
      {lines.map((line, i) => {
        const lineOpacity = fadeIn(localFrame, 24 + i * 10);
        return (
          <span
            key={i}
            style={{
              fontFamily: BODY_FONT,
              fontSize: 34,
              fontWeight: 400,
              color: textColor,
              opacity: lineOpacity * 0.85,
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {line}
          </span>
        );
      })}
    </div>
  );
};

const HealingSlide: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const line1 = fadeIn(localFrame, 10);
  const line2 = fadeIn(localFrame, 24);
  const line3 = fadeIn(localFrame, 38);
  const statsOpacity = fadeIn(localFrame, 52);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(160deg, ${BLUE} 0%, #2c5282 50%, #1a365d 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 70px",
        borderRadius: 24,
      }}
    >
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 50,
          fontWeight: 700,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.4,
          opacity: line1,
          marginBottom: 24,
        }}
      >
        These patterns are{"\n"}not your fault.
      </span>
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 50,
          fontWeight: 700,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.4,
          opacity: line2,
          marginBottom: 24,
        }}
      >
        But healing IS available.
      </span>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 38,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          lineHeight: 1.4,
          opacity: line3,
          marginBottom: 48,
        }}
      >
        Therapy helps you{"\n"}rewrite the story.
      </span>
      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 34,
          fontWeight: 700,
          color: YELLOW,
          textAlign: "center",
          opacity: statsOpacity,
        }}
      >
        390K people saved this post.
      </span>
    </div>
  );
};

const CTASlide: React.FC<{ localFrame: number; fps: number }> = ({
  localFrame,
  fps,
}) => {
  const titleOpacity = fadeIn(localFrame, 5);
  const subtitleOpacity = fadeIn(localFrame, 15);
  const btnScale = spring({
    frame: localFrame - 25,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });
  const infoOpacity = fadeIn(localFrame, 35);
  const statsOpacity = fadeIn(localFrame, 50);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: WHITE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
        borderRadius: 24,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${BLUE}, #4299e1)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          opacity: titleOpacity,
        }}
      >
        <span
          style={{
            color: WHITE,
            fontFamily: HEADER_FONT,
            fontWeight: 900,
            fontSize: 40,
          }}
        >
          R
        </span>
      </div>

      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 46,
          fontWeight: 800,
          color: CHARCOAL,
          textAlign: "center",
          lineHeight: 1.2,
          opacity: titleOpacity,
          marginBottom: 20,
        }}
      >
        Refresh Psychiatry{"\n"}& Therapy
      </span>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 30,
          fontWeight: 400,
          color: "#718096",
          textAlign: "center",
          lineHeight: 1.5,
          opacity: subtitleOpacity,
          marginBottom: 44,
        }}
      >
        Specializing in anxiety, depression,{"\n"}ADHD & trauma
      </span>

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${interpolate(btnScale, [0, 1], [0.7, 1])})`,
          opacity: interpolate(btnScale, [0, 1], [0, 1]),
          background: YELLOW,
          borderRadius: 60,
          padding: "24px 64px",
          marginBottom: 32,
        }}
      >
        <span
          style={{
            fontFamily: HEADER_FONT,
            fontSize: 32,
            fontWeight: 800,
            color: CHARCOAL,
          }}
        >
          Book a Consultation
        </span>
      </div>

      <span
        style={{
          fontFamily: HEADER_FONT,
          fontSize: 34,
          fontWeight: 700,
          color: CHARCOAL,
          opacity: infoOpacity,
          marginBottom: 12,
        }}
      >
        (954) 603-4081
      </span>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 28,
          fontWeight: 500,
          color: BLUE,
          opacity: infoOpacity,
          marginBottom: 8,
        }}
      >
        refreshpsychiatry.com
      </span>
      <span
        style={{
          fontFamily: BODY_FONT,
          fontSize: 24,
          fontWeight: 400,
          color: "#a0aec0",
          opacity: infoOpacity,
          textAlign: "center",
          marginBottom: 44,
        }}
      >
        Telehealth across Florida · Accepting insurance
      </span>

      {/* Engagement stats */}
      <div
        style={{
          display: "flex",
          gap: 40,
          opacity: statsOpacity,
        }}
      >
        {[
          { icon: "\u2764\uFE0F", label: "2.9M" },
          { icon: "\uD83D\uDCAC", label: "62K" },
          { icon: "\uD83D\uDCBE", label: "390K" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span style={{ fontSize: 28 }}>{stat.icon}</span>
            <span
              style={{
                fontFamily: BODY_FONT,
                fontSize: 26,
                fontWeight: 600,
                color: "#718096",
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// SLIDE DATA
// ============================================================

const SLIDES = [
  { type: "cover" as const },
  {
    type: "content" as const,
    number: "01",
    title: "Chronic\nPeople-Pleasing",
    lines: [
      "You learned that your needs come last.",
      'You say yes when you mean no \u2014 because "no" felt dangerous growing up.',
    ],
    bg: "linear-gradient(160deg, #fefce8 0%, #fef3c7 100%)",
  },
  {
    type: "content" as const,
    number: "02",
    title: "Difficulty Identifying\nEmotions",
    lines: [
      "When no one asked how you felt as a child, you stopped knowing.",
      'You might feel "fine" and "nothing" more than any other emotion.',
    ],
    bg: "linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)",
  },
  {
    type: "content" as const,
    number: "03",
    title: "Chronic\nSelf-Doubt",
    lines: [
      "You second-guess every decision because you were never trusted to make them.",
    ],
    bg: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)",
  },
  {
    type: "content" as const,
    number: "04",
    title: "Hypervigilance in\nRelationships",
    lines: [
      "You can read a room instantly \u2014 because you had to.",
      "Scanning for danger was survival. Now it\u2019s exhausting.",
    ],
    bg: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)",
  },
  {
    type: "content" as const,
    number: "05",
    title: "Burnout as\na Baseline",
    lines: [
      "You don\u2019t rest because rest was never modeled.",
      "Achievement became your only source of validation.",
    ],
    bg: "linear-gradient(160deg, #fff1f2 0%, #fecdd3 100%)",
  },
  { type: "healing" as const },
  { type: "cta" as const },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export const V7_Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine current scene
  let currentSceneIndex = 0;
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (frame >= SCENES[i].startFrame) {
      currentSceneIndex = i;
      break;
    }
  }

  const scene = SCENES[currentSceneIndex];
  const localFrame = frame - scene.startFrame;

  // Compute a continuous "slide position" (0 = first slide visible, 1 = second, etc.)
  // Between scenes, animate smoothly during SWIPE_DURATION frames
  let slidePosition = 0;
  if (currentSceneIndex === 0) {
    slidePosition = 0;
  } else {
    // All previous transitions are complete
    const completed = currentSceneIndex - 1;
    // Current transition progress
    const swipeProgress = clamp(localFrame, 0, SWIPE_DURATION, 0, 1);
    slidePosition = completed + swipeProgress;
  }

  // Determine active dot index
  const dotIndex = Math.min(scene.activeSlide, TOTAL_SLIDES - 1);

  // Global fade in
  const globalOpacity = fadeIn(frame, 0, 15);

  return (
    <AbsoluteFill
      style={{
        background: "#f7f7f7",
        fontFamily: BODY_FONT,
        opacity: globalOpacity,
      }}
    >
      <style>{fontImport}</style>

      {/* Instagram profile bar */}
      <ProfileBar opacity={1} />

      {/* Card viewport */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 40,
          right: 40,
          bottom: 240,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Each card is absolutely positioned and shifted by slidePosition */}
        {SLIDES.map((slide, i) => {
          // Card's X offset: (i - slidePosition) * 100%
          const offsetPct = (i - slidePosition) * 100;

          // Only render cards that are near the viewport for performance
          if (offsetPct < -150 || offsetPct > 150) return null;

          // Compute each card's local frame for staggered text animations
          const cardScene = SCENES[i];
          const cardLocalFrame = cardScene
            ? Math.max(
                0,
                frame - cardScene.startFrame - (i > 0 ? SWIPE_DURATION : 0),
              )
            : 0;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                transform: `translateX(${offsetPct}%)`,
              }}
            >
              {slide.type === "cover" && (
                <CoverSlide frame={frame} localFrame={cardLocalFrame} />
              )}
              {slide.type === "content" && (
                <ContentSlide
                  number={slide.number!}
                  title={slide.title!}
                  lines={slide.lines!}
                  bg={slide.bg!}
                  localFrame={cardLocalFrame}
                />
              )}
              {slide.type === "healing" && (
                <HealingSlide localFrame={cardLocalFrame} />
              )}
              {slide.type === "cta" && (
                <CTASlide localFrame={cardLocalFrame} fps={fps} />
              )}
            </div>
          );
        })}
      </div>

      {/* Dots indicator */}
      <DotsIndicator
        activeIndex={dotIndex}
        total={TOTAL_SLIDES}
        opacity={1}
      />

      {/* Bottom IG-style engagement bar for last scene */}
      {currentSceneIndex < 7 && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 48,
            opacity: 0.5,
          }}
        >
          {[
            // Heart
            <svg key="h" width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
            // Comment
            <svg key="c" width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
            // Send
            <svg key="s" width="36" height="36" viewBox="0 0 24 24" fill="none">
              <line x1="22" y1="2" x2="11" y2="13" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>,
            // Bookmark
            <svg key="b" width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}>
              <path
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
          ].map((icon, i) => (
            <div key={i}>{icon}</div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
