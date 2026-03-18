import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
  spring,
} from "remotion";
import { staticFile } from "remotion";

// -- Brand colors --
const BLUE = "#2B6CB0";
const DEEP_BLUE = "#1a3a5c";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";

// -- Platform colors --
const TIKTOK_BLACK = "#010101";
const TIKTOK_RED = "#FE2C55";
const TIKTOK_CYAN = "#25F4EE";
const IG_PURPLE = "#833AB4";
const IG_ORANGE = "#F77737";
const IG_PINK = "#E1306C";

const FONT_FAMILY = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

// -- Card data --
const CARDS = [
  {
    platform: "TikTok",
    title:
      "POV: Your therapist explains why you can't just 'snap out of' depression",
    creator: "@drjuliesmith",
    creatorLabel: "Licensed Psychologist",
    views: 48_200_000,
    likes: 6_100_000,
    comments: 89_000,
    saves: 0,
    shares: 0,
    takeaway:
      "Simple metaphors > clinical jargon. Destigmatizing \"it's not your fault\" messaging outperforms everything.",
  },
  {
    platform: "Instagram",
    title:
      "Anxiety is not: laziness, weakness, drama.\nAnxiety IS: a medical condition.",
    creator: "@mentalhealthamerica",
    creatorLabel: "MHA",
    views: 0,
    likes: 2_100_000,
    comments: 0,
    saves: 960_000,
    shares: 1_800_000,
    takeaway:
      "Myth vs. fact infographics are the most shareable format. \"Tag someone who needs this\" amplifies reach 3-5x.",
  },
  {
    platform: "Instagram",
    title: '"Your anxiety is lying to you"',
    creator: "@lisaoliveratherapy",
    creatorLabel: "Licensed Therapist",
    views: 16_800_000,
    likes: 2_800_000,
    comments: 0,
    saves: 1_400_000,
    shares: 0,
    takeaway:
      "CBT-style reframing as visual content mirrors the therapy process — educational and emotionally resonant.",
  },
  {
    platform: "TikTok",
    title:
      "Morning routine that actually helps my anxiety — from a psychiatrist's perspective",
    creator: "@drjoelgator",
    creatorLabel: "Psychiatrist & Creator",
    views: 19_400_000,
    likes: 3_200_000,
    comments: 0,
    saves: 2_100_000,
    shares: 0,
    takeaway:
      "Anti-hustle-culture mental health routines are trending hard. Realistic, clinician-backed advice builds trust.",
  },
];

// -- Helper: format large numbers --
const formatNum = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};

// -- Helper: animated counter --
const animatedCount = (target: number, progress: number): string => {
  const current = Math.round(target * Math.min(progress, 1));
  return formatNum(current);
};

// -- Soft radial glow --
const RadialGlow: React.FC<{
  color: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
}> = ({ color, x, y, size, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
      pointerEvents: "none",
    }}
  />
);

// -- Animated golden line divider --
const GoldLine: React.FC<{
  width: number;
  marginTop?: number;
  marginBottom?: number;
}> = ({ width, marginTop = 20, marginBottom = 20 }) => (
  <div
    style={{
      width,
      height: 3,
      background: `linear-gradient(90deg, transparent 0%, ${YELLOW} 20%, ${YELLOW} 80%, transparent 100%)`,
      margin: `${marginTop}px auto ${marginBottom}px`,
      borderRadius: 2,
    }}
  />
);

// -- Platform badge --
const PlatformBadge: React.FC<{
  platform: "TikTok" | "Instagram";
  opacity: number;
  scale: number;
}> = ({ platform, opacity, scale }) => {
  const isTikTok = platform === "TikTok";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `scale(${scale})`,
        padding: "12px 28px",
        borderRadius: 50,
        background: isTikTok
          ? TIKTOK_BLACK
          : `linear-gradient(135deg, ${IG_PURPLE}, ${IG_PINK}, ${IG_ORANGE})`,
        boxShadow: isTikTok
          ? `0 4px 20px rgba(254,44,85,0.3), 0 4px 20px rgba(37,244,238,0.2)`
          : `0 4px 24px rgba(131,58,180,0.35)`,
      }}
    >
      {isTikTok ? (
        <span style={{ fontSize: 28, fontWeight: 800, color: WHITE, fontFamily: FONT_FAMILY }}>
          <span style={{ color: TIKTOK_CYAN }}>♪</span> TikTok
        </span>
      ) : (
        <span style={{ fontSize: 28, fontWeight: 800, color: WHITE, fontFamily: FONT_FAMILY }}>
          ◎ Instagram
        </span>
      )}
    </div>
  );
};

