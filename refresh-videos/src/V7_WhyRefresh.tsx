import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  spring,
} from "remotion";

// ============================================================
// BRAND TOKENS
// ============================================================
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";

const FONT_HEAD =
  "'Montserrat', 'Poppins', 'DM Sans', system-ui, sans-serif";
const FONT_BODY = "'DM Sans', 'Montserrat', system-ui, sans-serif";

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

const APPLE_EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ============================================================
// SAFE HELPERS
// ============================================================

/** Safe interpolate -- guards against equal start/end */
const safe = (
  f: number,
  s: number,
  e: number,
  from = 0,
  to = 1,
): number =>
  s >= e
    ? to
    : interpolate(f, [s, e], [from, to], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

/** Eased interpolate */
const ease = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
): number =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE_EASE,
  });

/** Fade in */
const fadeIn = (frame: number, start: number, dur = 30) =>
  ease(frame, start, start + dur, 0, 1);

/** Fade out */
const fadeOut = (frame: number, start: number, dur = 25) =>
  ease(frame, start, start + dur, 1, 0);

/** Slide up entrance */
const slideUp = (frame: number, start: number, dur = 35) =>
  ease(frame, start, start + dur, 60, 0);

/** Scene opacity: fade in, hold, fade out */
const sceneOpacity = (
  frame: number,
  sceneStart: number,
  sceneEnd: number,
  fadeInDur = 20,
  fadeOutDur = 20,
) => {
  const fi = fadeIn(frame, sceneStart, fadeInDur);
  const fo = fadeOut(frame, sceneEnd - fadeOutDur, fadeOutDur);
  return Math.min(fi, fo);
};

