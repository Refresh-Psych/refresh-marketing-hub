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
const TWITTER_DARK = "#15202b";
const TWITTER_DARKER = "#1a2836";
const TWITTER_BORDER = "#38444d";
const TWITTER_BLUE = "#1d9bf0";
const TWITTER_TEXT = "#e7e9ea";
const TWITTER_SECONDARY = "#8b98a5";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const RED = "#f91880";
const RED_HEART = "#f91880";
const GREEN_RT = "#00ba7c";
const BLUE_BRAND = "#2B6CB0";
const GOLD_VERIFIED = "#e8a817";
const CHARCOAL = "#2D3748";

const FONT_SYSTEM =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_HEADER = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');`;

// ============================================================
// DATA
// ============================================================

interface TweetData {
  number: string;
  lines: string[];
  highlight?: boolean;
}

const TWEETS: TweetData[] = [
  {
    number: "",
    lines: [
      "🧵 Thread: What no one tells you about adult ADHD diagnosis",
      "",
      "A psychiatrist's perspective. (1/8)",
    ],
  },
  {
    number: "2/8",
    lines: [
      "(2/8) The grief is real.",
      "",
      "When you finally get diagnosed at 30, 35, 40 — you mourn the years lost.",
      "",
      "The degree you didn't finish. The relationships that fell apart.",
      "",
      "That's normal. And it's temporary.",
    ],
  },
  {
    number: "3/8",
    lines: [
      "(3/8) The bureaucratic nightmare.",
      "",
      "Getting evaluated as an adult is HARD.",
      "Long waitlists. Insurance fights. Providers who say 'you seem fine.'",
      "",
      "This is why telehealth is changing everything.",
    ],
  },
  {
    number: "4/8",
    lines: [
      "(4/8) The ADHD Tax is real.",
      "",
      "Late fees. Lost items. Duplicate purchases.",
      "The average adult with untreated ADHD spends $4,000+/year on ADHD-related losses.",
      "",
      "Treatment pays for itself.",
    ],
  },
  {
    number: "5/8",
    lines: [
      "(5/8) Medication myths need to die.",
      "",
      "❌ 'It changes your personality' — No.",
      "❌ 'It's just legal meth' — No.",
      "❌ 'You'll be dependent forever' — Not necessarily.",
      "✅ '83% of patients report significant improvement' — Yes.",
    ],
  },
  {
    number: "6/8",
    lines: [
      "(6/8) What treatment ACTUALLY changes:",
      "",
      "→ You finish tasks",
      "→ You remember appointments",
      "→ Relationships improve",
      "→ The mental 'fog' lifts",
      "→ You feel like yourself — maybe for the first time",
    ],
  },
  {
    number: "7/8",
    lines: [
      "(7/8) Micro-skills that help immediately:",
      "",
      "From @therapyinanutshell (8M+ views per video):",
      "• Box breathing for overwhelm",
      "• Cognitive defusion for spiraling",
      "• Body doubling for task initiation",
      "• Time blocking with alarms",
    ],
  },
  {
    number: "8/8",
    lines: [
      "(8/8) If you've been wondering whether it's ADHD:",
      "",
      "It might be.",
      "You deserve to find out.",
      "",
      "We offer adult ADHD evaluations.",
      "Telepsychiatry across Florida.",
      "@RefreshPsychMD · (954) 603-4081",
    ],
    highlight: true,
  },
];

// ============================================================
// HELPER COMPONENTS
// ============================================================