// -- Stat pill --
const StatPill: React.FC<{
  label: string;
  value: string;
  color: string;
  opacity: number;
  y: number;
}> = ({ label, value, color, opacity, y }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      opacity,
      transform: `translateY(${y}px)`,
    }}
  >
    <span
      style={{
        fontSize: 42,
        fontWeight: 800,
        color,
        fontFamily: FONT_FAMILY,
        lineHeight: 1.1,
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontSize: 18,
        fontWeight: 600,
        color: "rgba(255,255,255,0.6)",
        fontFamily: FONT_FAMILY,
        textTransform: "uppercase",
        letterSpacing: 2,
        marginTop: 4,
      }}
    >
      {label}
    </span>
  </div>
);

// -- Takeaway box --
const TakeawayBox: React.FC<{
  text: string;
  opacity: number;
  y: number;
}> = ({ text, opacity, y }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${y}px)`,
      background: "rgba(246,199,68,0.12)",
      border: `2px solid ${YELLOW}`,
      borderRadius: 20,
      padding: "20px 28px",
      marginTop: 24,
      maxWidth: 900,
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ fontSize: 24, color: YELLOW, fontWeight: 800, fontFamily: FONT_FAMILY, flexShrink: 0 }}>
        💡
      </span>
      <p
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 22,
          fontWeight: 500,
          margin: 0,
          lineHeight: 1.5,
          fontFamily: FONT_FAMILY,
        }}
      >
        {text}
      </p>
    </div>
  </div>
);

// ============================================================
// SCENE 1: INTRO
// ============================================================
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "130M+" number animate
  const numReveal = interpolate(frame, [15, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const displayNum = Math.round(130 * numReveal);

  const hookOpacity = interpolate(frame, [5, 22], [0, 1], {
    extrapolateRight: "clamp",
  });
  const hookY = interpolate(frame, [5, 22], [50, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const titleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [25, 45], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineWidth = interpolate(frame, [40, 65], [0, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subtitleOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [fps * 3.5 - 12, fps * 3.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgScale = interpolate(frame, [0, 105], [1.05, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("nature-calm.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${bgScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,20,35,0.88) 0%, rgba(10,35,55,0.82) 50%, rgba(15,50,75,0.78) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.15)" x={540} y={600} size={700} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.2)" x={200} y={1200} size={600} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "0 60px",
          textAlign: "center",
        }}
      >
        {/* Big number */}
        <div
          style={{
            opacity: hookOpacity,
            transform: `translateY(${hookY}px)`,
          }}
        >
          <span
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: YELLOW,
              lineHeight: 1,
              letterSpacing: -4,
              textShadow: `0 4px 40px rgba(246,199,68,0.4)`,
            }}
          >
            {displayNum}M+
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginTop: 20,
          }}
        >
          <h1
            style={{
              color: WHITE,
              fontSize: 72,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: -2,
              textShadow: "0 4px 30px rgba(0,0,0,0.3)",
            }}
          >
            People Are Learning
            <br />
            About Depression
            <br />& Anxiety
          </h1>
        </div>

        <GoldLine width={lineWidth} marginTop={30} marginBottom={30} />

        {/* Subtitle */}
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 28,
            fontWeight: 500,
            margin: 0,
            opacity: subtitleOpacity,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Here's what's going viral — and why it matters
        </p>

        {/* Brand pill */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: subtitleOpacity * 0.6,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: YELLOW }} />
          <span
            style={{
              color: WHITE,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Refresh Psychiatry
          </span>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: YELLOW }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: VIRAL CARD 1 — TikTok / Dr. Julie Smith
// ============================================================
const ViralCard1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = CARDS[0];

  const cardSpring = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 100, mass: 0.9 } });
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 130 } });

  const titleOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [12, 28], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const creatorOpacity = interpolate(frame, [25, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stats counter animation
  const statsProgress = interpolate(frame, [40, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const statsOpacity = interpolate(frame, [38, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statsY = interpolate(frame, [38, 52], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const takeawayOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeawayY = interpolate(frame, [90, 110], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fadeOut = interpolate(frame, [140, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("bright-space.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(240,247,255,0.92) 0%, rgba(220,235,250,0.88) 100%)",
        }}
      />

      <RadialGlow color="rgba(43,108,176,0.1)" x={540} y={500} size={800} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          padding: "80px 50px",
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
      >
        {/* Scene number */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: DEEP_BLUE,
              color: YELLOW,
              fontSize: 20,
              fontWeight: 800,
              padding: "6px 20px",
              borderRadius: 30,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Card 1 of 4
          </div>
        </div>

        {/* Platform badge */}
        <PlatformBadge
          platform="TikTok"
          opacity={interpolate(badgeSpring, [0, 1], [0, 1])}
          scale={interpolate(badgeSpring, [0, 1], [0.7, 1])}
        />

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginTop: 36,
            maxWidth: 920,
          }}
        >
          <h2
            style={{
              color: DEEP_BLUE,
              fontSize: 48,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.25,
              textAlign: "center",
              letterSpacing: -1,
            }}
          >
            "{card.title}"
          </h2>
        </div>

        {/* Creator */}
        <div
          style={{
            opacity: creatorOpacity,
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${BLUE}, ${DEEP_BLUE})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: WHITE,
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            JS
          </div>
          <div>
            <p style={{ margin: 0, color: CHARCOAL, fontSize: 24, fontWeight: 700 }}>
              {card.creator}
            </p>
            <p style={{ margin: 0, color: BLUE, fontSize: 18, fontWeight: 500 }}>
              {card.creatorLabel}
            </p>
          </div>
        </div>

        <GoldLine width={200} marginTop={28} marginBottom={28} />

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 60,
            opacity: statsOpacity,
            transform: `translateY(${statsY}px)`,
          }}
        >
          <StatPill
            label="Views"
            value={animatedCount(card.views, statsProgress)}
            color={DEEP_BLUE}
            opacity={1}
            y={0}
          />
          <StatPill
            label="Likes"
            value={animatedCount(card.likes, statsProgress)}
            color={TIKTOK_RED}
            opacity={1}
            y={0}
          />
          <StatPill
            label="Comments"
            value={animatedCount(card.comments, statsProgress)}
            color={BLUE}
            opacity={1}
            y={0}
          />
        </div>

        {/* Takeaway */}
        <TakeawayBox text={card.takeaway} opacity={takeawayOpacity} y={takeawayY} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: VIRAL CARD 2 — Instagram / MHA (Myth vs Fact)
// ============================================================
const ViralCard2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = CARDS[1];

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const cardSpring = spring({ frame: frame - 3, fps, config: { damping: 13, stiffness: 110, mass: 0.9 } });

  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 130 } });

  // Myth items stagger
  const myth1Opacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const myth2Opacity = interpolate(frame, [26, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const myth3Opacity = interpolate(frame, [34, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Fact reveal
  const factOpacity = interpolate(frame, [52, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const factScale = spring({ frame: frame - 50, fps, config: { damping: 10, stiffness: 100 } });

  const creatorOpacity = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stats
  const statsProgress = interpolate(frame, [55, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const statsOpacity = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const takeawayOpacity = interpolate(frame, [100, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const takeawayY = interpolate(frame, [100, 118], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fadeOut = interpolate(frame, [140, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const myths = ["Laziness", "Weakness", "Drama"];

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("green-leaves.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(20,45,35,0.88) 0%, rgba(15,55,45,0.82) 50%, rgba(25,65,55,0.78) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.12)" x={540} y={900} size={700} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.15)" x={800} y={300} size={500} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          padding: "70px 50px",
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})`,
        }}
      >
        {/* Card number + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              color: YELLOW,
              fontSize: 20,
              fontWeight: 800,
              padding: "6px 20px",
              borderRadius: 30,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Card 2 of 4
          </div>
        </div>

        <PlatformBadge
          platform="Instagram"
          opacity={interpolate(badgeSpring, [0, 1], [0, 1])}
          scale={interpolate(badgeSpring, [0, 1], [0.7, 1])}
        />

        {/* Creator */}
        <div
          style={{
            opacity: creatorOpacity,
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${IG_PURPLE}, ${IG_PINK})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: WHITE,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            MH
          </div>
          <div>
            <p style={{ margin: 0, color: WHITE, fontSize: 22, fontWeight: 700 }}>{card.creator}</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 500 }}>
              {card.creatorLabel}
            </p>
          </div>
        </div>

        {/* Myth vs Fact split */}
        <div style={{ marginTop: 36, width: "100%", maxWidth: 900 }}>
          {/* MYTH section */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,100,100,0.9)",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Anxiety is NOT
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {myths.map((myth, i) => {
              const o = [myth1Opacity, myth2Opacity, myth3Opacity][i];
              return (
                <div
                  key={myth}
                  style={{
                    opacity: o,
                    background: "rgba(255,80,80,0.12)",
                    border: "2px solid rgba(255,80,80,0.3)",
                    borderRadius: 16,
                    padding: "16px 32px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: "rgba(255,130,130,0.9)",
                      textDecoration: o > 0.8 ? "line-through" : "none",
                    }}
                  >
                    {myth}
                  </span>
                </div>
              );
            })}
          </div>

          {/* FACT section */}
          <div
            style={{
              textAlign: "center",
              marginTop: 36,
              opacity: factOpacity,
              transform: `scale(${interpolate(factScale, [0, 1], [0.8, 1])})`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(100,220,150,0.9)",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Anxiety IS
            </span>
            <div
              style={{
                marginTop: 16,
                background: "rgba(100,220,150,0.1)",
                border: `2px solid rgba(100,220,150,0.35)`,
                borderRadius: 20,
                padding: "22px 40px",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: WHITE,
                  lineHeight: 1.2,
                }}
              >
                A Medical Condition
              </span>
            </div>
          </div>
        </div>

        <GoldLine width={180} marginTop={28} marginBottom={20} />

        {/* Stats */}
        <div style={{ display: "flex", gap: 50, opacity: statsOpacity }}>
          <StatPill label="Likes" value={animatedCount(card.likes, statsProgress)} color={IG_PINK} opacity={1} y={0} />
          <StatPill label="Shares" value={animatedCount(card.shares, statsProgress)} color={YELLOW} opacity={1} y={0} />
          <StatPill label="Saves" value={animatedCount(card.saves, statsProgress)} color="#64DC96" opacity={1} y={0} />
        </div>

        {/* Takeaway */}
        <TakeawayBox text={card.takeaway} opacity={takeawayOpacity} y={takeawayY} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: VIRAL CARD 3 — Instagram / CBT Reframing
// ============================================================
const ViralCard3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = CARDS[2];

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const cardSpring = spring({ frame: frame - 3, fps, config: { damping: 13, stiffness: 110, mass: 0.9 } });
  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 130 } });

  const creatorOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CBT reframing animation
  const anxietyThoughts = [
    { lie: "Everyone is judging me", truth: "Most people are focused on themselves" },
    { lie: "I can't handle this", truth: "I've gotten through hard things before" },
    { lie: "Something terrible will happen", truth: "I'm safe in this moment" },
  ];

  const thought1Frame = 25;
  const thought2Frame = 50;
  const thought3Frame = 75;

  // Each thought: appear, then cross-out lie, then show truth
  const getThoughtAnim = (startFrame: number) => {
    const lieOpacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const strikeProgress = interpolate(frame, [startFrame + 12, startFrame + 18], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const truthOpacity = interpolate(frame, [startFrame + 16, startFrame + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { lieOpacity, strikeProgress, truthOpacity };
  };

  const anims = [getThoughtAnim(thought1Frame), getThoughtAnim(thought2Frame), getThoughtAnim(thought3Frame)];

  // Stats
  const statsProgress = interpolate(frame, [70, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const statsOpacity = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const takeawayOpacity = interpolate(frame, [110, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const takeawayY = interpolate(frame, [110, 128], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fadeOut = interpolate(frame, [140, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("family-warm.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(45,20,60,0.88) 0%, rgba(60,30,80,0.82) 50%, rgba(80,40,100,0.78) 100%)",
        }}
      />

      <RadialGlow color="rgba(131,58,180,0.15)" x={540} y={500} size={800} opacity={1} />
      <RadialGlow color="rgba(246,199,68,0.1)" x={200} y={1400} size={600} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          padding: "70px 50px",
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              color: YELLOW,
              fontSize: 20,
              fontWeight: 800,
              padding: "6px 20px",
              borderRadius: 30,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Card 3 of 4
          </div>
        </div>

        <PlatformBadge
          platform="Instagram"
          opacity={interpolate(badgeSpring, [0, 1], [0, 1])}
          scale={interpolate(badgeSpring, [0, 1], [0.7, 1])}
        />

        {/* Creator */}
        <div
          style={{ opacity: creatorOpacity, marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #9B59B6, #E74C8B)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: WHITE,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            LO
          </div>
          <div>
            <p style={{ margin: 0, color: WHITE, fontSize: 22, fontWeight: 700 }}>{card.creator}</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 500 }}>
              {card.creatorLabel}
            </p>
          </div>
        </div>

        {/* Title quote */}
        <h2
          style={{
            color: YELLOW,
            fontSize: 52,
            fontWeight: 800,
            textAlign: "center",
            margin: "28px 0 0 0",
            lineHeight: 1.2,
            fontStyle: "italic",
          }}
        >
          {card.title}
        </h2>

        {/* CBT Reframing cards */}
        <div style={{ marginTop: 28, width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", gap: 16 }}>
          {anxietyThoughts.map((thought, i) => {
            const anim = anims[i];
            return (
              <div
                key={i}
                style={{
                  opacity: anim.lieOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "16px 24px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Lie (crossed out) */}
                <div style={{ flex: 1, position: "relative" }}>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,130,130,0.8)",
                      fontSize: 24,
                      fontWeight: 600,
                      textDecoration: anim.strikeProgress > 50 ? "line-through" : "none",
                      opacity: anim.strikeProgress > 50 ? 0.5 : 1,
                    }}
                  >
                    "{thought.lie}"
                  </p>
                </div>

                {/* Arrow */}
                <span
                  style={{
                    color: YELLOW,
                    fontSize: 28,
                    fontWeight: 800,
                    opacity: anim.truthOpacity,
                  }}
                >
                  →
                </span>

                {/* Truth */}
                <div style={{ flex: 1, opacity: anim.truthOpacity }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#64DC96",
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    "{thought.truth}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 50, marginTop: 24, opacity: statsOpacity }}>
          <StatPill label="Views" value={animatedCount(card.views, statsProgress)} color={WHITE} opacity={1} y={0} />
          <StatPill label="Likes" value={animatedCount(card.likes, statsProgress)} color={IG_PINK} opacity={1} y={0} />
          <StatPill label="Saves" value={animatedCount(card.saves, statsProgress)} color={YELLOW} opacity={1} y={0} />
        </div>

        {/* Takeaway */}
        <TakeawayBox text={card.takeaway} opacity={takeawayOpacity} y={takeawayY} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: VIRAL CARD 4 — TikTok / Morning Routine
// ============================================================
const ViralCard4Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = CARDS[3];

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const cardSpring = spring({ frame: frame - 3, fps, config: { damping: 13, stiffness: 110, mass: 0.9 } });
  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 130 } });

  const creatorOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [12, 28], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Routine items stagger
  const routineItems = [
    { emoji: "☀️", text: "Wake without phone — 10 min buffer" },
    { emoji: "💧", text: "Hydrate before caffeine" },
    { emoji: "🧘", text: "5-min grounding breathwork" },
    { emoji: "📝", text: "Write 3 things you're grateful for" },
    { emoji: "🚶", text: "10-min walk — no earbuds" },
  ];

  const getItemAnim = (index: number) => {
    const startFrame = 32 + index * 10;
    const o = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const x = interpolate(frame, [startFrame, startFrame + 10], [-40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { o, x };
  };

  // Stats
  const statsProgress = interpolate(frame, [85, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const statsOpacity = interpolate(frame, [85, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const takeawayOpacity = interpolate(frame, [115, 132], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const takeawayY = interpolate(frame, [115, 132], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fadeOut = interpolate(frame, [140, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("warm-sunset.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(40,25,10,0.88) 0%, rgba(60,35,15,0.82) 50%, rgba(80,45,20,0.78) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.15)" x={540} y={600} size={800} opacity={1} />
      <RadialGlow color="rgba(255,140,50,0.1)" x={200} y={1200} size={600} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          padding: "70px 50px",
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              color: YELLOW,
              fontSize: 20,
              fontWeight: 800,
              padding: "6px 20px",
              borderRadius: 30,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Card 4 of 4
          </div>
        </div>

        <PlatformBadge
          platform="TikTok"
          opacity={interpolate(badgeSpring, [0, 1], [0, 1])}
          scale={interpolate(badgeSpring, [0, 1], [0.7, 1])}
        />

        {/* Creator */}
        <div
          style={{ opacity: creatorOpacity, marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: TIKTOK_BLACK,
              border: `2px solid ${TIKTOK_CYAN}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: WHITE,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            JG
          </div>
          <div>
            <p style={{ margin: 0, color: WHITE, fontSize: 22, fontWeight: 700 }}>{card.creator}</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 500 }}>
              {card.creatorLabel}
            </p>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          <h2
            style={{
              color: WHITE,
              fontSize: 42,
              fontWeight: 800,
              textAlign: "center",
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: -1,
            }}
          >
            {card.title}
          </h2>
        </div>

        <GoldLine width={160} marginTop={20} marginBottom={16} />

        {/* Routine items */}
        <div style={{ width: "100%", maxWidth: 880, display: "flex", flexDirection: "column", gap: 12 }}>
          {routineItems.map((item, i) => {
            const anim = getItemAnim(i);
            return (
              <div
                key={i}
                style={{
                  opacity: anim.o,
                  transform: `translateX(${anim.x}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "14px 24px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ fontSize: 32 }}>{item.emoji}</span>
                <span
                  style={{
                    color: WHITE,
                    fontSize: 26,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 50, marginTop: 24, opacity: statsOpacity }}>
          <StatPill label="Views" value={animatedCount(card.views, statsProgress)} color={WHITE} opacity={1} y={0} />
          <StatPill label="Likes" value={animatedCount(card.likes, statsProgress)} color={TIKTOK_RED} opacity={1} y={0} />
          <StatPill label="Saves" value={animatedCount(card.saves, statsProgress)} color={YELLOW} opacity={1} y={0} />
        </div>

        {/* Takeaway */}
        <TakeawayBox text={card.takeaway} opacity={takeawayOpacity} y={takeawayY} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA / CLOSING
// ============================================================
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const headlineY = interpolate(frame, [0, 22], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineWidth = interpolate(frame, [15, 40], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ctaSpring = spring({ frame: frame - 28, fps, config: { damping: 10, stiffness: 100, mass: 0.9 } });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);
  const ctaOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const detailsOpacity = interpolate(frame, [42, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailsY = interpolate(frame, [42, 58], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const insuranceOpacity = interpolate(frame, [62, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = 0.15 + Math.sin(frame * 0.06) * 0.08;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("warm-sunset.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,25,45,0.85) 0%, rgba(15,40,65,0.78) 50%, rgba(20,55,85,0.72) 100%)",
        }}
      />

      <RadialGlow color={`rgba(246,199,68,${glowPulse})`} x={540} y={700} size={600} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.15)" x={150} y={1400} size={600} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.12)" x={950} y={300} size={450} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          position: "relative",
          padding: "0 70px",
          transform: `translateY(${headlineY}px)`,
        }}
      >
        {/* Summary stat */}
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: YELLOW,
              lineHeight: 1,
              textShadow: `0 4px 30px rgba(246,199,68,0.35)`,
            }}
          >
            130M+
          </span>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 24,
              fontWeight: 500,
              margin: "8px 0 0 0",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            views on mental health content
          </p>
        </div>

        <h2
          style={{
            color: WHITE,
            fontSize: 58,
            fontWeight: 800,
            margin: "20px 0 0 0",
            lineHeight: 1.2,
            letterSpacing: -1.5,
            textShadow: "0 4px 30px rgba(0,0,0,0.25)",
          }}
        >
          Your mental health
          <br />
          matters. We can help.
        </h2>

        <GoldLine width={lineWidth} marginTop={28} marginBottom={32} />

        {/* CTA Button */}
        <div style={{ opacity: ctaOpacity, transform: `scale(${ctaScale})` }}>
          <div
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${YELLOW} 0%, #E8B730 100%)`,
              color: CHARCOAL,
              fontSize: 34,
              fontWeight: 800,
              padding: "24px 60px",
              borderRadius: 60,
              letterSpacing: 1,
              textTransform: "uppercase",
              boxShadow: `0 8px 32px rgba(246,199,68,0.4), 0 2px 8px rgba(0,0,0,0.15)`,
            }}
          >
            Learn More
          </div>
        </div>

        {/* Contact */}
        <div style={{ opacity: detailsOpacity, transform: `translateY(${detailsY}px)`, marginTop: 36 }}>
          <p
            style={{
              color: WHITE,
              fontSize: 42,
              fontWeight: 700,
              margin: 0,
              letterSpacing: 2,
              textShadow: "0 2px 12px rgba(0,0,0,0.2)",
            }}
          >
            (954) 603-4081
          </p>
          <p
            style={{
              color: YELLOW,
              fontSize: 28,
              fontWeight: 600,
              margin: "12px 0 0 0",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            refreshpsychiatry.com
          </p>
        </div>

        {/* Insurance */}
        <div style={{ opacity: insuranceOpacity, marginTop: 36 }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              borderRadius: 30,
              padding: "12px 36px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 19,
                fontWeight: 500,
                margin: 0,
                letterSpacing: 2,
              }}
            >
              Aetna · United · Cigna · Humana · Avmed · UMR · Oscar
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const MyComp: React.FC = () => {
  const INTRO_DURATION = 105; // 3.5s
  const CARD_DURATION = 150; // 5s each x 4 = 600 frames
  const CTA_DURATION = 120; // 4s
  // Total: 105 + 600 + 120 = 825 frames

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <IntroScene />
      </Sequence>

      <Sequence from={INTRO_DURATION} durationInFrames={CARD_DURATION}>
        <ViralCard1Scene />
      </Sequence>

      <Sequence from={INTRO_DURATION + CARD_DURATION} durationInFrames={CARD_DURATION}>
        <ViralCard2Scene />
      </Sequence>

      <Sequence from={INTRO_DURATION + CARD_DURATION * 2} durationInFrames={CARD_DURATION}>
        <ViralCard3Scene />
      </Sequence>

      <Sequence from={INTRO_DURATION + CARD_DURATION * 3} durationInFrames={CARD_DURATION}>
        <ViralCard4Scene />
      </Sequence>

      <Sequence from={INTRO_DURATION + CARD_DURATION * 4} durationInFrames={CTA_DURATION}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