// ============================================================
// SCENE 1 -- PREMIUM INTRO (0-100)
// ============================================================
const Scene1_PremiumIntro: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneOpacity(frame, 0, 100, 25, 20);

  const whyOp = fadeIn(frame, 12, 30);
  const whyY = slideUp(frame, 12, 35);

  const refreshOp = fadeIn(frame, 35, 30);
  const refreshY = slideUp(frame, 35, 35);
  const refreshScale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1 },
  });

  const underlineWidth = ease(frame, 55, 85, 0, 420);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Dark charcoal background with subtle gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(170deg, ${CHARCOAL} 0%, #1A202C 60%, #171923 100%)`,
        }}
      />

      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 45%, ${BLUE}18 0%, transparent 65%)`,
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          textAlign: "center",
          width: "85%",
        }}
      >
        {/* "Why Choose" */}
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 36,
            fontWeight: 400,
            color: `${WHITE}cc`,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: whyOp,
            transform: `translateY(${whyY}px)`,
            marginBottom: 20,
          }}
        >
          Why Choose
        </div>

        {/* "Refresh Psychiatry" */}
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 72,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.1,
            opacity: refreshOp,
            transform: `translateY(${refreshY}px) scale(${Math.min(refreshScale, 1)})`,
          }}
        >
          Refresh
          <br />
          <span style={{ color: BLUE }}>Psychiatry</span>
        </div>

        {/* Yellow underline accent */}
        <div
          style={{
            width: underlineWidth,
            height: 5,
            background: `linear-gradient(90deg, ${YELLOW}, ${YELLOW}cc)`,
            borderRadius: 3,
            margin: "28px auto 0",
            boxShadow: `0 0 20px ${YELLOW}40`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================
// SCENE 2 -- DR. NEPA INTRO (100-220)
// ============================================================
const Scene2_DrNepa: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneOpacity(frame, 100, 220, 22, 20);

  const ledByOp = fadeIn(frame, 108, 25);
  const nameOp = fadeIn(frame, 125, 30);
  const nameY = slideUp(frame, 125, 35);

  const credSpring = spring({
    frame: frame - 155,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });

  const goldLineW = ease(frame, 165, 195, 0, 600);

  const credentials = [
    "Board-Certified Psychiatrist",
    "Doctor of Osteopathic Medicine",
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Initials circle */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: "50%",
          transform: `translate(-50%, 0) scale(${spring({
            frame: frame - 112,
            fps,
            config: { damping: 12, stiffness: 100, mass: 0.8 },
          })})`,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${BLUE}, #1E4E8C)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 12px 48px ${BLUE}40`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 52,
            fontWeight: 800,
            color: WHITE,
          }}
        >
          JN
        </span>
      </div>

      {/* "Led by" label */}
      <div
        style={{
          position: "absolute",
          top: 560,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_BODY,
          fontSize: 22,
          fontWeight: 600,
          color: BLUE,
          letterSpacing: 5,
          textTransform: "uppercase",
          opacity: ledByOp,
        }}
      >
        Led By
      </div>

      {/* Name */}
      <div
        style={{
          position: "absolute",
          top: 610,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_HEAD,
          fontSize: 50,
          fontWeight: 800,
          color: CHARCOAL,
          opacity: nameOp,
          transform: `translateY(${nameY}px)`,
        }}
      >
        Dr. Justin Nepa, DO
      </div>

      {/* Gold accent line */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: "50%",
          transform: "translateX(-50%)",
          width: goldLineW,
          height: 3,
          background: YELLOW,
          borderRadius: 2,
        }}
      />

      {/* Credentials */}
      <div
        style={{
          position: "absolute",
          top: 740,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        {credentials.map((cred, i) => {
          const cDelay = 160 + i * 18;
          return (
            <div
              key={cred}
              style={{
                padding: "14px 40px",
                borderRadius: 50,
                background: `${BLUE}0A`,
                border: `1px solid ${BLUE}18`,
                fontFamily: FONT_BODY,
                fontSize: 24,
                fontWeight: 500,
                color: CHARCOAL,
                opacity: fadeIn(frame, cDelay, 22),
                transform: `translateY(${slideUp(frame, cDelay, 25)}px) scale(${Math.min(credSpring, 1)})`,
              }}
            >
              {cred}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// SCENE 3 -- KEY DIFFERENTIATORS (220-370)
// ============================================================
const differentiators = [
  "16 Locations Across FL, MA & TX",
  "Same-Day Telehealth Appointments",
  "Pharmacogenomic Testing Available",
  "Evidence-Based, Personalized Care",
];

const Scene3_Differentiators: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneOpacity(frame, 220, 370, 22, 20);

  const headerOp = fadeIn(frame, 228, 25);
  const headerY = slideUp(frame, 228, 30);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Section header */}
      <div
        style={{
          position: "absolute",
          top: 340,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 20,
            fontWeight: 600,
            color: BLUE,
            letterSpacing: 5,
            textTransform: "uppercase",
            opacity: fadeIn(frame, 225, 22),
          }}
        >
          What Sets Us Apart
        </div>
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 46,
            fontWeight: 800,
            color: CHARCOAL,
            opacity: headerOp,
            transform: `translateY(${headerY}px)`,
            marginTop: 12,
          }}
        >
          The Refresh
          <br />
          <span style={{ color: BLUE }}>Difference</span>
        </div>
      </div>

      {/* Differentiator items */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {differentiators.map((item, i) => {
          const itemDelay = 255 + i * 35;
          const itemOp = fadeIn(frame, itemDelay, 25);
          const itemX = ease(frame, itemDelay, itemDelay + 30, 120, 0);

          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: itemOp,
                transform: `translateX(${itemX}px)`,
              }}
            >
              {/* Yellow dot bullet */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: YELLOW,
                  flexShrink: 0,
                  boxShadow: `0 2px 12px ${YELLOW}50`,
                }}
              />
              <div
                style={{
                  fontFamily: FONT_HEAD,
                  fontSize: 28,
                  fontWeight: 600,
                  color: CHARCOAL,
                  lineHeight: 1.35,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// SCENE 4 -- SERVICES GRID (370-500)
// ============================================================
const services = ["ADHD", "Anxiety", "Depression", "PTSD", "Bipolar", "OCD"];

const Scene4_Services: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneOpacity(frame, 370, 500, 22, 20);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 320,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 20,
            fontWeight: 600,
            color: BLUE,
            letterSpacing: 5,
            textTransform: "uppercase",
            opacity: fadeIn(frame, 375, 22),
          }}
        >
          Conditions
        </div>
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 50,
            fontWeight: 800,
            color: CHARCOAL,
            opacity: fadeIn(frame, 380, 25),
            transform: `translateY(${slideUp(frame, 380, 30)}px)`,
            marginTop: 10,
          }}
        >
          What We <span style={{ color: BLUE }}>Treat</span>
        </div>
      </div>

      {/* 2x3 grid */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {services.map((svc, i) => {
          const row = Math.floor(i / 2);
          const cardDelay = 400 + row * 18 + (i % 2) * 8;
          const cardOp = fadeIn(frame, cardDelay, 22);
          const cardScale = spring({
            frame: frame - cardDelay,
            fps,
            config: { damping: 13, stiffness: 110, mass: 0.7 },
          });

          return (
            <div
              key={svc}
              style={{
                width: "calc(50% - 12px)",
                opacity: cardOp,
                transform: `scale(${Math.min(cardScale, 1)})`,
              }}
            >
              <div
                style={{
                  padding: "36px 16px",
                  borderRadius: 20,
                  background: `linear-gradient(145deg, ${BLUE}12, ${BLUE}08)`,
                  border: `1px solid ${BLUE}18`,
                  textAlign: "center",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: 28,
                    fontWeight: 700,
                    color: BLUE,
                  }}
                >
                  {svc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// SCENE 5 -- PATIENT-FIRST PHILOSOPHY (500-630)
// ============================================================
const pillars = [
  { label: "Listen", color: BLUE },
  { label: "Understand", color: YELLOW },
  { label: "Treat", color: BLUE },
];

const Scene5_Philosophy: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneOpacity(frame, 500, 630, 22, 20);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 300,
          width: "100%",
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 42,
            fontWeight: 800,
            color: CHARCOAL,
            lineHeight: 1.25,
            opacity: fadeIn(frame, 508, 28),
            transform: `translateY(${slideUp(frame, 508, 32)}px)`,
          }}
        >
          Your Mental Health
          <br />
          Journey{" "}
          <span style={{ color: BLUE }}>Starts Here</span>
        </div>

        {/* Yellow accent */}
        <div
          style={{
            width: ease(frame, 530, 555, 0, 200),
            height: 4,
            background: YELLOW,
            borderRadius: 2,
            margin: "24px auto 0",
          }}
        />
      </div>

      {/* Three vertical bars / pillars */}
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 48,
          alignItems: "flex-end",
        }}
      >
        {pillars.map((pillar, i) => {
          const barDelay = 545 + i * 25;
          const barHeight = ease(frame, barDelay, barDelay + 40, 0, 320 - i * 30 + (i === 2 ? 60 : 0));
          const labelOp = fadeIn(frame, barDelay + 20, 20);

          return (
            <div
              key={pillar.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              {/* Vertical bar */}
              <div
                style={{
                  width: 80,
                  height: barHeight,
                  borderRadius: 16,
                  background:
                    pillar.color === YELLOW
                      ? `linear-gradient(180deg, ${YELLOW}, ${YELLOW}aa)`
                      : `linear-gradient(180deg, ${BLUE}, ${BLUE}aa)`,
                  boxShadow: `0 8px 32px ${pillar.color}30`,
                }}
              />
              {/* Label */}
              <div
                style={{
                  fontFamily: FONT_HEAD,
                  fontSize: 26,
                  fontWeight: 700,
                  color: CHARCOAL,
                  opacity: labelOp,
                  textAlign: "center",
                }}
              >
                {pillar.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step numbers */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 48,
        }}
      >
        {[1, 2, 3].map((num, i) => {
          const numDelay = 575 + i * 12;
          return (
            <div
              key={num}
              style={{
                width: 80,
                textAlign: "center",
                fontFamily: FONT_BODY,
                fontSize: 18,
                fontWeight: 500,
                color: `${CHARCOAL}80`,
                letterSpacing: 2,
                opacity: fadeIn(frame, numDelay, 18),
              }}
            >
              0{num}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// SCENE 6 -- INSURANCE (630-720)
// ============================================================
const insurers = ["Aetna", "United", "Cigna", "Humana", "Avmed", "Oscar"];

const Scene6_Insurance: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = sceneOpacity(frame, 630, 720, 22, 18);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 400,
          width: "100%",
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 42,
            fontWeight: 800,
            color: CHARCOAL,
            lineHeight: 1.25,
            opacity: fadeIn(frame, 636, 25),
            transform: `translateY(${slideUp(frame, 636, 30)}px)`,
          }}
        >
          We Accept Most
          <br />
          <span style={{ color: BLUE }}>Major Insurance</span>
        </div>
      </div>

      {/* Insurance pills grid */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 60,
          right: 60,
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {insurers.map((ins, i) => {
          const insDelay = 655 + i * 10;
          const insOp = fadeIn(frame, insDelay, 18);
          const insScale = spring({
            frame: frame - insDelay,
            fps,
            config: { damping: 14, stiffness: 120, mass: 0.6 },
          });

          return (
            <div
              key={ins}
              style={{
                padding: "18px 36px",
                borderRadius: 50,
                background: WHITE,
                border: `2px solid ${BLUE}20`,
                boxShadow: `0 2px 16px ${BLUE}0C`,
                opacity: insOp,
                transform: `scale(${Math.min(insScale, 1)})`,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_HEAD,
                  fontSize: 24,
                  fontWeight: 700,
                  color: BLUE,
                }}
              >
                {ins}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 400,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_BODY,
          fontSize: 22,
          fontWeight: 400,
          color: `${CHARCOAL}99`,
          opacity: fadeIn(frame, 690, 18),
        }}
      >
        Making care accessible for you
      </div>
    </div>
  );
};

// ============================================================
// SCENE 7 -- FINAL CTA (720-780)
// ============================================================
const Scene7_CTA: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = fadeIn(frame, 720, 22);

  const ctaSpring = spring({
    frame: frame - 725,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });

  const phoneSpring = spring({
    frame: frame - 740,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });

  // Subtle yellow glow pulse
  const glowPulse = 0.4 + 0.2 * Math.sin((frame - 720) * 0.08);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Premium blue background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(170deg, ${BLUE} 0%, #1E4E8C 50%, #163A6B 100%)`,
        }}
      />

      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${WHITE}10 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          textAlign: "center",
          width: "85%",
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 50,
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.2,
            transform: `scale(${Math.min(ctaSpring, 1)})`,
          }}
        >
          Book Your
          <br />
          Appointment
          <br />
          <span style={{ color: YELLOW }}>Today</span>
        </div>

        {/* Yellow accent line */}
        <div
          style={{
            width: ease(frame, 732, 750, 0, 200),
            height: 4,
            background: YELLOW,
            borderRadius: 2,
            margin: "28px auto",
            boxShadow: `0 0 24px ${YELLOW}${Math.round(glowPulse * 255)
              .toString(16)
              .padStart(2, "0")}`,
          }}
        />

        {/* Phone number */}
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 46,
            fontWeight: 700,
            color: WHITE,
            opacity: safe(frame, 738, 755, 0, 1),
            transform: `scale(${Math.min(phoneSpring, 1)})`,
            marginBottom: 16,
          }}
        >
          (954) 603-4081
        </div>

        {/* Website */}
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 28,
            fontWeight: 500,
            color: `${WHITE}cc`,
            opacity: fadeIn(frame, 748, 18),
            transform: `translateY(${slideUp(frame, 748, 22)}px)`,
          }}
        >
          refreshpsychiatry.com
        </div>

        {/* Yellow CTA button effect */}
        <div
          style={{
            marginTop: 48,
            opacity: fadeIn(frame, 755, 16),
            transform: `translateY(${slideUp(frame, 755, 20)}px)`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "18px 52px",
              borderRadius: 60,
              background: YELLOW,
              boxShadow: `0 6px 36px ${YELLOW}50`,
            }}
          >
            <span
              style={{
                fontFamily: FONT_HEAD,
                fontSize: 22,
                fontWeight: 800,
                color: CHARCOAL,
                letterSpacing: 3,
              }}
            >
              SCHEDULE NOW
            </span>
          </div>
        </div>
      </div>

      {/* Logo area at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          textAlign: "center",
          opacity: fadeIn(frame, 760, 16),
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: 16,
            fontWeight: 600,
            color: `${WHITE}70`,
            letterSpacing: 4,
          }}
        >
          REFRESH PSYCHIATRY & THERAPY
        </div>
        <div
          style={{
            width: 40,
            height: 3,
            background: `${YELLOW}80`,
            borderRadius: 2,
            margin: "12px auto 0",
          }}
        />
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const V7_WhyRefresh: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "#FAFBFC",
        fontFamily: FONT_BODY,
      }}
    >
      <style>{fontImport}</style>

      {/* Subtle decorative accent shapes */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}06 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${YELLOW}08 0%, transparent 70%)`,
        }}
      />

      {/* Scenes */}
      {frame < 120 && <Scene1_PremiumIntro frame={frame} fps={fps} />}
      {frame >= 85 && frame < 240 && (
        <Scene2_DrNepa frame={frame} fps={fps} />
      )}
      {frame >= 205 && frame < 390 && (
        <Scene3_Differentiators frame={frame} fps={fps} />
      )}
      {frame >= 355 && frame < 520 && (
        <Scene4_Services frame={frame} fps={fps} />
      )}
      {frame >= 485 && frame < 650 && (
        <Scene5_Philosophy frame={frame} fps={fps} />
      )}
      {frame >= 615 && frame < 738 && (
        <Scene6_Insurance frame={frame} fps={fps} />
      )}
      {frame >= 705 && <Scene7_CTA frame={frame} fps={fps} />}

      {/* Persistent thin top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(to right, ${BLUE}, ${YELLOW})`,
          opacity: fadeIn(frame, 0, 30),
        }}
      />
    </AbsoluteFill>
  );
};
