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

// -- Brand colors --
const BLUE = "#2B6CB0";
const DEEP_BLUE = "#1a3a5c";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const DARK_RED_BG = "#1a0a0a";
const LIGHT_BG = "#f0f7ff";

const FONT_FAMILY = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

// ──────────────────────────────────────────────
// Center divider line with glow
// ──────────────────────────────────────────────
const CenterDivider: React.FC<{
  progress: number; // 0 → 1 draw progress
  opacity?: number;
  collapseX?: number; // horizontal offset to collapse line
}> = ({ progress, opacity = 1, collapseX = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 960 + collapseX - 1.5,
      top: 0,
      width: 3,
      height: `${progress * 100}%`,
      background: WHITE,
      boxShadow: `0 0 14px 4px rgba(255,255,255,0.35), 0 0 40px 8px rgba(255,255,255,0.12)`,
      opacity,
      zIndex: 10,
    }}
  />
);

// ──────────────────────────────────────────────
// Staggered bullet item
// ──────────────────────────────────────────────
const BulletItem: React.FC<{
  text: string;
  frame: number;
  delay: number;
  side: "left" | "right";
  index: number;
}> = ({ text, frame, delay, side, index }) => {
  const progress = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const slideX = interpolate(progress, [0, 1], [side === "left" ? -60 : 60, 0]);
  const mark = side === "left" ? "✗" : "✓";
  const markColor = side === "left" ? "#e53e3e" : "#38a169";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: progress,
        transform: `translateX(${slideX}px)`,
        marginBottom: 18,
        flexDirection: side === "left" ? "row" : "row",
      }}
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 30,
          fontWeight: 800,
          color: markColor,
          minWidth: 30,
          textAlign: "center",
        }}
      >
        {mark}
      </span>
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 26,
          fontWeight: 600,
          color: side === "left" ? "#e8c0c0" : CHARCOAL,
          lineHeight: 1.35,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ──────────────────────────────────────────────
// Split panel (left or right half)
// ──────────────────────────────────────────────
const SplitPanel: React.FC<{
  side: "left" | "right";
  header: string;
  items: string[];
  frame: number;
  sceneStart: number;
}> = ({ side, header, items, frame, sceneStart }) => {
  const relFrame = frame - sceneStart;

  const headerOpacity = interpolate(relFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isLeft = side === "left";

  return (
    <div
      style={{
        position: "absolute",
        left: isLeft ? 0 : 960,
        top: 0,
        width: 960,
        height: 1080,
        background: isLeft
          ? `linear-gradient(160deg, #1a0a0a 0%, #2a0e0e 50%, #1a0a0a 100%)`
          : `linear-gradient(200deg, #f0f7ff 0%, #e8f4f8 50%, #f8fbff 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: isLeft ? "60px 50px 60px 70px" : "60px 70px 60px 50px",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 3,
          color: isLeft ? "rgba(255,120,120,0.7)" : BLUE,
          opacity: headerOpacity,
          marginBottom: 36,
          textTransform: "uppercase",
        }}
      >
        {header}
      </div>

      {/* Bullet items — alternating stagger: left items at even delays, right at odd */}
      {items.map((item, i) => {
        // Stagger: each item 18 frames apart, alternating sides
        const baseDelay = 20 + i * 24;
        return (
          <BulletItem
            key={i}
            text={item}
            frame={relFrame}
            delay={baseDelay}
            side={side}
            index={i}
          />
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────
// Scene 1 — Hook
// ──────────────────────────────────────────────
const SceneHook: React.FC<{ frame: number }> = ({ frame }) => {
  const line1Opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [10, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [38, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [38, 55], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const line2Scale = interpolate(frame, [38, 58], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });

  // TikTok badge
  const badgeOpacity = interpolate(frame, [58, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Split line drawing at end of scene
  const lineProgress = interpolate(frame, [72, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 900,
          height: 900,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(43,108,176,0.12) 0%, transparent 70%)",
        }}
      />

      {/* "Is it selfish..." */}
      <div
        style={{
          position: "absolute",
          top: 360,
          width: "100%",
          textAlign: "center",
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 72,
            fontWeight: 700,
            color: WHITE,
          }}
        >
          Is it selfish...
        </span>
      </div>

      {/* "...or is it ADHD?" */}
      <div
        style={{
          position: "absolute",
          top: 460,
          width: "100%",
          textAlign: "center",
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px) scale(${line2Scale})`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 88,
            fontWeight: 900,
            color: YELLOW,
          }}
        >
          ...or is it ADHD?
        </span>
      </div>

      {/* TikTok badge + stats */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: 30,
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 18,
              fontWeight: 700,
              color: WHITE,
            }}
          >
            TikTok
          </span>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 18,
              fontWeight: 600,
              color: YELLOW,
            }}
          >
            6.2M views
          </span>
        </div>
      </div>

      {/* Divider line drawing */}
      {lineProgress > 0 && (
        <CenterDivider progress={lineProgress} opacity={lineProgress} />
      )}
    </AbsoluteFill>
  );
};

