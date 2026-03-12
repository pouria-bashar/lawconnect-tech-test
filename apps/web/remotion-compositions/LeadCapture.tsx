import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

const SPRING_SMOOTH = { damping: 200 };
const SPRING_BOUNCY = { damping: 15 };

const EMERALD = "#059669";
const EMERALD_LIGHT = "#d1fae5";
const DARK = "#18181b";
const GRAY = "#71717a";

const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(
    spring({ frame, fps, config: SPRING_SMOOTH }),
    [0, 1],
    [40, 0],
  );
  const titleOpacity = spring({ frame, fps, config: SPRING_SMOOTH });
  const subtitleOpacity = spring({
    frame,
    fps,
    config: SPRING_SMOOTH,
    delay: 15,
  });

  return (
    <AbsoluteFill
      style={{
        background: "white",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700 }}>
          <span style={{ color: EMERALD }}>Law</span>
          <span style={{ color: DARK }}>Network</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: GRAY,
            opacity: subtitleOpacity,
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          AI-powered legal intake assistant
        </div>
      </div>
    </AbsoluteFill>
  );
};

type StepSceneProps = {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
};

const StepScene: React.FC<StepSceneProps> = ({
  stepNumber,
  title,
  description,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeScale = spring({ frame, fps, config: SPRING_BOUNCY });
  const contentProgress = spring({
    frame,
    fps,
    config: SPRING_SMOOTH,
    delay: 10,
  });
  const contentY = interpolate(contentProgress, [0, 1], [30, 0]);
  const descProgress = spring({
    frame,
    fps,
    config: SPRING_SMOOTH,
    delay: 20,
  });

  return (
    <AbsoluteFill
      style={{
        background: "white",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: EMERALD_LIGHT,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 40,
            transform: `scale(${badgeScale})`,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            opacity: contentProgress,
            transform: `translateY(${contentY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, color: EMERALD, fontWeight: 600 }}>
            Step {stepNumber}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: DARK }}>
            {title}
          </div>
        </div>
        <div
          style={{
            fontSize: 22,
            color: GRAY,
            opacity: descProgress,
            maxWidth: 500,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: SPRING_SMOOTH });
  const y = interpolate(progress, [0, 1], [30, 0]);
  const ctaProgress = spring({
    frame,
    fps,
    config: SPRING_BOUNCY,
    delay: 15,
  });

  return (
    <AbsoluteFill
      style={{
        background: EMERALD,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: progress,
          transform: `translateY(${y}px)`,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, color: "white" }}>
          Try it now
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.85)",
            maxWidth: 500,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Describe your legal issue below and get matched with the right lawyer
        </div>
        <div
          style={{
            marginTop: 8,
            padding: "14px 40px",
            background: "white",
            borderRadius: 12,
            fontSize: 20,
            fontWeight: 600,
            color: EMERALD,
            transform: `scale(${ctaProgress})`,
          }}
        >
          Start chatting ↓
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LeadCaptureVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  const sceneDuration = Math.round(3 * fps);
  const premount = Math.round(0.5 * fps);

  return (
    <AbsoluteFill>
      <Sequence
        durationInFrames={sceneDuration}
        premountFor={premount}
      >
        <SceneIntro />
      </Sequence>

      <Sequence
        from={sceneDuration}
        durationInFrames={sceneDuration}
        premountFor={premount}
      >
        <StepScene
          stepNumber={1}
          title="Describe your issue"
          description="Tell the AI what legal help you need — family law, immigration, property, and more."
          icon="💬"
        />
      </Sequence>

      <Sequence
        from={sceneDuration * 2}
        durationInFrames={sceneDuration}
        premountFor={premount}
      >
        <StepScene
          stepNumber={2}
          title="Answer a few questions"
          description="The assistant asks targeted follow-ups to understand your situation and build your case profile."
          icon="📋"
        />
      </Sequence>

      <Sequence
        from={sceneDuration * 3}
        durationInFrames={sceneDuration}
        premountFor={premount}
      >
        <StepScene
          stepNumber={3}
          title="Get matched"
          description="Receive a pre-filled intake form and get connected with a suitable lawyer."
          icon="⚖️"
        />
      </Sequence>

      <Sequence
        from={sceneDuration * 4}
        durationInFrames={sceneDuration}
        premountFor={premount}
      >
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
