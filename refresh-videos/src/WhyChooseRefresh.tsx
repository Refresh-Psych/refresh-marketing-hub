import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
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

// Platform colors
const INSTAGRAM_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";
const YOUTUBE_RED = "#FF0000";
const REDDIT_ORANGE = "#FF4500";

const FONT_FAMILY = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

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

// -- Platform badge component --
const PlatformBadge: React.FC<{
  platform: "Instagram" | "YouTube" | "Reddit";
  opacity: number;
}> = ({ platform, opacity }) => {
  const styles: Record<string, { bg: string; icon: string }> = {
    Instagram: { bg: INSTAGRAM_GRADIENT, icon: "\uD83D\uDCF7" },
    YouTube: { bg: YOUTUBE_RED, icon: "\u25B6" },
    Reddit: { bg: REDDIT_ORANGE, icon: "\uD83E\uDD16" },
  };
  const s = styles[platform];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: platform === "Instagram" ? s.bg : s.bg,
        padding: "10px 24px",
        borderRadius: 40,
        opacity,
      }}
    >
      <span style={{ fontSize: 22 }}>{s.icon}</span>
      <span
        style={{
          color: WHITE,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {platform}
      </span>
    </div>
  );
};

// -- Stat counter helper --
const AnimatedStat: React.FC<{
  frame: number;
  startFrame: number;
  value: string;
  label: string;
  color?: string;
  fontSize?: number;
}> = ({ frame, startFrame, value, label, color = WHITE, fontSize = 28 }) => {
  const opacity = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [startFrame, startFrame + 12], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        textAlign: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          color: YELLOW,
          fontSize: fontSize,
          fontWeight: 900,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color,
          fontSize: 14,
          fontWeight: 500,
          marginTop: 2,
          opacity: 0.8,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// -- Takeaway callout box --
const TakeawayBox: React.FC<{
  text: string;
  opacity: number;
  translateY?: number;
  accentColor?: string;
}> = ({ text, opacity, translateY = 0, accentColor = YELLOW }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(12px)",
      border: `2px solid ${accentColor}40`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 16,
      padding: "18px 28px",
      maxWidth: 780,
      margin: "0 auto",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <span
        style={{
          color: accentColor,
          fontSize: 22,
          fontWeight: 900,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        TAKEAWAY
      </span>
      <span
        style={{
          color: WHITE,
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  </div>
);

// ============================================================
// SCENE 1: Hook (0-120 frames, 4s)
// ============================================================
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const words = "The Mental Health Content People Can't Stop Sharing".split(" ");

  const bgShift = interpolate(frame, [0, 120], [0, 20], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle
  const subOpacity = interpolate(frame, [55, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [55, 68], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
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
          background: `linear-gradient(${135 + bgShift}deg, rgba(13,43,69,0.9) 0%, rgba(26,58,92,0.85) 50%, rgba(43,108,176,0.8) 100%)`,
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.14)" x={960} y={540} size={700} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.2)" x={200} y={300} size={500} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.15)" x={1700} y={800} size={450} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          position: "relative",
          padding: "0 120px",
        }}
      >
        {/* Theme label */}
        <div
          style={{
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginBottom: 24,
          }}
        >
          <span
            style={{
              color: YELLOW,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Content Strategies That Build Trust
          </span>
        </div>

        {/* Word-by-word reveal */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 20px",
          }}
        >
          {words.map((word, i) => {
            const wordStart = 12 + i * 8;
            const wordOpacity = interpolate(frame, [wordStart, wordStart + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const wordY = interpolate(frame, [wordStart, wordStart + 12], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            const isHighlight =
              word === "Can't" || word === "Stop" || word === "Sharing";

            return (
              <span
                key={i}
                style={{
                  color: isHighlight ? YELLOW : WHITE,
                  fontSize: 78,
                  fontWeight: 800,
                  letterSpacing: -2,
                  lineHeight: 1.2,
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  display: "inline-block",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 28,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            What content formats actually work in mental health
          </span>
        </div>
      </div>

      {/* Decorative watermark */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 40,
          fontSize: 350,
          fontWeight: 900,
          color: WHITE,
          opacity: 0.03,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        #
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: Card 1 - Instagram Carousel (120-270, 5s)
// ============================================================
const Card1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Card entrance
  const cardSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.9 },
  });
  const cardX = interpolate(cardSpring, [0, 1], [-200, 0]);
  const cardOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Carousel slide animation - slides stacking
  const slideOffsets = [0, 1, 2, 3].map((i) => {
    const slideStart = 25 + i * 12;
    const slideProgress = interpolate(frame, [slideStart, slideStart + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return slideProgress;
  });

  // Stats
  const statsOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Takeaway
  const takeawayOpacity = interpolate(frame, [90, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeawayY = interpolate(frame, [90, 105], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
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
            "linear-gradient(160deg, rgba(40,30,15,0.65) 0%, rgba(50,40,20,0.55) 50%, rgba(60,50,25,0.5) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.12)" x={960} y={540} size={800} opacity={1} />
      <RadialGlow color="rgba(200,100,200,0.1)" x={300} y={300} size={500} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "50px 80px",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Left: Carousel mockup */}
        <div
          style={{
            flex: "0 0 380px",
            opacity: cardOpacity,
            transform: `translateX(${cardX}px)`,
            position: "relative",
            height: 480,
          }}
        >
          {/* Stacking carousel slides */}
          {slideOffsets.map((progress, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: i * 12,
                width: 340,
                height: 440,
                borderRadius: 20,
                background: `linear-gradient(135deg, rgba(255,255,255,${0.95 - i * 0.15}) 0%, rgba(245,240,255,${0.9 - i * 0.15}) 100%)`,
                boxShadow: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0,0,0,${0.2 - i * 0.03})`,
                transform: `translateX(${(1 - progress) * 100}px) scale(${1 - i * 0.03})`,
                opacity: progress,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 28,
                zIndex: 4 - i,
              }}
            >
              {i === 0 && (
                <>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: INSTAGRAM_GRADIENT,
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 28, color: WHITE }}>IG</span>
                  </div>
                  <div
                    style={{
                      color: CHARCOAL,
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    "Things my therapist said that changed my life"
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      color: "#888",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    Carousel - 10 slides
                  </div>
                </>
              )}
              {i > 0 && (
                <div
                  style={{
                    color: "#aaa",
                    fontSize: 60,
                    fontWeight: 300,
                  }}
                >
                  {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Content info */}
        <div style={{ flex: 1 }}>
          {/* Platform badge */}
          <PlatformBadge platform="Instagram" opacity={cardOpacity} />

          {/* Title */}
          <h2
            style={{
              color: WHITE,
              fontSize: 40,
              fontWeight: 800,
              margin: "20px 0 8px 0",
              lineHeight: 1.2,
              letterSpacing: -1,
              opacity: cardOpacity,
              textShadow: "0 3px 20px rgba(0,0,0,0.3)",
            }}
          >
            "Things my therapist said that changed my life"
          </h2>

          {/* Creator */}
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 20,
              fontWeight: 500,
              marginBottom: 24,
              opacity: cardOpacity,
            }}
          >
            @theholisticpsychologist - Dr. Nicole LePera
          </div>

          <GoldLine
            width={interpolate(frame, [20, 45], [0, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}
            marginTop={0}
            marginBottom={24}
          />

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 40,
              opacity: statsOpacity,
              marginBottom: 28,
            }}
          >
            <AnimatedStat frame={frame} startFrame={60} value="3.8M" label="Likes" />
            <AnimatedStat frame={frame} startFrame={66} value="2.4M" label="Saves" />
            <AnimatedStat frame={frame} startFrame={72} value="890K" label="Shares" />
          </div>

          {/* Takeaway */}
          <TakeawayBox
            text={'Carousels with quotable therapy insights drive massive saves. The "save" metric is Instagram\'s strongest algorithm signal.'}
            opacity={takeawayOpacity}
            translateY={takeawayY}
          />
        </div>
      </div>

      {/* Card number */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          color: "rgba(255,255,255,0.1)",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        01
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: Card 2 - YouTube Documentary (270-420, 5s)
// ============================================================
const Card2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Hero number animation
  const heroSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });
  const heroScale = interpolate(heroSpring, [0, 1], [0.3, 1]);
  const heroOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title
  const titleOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [8, 22], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Stats row
  const statsOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Takeaway
  const takeawayOpacity = interpolate(frame, [85, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeawayY = interpolate(frame, [85, 100], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Play button pulse
  const playPulse = 0.9 + Math.sin(frame * 0.1) * 0.1;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
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
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(10,10,10,0.88) 0%, rgba(20,15,25,0.82) 50%, rgba(15,10,20,0.85) 100%)",
        }}
      />

      <RadialGlow color="rgba(255,0,0,0.08)" x={960} y={540} size={800} opacity={1} />
      <RadialGlow color="rgba(246,199,68,0.06)" x={200} y={800} size={500} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 100px",
        }}
      >
        {/* Platform badge */}
        <PlatformBadge
          platform="YouTube"
          opacity={interpolate(frame, [5, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />

        {/* Title */}
        <h2
          style={{
            color: WHITE,
            fontSize: 42,
            fontWeight: 800,
            margin: "20px 0 6px 0",
            lineHeight: 1.2,
            letterSpacing: -1,
            textAlign: "center",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: "0 3px 20px rgba(0,0,0,0.4)",
            maxWidth: 900,
          }}
        >
          "I asked 1,000 people what healed their anxiety"
        </h2>

        {/* Creator */}
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 20,
            fontWeight: 500,
            marginBottom: 10,
            opacity: titleOpacity,
          }}
        >
          @MedCircle - Mental Health Education - Documentary Short
        </div>

        <GoldLine
          width={interpolate(frame, [18, 40], [0, 250], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}
          marginTop={12}
          marginBottom={20}
        />

        {/* Hero number with play button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            opacity: heroOpacity,
            transform: `scale(${heroScale})`,
            marginBottom: 24,
          }}
        >
          {/* Play button */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: YOUTUBE_RED,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${30 * playPulse}px rgba(255,0,0,${0.4 * playPulse})`,
              transform: `scale(${playPulse})`,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "28px solid white",
                borderTop: "18px solid transparent",
                borderBottom: "18px solid transparent",
                marginLeft: 6,
              }}
            />
          </div>
          <div
            style={{
              color: YELLOW,
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            28.4M
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 28,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Views
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 60,
            opacity: statsOpacity,
            marginBottom: 28,
          }}
        >
          <AnimatedStat frame={frame} startFrame={55} value="1.2M" label="Likes" />
          <AnimatedStat frame={frame} startFrame={60} value="45K" label="Comments" />
        </div>

        {/* Takeaway */}
        <TakeawayBox
          text='Long-form "real people, real stories" content builds deep trust. YouTube rewards watch time over clicks.'
          opacity={takeawayOpacity}
          translateY={takeawayY}
        />
      </div>

      {/* Card number */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          color: "rgba(255,255,255,0.08)",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        02
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: Card 3 - Reddit AMA (420-570, 5s)
// ============================================================
const Card3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // AMA card entrance
  const cardSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 110, mass: 0.8 },
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1]);
  const cardOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Upvote counter animation
  const upvoteCount = Math.round(
    interpolate(frame, [30, 70], [0, 94000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  const upvoteDisplay =
    upvoteCount >= 1000
      ? `${(upvoteCount / 1000).toFixed(upvoteCount >= 10000 ? 0 : 1)}K`
      : String(upvoteCount);

  // Stats
  const statsOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Takeaway
  const takeawayOpacity = interpolate(frame, [90, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeawayY = interpolate(frame, [90, 105], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
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
            "linear-gradient(160deg, rgba(255,255,255,0.94) 0%, rgba(250,248,245,0.92) 50%, rgba(255,252,248,0.92) 100%)",
        }}
      />

      <RadialGlow color="rgba(255,69,0,0.06)" x={960} y={540} size={900} opacity={1} />
      <RadialGlow color="rgba(255,69,0,0.04)" x={300} y={200} size={500} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "50px 80px",
          gap: 50,
          alignItems: "center",
        }}
      >
        {/* Left: Upvote counter mockup */}
        <div
          style={{
            flex: "0 0 280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
          }}
        >
          {/* Upvote arrow */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "40px solid transparent",
              borderRight: "40px solid transparent",
              borderBottom: `60px solid ${REDDIT_ORANGE}`,
              marginBottom: 16,
            }}
          />
          {/* Count */}
          <div
            style={{
              color: REDDIT_ORANGE,
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {upvoteDisplay}
          </div>
          <div
            style={{
              color: "#888",
              fontSize: 18,
              fontWeight: 600,
              marginTop: 8,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Upvotes
          </div>
          {/* Downvote arrow */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "28px solid transparent",
              borderRight: "28px solid transparent",
              borderTop: "42px solid #ccc",
              marginTop: 16,
            }}
          />

          {/* Awards row */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 24,
              opacity: statsOpacity,
            }}
          >
            {["\uD83C\uDFC5", "\uD83E\uDD47", "\u2B50", "\uD83D\uDCA0"].map((emoji, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,69,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {emoji}
              </div>
            ))}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,69,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: REDDIT_ORANGE,
              }}
            >
              42
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div style={{ flex: 1 }}>
          {/* Platform badge */}
          <PlatformBadge platform="Reddit" opacity={cardOpacity} />

          {/* Subreddit tag */}
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,69,0,0.08)",
              border: `1px solid ${REDDIT_ORANGE}40`,
              borderRadius: 20,
              padding: "6px 16px",
              marginTop: 14,
              marginBottom: 14,
              opacity: cardOpacity,
            }}
          >
            <span
              style={{
                color: REDDIT_ORANGE,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              r/AMA - Verified Psychiatrist
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              color: CHARCOAL,
              fontSize: 36,
              fontWeight: 800,
              margin: "8px 0 8px 0",
              lineHeight: 1.3,
              letterSpacing: -0.5,
              opacity: cardOpacity,
            }}
          >
            "I'm a psychiatrist. AMA about medication, therapy, or anything
            mental health."
          </h2>

          <GoldLine
            width={interpolate(frame, [20, 45], [0, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}
            marginTop={10}
            marginBottom={20}
          />

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 40,
              opacity: statsOpacity,
              marginBottom: 24,
            }}
          >
            <AnimatedStat
              frame={frame}
              startFrame={55}
              value="94K"
              label="Upvotes"
              color={CHARCOAL}
              fontSize={30}
            />
            <AnimatedStat
              frame={frame}
              startFrame={60}
              value="4.2K"
              label="Comments"
              color={CHARCOAL}
              fontSize={30}
            />
            <AnimatedStat
              frame={frame}
              startFrame={65}
              value="42"
              label="Awards"
              color={CHARCOAL}
              fontSize={30}
            />
          </div>

          {/* Takeaway */}
          <div
            style={{
              opacity: takeawayOpacity,
              transform: `translateY(${takeawayY}px)`,
              background: "rgba(255,69,0,0.06)",
              border: `2px solid ${REDDIT_ORANGE}30`,
              borderLeft: `4px solid ${REDDIT_ORANGE}`,
              borderRadius: 16,
              padding: "18px 28px",
              maxWidth: 780,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span
                style={{
                  color: REDDIT_ORANGE,
                  fontSize: 22,
                  fontWeight: 900,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                TAKEAWAY
              </span>
              <span
                style={{
                  color: CHARCOAL,
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                Reddit AMAs build credibility. Q&A format lets clinicians address real
                fears with authentic answers.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card number */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          color: "rgba(0,0,0,0.05)",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        03
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: Card 4 - YouTube React Video (570-720, 5s)
// ============================================================
const Card4Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Card entrance from right
  const cardSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.9 },
  });
  const cardX = interpolate(cardSpring, [0, 1], [200, 0]);
  const cardOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Play button pulse
  const playPulse = 0.9 + Math.sin(frame * 0.12) * 0.1;

  // Stats
  const statsOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Takeaway
  const takeawayOpacity = interpolate(frame, [85, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeawayY = interpolate(frame, [85, 100], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "Expert Reacts" badge
  const badgeSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 8, stiffness: 120, mass: 0.7 },
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.5, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
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
            "linear-gradient(160deg, rgba(30,15,10,0.82) 0%, rgba(40,20,15,0.75) 50%, rgba(50,25,15,0.78) 100%)",
        }}
      />

      <RadialGlow color="rgba(255,0,0,0.08)" x={960} y={540} size={800} opacity={1} />
      <RadialGlow color="rgba(246,199,68,0.08)" x={1600} y={300} size={500} opacity={1} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "50px 80px",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Left: Content */}
        <div style={{ flex: 1 }}>
          {/* Platform badge */}
          <PlatformBadge platform="YouTube" opacity={cardOpacity} />

          {/* Expert Reacts badge */}
          <div
            style={{
              display: "inline-block",
              marginTop: 16,
              marginLeft: 12,
              opacity: cardOpacity,
              transform: `scale(${badgeScale})`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${YELLOW} 0%, #E8B730 100%)`,
                color: CHARCOAL,
                padding: "8px 20px",
                borderRadius: 30,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              #1 Performing Long-Form Format
            </div>
          </div>

          {/* Title */}
          <h2
            style={{
              color: WHITE,
              fontSize: 38,
              fontWeight: 800,
              margin: "20px 0 8px 0",
              lineHeight: 1.3,
              letterSpacing: -0.5,
              opacity: cardOpacity,
              transform: `translateX(${-cardX}px)`,
              textShadow: "0 3px 20px rgba(0,0,0,0.3)",
              maxWidth: 800,
            }}
          >
            "Psychiatrist reacts to viral mental health TikToks — are they accurate?"
          </h2>

          {/* Creator */}
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 20,
              fontWeight: 500,
              marginBottom: 20,
              opacity: cardOpacity,
            }}
          >
            @DoctorTracey - Board-Certified Psychiatrist
          </div>

          <GoldLine
            width={interpolate(frame, [20, 45], [0, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}
            marginTop={0}
            marginBottom={24}
          />

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 50,
              opacity: statsOpacity,
              marginBottom: 28,
            }}
          >
            <AnimatedStat frame={frame} startFrame={50} value="11.8M" label="Views" fontSize={34} />
            <AnimatedStat frame={frame} startFrame={56} value="680K" label="Likes" fontSize={34} />
            <AnimatedStat frame={frame} startFrame={62} value="22K" label="Comments" fontSize={34} />
          </div>

          {/* Takeaway */}
          <TakeawayBox
            text='"Expert reacts" is the highest-performing long-form format. Positions you as authority while riding viral content momentum.'
            opacity={takeawayOpacity}
            translateY={takeawayY}
          />
        </div>

        {/* Right: Video player mockup */}
        <div
          style={{
            flex: "0 0 420px",
            opacity: cardOpacity,
            transform: `translateX(${cardX}px)`,
          }}
        >
          <div
            style={{
              width: 420,
              height: 280,
              borderRadius: 20,
              background: "rgba(0,0,0,0.5)",
              border: "2px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Fake video thumbnail */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)",
              }}
            />
            {/* Doctor icon */}
            <div
              style={{
                position: "absolute",
                left: 30,
                top: 30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              {"\uD83E\uDDD1\u200D\u2695\uFE0F"}
            </div>
            {/* VS text */}
            <div
              style={{
                color: YELLOW,
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: 4,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              REACTS
            </div>
            {/* TikTok icon */}
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              {"\uD83C\uDFA5"}
            </div>
            {/* Play button overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: `translateX(-50%) scale(${playPulse})`,
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: YOUTUBE_RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${20 * playPulse}px rgba(255,0,0,0.5)`,
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "22px solid white",
                  borderTop: "14px solid transparent",
                  borderBottom: "14px solid transparent",
                  marginLeft: 4,
                }}
              />
            </div>
            {/* YouTube progress bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: "rgba(255,255,255,0.2)",
              }}
            >
              <div
                style={{
                  width: `${interpolate(frame, [20, 130], [0, 65], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}%`,
                  height: "100%",
                  background: YOUTUBE_RED,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          {/* View count below video */}
          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              opacity: statsOpacity,
            }}
          >
            <span
              style={{
                color: YELLOW,
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              11.8M
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 22,
                fontWeight: 600,
                marginLeft: 12,
              }}
            >
              views
            </span>
          </div>
        </div>
      </div>

      {/* Card number */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          color: "rgba(255,255,255,0.08)",
          fontSize: 140,
          fontWeight: 900,
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        04
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA (600-750 frames, 5s)
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

  const ctaSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 100, mass: 0.9 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);
  const ctaOpacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const detailsOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailsY = interpolate(frame, [40, 55], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const insuranceOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const brandOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow on CTA
  const glowPulse = 0.4 + Math.sin(frame * 0.08) * 0.15;

  const bgShift = interpolate(frame, [0, 150], [0, 12], {
    extrapolateRight: "clamp",
  });

  const insurers = ["Aetna", "United", "Cigna", "Humana", "Avmed", "UMR", "Oscar"];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
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
          background: `linear-gradient(${150 + bgShift}deg, rgba(13,43,69,0.75) 0%, rgba(26,58,92,0.7) 35%, rgba(43,108,176,0.65) 70%, rgba(59,130,196,0.7) 100%)`,
        }}
      />

      <RadialGlow
        color={`rgba(246,199,68,${glowPulse * 0.3})`}
        x={960}
        y={480}
        size={600}
        opacity={1}
      />
      <RadialGlow color="rgba(59,130,196,0.15)" x={200} y={800} size={600} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.12)" x={1700} y={200} size={450} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          position: "relative",
          padding: "0 100px",
          transform: `translateY(${headlineY}px)`,
        }}
      >
        <h2
          style={{
            color: WHITE,
            fontSize: 60,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: -2,
            textShadow: "0 4px 30px rgba(0,0,0,0.25)",
          }}
        >
          Ready to Create Content That{" "}
          <span style={{ color: YELLOW }}>Connects?</span>
        </h2>

        <GoldLine width={lineWidth} marginTop={20} marginBottom={24} />

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${YELLOW} 0%, #E8B730 100%)`,
              color: CHARCOAL,
              fontSize: 32,
              fontWeight: 800,
              padding: "22px 64px",
              borderRadius: 60,
              letterSpacing: 1,
              textTransform: "uppercase",
              boxShadow: `0 0 ${40 + glowPulse * 40}px rgba(246,199,68,${glowPulse}), 0 8px 32px rgba(246,199,68,0.35)`,
            }}
          >
            Schedule a Consultation
          </div>
        </div>

        {/* Contact details */}
        <div
          style={{
            opacity: detailsOpacity,
            transform: `translateY(${detailsY}px)`,
            marginTop: 28,
          }}
        >
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
              fontSize: 26,
              fontWeight: 600,
              margin: "10px 0 0 0",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            refreshpsychiatry.com
          </p>
        </div>

        {/* Insurance badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 24,
            opacity: insuranceOpacity,
            flexWrap: "wrap",
          }}
        >
          {insurers.map((name, i) => {
            const badgeDelay = 60 + i * 4;
            const badgeSpring2 = spring({
              frame: frame - badgeDelay,
              fps,
              config: { damping: 10, stiffness: 150, mass: 0.6 },
            });
            const bScale = interpolate(badgeSpring2, [0, 1], [0.5, 1]);
            return (
              <div
                key={name}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 30,
                  padding: "8px 22px",
                  transform: `scale(${bScale})`,
                }}
              >
                <span
                  style={{
                    color: WHITE,
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  {name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Brand pill */}
        <div
          style={{
            opacity: brandOpacity,
            marginTop: 28,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: YELLOW,
            }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Refresh Psychiatry & Therapy
          </span>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: YELLOW,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const WhyChooseRefresh: React.FC = () => {
  // 750 total frames @ 30fps = 25s
  // Hook: 90 frames (3s) | Cards 1-4: 135 frames each (4.5s) | CTA: 120 frames (4s)
  const HOOK_DURATION = 90;
  const CARD_DURATION = 135;
  const CTA_DURATION = 120;

  const card1Start = HOOK_DURATION;
  const card2Start = card1Start + CARD_DURATION;
  const card3Start = card2Start + CARD_DURATION;
  const card4Start = card3Start + CARD_DURATION;
  const ctaStart = card4Start + CARD_DURATION;

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={HOOK_DURATION}>
        <HookScene />
      </Sequence>

      <Sequence from={card1Start} durationInFrames={CARD_DURATION}>
        <Card1Scene />
      </Sequence>

      <Sequence from={card2Start} durationInFrames={CARD_DURATION}>
        <Card2Scene />
      </Sequence>

      <Sequence from={card3Start} durationInFrames={CARD_DURATION}>
        <Card3Scene />
      </Sequence>

      <Sequence from={card4Start} durationInFrames={CARD_DURATION}>
        <Card4Scene />
      </Sequence>

      <Sequence from={ctaStart} durationInFrames={CTA_DURATION}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