/** Verified badge (gold checkmark) */
const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <path
      d="M20.396 11c.002-.812-.252-1.63-.756-2.305a3.004 3.004 0 00-1.985-1.265c-.173-.637-.54-1.194-1.05-1.594a2.994 2.994 0 00-1.77-.613c-.457-.424-1.03-.72-1.648-.852a3.004 3.004 0 00-1.865.136 2.996 2.996 0 00-3.645 0 3.004 3.004 0 00-1.865-.136 2.994 2.994 0 00-1.648.852 2.994 2.994 0 00-1.77.613 2.994 2.994 0 00-1.05 1.594 3.004 3.004 0 00-1.985 1.265A3.004 3.004 0 00.604 11c-.002.812.252 1.63.756 2.305a3.004 3.004 0 001.985 1.265c.173.637.54 1.194 1.05 1.594.51.399 1.12.613 1.77.613.457.424 1.03.72 1.648.852a3.004 3.004 0 001.865-.136 2.996 2.996 0 003.645 0 3.004 3.004 0 001.865.136 2.994 2.994 0 001.648-.852 2.994 2.994 0 001.77-.613 2.994 2.994 0 001.05-1.594 3.004 3.004 0 001.985-1.265A3.004 3.004 0 0020.396 11z"
      fill={GOLD_VERIFIED}
    />
    <path
      d="M8.287 14.202l-2.49-2.49 1.06-1.06 1.43 1.43 4.356-4.356 1.06 1.06-5.416 5.416z"
      fill={TWITTER_DARK}
    />
  </svg>
);

/** Profile avatar (blue gradient circle with initials) */
const Avatar: React.FC<{ size?: number }> = ({ size = 52 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${BLUE_BRAND}, ${TWITTER_BLUE})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontFamily: FONT_HEADER,
        fontWeight: 800,
        fontSize: size * 0.38,
        color: WHITE,
        letterSpacing: -1,
      }}
    >
      RP
    </span>
  </div>
);

/** Thread connector line */
const ThreadLine: React.FC<{ height?: string }> = ({ height = "100%" }) => (
  <div
    style={{
      position: "absolute",
      left: 25,
      top: 58,
      width: 2,
      height,
      backgroundColor: TWITTER_BORDER,
    }}
  />
);

/** Single tweet card */
const TweetCard: React.FC<{
  tweet: TweetData;
  frame: number;
  fps: number;
  entryDelay: number;
  showLine?: boolean;
  showEngagement?: boolean;
  heartAnimFrame?: number;
}> = ({
  tweet,
  frame,
  fps,
  entryDelay,
  showLine = true,
  showEngagement = false,
  heartAnimFrame,
}) => {
  const entrySpring = spring({
    frame: frame - entryDelay,
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  const slideY = interpolate(entrySpring, [0, 1], [120, 0]);
  const opacity = interpolate(entrySpring, [0, 1], [0, 1]);

  const heartFilled =
    heartAnimFrame !== undefined && frame > heartAnimFrame;
  const heartScale =
    heartAnimFrame !== undefined
      ? spring({
          frame: frame - heartAnimFrame,
          fps,
          config: { damping: 6, stiffness: 200, mass: 0.4 },
        })
      : 0;

  return (
    <div
      style={{
        position: "relative",
        padding: "16px 24px 16px 0",
        borderBottom: `1px solid ${TWITTER_BORDER}`,
        opacity,
        transform: `translateY(${slideY}px)`,
        display: "flex",
        gap: 14,
        ...(tweet.highlight
          ? { borderLeft: `4px solid ${YELLOW}`, paddingLeft: 20 }
          : { paddingLeft: 24 }),
      }}
    >
      {/* Avatar column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Avatar size={52} />
        {showLine && (
          <div
            style={{
              width: 2,
              flexGrow: 1,
              backgroundColor: TWITTER_BORDER,
              marginTop: 6,
              minHeight: 20,
            }}
          />
        )}
      </div>

      {/* Content column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: FONT_SYSTEM,
              fontWeight: 700,
              fontSize: 17,
              color: TWITTER_TEXT,
            }}
          >
            Refresh Psychiatry
          </span>
          <VerifiedBadge size={20} />
          <span
            style={{
              fontFamily: FONT_SYSTEM,
              fontSize: 16,
              color: TWITTER_SECONDARY,
            }}
          >
            @RefreshPsychMD
          </span>
        </div>

        {/* Tweet text */}
        <div style={{ lineHeight: 1.45 }}>
          {tweet.lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: FONT_SYSTEM,
                fontSize: 18,
                color: TWITTER_TEXT,
                minHeight: line === "" ? 10 : "auto",
                marginBottom: 2,
              }}
            >
              {line.startsWith("→") || line.startsWith("•") ? (
                <span>{line}</span>
              ) : line.startsWith("❌") || line.startsWith("✅") ? (
                <span>{line}</span>
              ) : line.includes("@therapyinanutshell") ? (
                <span>
                  From{" "}
                  <span style={{ color: TWITTER_BLUE }}>
                    @therapyinanutshell
                  </span>{" "}
                  (8M+ views per video):
                </span>
              ) : line.includes("@RefreshPsychMD") &&
                tweet.number === "8/8" ? (
                <span style={{ color: TWITTER_BLUE }}>{line}</span>
              ) : (
                line
              )}
            </div>
          ))}
        </div>

        {/* Engagement row (only on first tweet) */}
        {showEngagement && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              marginTop: 14,
              paddingTop: 10,
              borderTop: `1px solid ${TWITTER_BORDER}22`,
            }}
          >
            <EngagementStat icon="reply" value="12.3K" />
            <EngagementStat icon="repost" value="41K" color={GREEN_RT} />
            <EngagementStat
              icon="heart"
              value="98K"
              color={heartFilled ? RED_HEART : undefined}
              filled={heartFilled}
              scale={heartFilled ? interpolate(heartScale, [0, 1], [1, 1]) : 1}
              pulse={
                heartFilled
                  ? interpolate(
                      heartScale,
                      [0, 0.5, 1],
                      [1.4, 0.9, 1],
                    )
                  : 1
              }
            />
            <EngagementStat icon="bookmark" value="28K" />
            <EngagementStat icon="views" value="2.4M" />
          </div>
        )}
      </div>
    </div>
  );
};

