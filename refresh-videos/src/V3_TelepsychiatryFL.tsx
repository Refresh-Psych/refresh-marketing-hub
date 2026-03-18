import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

// -- Brand Colors --
const BLUE = "#2B6CB0";
const YELLOW = "#F6C744";
const WHITE = "#FFFFFF";
const CHARCOAL = "#2D3748";
const LIGHT_BLUE = "#EBF4FF";
const DEEP_BLUE = "#1A365D";

// -- Fonts --
const HEADING_FONT = "'Montserrat', 'Poppins', sans-serif";
const BODY_FONT = "'DM Sans', 'Montserrat', sans-serif";

// -- Safe interpolate helper --
const safe = (
  f: number,
  s: number,
  e: number,
  from = 0,
  to = 1
): number =>
  s >= e
    ? to
    : interpolate(f, [s, e], [from, to], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

// -- Florida city locations (approximate positions on a 500x600 layout) --
const FL_CITIES = [
  { x: 140, y: 55, label: "Tallahassee", delay: 0 },
  { x: 310, y: 110, label: "Jacksonville", delay: 8 },
  { x: 240, y: 200, label: "Orlando", delay: 16 },
  { x: 160, y: 230, label: "Tampa", delay: 24 },
  { x: 300, y: 280, label: "Melbourne", delay: 32 },
  { x: 170, y: 340, label: "Fort Myers", delay: 40 },
  { x: 300, y: 380, label: "West Palm Beach", delay: 48 },
  { x: 280, y: 420, label: "Fort Lauderdale", delay: 56 },
  { x: 260, y: 450, label: "Davie", delay: 64 },
  { x: 290, y: 480, label: "Miami", delay: 72 },
  { x: 120, y: 280, label: "St. Petersburg", delay: 80 },
];

// ============================================================
// SCENE 1: TITLE (frames 0-90)
// ============================================================
const SceneTitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const titleIn = safe(frame, 8, 40);
  const subtitleIn = safe(frame, 30, 55);
  const floridaIn = safe(frame, 5, 50);
  const exitOp = safe(frame, 75, 90, 1, 0);

  // Pulsing glow
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${WHITE} 0%, ${LIGHT_BLUE} 100%)`,
        opacity: exitOp,
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 80,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}08 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 50,
          bottom: 50,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${YELLOW}10 0%, transparent 70%)`,
        }}
      />

      {/* Stylized Florida shape using CSS borders/divs */}
      <div
        style={{
          position: "absolute",
          right: 180,
          top: "50%",
          transform: `translateY(-50%) scale(${0.9 + floridaIn * 0.1})`,
          opacity: floridaIn * 0.25,
        }}
      >
        {/* Main peninsula */}
        <div
          style={{
            width: 160,
            height: 360,
            background: `linear-gradient(180deg, ${BLUE}30 0%, ${BLUE}15 100%)`,
            borderRadius: "40px 60px 80px 40px",
            position: "relative",
          }}
        >
          {/* Panhandle */}
          <div
            style={{
              position: "absolute",
              top: -10,
              left: -180,
              width: 200,
              height: 50,
              background: `${BLUE}25`,
              borderRadius: "20px 10px 15px 25px",
              transform: "rotate(-3deg)",
            }}
          />
          {/* Pulsing dot for Davie */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 30,
              width: 16 + pulse * 8,
              height: 16 + pulse * 8,
              borderRadius: "50%",
              background: YELLOW,
              boxShadow: `0 0 ${20 + pulse * 15}px ${YELLOW}80`,
              transform: "translate(50%, 50%)",
            }}
          />
        </div>
      </div>

      {/* Title text */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 120,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 78,
            fontWeight: 800,
            color: CHARCOAL,
            lineHeight: 1.1,
          }}
        >
          Telehealth
          <br />
          <span style={{ color: BLUE }}>Psychiatry</span>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 120,
          opacity: subtitleIn,
          transform: `translateY(${(1 - subtitleIn) * 25}px)`,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 50,
            height: 4,
            background: YELLOW,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 32,
            color: BLUE,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          Available Statewide
        </div>
      </div>

      {/* Bottom brand bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${BLUE}, ${YELLOW}, ${BLUE})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: FLORIDA MAP WITH LOCATIONS (frames 90-210)
// ============================================================
const SceneMap: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = frame - 90;
  const enterOp = safe(localFrame, 0, 15, 0, 1);
  const exitOp = safe(localFrame, 105, 120, 1, 0);
  const opacity = Math.min(enterOp, exitOp);

  const titleIn = safe(localFrame, 5, 25);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);

  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, opacity }}>
      {/* Background gradient accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 55% 50%, ${LIGHT_BLUE} 0%, ${WHITE} 70%)`,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: HEADING_FONT,
          fontSize: 48,
          fontWeight: 800,
          color: CHARCOAL,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        Serving All of <span style={{ color: BLUE }}>Florida</span>
      </div>

      {/* Yellow underline */}
      <div
        style={{
          position: "absolute",
          top: 128,
          left: "50%",
          transform: "translateX(-50%)",
          width: safe(localFrame, 10, 30, 0, 160),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
        }}
      />

      {/* Florida map container */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 600,
        }}
      >
        {/* Simplified Florida shape using CSS */}
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 80,
            width: 200,
            height: 420,
            background: `linear-gradient(180deg, ${BLUE}15 0%, ${BLUE}08 100%)`,
            borderRadius: "50px 70px 100px 50px",
            border: `2px solid ${BLUE}20`,
          }}
        >
          {/* Panhandle */}
          <div
            style={{
              position: "absolute",
              top: -15,
              left: -200,
              width: 230,
              height: 55,
              background: `${BLUE}12`,
              borderRadius: "25px 15px 20px 30px",
              border: `2px solid ${BLUE}15`,
              transform: "rotate(-2deg)",
            }}
          />
        </div>

        {/* City dots and labels */}
        {FL_CITIES.map((city, i) => {
          const dotDelay = 10 + city.delay;
          const dotSpring = spring({
            frame: Math.max(0, localFrame - dotDelay),
            fps,
            config: { damping: 8, stiffness: 120 },
          });
          const isHighlight = city.label === "Davie";
          const dotSize = isHighlight ? 14 : 10;
          const glowSize = isHighlight ? dotSize + 10 + pulse * 6 : dotSize + 6 + pulse * 4;

          return (
            <React.Fragment key={city.label}>
              {/* Glow ring */}
              <div
                style={{
                  position: "absolute",
                  left: city.x - glowSize / 2,
                  top: city.y - glowSize / 2,
                  width: glowSize,
                  height: glowSize,
                  borderRadius: "50%",
                  background: isHighlight ? `${YELLOW}40` : `${BLUE}20`,
                  opacity: dotSpring,
                  transform: `scale(${dotSpring})`,
                }}
              />
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: city.x - dotSize / 2,
                  top: city.y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  background: isHighlight ? YELLOW : BLUE,
                  border: `2px solid ${WHITE}`,
                  boxShadow: isHighlight
                    ? `0 0 12px ${YELLOW}80`
                    : `0 0 8px ${BLUE}40`,
                  opacity: dotSpring,
                  transform: `scale(${dotSpring})`,
                }}
              />
              {/* Label */}
              <div
                style={{
                  position: "absolute",
                  left: city.x + dotSize / 2 + 8,
                  top: city.y - 9,
                  fontFamily: BODY_FONT,
                  fontSize: isHighlight ? 17 : 14,
                  fontWeight: isHighlight ? 700 : 600,
                  color: isHighlight ? CHARCOAL : `${CHARCOAL}CC`,
                  opacity: dotSpring,
                  whiteSpace: "nowrap",
                }}
              >
                {city.label}
                {isHighlight && (
                  <span
                    style={{
                      fontSize: 11,
                      color: BLUE,
                      marginLeft: 6,
                      fontWeight: 600,
                    }}
                  >
                    HQ
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: BODY_FONT,
          fontSize: 22,
          color: BLUE,
          opacity: safe(localFrame, 80, 100),
          fontWeight: 600,
        }}
      >
        11 Locations Across Florida + Statewide Telehealth
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3: BENEFITS CARDS (frames 210-360)
// ============================================================
const SceneBenefits: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = frame - 210;
  const enterOp = safe(localFrame, 0, 15, 0, 1);
  const exitOp = safe(localFrame, 135, 150, 1, 0);
  const opacity = Math.min(enterOp, exitOp);

  const titleIn = safe(localFrame, 5, 25);

  const benefits = [
    { title: "No Commute", desc: "Skip the traffic and waiting rooms", color: BLUE },
    { title: "Same-Day Availability", desc: "Get seen when you need it most", color: "#3182CE" },
    { title: "Private & Comfortable", desc: "From the comfort of your own space", color: "#2C5282" },
    { title: "Insurance Accepted", desc: "Most major plans covered", color: DEEP_BLUE },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: LIGHT_BLUE, opacity }}>
      {/* Decorative corner accents */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `${YELLOW}10`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `${BLUE}08`,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: HEADING_FONT,
          fontSize: 52,
          fontWeight: 800,
          color: CHARCOAL,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 25}px)`,
        }}
      >
        Why <span style={{ color: BLUE }}>Telehealth?</span>
      </div>

      {/* Yellow underline */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: "50%",
          transform: "translateX(-50%)",
          width: safe(localFrame, 10, 30, 0, 140),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
        }}
      />

      {/* Benefit cards in a 2x2 grid */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 40,
          padding: "0 200px",
        }}
      >
        {benefits.map((b, i) => {
          const cardDelay = 20 + i * 30;
          const slideIn = safe(localFrame, cardDelay, cardDelay + 25);
          const cardSpring = spring({
            frame: Math.max(0, localFrame - cardDelay),
            fps,
            config: { damping: 12, stiffness: 80 },
          });

          return (
            <div
              key={b.title}
              style={{
                width: 340,
                background: WHITE,
                borderRadius: 20,
                padding: "36px 32px",
                boxShadow: "0 8px 40px rgba(43,108,176,0.1)",
                border: `2px solid ${BLUE}12`,
                opacity: cardSpring,
                transform: `translateX(${(1 - slideIn) * -80}px) scale(${0.9 + cardSpring * 0.1})`,
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  minWidth: 56,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${b.color}, ${b.color}CC)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: i === 0 ? "2px" : i === 1 ? "50%" : i === 2 ? "4px" : "3px",
                    background: WHITE,
                    transform: i === 0 ? "rotate(45deg)" : "none",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 24,
                    fontWeight: 700,
                    color: CHARCOAL,
                    marginBottom: 6,
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 17,
                    color: `${CHARCOAL}BB`,
                    lineHeight: 1.4,
                  }}
                >
                  {b.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4: HOW IT WORKS - 3 STEPS (frames 360-510)
// ============================================================
const SceneHowItWorks: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = frame - 360;
  const enterOp = safe(localFrame, 0, 15, 0, 1);
  const exitOp = safe(localFrame, 135, 150, 1, 0);
  const opacity = Math.min(enterOp, exitOp);

  const titleIn = safe(localFrame, 5, 25);

  const steps = [
    { num: "1", title: "Schedule Online", desc: "Book in minutes through our easy portal" },
    { num: "2", title: "Video Visit from Home", desc: "Connect face-to-face with your provider" },
    { num: "3", title: "Start Your Treatment Plan", desc: "Personalized care, delivered virtually" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, opacity }}>
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(${BLUE}06 1px, transparent 1px), linear-gradient(90deg, ${BLUE}06 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: HEADING_FONT,
          fontSize: 52,
          fontWeight: 800,
          color: CHARCOAL,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 25}px)`,
        }}
      >
        How It <span style={{ color: BLUE }}>Works</span>
      </div>

      {/* Yellow underline */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: "50%",
          transform: "translateX(-50%)",
          width: safe(localFrame, 10, 30, 0, 140),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
        }}
      />

      {/* Steps */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 60,
          padding: "0 120px",
        }}
      >
        {steps.map((step, i) => {
          const stepDelay = 25 + i * 35;
          const stepSpring = spring({
            frame: Math.max(0, localFrame - stepDelay),
            fps,
            config: { damping: 10, stiffness: 80 },
          });

          return (
            <React.Fragment key={step.num}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                  opacity: stepSpring,
                  transform: `translateY(${(1 - stepSpring) * 50}px)`,
                  maxWidth: 320,
                }}
              >
                {/* Number circle */}
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${BLUE}, ${DEEP_BLUE})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 30px ${BLUE}40`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontFamily: HEADING_FONT,
                      fontSize: 52,
                      fontWeight: 800,
                      color: WHITE,
                    }}
                  >
                    {step.num}
                  </div>
                  {/* Yellow accent ring */}
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: "50%",
                      border: `3px solid ${YELLOW}60`,
                    }}
                  />
                </div>

                {/* Step title */}
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 26,
                    fontWeight: 700,
                    color: CHARCOAL,
                    textAlign: "center",
                  }}
                >
                  {step.title}
                </div>

                {/* Step description */}
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 18,
                    color: `${CHARCOAL}BB`,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </div>
              </div>

              {/* Connecting line between steps */}
              {i < 2 && (
                <div
                  style={{
                    marginTop: 55,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: safe(localFrame, stepDelay + 20, stepDelay + 40, 0, 60),
                      height: 3,
                      background: `linear-gradient(90deg, ${YELLOW}, ${YELLOW}60)`,
                      borderRadius: 2,
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderLeft: `10px solid ${YELLOW}`,
                      opacity: safe(localFrame, stepDelay + 35, stepDelay + 45),
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom note */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: BODY_FONT,
          fontSize: 24,
          color: BLUE,
          opacity: safe(localFrame, 100, 120),
          fontWeight: 600,
        }}
      >
        It's that simple.
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5: INSURANCE (frames 510-630)
// ============================================================
const SceneInsurance: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = frame - 510;
  const enterOp = safe(localFrame, 0, 15, 0, 1);
  const exitOp = safe(localFrame, 105, 120, 1, 0);
  const opacity = Math.min(enterOp, exitOp);

  const titleIn = safe(localFrame, 5, 25);
  const subtitleIn = safe(localFrame, 15, 35);

  const insurancePlans = ["Aetna", "United", "Cigna", "Humana", "Avmed", "Oscar"];

  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, opacity }}>
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 500,
          background: `linear-gradient(180deg, ${LIGHT_BLUE} 0%, ${WHITE} 100%)`,
        }}
      />

      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: `2px solid ${BLUE}08`,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: HEADING_FONT,
          fontSize: 52,
          fontWeight: 800,
          color: CHARCOAL,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 25}px)`,
        }}
      >
        Most Major Insurance{" "}
        <span style={{ color: BLUE }}>Accepted</span>
      </div>

      {/* Yellow underline */}
      <div
        style={{
          position: "absolute",
          top: 252,
          left: "50%",
          transform: "translateX(-50%)",
          width: safe(localFrame, 15, 35, 0, 200),
          height: 4,
          background: YELLOW,
          borderRadius: 2,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 290,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: BODY_FONT,
          fontSize: 24,
          color: `${CHARCOAL}BB`,
          opacity: subtitleIn,
        }}
      >
        We work with your plan so you can focus on getting better
      </div>

      {/* Insurance pills */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 36,
          flexWrap: "wrap",
          padding: "0 250px",
        }}
      >
        {insurancePlans.map((plan, i) => {
          const pillDelay = 35 + i * 10;
          const pillSpring = spring({
            frame: Math.max(0, localFrame - pillDelay),
            fps,
            config: { damping: 10, stiffness: 100 },
          });
          return (
            <div
              key={plan}
              style={{
                opacity: pillSpring,
                transform: `scale(${pillSpring}) translateY(${(1 - pillSpring) * 20}px)`,
                background: `linear-gradient(135deg, ${BLUE}, ${DEEP_BLUE})`,
                color: WHITE,
                fontFamily: HEADING_FONT,
                fontSize: 26,
                fontWeight: 700,
                padding: "18px 44px",
                borderRadius: 50,
                boxShadow: `0 6px 24px ${BLUE}30`,
                letterSpacing: 0.5,
              }}
            >
              {plan}
            </div>
          );
        })}
      </div>

      {/* UMR mention */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: BODY_FONT,
          fontSize: 20,
          color: `${CHARCOAL}99`,
          opacity: safe(localFrame, 85, 100),
        }}
      >
        Also accepting UMR and more
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6: CTA (frames 630-720)
// ============================================================
const SceneCTA: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = frame - 630;
  const enterOp = safe(localFrame, 0, 15, 0, 1);

  const logoIn = spring({
    frame: Math.max(0, localFrame - 5),
    fps,
    config: { damping: 10, stiffness: 80 },
  });
  const taglineIn = safe(localFrame, 20, 40);
  const phoneIn = safe(localFrame, 35, 55);
  const urlIn = safe(localFrame, 50, 65);

  // Subtle pulse on CTA
  const pulse = 0.97 + 0.03 * Math.sin(localFrame * 0.15);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${DEEP_BLUE} 0%, ${BLUE} 50%, ${DEEP_BLUE} 100%)`,
        opacity: enterOp,
      }}
    >
      {/* Dot pattern background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle, ${WHITE}08 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing orbs */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 150,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${YELLOW}12 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 150,
          bottom: 80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}18 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 42,
            fontWeight: 700,
            color: `${WHITE}CC`,
            opacity: logoIn,
            transform: `scale(${0.9 + logoIn * 0.1})`,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Refresh Psychiatry
        </div>

        {/* Yellow accent line */}
        <div
          style={{
            width: safe(localFrame, 10, 30, 0, 200),
            height: 4,
            background: YELLOW,
            borderRadius: 2,
            margin: "12px 0",
          }}
        />

        {/* CTA headline */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 64,
            fontWeight: 800,
            color: WHITE,
            opacity: taglineIn,
            transform: `translateY(${(1 - taglineIn) * 25}px)`,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Book Your Virtual
          <br />
          <span style={{ color: YELLOW }}>Visit Today</span>
        </div>

        {/* Phone number */}
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 48,
            fontWeight: 700,
            color: YELLOW,
            opacity: phoneIn,
            transform: `translateY(${(1 - phoneIn) * 20}px) scale(${pulse})`,
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Phone icon using CSS */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `${YELLOW}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                border: `3px solid ${YELLOW}`,
                borderRadius: "0 0 8px 0",
                borderTop: "none",
                borderLeft: "none",
                transform: "rotate(-45deg)",
              }}
            />
          </div>
          (954) 603-4081
        </div>

        {/* Website */}
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 28,
            color: `${WHITE}BB`,
            opacity: urlIn,
            transform: `translateY(${(1 - urlIn) * 15}px)`,
            marginTop: 12,
            letterSpacing: 1.5,
          }}
        >
          refreshpsychiatry.com
        </div>
      </div>

      {/* Bottom yellow bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: YELLOW,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const V3_TelepsychiatryFL: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: WHITE }}>
      {/* Scene 1: Title (0-90) */}
      {frame < 90 && <SceneTitle frame={frame} fps={fps} />}

      {/* Scene 2: Florida Map with Locations (90-210) */}
      {frame >= 90 && frame < 210 && <SceneMap frame={frame} fps={fps} />}

      {/* Scene 3: Benefits Cards (210-360) */}
      {frame >= 210 && frame < 360 && (
        <SceneBenefits frame={frame} fps={fps} />
      )}

      {/* Scene 4: How It Works (360-510) */}
      {frame >= 360 && frame < 510 && (
        <SceneHowItWorks frame={frame} fps={fps} />
      )}

      {/* Scene 5: Insurance (510-630) */}
      {frame >= 510 && frame < 630 && (
        <SceneInsurance frame={frame} fps={fps} />
      )}

      {/* Scene 6: CTA (630-720) */}
      {frame >= 630 && <SceneCTA frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
};