// ──────────────────────────────────────────────
// Scene 5 — Stats & Takeaway
// ──────────────────────────────────────────────
const SceneStats: React.FC<{ frame: number }> = ({ frame }) => {
  // Collapse animation: line merges to center, panels merge
  const collapseProgress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const bgOpacity = interpolate(collapseProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Content fade in after collapse
  const contentOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const contentY = interpolate(frame, [35, 55], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Stats row
  const statsOpacity = interpolate(frame, [55, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Takeaway box
  const takeawayOpacity = interpolate(frame, [78, 98], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeawayX = interpolate(frame, [78, 98], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Source
  const sourceOpacity = interpolate(frame, [105, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Transition: split bg fading to solid */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 960,
          height: 1080,
          background: `linear-gradient(160deg, #1a0a0a 0%, #2a0e0e 100%)`,
          opacity: 1 - bgOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 0,
          width: 960,
          height: 1080,
          background: `linear-gradient(200deg, #f0f7ff 0%, #f8fbff 100%)`,
          opacity: 1 - bgOpacity,
        }}
      />
      {/* Solid deep blue bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${DEEP_BLUE} 0%, #0f2a42 60%, #1a3a5c 100%)`,
          opacity: bgOpacity,
        }}
      />

      {/* Collapsing divider line */}
      {collapseProgress < 1 && (
        <CenterDivider progress={1} opacity={1 - collapseProgress} />
      )}

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 120px",
          opacity: contentOpacity,
          transform: `translateY(${contentY}px)`,
        }}
      >
        {/* Creator credit */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 28,
            fontWeight: 700,
            color: WHITE,
            marginBottom: 6,
          }}
        >
          @katimorton · Kati Morton, LMFT
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 24,
            marginBottom: 50,
            opacity: statsOpacity,
          }}
        >
          {[
            { label: "views", value: "6.2M" },
            { label: "likes", value: "890K" },
            { label: "shares", value: "220K" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 36,
                  fontWeight: 800,
                  color: YELLOW,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 20,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Takeaway box */}
        <div
          style={{
            opacity: takeawayOpacity,
            transform: `translateX(${takeawayX}px)`,
            background: "rgba(255,255,255,0.06)",
            borderLeft: `4px solid ${YELLOW}`,
            borderRadius: "0 12px 12px 0",
            padding: "28px 36px",
            maxWidth: 900,
          }}
        >
          <p
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 24,
              fontWeight: 600,
              color: WHITE,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            The &ldquo;send this to my mom&rdquo; dynamic drives the highest
            share-to-view ratios in mental health content
          </p>
        </div>

        {/* Source */}
        <div
          style={{
            marginTop: 30,
            opacity: sourceOpacity,
            fontFamily: FONT_FAMILY,
            fontSize: 15,
            fontWeight: 400,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Source: TikTok viral mental health analysis, March 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ──────────────────────────────────────────────
// Scene 6 — CTA
// ──────────────────────────────────────────────
const SceneCTA: React.FC<{ frame: number }> = ({ frame }) => {
  const headlineOpacity = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(frame, [8, 28], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subOpacity = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [38, 60], [0, 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const brandOpacity = interpolate(frame, [50, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contactOpacity = interpolate(frame, [62, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const insuranceOpacity = interpolate(frame, [74, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const footerOpacity = interpolate(frame, [85, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const insuranceNames = ["Aetna", "United", "Cigna", "Humana"];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${BLUE} 0%, #1e5a9e 50%, #1a4f8a 100%)`,
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          right: -100,
          top: -100,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(246,199,68,0.1) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 100px",
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            fontFamily: FONT_FAMILY,
            fontSize: 62,
            fontWeight: 800,
            color: WHITE,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          ADHD treatment can help.
        </div>

        {/* Subheadline */}
        <div
          style={{
            opacity: subOpacity,
            fontFamily: FONT_FAMILY,
            fontSize: 30,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          We're accepting new patients in Florida.
        </div>

        {/* Yellow divider line */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            background: YELLOW,
            borderRadius: 2,
            marginBottom: 36,
          }}
        />

        {/* Brand name */}
        <div
          style={{
            opacity: brandOpacity,
            fontFamily: FONT_FAMILY,
            fontSize: 40,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: 1,
            marginBottom: 14,
          }}
        >
          Refresh Psychiatry
        </div>

        {/* Contact */}
        <div
          style={{
            opacity: contactOpacity,
            fontFamily: FONT_FAMILY,
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 36,
          }}
        >
          (954) 603-4081 · refreshpsychiatry.com
        </div>

        {/* Insurance logos row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            opacity: insuranceOpacity,
            marginBottom: 30,
          }}
        >
          {insuranceNames.map((name) => (
            <div
              key={name}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "10px 28px",
                fontFamily: FONT_FAMILY,
                fontSize: 18,
                fontWeight: 700,
                color: WHITE,
                letterSpacing: 0.5,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            opacity: footerOpacity,
            fontFamily: FONT_FAMILY,
            fontSize: 19,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: 1,
          }}
        >
          Telehealth · 16 locations · 7 days/week
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export const V2_SplitScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene boundaries
  const SCENE_1_END = 90;
  const SCENE_2_END = 210;
  const SCENE_3_END = 330;
  const SCENE_4_END = 450;
  const SCENE_5_END = 600;
  const SCENE_6_END = 720;

  // Split screen content data
  const scene2Left = [
    "Forgetting important dates",
    "Missing appointments",
    "Canceling last minute",
  ];
  const scene2Right = [
    "Working memory deficit",
    "Time blindness",
    "Executive dysfunction",
  ];

  const scene3Left = [
    "Interrupting conversations",
    "Not listening",
    "Talking too much",
  ];
  const scene3Right = [
    "Impulse control difficulty",
    "Auditory processing delay",
    "Hyperactive verbal processing",
  ];

  const scene4Left = [
    "Messy home",
    "Poor hygiene routines",
    "Can't stick to plans",
  ];
  const scene4Right = [
    "Task initiation impairment",
    "Routine formation difficulty",
    "Dopamine-seeking behavior",
  ];

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Scene 1 — Hook (0-90) */}
      <Sequence from={0} durationInFrames={SCENE_1_END}>
        <SceneHook frame={frame} />
      </Sequence>

      {/* Scene 2 — Split: Forgetting Plans (90-210) */}
      <Sequence from={SCENE_1_END} durationInFrames={SCENE_2_END - SCENE_1_END}>
        <AbsoluteFill>
          <SplitPanel
            side="left"
            header="WHAT PEOPLE SEE:"
            items={scene2Left}
            frame={frame}
            sceneStart={SCENE_1_END}
          />
          <SplitPanel
            side="right"
            header="WHAT'S ACTUALLY HAPPENING:"
            items={scene2Right}
            frame={frame}
            sceneStart={SCENE_1_END}
          />
          <CenterDivider progress={1} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 — Split: Communication (210-330) */}
      <Sequence from={SCENE_2_END} durationInFrames={SCENE_3_END - SCENE_2_END}>
        <AbsoluteFill>
          <SplitPanel
            side="left"
            header="WHAT PEOPLE SEE:"
            items={scene3Left}
            frame={frame}
            sceneStart={SCENE_2_END}
          />
          <SplitPanel
            side="right"
            header="WHAT'S ACTUALLY HAPPENING:"
            items={scene3Right}
            frame={frame}
            sceneStart={SCENE_2_END}
          />
          <CenterDivider progress={1} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 — Split: Self-Care (330-450) */}
      <Sequence from={SCENE_3_END} durationInFrames={SCENE_4_END - SCENE_3_END}>
        <AbsoluteFill>
          <SplitPanel
            side="left"
            header="WHAT PEOPLE SEE:"
            items={scene4Left}
            frame={frame}
            sceneStart={SCENE_3_END}
          />
          <SplitPanel
            side="right"
            header="WHAT'S ACTUALLY HAPPENING:"
            items={scene4Right}
            frame={frame}
            sceneStart={SCENE_3_END}
          />
          <CenterDivider progress={1} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 — Stats & Takeaway (450-600) */}
      <Sequence from={SCENE_4_END} durationInFrames={SCENE_5_END - SCENE_4_END}>
        <SceneStats frame={frame - SCENE_4_END} />
      </Sequence>

      {/* Scene 6 — CTA (600-720) */}
      <Sequence from={SCENE_5_END} durationInFrames={SCENE_6_END - SCENE_5_END}>
        <SceneCTA frame={frame - SCENE_5_END} />
      </Sequence>
    </AbsoluteFill>
  );
};