/** Engagement stat with icon */
const EngagementStat: React.FC<{
  icon: string;
  value: string;
  color?: string;
  filled?: boolean;
  scale?: number;
  pulse?: number;
}> = ({
  icon,
  value,
  color = TWITTER_SECONDARY,
  filled = false,
  scale = 1,
  pulse = 1,
}) => {
  const iconSize = 18;
  const iconSvg = {
    reply: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <path
          d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.36-2.514 5.953L13.888 22.1a2.685 2.685 0 01-3.778 0l-5.85-6.017A8.098 8.098 0 011.751 10z"
          stroke={color}
          strokeWidth="1.8"
        />
      </svg>
    ),
    repost: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <path
          d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2h4v2h-4c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM19.5 20.12l-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2h-4V4h4c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14z"
          fill={color}
        />
      </svg>
    ),
    heart: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={filled ? color : "none"}
        style={{ transform: `scale(${pulse})` }}
      >
        <path
          d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.807 1.1-.806-1.1C10.063 6.01 8.546 5.44 7.303 5.5c-3.038.14-5.242 2.61-5.093 5.88.16 3.46 3.23 6.34 8.69 10.22l.56.39.56-.39c5.46-3.88 8.53-6.76 8.69-10.22.15-3.27-2.055-5.74-5.013-5.88z"
          stroke={filled ? "none" : color}
          strokeWidth="1.8"
        />
      </svg>
    ),
    bookmark: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
          stroke={color}
          strokeWidth="1.8"
        />
      </svg>
    ),
    views: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <path
          d="M8.75 21V3h2v18h-2zM18.75 21V8.5h2V21h-2zM13.75 21v-9h2v9h-2zM3.75 21v-4h2v4h-2z"
          fill={color}
        />
      </svg>
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        transform: `scale(${scale})`,
      }}
    >
      {iconSvg[icon as keyof typeof iconSvg]}
      <span
        style={{
          fontFamily: FONT_SYSTEM,
          fontSize: 14,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
};

/** Animated counter */
const AnimatedCounter: React.FC<{
  value: string;
  frame: number;
  startFrame: number;
  duration?: number;
  fontSize?: number;
  color?: string;
}> = ({ value, frame, startFrame, duration = 40, fontSize = 64, color = WHITE }) => {
  // Extract numeric portion and suffix
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return <span>{value}</span>;
  const numericTarget = parseFloat(match[1]);
  const suffix = match[2];

  const progress = interpolate(frame - startFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const currentVal = numericTarget * progress;
  const display =
    numericTarget % 1 === 0
      ? Math.round(currentVal).toString()
      : currentVal.toFixed(1);

  return (
    <span
      style={{
        fontFamily: FONT_HEADER,
        fontWeight: 900,
        fontSize,
        color,
        letterSpacing: -1,
      }}
    >
      {display}
      {suffix}
    </span>
  );
};

// ============================================================
// SCENE COMPONENTS
// ============================================================

/** Scene 1: Thread Opening (0-90) */
const Scene1_Opening: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Top bar fade in
  const topBarOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 20px",
          gap: 28,
          opacity: topBarOpacity,
          borderBottom: `1px solid ${TWITTER_BORDER}`,
        }}
      >
        {/* Back arrow */}
        <svg width={22} height={22} viewBox="0 0 24 24" fill={TWITTER_TEXT}>
          <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
        </svg>
        <span
          style={{
            fontFamily: FONT_SYSTEM,
            fontWeight: 700,
            fontSize: 22,
            color: TWITTER_TEXT,
          }}
        >
          Thread
        </span>
      </div>

      {/* Tweet container */}
      <div style={{ padding: "0 0", flex: 1 }}>
        <TweetCard
          tweet={TWEETS[0]}
          frame={frame}
          fps={fps}
          entryDelay={20}
          showLine={false}
          showEngagement
        />
      </div>
    </div>
  );
};

