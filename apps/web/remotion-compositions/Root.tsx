import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { LeadCaptureVideo } from "./LeadCapture";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="LeadCapture"
        component={LeadCaptureVideo}
        durationInFrames={450}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
