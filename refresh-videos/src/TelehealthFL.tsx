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

const FONT_FAMILY = "'Montserrat', 'Poppins', 'DM Sans', sans-serif";

// -- Platform badge colors --
const TIKTOK_BLACK = "#000000";
const LINKEDIN_BLUE = "#0A66C2";
const INSTAGRAM_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";

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
  platform: "TikTok" | "LinkedIn" | "Instagram";
}> = ({ platform }) => {
  const bgMap = {
    TikTok: TIKTOK_BLACK,
    LinkedIn: LINKEDIN_BLUE,
    Instagram: "transparent",
  };
  const isInstagram = platform === "Instagram";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: isInstagram ? INSTAGRAM_GRADIENT : bgMap[platform],
        color: WHITE,
        fontSize: 18,
        fontWeight: 700,
        padding: "8px 20px",
        borderRadius: 30,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {platform === "TikTok" && (
        <span style={{ fontSize: 16 }}>&#9835;</span>
      )}
      {platform === "LinkedIn" && (
        <span style={{ fontSize: 16, fontWeight: 900 }}>in</span>
      )}
      {platform === "Instagram" && (
        <span style={{ fontSize: 16 }}>&#9737;</span>
      )}
      {platform}
    </div>
  );
};

// -- Animated stat counter --
const AnimatedStat: React.FC<{
  value: string;
  label: string;
  frame: number;
  delay: number;
  fps: number;
  color?: string;
  size?: number;
}> = ({ value, label, frame, delay, fps, color = YELLOW, size = 64 }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });
  const scale = interpolate(s, [0, 1], [0.3, 1]);
  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          color,
          fontSize: size,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1,
          textShadow: `0 4px 24px ${color}44`,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 20,
          fontWeight: 600,
          marginTop: 6,
          letterSpacing: 1,
          textTransform: "uppercase",
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
  frame: number;
  delay: number;
  fps: number;
}> = ({ text, frame, delay, fps }) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 90, mass: 0.9 },
  });
  const slideX = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${slideX}px)`,
        background: "rgba(246,199,68,0.12)",
        border: `2px solid ${YELLOW}55`,
        borderLeft: `4px solid ${YELLOW}`,
        borderRadius: 12,
        padding: "16px 24px",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          color: WHITE,
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.5,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <span style={{ color: YELLOW, fontSize: 22, flexShrink: 0, marginTop: 2 }}>
          &#9889;
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
};

// ============================================================
// SCENE 1: Hook (0-105 frames, 3.5s)
// "The Future of Psychiatry Is Already Here" word-by-word
// ============================================================
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const words = "The Future of Psychiatry Is Already Here".split(" ");

  const bgShift = interpolate(frame, [0, 105], [0, 15], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [90, 105], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + bgShift}deg, #0d2b45 0%, ${DEEP_BLUE} 30%, ${BLUE} 65%, #3b82c4 100%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("cozy-home.jpg")}
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
            "linear-gradient(135deg, rgba(13,43,69,0.88) 0%, rgba(26,58,92,0.80) 50%, rgba(43,108,176,0.75) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.14)" x={960} y={540} size={700} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.2)" x={200} y={300} size={500} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.15)" x={1700} y={800} size={450} opacity={1} />

      {/* Subtle futuristic watermark */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 30,
          fontSize: 300,
          fontWeight: 900,
          color: WHITE,
          opacity: 0.03,
          lineHeight: 1,
          userSelect: "none",
          letterSpacing: -10,
        }}
      >
        2026
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(8px)",
            borderRadius: 30,
            padding: "10px 32px",
            border: "1px solid rgba(255,255,255,0.1)",
            opacity: interpolate(frame, [2, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Telehealth &middot; Pharmacogenomics &middot; Growth
          </span>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          position: "relative",
          padding: "0 120px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 22px",
        }}
      >
        {words.map((word, i) => {
          const wordStart = 8 + i * 8;
          const wordOpacity = interpolate(frame, [wordStart, wordStart + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wordY = interpolate(frame, [wordStart, wordStart + 10], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          const isHighlight = word === "Future" || word === "Here";

          return (
            <span
              key={i}
              style={{
                color: isHighlight ? YELLOW : WHITE,
                fontSize: 86,
                fontWeight: 800,
                letterSpacing: -2,
                lineHeight: 1.2,
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                textShadow: isHighlight
                  ? "0 4px 30px rgba(246,199,68,0.4), 0 2px 12px rgba(0,0,0,0.3)"
                  : "0 4px 30px rgba(0,0,0,0.3)",
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: Card 1 - TikTok Telehealth (105-240 frames, 4.5s)
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

  // Laptop mockup slide in
  const laptopSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });
  const laptopX = interpolate(laptopSpring, [0, 1], [-200, 0]);
  const laptopOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
            "linear-gradient(165deg, rgba(255,255,255,0.88) 0%, rgba(248,250,255,0.85) 50%, rgba(240,247,255,0.87) 100%)",
        }}
      />

      <RadialGlow color="rgba(0,0,0,0.04)" x={400} y={540} size={800} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.06)" x={1400} y={400} size={600} opacity={1} />

      {/* Two-column layout */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          zIndex: 1,
          position: "relative",
          padding: "60px 80px",
          alignItems: "center",
        }}
      >
        {/* Left: Laptop mockup */}
        <div
          style={{
            flex: "0 0 45%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: laptopOpacity,
            transform: `translateX(${laptopX}px)`,
          }}
        >
          <div
            style={{
              width: 580,
              height: 380,
              borderRadius: 20,
              background: CHARCOAL,
              padding: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            {/* Screen */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${BLUE}22 0%, ${DEEP_BLUE}33 100%)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {/* Video call UI mockup */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${DEEP_BLUE} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 48, color: WHITE, fontWeight: 900 }}>Dr</span>
              </div>
              <div style={{ color: DEEP_BLUE, fontSize: 20, fontWeight: 700 }}>
                Telehealth Session in Progress
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 8,
                }}
              >
                {["Mic", "Video", "Chat"].map((btn) => (
                  <div
                    key={btn}
                    style={{
                      background: `${BLUE}22`,
                      borderRadius: 20,
                      padding: "8px 20px",
                      color: BLUE,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {btn}
                  </div>
                ))}
              </div>
            </div>
            {/* Laptop base */}
            <div
              style={{
                position: "absolute",
                bottom: -16,
                left: "10%",
                right: "10%",
                height: 16,
                background: CHARCOAL,
                borderRadius: "0 0 8px 8px",
              }}
            />
          </div>
        </div>

        {/* Right: Content */}
        <div
          style={{
            flex: "0 0 55%",
            paddingLeft: 60,
          }}
        >
          <div
            style={{
              opacity: interpolate(frame, [15, 28], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <PlatformBadge platform="TikTok" />
          </div>

          <h2
            style={{
              color: DEEP_BLUE,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: -1,
              margin: "20px 0 8px 0",
              lineHeight: 1.25,
              opacity: interpolate(frame, [20, 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            "What a telehealth psychiatry appointment actually looks like"
          </h2>

          <div
            style={{
              color: CHARCOAL,
              fontSize: 18,
              fontWeight: 500,
              opacity: interpolate(frame, [28, 40], [0, 0.6], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              marginBottom: 20,
            }}
          >
            @drkarenatyah &middot; Telepsychiatrist
          </div>

          {/* Hero stat */}
          <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
            <AnimatedStat value="14.2M" label="Views" frame={frame} delay={35} fps={fps} color={BLUE} size={56} />
            <AnimatedStat value="2.1M" label="Likes" frame={frame} delay={42} fps={fps} color={BLUE} size={42} />
            <AnimatedStat value="38K" label="Comments" frame={frame} delay={49} fps={fps} color={BLUE} size={42} />
          </div>

          <TakeawayBox
            text={`"Day in the life" and "what to expect" content crushes fear-based barriers. Directly drives bookings.`}
            frame={frame}
            delay={55}
            fps={fps}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: Card 2 - LinkedIn Growth (240-375 frames, 4.5s)
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

  // Counter animation: 200 -> 2000
  const counterProgress = interpolate(frame, [35, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const counterValue = Math.round(200 + counterProgress * 1800);

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
            "linear-gradient(155deg, rgba(13,43,69,0.90) 0%, rgba(26,58,92,0.82) 50%, rgba(10,102,194,0.75) 100%)",
        }}
      />

      <RadialGlow color="rgba(10,102,194,0.2)" x={960} y={300} size={700} opacity={1} />
      <RadialGlow color="rgba(246,199,68,0.1)" x={200} y={700} size={500} opacity={1} />

      {/* LinkedIn-style header bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: LINKEDIN_BLUE,
          zIndex: 2,
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          zIndex: 1,
          position: "relative",
          padding: "70px 80px",
          alignItems: "center",
        }}
      >
        {/* Left: Content */}
        <div style={{ flex: "0 0 55%", paddingRight: 40 }}>
          <div
            style={{
              opacity: interpolate(frame, [8, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <PlatformBadge platform="LinkedIn" />
          </div>

          <h2
            style={{
              color: WHITE,
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: -0.5,
              margin: "20px 0 8px 0",
              lineHeight: 1.3,
              opacity: interpolate(frame, [15, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            "We went from 200 to 2,000 patients in 18 months. Here's our playbook."
          </h2>

          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 17,
              fontWeight: 500,
              marginBottom: 24,
              opacity: interpolate(frame, [22, 34], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            CEO of a multi-location psychiatric group
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
            <AnimatedStat value="28K" label="Reactions" frame={frame} delay={35} fps={fps} size={40} />
            <AnimatedStat value="1.8K" label="Comments" frame={frame} delay={40} fps={fps} size={40} />
            <AnimatedStat value="4.2K" label="Reposts" frame={frame} delay={45} fps={fps} size={40} />
          </div>

          <TakeawayBox
            text="LinkedIn growth stories attract referral partners and potential hires. Dr. Nepa sharing Refresh's 10-location story would be extremely high-value."
            frame={frame}
            delay={55}
            fps={fps}
          />
        </div>

        {/* Right: Animated counter */}
        <div
          style={{
            flex: "0 0 45%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              opacity: interpolate(frame, [30, 45], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                borderRadius: 32,
                padding: "48px 56px",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Patient Growth
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 24,
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 52, fontWeight: 800 }}>
                  200
                </div>
                <div
                  style={{
                    color: YELLOW,
                    fontSize: 40,
                    fontWeight: 900,
                    opacity: interpolate(frame, [40, 50], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  &#8594;
                </div>
                <div
                  style={{
                    color: YELLOW,
                    fontSize: 72,
                    fontWeight: 900,
                    textShadow: `0 4px 30px ${YELLOW}44`,
                    letterSpacing: -2,
                  }}
                >
                  {counterValue.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 16,
                  fontWeight: 500,
                  marginTop: 12,
                }}
              >
                in 18 months
              </div>

              {/* Dr. Nepa mention */}
              <div
                style={{
                  marginTop: 28,
                  background: `${YELLOW}18`,
                  border: `1px solid ${YELLOW}33`,
                  borderRadius: 16,
                  padding: "14px 20px",
                  opacity: interpolate(frame, [75, 90], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <div style={{ color: YELLOW, fontSize: 16, fontWeight: 700 }}>
                  Dr. Nepa &middot; Refresh Psychiatry
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                  10 Florida locations and growing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: Card 3 - Pharmacogenomics (375-510 frames, 4.5s)
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

  // DNA helix animation
  const helixRotation = interpolate(frame, [0, 135], [0, 360], {
    extrapolateRight: "clamp",
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
            "linear-gradient(155deg, rgba(13,60,60,0.90) 0%, rgba(15,80,80,0.82) 50%, rgba(20,100,100,0.78) 100%)",
        }}
      />

      <RadialGlow color="rgba(0,180,180,0.15)" x={960} y={540} size={800} opacity={1} />
      <RadialGlow color="rgba(246,199,68,0.08)" x={1600} y={300} size={500} opacity={1} />

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          zIndex: 1,
          position: "relative",
          padding: "60px 80px",
          alignItems: "center",
        }}
      >
        {/* Left: DNA concept */}
        <div
          style={{
            flex: "0 0 40%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 340,
              height: 420,
              opacity: interpolate(frame, [10, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {/* DNA helix visualization with CSS */}
            {Array.from({ length: 12 }).map((_, i) => {
              const yPos = 20 + i * 34;
              const xOffset = Math.sin((helixRotation * Math.PI) / 180 + i * 0.6) * 60;
              const xOffset2 = Math.sin((helixRotation * Math.PI) / 180 + i * 0.6 + Math.PI) * 60;
              const dotOpacity = 0.3 + Math.abs(Math.sin((helixRotation * Math.PI) / 180 + i * 0.6)) * 0.7;

              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      position: "absolute",
                      left: 170 + xOffset - 10,
                      top: yPos,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: YELLOW,
                      opacity: dotOpacity,
                      boxShadow: `0 0 12px ${YELLOW}66`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 170 + xOffset2 - 8,
                      top: yPos + 4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "rgba(0,220,220,0.7)",
                      opacity: dotOpacity,
                      boxShadow: "0 0 12px rgba(0,220,220,0.4)",
                    }}
                  />
                  {/* Connecting bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: Math.min(170 + xOffset, 170 + xOffset2),
                      top: yPos + 8,
                      width: Math.abs(xOffset - xOffset2),
                      height: 2,
                      background: "rgba(255,255,255,0.15)",
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Center label */}
            <div
              style={{
                position: "absolute",
                bottom: -10,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Pharmacogenomics
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div style={{ flex: "0 0 60%", paddingLeft: 40 }}>
          <div
            style={{
              opacity: interpolate(frame, [8, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <PlatformBadge platform="Instagram" />
          </div>

          <h2
            style={{
              color: WHITE,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.5,
              margin: "18px 0 8px 0",
              lineHeight: 1.3,
              opacity: interpolate(frame, [15, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            "Why the same medication works for your friend but not for you — pharmacogenomics explained"
          </h2>

          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 17,
              fontWeight: 500,
              marginBottom: 20,
              opacity: interpolate(frame, [22, 34], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            @pharmacogenomics_today &middot; Science Page
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
            <AnimatedStat value="1.6M" label="Likes" frame={frame} delay={35} fps={fps} size={44} />
            <AnimatedStat value="890K" label="Saves" frame={frame} delay={40} fps={fps} size={52} color={YELLOW} />
            <AnimatedStat value="340K" label="Shares" frame={frame} delay={45} fps={fps} size={44} />
          </div>

          <TakeawayBox
            text="Pharmacogenomics is a MASSIVE content gap with huge viral potential. Refresh offers this service — positioning the practice as cutting-edge."
            frame={frame}
            delay={55}
            fps={fps}
          />

          {/* Refresh offers this badge */}
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: `${YELLOW}22`,
              border: `2px solid ${YELLOW}55`,
              borderRadius: 30,
              padding: "10px 24px",
              opacity: interpolate(frame, [75, 90], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span style={{ color: YELLOW, fontSize: 20 }}>&#10003;</span>
            <span style={{ color: YELLOW, fontSize: 18, fontWeight: 700 }}>
              Refresh Psychiatry offers pharmacogenomic testing
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: Refresh Highlight (510-615 frames, 3.5s)
// "Refresh Psychiatry Does ALL of This"
// ============================================================
const RefreshHighlightScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [90, 105], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const features = [
    { text: "Telehealth Psychiatry", icon: "&#128187;" },
    { text: "Pharmacogenomic Testing", icon: "&#129516;" },
    { text: "10 Florida Locations", icon: "&#128205;" },
    { text: "7 Days a Week", icon: "&#128197;" },
  ];

  const glowPulse = 0.5 + Math.sin(frame * 0.1) * 0.2;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        opacity,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("florida-palms.jpg")}
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
          background: `linear-gradient(155deg, rgba(26,58,92,0.92) 0%, rgba(43,108,176,0.85) 50%, rgba(26,58,92,0.88) 100%)`,
        }}
      />

      <RadialGlow color={`rgba(246,199,68,${glowPulse * 0.25})`} x={960} y={540} size={900} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.2)" x={200} y={200} size={500} opacity={1} />
      <RadialGlow color="rgba(43,108,176,0.15)" x={1700} y={800} size={500} opacity={1} />

      {/* Subtle brand watermark */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 30,
          fontSize: 280,
          fontWeight: 900,
          color: WHITE,
          opacity: 0.02,
          lineHeight: 1,
          userSelect: "none",
          letterSpacing: -8,
        }}
      >
        RP
      </div>

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "0 100px",
        }}
      >
        {/* Heading */}
        <div
          style={{
            opacity: interpolate(frame, [5, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [5, 20], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <h2
            style={{
              color: WHITE,
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: -2,
              margin: 0,
              textShadow: "0 4px 30px rgba(0,0,0,0.25)",
            }}
          >
            Refresh Psychiatry Does{" "}
            <span
              style={{
                color: YELLOW,
                textShadow: `0 4px 30px ${YELLOW}44`,
              }}
            >
              ALL
            </span>{" "}
            of This
          </h2>
        </div>

        <GoldLine
          width={interpolate(frame, [12, 30], [0, 300], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}
          marginTop={20}
          marginBottom={40}
        />

        {/* Feature checklist - horizontal */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          {features.map((feature, i) => {
            const itemDelay = 22 + i * 12;
            const itemSpring = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 10, stiffness: 120, mass: 0.8 },
            });
            const itemScale = interpolate(itemSpring, [0, 1], [0.5, 1]);
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 24,
                  padding: "32px 36px",
                  width: 350,
                  opacity: itemOpacity,
                  transform: `scale(${itemScale})`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                {/* Checkmark circle */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${YELLOW} 0%, #E8B730 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 4px 20px ${YELLOW}44`,
                  }}
                >
                  <span
                    style={{
                      color: CHARCOAL,
                      fontSize: 28,
                      fontWeight: 900,
                    }}
                  >
                    &#10003;
                  </span>
                </div>

                <span
                  style={{
                    color: WHITE,
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                  }}
                >
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Brand moment glow text */}
        <div
          style={{
            marginTop: 36,
            opacity: interpolate(frame, [75, 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            The Future Is Already Here
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA (615-720 frames, 3.5s)
// "Experience the Future of Psychiatry"
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

  const lineWidth = interpolate(frame, [15, 40], [0, 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ctaSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 100, mass: 0.9 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);
  const ctaOpacity = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const detailsOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailsY = interpolate(frame, [30, 45], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const insuranceOpacity = interpolate(frame, [48, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const brandOpacity = interpolate(frame, [58, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = 0.4 + Math.sin(frame * 0.08) * 0.15;

  const bgShift = interpolate(frame, [0, 105], [0, 10], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${150 + bgShift}deg, #0d2b45 0%, ${DEEP_BLUE} 35%, ${BLUE} 70%, #3b82c4 100%)`,
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
          background:
            "linear-gradient(150deg, rgba(13,43,69,0.78) 0%, rgba(26,58,92,0.68) 35%, rgba(43,108,176,0.62) 100%)",
        }}
      />

      <RadialGlow color={`rgba(246,199,68,${glowPulse * 0.3})`} x={960} y={480} size={600} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.15)" x={200} y={800} size={600} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.12)" x={1700} y={200} size={450} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          padding: "0 100px",
          position: "relative",
          transform: `translateY(${headlineY}px)`,
        }}
      >
        <h2
          style={{
            color: WHITE,
            fontSize: 62,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: -2,
            textShadow: "0 4px 30px rgba(0,0,0,0.25)",
          }}
        >
          Experience the{" "}
          <span style={{ color: YELLOW }}>Future</span>
          <br />
          of Psychiatry
        </h2>

        <GoldLine width={lineWidth} marginTop={20} marginBottom={28} />

        {/* CTA Button */}
        <div style={{ opacity: ctaOpacity, transform: `scale(${ctaScale})` }}>
          <div
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${YELLOW} 0%, #E8B730 100%)`,
              color: CHARCOAL,
              fontSize: 34,
              fontWeight: 800,
              padding: "22px 64px",
              borderRadius: 60,
              letterSpacing: 1,
              textTransform: "uppercase",
              boxShadow: `0 0 ${40 + glowPulse * 40}px rgba(246,199,68,${glowPulse}), 0 8px 32px rgba(246,199,68,0.35), 0 2px 8px rgba(0,0,0,0.15)`,
            }}
          >
            Book Your Visit Today
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
              fontSize: 40,
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
              margin: "12px 0 0 0",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            refreshpsychiatry.com
          </p>
        </div>

        {/* Insurance pill */}
        <div style={{ opacity: insuranceOpacity, marginTop: 22 }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              borderRadius: 30,
              padding: "11px 34px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 18,
                fontWeight: 500,
                margin: 0,
                letterSpacing: 2,
              }}
            >
              Aetna &middot; United &middot; Cigna &middot; Humana &middot; Avmed &middot; UMR &middot; Oscar
            </p>
          </div>
        </div>

        {/* Brand pill */}
        <div
          style={{
            opacity: brandOpacity,
            marginTop: 22,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: YELLOW }} />
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Refresh Psychiatry &amp; Therapy
          </span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: YELLOW }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION — 720 frames total at 30fps = 24s
// ============================================================
export const TelehealthFL: React.FC = () => {
  const HOOK_DURATION = 105;              // 3.5s
  const CARD1_DURATION = 135;             // 4.5s
  const CARD2_DURATION = 135;             // 4.5s
  const CARD3_DURATION = 135;             // 4.5s
  const REFRESH_HIGHLIGHT_DURATION = 105; // 3.5s
  const CTA_DURATION = 105;              // 3.5s
  // Total: 105+135+135+135+105+105 = 720

  let offset = 0;

  const scenes = [
    { from: (offset = 0), duration: HOOK_DURATION, Component: HookScene },
    { from: (offset += HOOK_DURATION), duration: CARD1_DURATION, Component: Card1Scene },
    { from: (offset += CARD1_DURATION), duration: CARD2_DURATION, Component: Card2Scene },
    { from: (offset += CARD2_DURATION), duration: CARD3_DURATION, Component: Card3Scene },
    { from: (offset += CARD3_DURATION), duration: REFRESH_HIGHLIGHT_DURATION, Component: RefreshHighlightScene },
    { from: (offset += REFRESH_HIGHLIGHT_DURATION), duration: CTA_DURATION, Component: CTAScene },
  ];

  return (
    <AbsoluteFill>
      {scenes.map(({ from, duration, Component }, i) => (
        <Sequence key={i} from={from} durationInFrames={duration}>
          <Component />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