/** Scenes 2-5: Scrolling tweets */
const ScrollingThread: React.FC<{
  frame: number;
  fps: number;
  sceneFrame: number;
  tweetsToShow: number[];
  scrollOffset: number;
}> = ({ frame, fps, sceneFrame, tweetsToShow, scrollOffset }) => {
  // Smooth scrolling via interpolation
  const scrollY = interpolate(sceneFrame, [0, 30], [0, scrollOffset], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Determine which tweets we're showing in this scene
  // We show all previous tweets (scrolled up) and the new ones appearing
  const allTweets = tweetsToShow.map((idx) => TWEETS[idx]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 20px",
          gap: 28,
          borderBottom: `1px solid ${TWITTER_BORDER}`,
          zIndex: 10,
          backgroundColor: TWITTER_DARK,
        }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill={TWITTER_TEXT}>
          <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
        </svg>
        <span
          style={{
            fontFamily: FONT_SYSTEM,
            fontWeight: 700,
            fontSize: 22,
            color: TWITTER_TEXT,
          }}
        >
          Thread
        </span>
      </div>

      {/* Scrolling tweet container */}
      <div
        style={{
          transform: `translateY(-${scrollY}px)`,
          padding: "0 0",
        }}
      >
        {allTweets.map((tweet, i) => {
          const isLastTwo = i >= allTweets.length - 2;
          const entryDelay = isLastTwo
            ? 10 + (i - (allTweets.length - 2)) * 35
            : -999;

          return (
            <TweetCard
              key={i}
              tweet={tweet}
              frame={frame}
              fps={fps}
              entryDelay={isLastTwo ? sceneFrame - entryDelay : -30}
              showLine={i < allTweets.length - 1}
              showEngagement={false}
              heartAnimFrame={
                tweet.highlight ? sceneFrame + 50 : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
};

/** Scene 5 — Final Tweet with heart animation */
const Scene5_FinalTweet: React.FC<{ frame: number; fps: number; sceneFrame: number }> = ({
  frame,
  fps,
  sceneFrame,
}) => {
  const scrollY = interpolate(sceneFrame, [0, 30], [0, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 20px",
          gap: 28,
          borderBottom: `1px solid ${TWITTER_BORDER}`,
          zIndex: 10,
          backgroundColor: TWITTER_DARK,
        }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill={TWITTER_TEXT}>
          <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
        </svg>
        <span
          style={{
            fontFamily: FONT_SYSTEM,
            fontWeight: 700,
            fontSize: 22,
            color: TWITTER_TEXT,
          }}
        >
          Thread
        </span>
      </div>

      <div
        style={{
          transform: `translateY(-${scrollY}px)`,
          padding: "0 0",
        }}
      >
        {/* Previous tweets (6, 7) shown above */}
        {[TWEETS[5], TWEETS[6]].map((tweet, i) => (
          <TweetCard
            key={i}
            tweet={tweet}
            frame={frame}
            fps={fps}
            entryDelay={-30}
            showLine
          />
        ))}
        {/* Final tweet (8) */}
        <TweetCard
          tweet={TWEETS[7]}
          frame={frame}
          fps={fps}
          entryDelay={sceneFrame - 15}
          showLine={false}
          showEngagement
          heartAnimFrame={sceneFrame + 60}
        />
      </div>
    </div>
  );
};

/** Scene 6 — Stats Summary */
const Scene6_Stats: React.FC<{ frame: number; fps: number; sceneFrame: number }> = ({
  frame,
  fps,
  sceneFrame,
}) => {
  const fadeIn = interpolate(sceneFrame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const stats = [
    { label: "impressions", value: "2.4M", delay: 15 },
    { label: "reposts", value: "41K", delay: 30 },
    { label: "bookmarks", value: "28K", delay: 45 },
  ];

  const insightOpacity = interpolate(sceneFrame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: FONT_SYSTEM,
          fontSize: 22,
          color: TWITTER_SECONDARY,
          marginBottom: 40,
          textTransform: "uppercase",
          letterSpacing: 3,
        }}
      >
        This thread reached
      </div>

      {stats.map((stat, i) => {
        const statSpring = spring({
          frame: sceneFrame - stat.delay,
          fps,
          config: { damping: 12, stiffness: 100, mass: 0.6 },
        });
        const statOpacity = interpolate(statSpring, [0, 1], [0, 1]);
        const statY = interpolate(statSpring, [0, 1], [40, 0]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              marginBottom: 24,
              opacity: statOpacity,
              transform: `translateY(${statY}px)`,
            }}
          >
            <AnimatedCounter
              value={stat.value}
              frame={sceneFrame}
              startFrame={stat.delay}
              duration={35}
              fontSize={72}
              color={i === 0 ? TWITTER_BLUE : WHITE}
            />
            <span
              style={{
                fontFamily: FONT_SYSTEM,
                fontSize: 24,
                color: TWITTER_SECONDARY,
              }}
            >
              {stat.label}
            </span>
          </div>
        );
      })}

      {/* Insight text */}
      <div
        style={{
          marginTop: 50,
          padding: "28px 36px",
          borderRadius: 16,
          border: `1px solid ${TWITTER_BORDER}`,
          backgroundColor: TWITTER_DARKER,
          opacity: insightOpacity,
          maxWidth: 860,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SYSTEM,
            fontSize: 20,
            color: TWITTER_TEXT,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          <span style={{ fontWeight: 700 }}>Why it worked:</span> Real clinical
          info in a relatable format
        </div>
        <div
          style={{
            fontFamily: FONT_SYSTEM,
            fontSize: 18,
            color: TWITTER_SECONDARY,
            lineHeight: 1.5,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          Combined with{" "}
          <span style={{ color: TWITTER_BLUE }}>@therapyinanutshell</span>'s 8M
          views per video — educational content dominates
        </div>
      </div>
    </div>
  );
};

/** Scene 7 — CTA */
const Scene7_CTA: React.FC<{ frame: number; fps: number; sceneFrame: number }> = ({
  frame,
  fps,
  sceneFrame,
}) => {
  const fadeIn = spring({
    frame: sceneFrame,
    fps,
    config: { damping: 14, stiffness: 60, mass: 0.8 },
  });
  const mainOpacity = interpolate(fadeIn, [0, 1], [0, 1]);
  const mainY = interpolate(fadeIn, [0, 1], [60, 0]);

  const insurances = [
    "Aetna",
    "United",
    "Cigna",
    "Humana",
    "Avmed",
    "UMR",
    "Oscar",
  ];

  const hashtagOpacity = interpolate(sceneFrame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(sceneFrame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${TWITTER_DARK} 0%, #0d2137 50%, ${BLUE_BRAND}33 100%)`,
        padding: "0 60px",
        opacity: mainOpacity,
        transform: `translateY(${mainY}px)`,
      }}
    >
      {/* Logo/Title */}
      <div
        style={{
          fontFamily: FONT_HEADER,
          fontWeight: 900,
          fontSize: 52,
          color: WHITE,
          marginBottom: 10,
          letterSpacing: -1,
          textAlign: "center",
        }}
      >
        Refresh Psychiatry
      </div>

      <div
        style={{
          fontFamily: FONT_SYSTEM,
          fontSize: 24,
          color: TWITTER_BLUE,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        Adult ADHD Evaluations · Telehealth FL
      </div>

      {/* Phone */}
      <div
        style={{
          fontFamily: FONT_HEADER,
          fontWeight: 800,
          fontSize: 48,
          color: YELLOW,
          marginBottom: 12,
          letterSpacing: 1,
        }}
      >
        (954) 603-4081
      </div>

      {/* URL */}
      <div
        style={{
          fontFamily: FONT_SYSTEM,
          fontSize: 22,
          color: TWITTER_SECONDARY,
          marginBottom: 44,
        }}
      >
        refreshpsychiatry.com
      </div>

      {/* Insurance row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          marginBottom: 36,
          maxWidth: 860,
        }}
      >
        {insurances.map((ins, i) => {
          const insSpring = spring({
            frame: sceneFrame - 20 - i * 4,
            fps,
            config: { damping: 12, stiffness: 120, mass: 0.5 },
          });
          return (
            <div
              key={i}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: `1px solid ${TWITTER_BORDER}`,
                backgroundColor: `${TWITTER_DARKER}`,
                fontFamily: FONT_SYSTEM,
                fontSize: 16,
                color: TWITTER_TEXT,
                opacity: interpolate(insSpring, [0, 1], [0, 1]),
                transform: `scale(${interpolate(insSpring, [0, 1], [0.7, 1])})`,
              }}
            >
              {ins}
            </div>
          );
        })}
      </div>

      {/* Hashtags */}
      <div
        style={{
          fontFamily: FONT_SYSTEM,
          fontSize: 18,
          color: TWITTER_BLUE,
          textAlign: "center",
          opacity: hashtagOpacity,
          marginBottom: 20,
        }}
      >
        #ADHDTwitter #ADHDAdults #TelepsychiatryFL
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: FONT_SYSTEM,
          fontSize: 19,
          color: TWITTER_SECONDARY,
          textAlign: "center",
          opacity: taglineOpacity,
        }}
      >
        Same-week appointments · 16 locations
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const V10_ThreadUnroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global fade-in at start
  const globalFade = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TWITTER_DARK,
        fontFamily: FONT_SYSTEM,
        overflow: "hidden",
        opacity: globalFade,
      }}
    >
      <style>{fontStyle}</style>

      {/* Scene 1: Thread Opening (0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill>
          <Scene1_Opening frame={frame} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Tweets 2-3 (90-210) */}
      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill>
          <ScrollingThread
            frame={frame}
            fps={fps}
            sceneFrame={frame - 90}
            tweetsToShow={[0, 1, 2]}
            scrollOffset={180}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Tweets 4-5 (210-330) */}
      <Sequence from={210} durationInFrames={120}>
        <AbsoluteFill>
          <ScrollingThread
            frame={frame}
            fps={fps}
            sceneFrame={frame - 210}
            tweetsToShow={[0, 1, 2, 3, 4]}
            scrollOffset={420}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Tweets 6-7 (330-450) */}
      <Sequence from={330} durationInFrames={120}>
        <AbsoluteFill>
          <ScrollingThread
            frame={frame}
            fps={fps}
            sceneFrame={frame - 330}
            tweetsToShow={[0, 1, 2, 3, 4, 5, 6]}
            scrollOffset={700}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Final Tweet (450-570) */}
      <Sequence from={450} durationInFrames={120}>
        <AbsoluteFill>
          <Scene5_FinalTweet
            frame={frame}
            fps={fps}
            sceneFrame={frame - 450}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: Stats Summary (570-670) */}
      <Sequence from={570} durationInFrames={100}>
        <AbsoluteFill>
          <Scene6_Stats frame={frame} fps={fps} sceneFrame={frame - 570} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 7: CTA (670-780) */}
      <Sequence from={670} durationInFrames={110}>
        <AbsoluteFill>
          <Scene7_CTA frame={frame} fps={fps} sceneFrame={frame - 670} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
