import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { WhyChooseRefresh } from "./WhyChooseRefresh";
import { ADHDTreatment } from "./ADHDTreatment";
import { TelehealthFL } from "./TelehealthFL";
import { V1_ChildVsAdultADHD } from "./V1_ChildVsAdultADHD";
import { V2_Pharmacogenomics } from "./V2_Pharmacogenomics";
import { V3_TelepsychiatryFL } from "./V3_TelepsychiatryFL";
import { V4_AnxietyVsDepression } from "./V4_AnxietyVsDepression";
import { V5_FirstAppointment } from "./V5_FirstAppointment";
import { V6_SpringAnxiety } from "./V6_SpringAnxiety";
import { V7_WhyRefresh } from "./V7_WhyRefresh";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Original 4 Videos ── */}
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={825}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WhyChooseRefresh"
        component={WhyChooseRefresh}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ADHDTreatment"
        component={ADHDTreatment}
        durationInFrames={700}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TelehealthFL"
        component={TelehealthFL}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ── 7 New Content-Based Videos ── */}
      <Composition
        id="V1-ChildVsAdultADHD"
        component={V1_ChildVsAdultADHD}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="V2-Pharmacogenomics"
        component={V2_Pharmacogenomics}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="V3-TelepsychiatryFL"
        component={V3_TelepsychiatryFL}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="V4-AnxietyVsDepression"
        component={V4_AnxietyVsDepression}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="V5-FirstAppointment"
        component={V5_FirstAppointment}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="V6-SpringAnxiety"
        component={V6_SpringAnxiety}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="V7-WhyRefresh"
        component={V7_WhyRefresh}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
