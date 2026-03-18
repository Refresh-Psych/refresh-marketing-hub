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

// Platform colors
const TIKTOK_BLACK = "#000000";
const TWITTER_BLUE = "#1DA1F2";
const FACEBOOK_BLUE = "#1877F2";

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

// -- Animated stat counter --
const AnimatedStat: React.FC<{
  label: string;
  value: string;
  frame: number;
  delay: number;
  color?: string;
  fontSize?: number;
  isHero?: boolean;
}> = ({ label, value, frame, delay, color = WHITE, fontSize = 28, isHero = false }) => {
  const progress = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const scale = interpolate(frame, [delay, delay + 14], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `scale(${scale})`,
        textAlign: "center",
        padding: isHero ? "12px 24px" : "4px 12px",
        background: isHero ? "rgba(246,199,68,0.15)" : "transparent",
        borderRadius: isHero ? 16 : 0,
        border: isHero ? `2px solid rgba(246,199,68,0.3)` : "none",
      }}
    >
      <div
        style={{
          color: isHero ? YELLOW : color,
          fontSize: isHero ? fontSize * 1.4 : fontSize,
          fontWeight: 900,
          letterSpacing: -0.5,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: isHero ? "rgba(246,199,68,0.8)" : "rgba(255,255,255,0.6)",
          fontSize: isHero ? 18 : 15,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// -- Platform badge --
const PlatformBadge: React.FC<{
  platform: string;
  color: string;
  frame: number;
  delay: number;
}> = ({ platform, color, frame, delay }) => {
  const badgeOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeScale = interpolate(frame, [delay, delay + 12], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <div
      style={{
        opacity: badgeOpacity,
        transform: `scale(${badgeScale})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: color,
        padding: "10px 24px",
        borderRadius: 30,
        boxShadow: `0 4px 20px ${color}44`,
      }}
    >
      <span style={{ color: WHITE, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
        {platform}
      </span>
    </div>
  );
};

// -- Takeaway callout box --
const TakeawayBox: React.FC<{
  text: string;
  frame: number;
  delay: number;
}> = ({ text, frame, delay }) => {
  const progress = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const slideY = interpolate(frame, [delay, delay + 18], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${slideY}px)`,
        background: "rgba(246,199,68,0.08)",
        border: `1.5px solid rgba(246,199,68,0.25)`,
        borderRadius: 20,
        padding: "20px 28px",
        marginTop: 20,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          color: YELLOW,
          fontSize: 24,
          fontWeight: 900,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        💡
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.45,
          letterSpacing: 0.2,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ============================================================
// SCENE 1: Hook (0-120 frames, 4s)
// "ADHD & Medication — What 100M+ People Need to Know"
// ============================================================
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const words = ["ADHD", "&", "Medication", "—", "What", "100M+", "People", "Need", "to", "Know"];
  const highlightWords = new Set(["ADHD", "100M+"]);

  const bgShift = interpolate(frame, [0, 120], [0, 20], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [85, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${145 + bgShift}deg, #0d2b45 0%, ${DEEP_BLUE} 30%, ${BLUE} 65%, #3b82c4 100%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("focus-desk.jpg")}
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
            "linear-gradient(160deg, rgba(13,43,69,0.90) 0%, rgba(26,58,92,0.82) 50%, rgba(43,108,176,0.80) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.14)" x={540} y={700} size={700} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.2)" x={200} y={400} size={500} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.15)" x={900} y={1400} size={450} opacity={1} />

      {/* Viral badge */}
      <div
        style={{
          position: "absolute",
          top: 160,
          zIndex: 2,
          opacity: interpolate(frame, [5, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `scale(${interpolate(frame, [5, 18], [0.7, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.5)),
          })})`,
        }}
      >
        <div
          style={{
            background: "rgba(246,199,68,0.15)",
            border: `2px solid rgba(246,199,68,0.4)`,
            borderRadius: 40,
            padding: "12px 36px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 28 }}>🔥</span>
          <span
            style={{
              color: YELLOW,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Viral Mental Health Content
          </span>
        </div>
      </div>

      {/* Large watermark */}
      <div
        style={{
          position: "absolute",
          right: 20,
          bottom: 80,
          fontSize: 420,
          fontWeight: 900,
          color: WHITE,
          opacity: 0.025,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        #
      </div>

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          padding: "0 70px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 20px",
        }}
      >
        {words.map((word, i) => {
          const wordStart = 18 + i * 8;
          const wordOpacity = interpolate(frame, [wordStart, wordStart + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wordY = interpolate(frame, [wordStart, wordStart + 12], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          const isHighlight = highlightWords.has(word);

          return (
            <span
              key={i}
              style={{
                color: isHighlight ? YELLOW : WHITE,
                fontSize: isHighlight ? 88 : 78,
                fontWeight: 800,
                letterSpacing: -2,
                lineHeight: 1.25,
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                textShadow: isHighlight
                  ? `0 4px 30px rgba(246,199,68,0.4), 0 2px 12px rgba(0,0,0,0.3)`
                  : "0 4px 30px rgba(0,0,0,0.3)",
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Bottom subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          zIndex: 2,
          opacity: interpolate(frame, [75, 90], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          4 POSTS THAT CHANGED THE CONVERSATION
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: Card 1 — ADHD Symptoms TikTok (120-270 frames, 5s)
// ============================================================
const Card1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [115, 130], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const symptoms = [
    "Losing your keys... again",
    "Hyperfocus on the wrong thing",
    "Emotional dysregulation",
    "Can't start simple tasks",
    "Time blindness is real",
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #FFFFFF 0%, #F0F7FF 50%, #E8F0FE 100%)`,
        justifyContent: "center",
        alignItems: "center",
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
            "linear-gradient(165deg, rgba(255,255,255,0.93) 0%, rgba(250,248,240,0.90) 50%, rgba(245,242,235,0.90) 100%)",
        }}
      />

      <RadialGlow color="rgba(0,0,0,0.04)" x={540} y={960} size={800} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          padding: "0 60px",
          position: "relative",
        }}
      >
        {/* Platform badge */}
        <PlatformBadge platform="TikTok" color={TIKTOK_BLACK} frame={frame} delay={5} />

        {/* Creator */}
        <div
          style={{
            opacity: interpolate(frame, [12, 24], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginTop: 20,
            marginBottom: 12,
          }}
        >
          <span
            style={{ color: CHARCOAL, fontSize: 22, fontWeight: 600, opacity: 0.7 }}
          >
            @connordewolfe · ADHD Advocate
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: interpolate(frame, [15, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [15, 28], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <h2
            style={{
              color: DEEP_BLUE,
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -1,
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            "Signs you might have ADHD as an adult and don't know it"
          </h2>
        </div>

        <GoldLine
          width={interpolate(frame, [20, 40], [0, 200], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}
          marginTop={16}
          marginBottom={24}
        />

        {/* Symptom checklist */}
        <div style={{ textAlign: "left", maxWidth: 800, margin: "0 auto" }}>
          {symptoms.map((symptom, i) => {
            const itemDelay = 30 + i * 14;
            const itemSpring = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 11, stiffness: 120, mass: 0.8 },
            });
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const checkScale = interpolate(itemSpring, [0, 1], [0, 1]);
            const itemX = interpolate(itemSpring, [0, 1], [-40, 0]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 14,
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${BLUE} 0%, #3b82c4 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${checkScale})`,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: WHITE, fontSize: 22, fontWeight: 900 }}>✓</span>
                </div>
                <span
                  style={{
                    color: CHARCOAL,
                    fontSize: 30,
                    fontWeight: 600,
                    letterSpacing: -0.3,
                  }}
                >
                  {symptom}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            marginTop: 28,
          }}
        >
          <AnimatedStat label="Views" value="35.6M" frame={frame} delay={95} color={CHARCOAL} />
          <AnimatedStat label="Likes" value="4.9M" frame={frame} delay={100} color={CHARCOAL} />
          <AnimatedStat label="Comments" value="122K" frame={frame} delay={105} color={CHARCOAL} />
        </div>

        {/* Takeaway */}
        <div
          style={{
            marginTop: 16,
            opacity: interpolate(frame, [112, 128], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [112, 128], [15, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(43,108,176,0.06)",
              border: `1.5px solid rgba(43,108,176,0.15)`,
              borderRadius: 18,
              padding: "16px 24px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>💡</span>
            <span
              style={{
                color: DEEP_BLUE,
                fontSize: 21,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              ADHD content is the #1 mental health niche on TikTok. Relatable symptom
              lists create massive engagement.
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: Card 2 — SSRI Animation TikTok (270-405 frames, 4.5s)
// ============================================================
const Card2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [100, 115], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const bgShift = interpolate(frame, [0, 115], [0, 15], {
    extrapolateRight: "clamp",
  });

  // Brain synapse visual — animated circles representing neurotransmitters
  const synapseProgress = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${155 + bgShift}deg, #0d3b4a 0%, #0e5c6e 35%, #1a8a8a 70%, #2ba5a5 100%)`,
        justifyContent: "center",
        alignItems: "center",
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
            "linear-gradient(155deg, rgba(10,60,80,0.88) 0%, rgba(15,80,100,0.82) 40%, rgba(20,100,120,0.82) 70%, rgba(30,120,140,0.80) 100%)",
        }}
      />

      <RadialGlow color="rgba(80,200,220,0.15)" x={540} y={600} size={700} opacity={1} />
      <RadialGlow color="rgba(246,199,68,0.10)" x={300} y={1200} size={500} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          padding: "0 60px",
          position: "relative",
        }}
      >
        {/* Platform badge */}
        <PlatformBadge platform="TikTok" color={TIKTOK_BLACK} frame={frame} delay={5} />

        {/* Creator */}
        <div
          style={{
            opacity: interpolate(frame, [10, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 22, fontWeight: 600 }}>
            @sciencesam · Neuroscience Educator
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: interpolate(frame, [14, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [14, 28], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <h2
            style={{
              color: WHITE,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: -1,
              margin: "0 0 6px 0",
              lineHeight: 1.2,
              textShadow: "0 3px 20px rgba(0,0,0,0.3)",
            }}
          >
            "What happens in your brain when you take an SSRI — animated"
          </h2>
        </div>

        <GoldLine
          width={interpolate(frame, [20, 40], [0, 180], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}
          marginTop={14}
          marginBottom={20}
        />

        {/* Simplified brain synapse visual */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            marginBottom: 24,
            opacity: interpolate(frame, [28, 42], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* Pre-synapse */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(80,200,220,0.3), rgba(80,200,220,0.1))",
              border: "2px solid rgba(80,200,220,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 18, color: WHITE, fontWeight: 700 }}>PRE</span>
          </div>

          {/* Neurotransmitter dots flowing */}
          <div style={{ position: "relative", width: 200, height: 60 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const dotDelay = 35 + i * 8;
              const dotProgress = interpolate(frame, [dotDelay, dotDelay + 25], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              });
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: dotProgress * 160,
                    top: 20 + Math.sin(i * 1.8) * 15,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${YELLOW}, #E8B730)`,
                    opacity: dotProgress > 0 ? 0.9 : 0,
                    boxShadow: `0 0 12px rgba(246,199,68,0.5)`,
                  }}
                />
              );
            })}
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                top: 25,
                left: 0,
                width: 200 * synapseProgress,
                height: 3,
                background: `linear-gradient(90deg, rgba(246,199,68,0.1), rgba(246,199,68,0.5))`,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 35,
                left: 60,
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 2,
                opacity: interpolate(frame, [50, 60], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              SEROTONIN
            </div>
          </div>

          {/* Post-synapse */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, rgba(246,199,68,${0.1 + synapseProgress * 0.2}), rgba(246,199,68,${0.05 + synapseProgress * 0.15}))`,
              border: `2px solid rgba(246,199,68,${0.3 + synapseProgress * 0.3})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 18, color: WHITE, fontWeight: 700 }}>POST</span>
          </div>
        </div>

        {/* SSRI label */}
        <div
          style={{
            opacity: interpolate(frame, [55, 68], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(246,199,68,0.12)",
              border: "1.5px solid rgba(246,199,68,0.3)",
              borderRadius: 14,
              padding: "10px 28px",
            }}
          >
            <span style={{ color: YELLOW, fontSize: 24, fontWeight: 700 }}>
              SSRI blocks reuptake → more serotonin available
            </span>
          </div>
        </div>

        {/* Stats — hero stat: 1.9M saves */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <AnimatedStat label="Views" value="22.1M" frame={frame} delay={72} />
          <AnimatedStat label="Likes" value="3.4M" frame={frame} delay={77} />
          <AnimatedStat
            label="Saves"
            value="1.9M"
            frame={frame}
            delay={82}
            isHero
          />
        </div>

        {/* Takeaway */}
        <TakeawayBox
          text="Visual science education dominates saves. Animated explainers of how medications work build trust and bookmarks."
          frame={frame}
          delay={95}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: Card 3 — Medication Education Thread X/Twitter (405-540 frames, 4.5s)
// ============================================================
const Card3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [100, 115], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const medications = [
    { name: "SSRIs", desc: "Selective Serotonin Reuptake Inhibitors" },
    { name: "SNRIs", desc: "Serotonin-Norepinephrine Reuptake Inhibitors" },
    { name: "Benzodiazepines", desc: "Fast-acting anti-anxiety" },
    { name: "Buspirone", desc: "Non-addictive anxiolytic" },
    { name: "Hydroxyzine", desc: "Antihistamine for anxiety" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #FFFFFF 0%, #F0F7F0 50%, #E8F5E9 100%)`,
        justifyContent: "center",
        alignItems: "center",
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
            "linear-gradient(165deg, rgba(255,255,255,0.93) 0%, rgba(248,255,248,0.90) 50%, rgba(240,250,240,0.90) 100%)",
        }}
      />

      <RadialGlow color="rgba(29,161,242,0.06)" x={540} y={960} size={800} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          padding: "0 55px",
          position: "relative",
        }}
      >
        {/* Platform badge — X/Twitter */}
        <PlatformBadge platform="𝕏 / Twitter" color={TWITTER_BLUE} frame={frame} delay={5} />

        {/* Creator */}
        <div
          style={{
            opacity: interpolate(frame, [10, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <span style={{ color: CHARCOAL, fontSize: 21, fontWeight: 600, opacity: 0.7 }}>
            @DrDanielAmen · Board-Certified Psychiatrist
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: interpolate(frame, [14, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [14, 28], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <h2
            style={{
              color: DEEP_BLUE,
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: -0.5,
              margin: "0 0 6px 0",
              lineHeight: 1.2,
            }}
          >
            "5 medications most commonly prescribed for anxiety — and what they actually do"
          </h2>
        </div>

        <GoldLine
          width={interpolate(frame, [20, 40], [0, 180], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}
          marginTop={12}
          marginBottom={18}
        />

        {/* Medication list */}
        <div style={{ textAlign: "left", maxWidth: 860, margin: "0 auto" }}>
          {medications.map((med, i) => {
            const itemDelay = 30 + i * 14;
            const itemSpring = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 12, stiffness: 110, mass: 0.8 },
            });
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemX = interpolate(itemSpring, [0, 1], [-50, 0]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 12,
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                  background: "rgba(29,161,242,0.04)",
                  border: "1px solid rgba(29,161,242,0.1)",
                  borderRadius: 16,
                  padding: "14px 20px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${TWITTER_BLUE}, #1890d0)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: WHITE,
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      color: DEEP_BLUE,
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: -0.3,
                    }}
                  >
                    {med.name}
                  </span>
                  <span
                    style={{
                      color: CHARCOAL,
                      fontSize: 18,
                      fontWeight: 500,
                      opacity: 0.6,
                      marginLeft: 10,
                    }}
                  >
                    {med.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 20,
          }}
        >
          <AnimatedStat
            label="Impressions"
            value="18.7M"
            frame={frame}
            delay={95}
            color={CHARCOAL}
          />
          <AnimatedStat
            label="Retweets"
            value="94K"
            frame={frame}
            delay={100}
            color={CHARCOAL}
          />
          <AnimatedStat
            label="Likes"
            value="280K"
            frame={frame}
            delay={105}
            color={CHARCOAL}
          />
        </div>

        {/* Takeaway */}
        <div
          style={{
            marginTop: 14,
            opacity: interpolate(frame, [112, 128], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [112, 128], [15, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(29,161,242,0.06)",
              border: `1.5px solid rgba(29,161,242,0.15)`,
              borderRadius: 18,
              padding: "14px 22px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💡</span>
            <span
              style={{
                color: DEEP_BLUE,
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Medication education threads fill a massive knowledge gap. Patients want to
              understand what they're taking.
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: Card 4 — Parent ADHD Facebook (540-660 frames, 4s)
// ============================================================
const Card4Scene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [85, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #FFF8E8 0%, #FFF3D8 50%, #FFE8B8 100%)`,
        justifyContent: "center",
        alignItems: "center",
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
            "linear-gradient(165deg, rgba(255,248,232,0.88) 0%, rgba(255,243,216,0.85) 50%, rgba(255,235,195,0.85) 100%)",
        }}
      />

      <RadialGlow color="rgba(246,199,68,0.10)" x={540} y={700} size={800} opacity={1} />
      <RadialGlow color="rgba(24,119,242,0.06)" x={300} y={1300} size={500} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          padding: "0 60px",
          position: "relative",
        }}
      >
        {/* Platform badge */}
        <PlatformBadge platform="Facebook" color={FACEBOOK_BLUE} frame={frame} delay={5} />

        {/* Creator */}
        <div
          style={{
            opacity: interpolate(frame, [10, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            marginTop: 18,
            marginBottom: 12,
          }}
        >
          <span style={{ color: CHARCOAL, fontSize: 22, fontWeight: 600, opacity: 0.7 }}>
            @ADDitudeMag · ADHD Resource
          </span>
        </div>

        {/* Title — emotional open letter */}
        <div
          style={{
            opacity: interpolate(frame, [14, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [14, 28], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <h2
            style={{
              color: DEEP_BLUE,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: -1,
              margin: "0 0 6px 0",
              lineHeight: 1.25,
              fontStyle: "italic",
            }}
          >
            "To the parent who just got their child's ADHD diagnosis — here's what I wish someone
            told me"
          </h2>
        </div>

        <GoldLine
          width={interpolate(frame, [20, 40], [0, 200], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })}
          marginTop={16}
          marginBottom={24}
        />

        {/* Emotional quote excerpt */}
        <div
          style={{
            opacity: interpolate(frame, [35, 50], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            background: "rgba(255,255,255,0.6)",
            borderLeft: `4px solid ${YELLOW}`,
            borderRadius: "0 16px 16px 0",
            padding: "24px 28px",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              color: CHARCOAL,
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.5,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            "Your child is not broken. Their brain just works differently — and that's a
            superpower waiting to be understood."
          </p>
        </div>

        {/* Hero stat — 420K shares */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 12,
          }}
        >
          <AnimatedStat
            label="Shares"
            value="420K"
            frame={frame}
            delay={55}
            color={CHARCOAL}
            isHero
          />
          <AnimatedStat
            label="Reactions"
            value="890K"
            frame={frame}
            delay={60}
            color={CHARCOAL}
          />
          <AnimatedStat
            label="Comments"
            value="65K"
            frame={frame}
            delay={65}
            color={CHARCOAL}
          />
        </div>

        {/* Takeaway */}
        <div
          style={{
            marginTop: 20,
            opacity: interpolate(frame, [78, 95], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [78, 95], [15, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(24,119,242,0.06)",
              border: `1.5px solid rgba(24,119,242,0.15)`,
              borderRadius: 18,
              padding: "16px 24px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>💡</span>
            <span
              style={{
                color: DEEP_BLUE,
                fontSize: 21,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Facebook still dominates for parent-focused mental health content. Emotional
              "open letter" format drives massive organic sharing.
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA (560-700 frames, ~4.7s / 140 frames)
// "Get Expert ADHD Evaluation at Refresh Psychiatry"
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
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 100, mass: 0.9 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);
  const ctaOpacity = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const detailsOpacity = interpolate(frame, [34, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailsY = interpolate(frame, [34, 50], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const insuranceOpacity = interpolate(frame, [50, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = 0.4 + Math.sin(frame * 0.08) * 0.15;

  const bgShift = interpolate(frame, [0, 140], [0, 12], {
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
            "linear-gradient(150deg, rgba(13,43,69,0.78) 0%, rgba(26,58,92,0.68) 40%, rgba(43,108,176,0.68) 100%)",
        }}
      />

      <RadialGlow
        color={`rgba(246,199,68,${glowPulse * 0.3})`}
        x={540}
        y={800}
        size={600}
        opacity={1}
      />
      <RadialGlow color="rgba(59,130,196,0.15)" x={150} y={1400} size={600} opacity={1} />
      <RadialGlow color="rgba(59,130,196,0.12)" x={950} y={300} size={450} opacity={1} />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          padding: "0 70px",
          position: "relative",
          transform: `translateY(${headlineY}px)`,
        }}
      >
        {/* Headline */}
        <h2
          style={{
            color: WHITE,
            fontSize: 58,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: -2,
            textShadow: "0 4px 30px rgba(0,0,0,0.25)",
          }}
        >
          Get Expert{" "}
          <span style={{ color: YELLOW }}>ADHD</span>{" "}
          Evaluation
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 30,
            fontWeight: 600,
            margin: "8px 0 0 0",
            letterSpacing: 1,
          }}
        >
          at Refresh Psychiatry
        </p>

        <GoldLine width={lineWidth} marginTop={24} marginBottom={28} />

        {/* CTA Button */}
        <div style={{ opacity: ctaOpacity, transform: `scale(${ctaScale})` }}>
          <div
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${YELLOW} 0%, #E8B730 100%)`,
              color: CHARCOAL,
              fontSize: 34,
              fontWeight: 800,
              padding: "24px 56px",
              borderRadius: 60,
              letterSpacing: 1,
              textTransform: "uppercase",
              boxShadow: `0 0 ${40 + glowPulse * 40}px rgba(246,199,68,${glowPulse}), 0 8px 32px rgba(246,199,68,0.35), 0 2px 8px rgba(0,0,0,0.15)`,
            }}
          >
            Book Your Evaluation
          </div>
        </div>

        {/* Contact details */}
        <div
          style={{
            opacity: detailsOpacity,
            transform: `translateY(${detailsY}px)`,
            marginTop: 32,
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
              margin: "14px 0 0 0",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            refreshpsychiatry.com
          </p>
        </div>

        {/* Insurance pill */}
        <div style={{ opacity: insuranceOpacity, marginTop: 32 }}>
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

        {/* Telehealth badge */}
        <div
          style={{
            opacity: insuranceOpacity,
            marginTop: 20,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            TELEHEALTH · FL · MA · TX
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION — Total: 700 frames at 30fps
// Hook(100) + Card1(130) + Card2(115) + Card3(115) + Card4(100) + CTA(140) = 700
// ============================================================
export const ADHDTreatment: React.FC = () => {
  const HOOK_DURATION = 100;     // ~3.3s
  const CARD1_DURATION = 130;    // ~4.3s
  const CARD2_DURATION = 115;    // ~3.8s
  const CARD3_DURATION = 115;    // ~3.8s
  const CARD4_DURATION = 100;    // ~3.3s
  const CTA_DURATION = 140;     // ~4.7s

  const s1 = 0;
  const s2 = s1 + HOOK_DURATION;
  const s3 = s2 + CARD1_DURATION;
  const s4 = s3 + CARD2_DURATION;
  const s5 = s4 + CARD3_DURATION;
  const s6 = s5 + CARD4_DURATION;

  return (
    <AbsoluteFill>
      <Sequence from={s1} durationInFrames={HOOK_DURATION}>
        <HookScene />
      </Sequence>

      <Sequence from={s2} durationInFrames={CARD1_DURATION}>
        <Card1Scene />
      </Sequence>

      <Sequence from={s3} durationInFrames={CARD2_DURATION}>
        <Card2Scene />
      </Sequence>

      <Sequence from={s4} durationInFrames={CARD3_DURATION}>
        <Card3Scene />
      </Sequence>

      <Sequence from={s5} durationInFrames={CARD4_DURATION}>
        <Card4Scene />
      </Sequence>

      <Sequence from={s6} durationInFrames={CTA_DURATION}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
