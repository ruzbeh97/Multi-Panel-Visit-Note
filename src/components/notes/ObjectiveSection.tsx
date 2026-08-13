import Section, { SubHeading, Block } from "./Section";
import RadioGroup from "./fields/RadioGroup";
import TextField from "./fields/TextField";
import MuscleTable from "./fields/MuscleTable";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore } from "./noteStore";
import { PREVIOUS_VISIT } from "../../data/chart";

const PAIN_SCALE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function ObjectiveSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();
  const source = PREVIOUS_VISIT.objective;

  const pain = readOnly
    ? {
        currentPain: source.currentPain,
        worstPain: source.worstPain,
        bestPain: source.bestPain,
        painDescription: source.painDescription,
      }
    : store.note.objective;

  const setObjective = (patch: Partial<typeof store.note.objective>) => {
    if (!readOnly) store.patchObjective(patch);
  };

  const hipRows = source.hip.rows;
  const kneeRows = source.knee.rows;

  const strength = readOnly
    ? {
        hipLeft: source.hip.left,
        hipRight: source.hip.right,
        kneeLeft: source.knee.left,
        kneeRight: source.knee.right,
      }
    : store.note.objective;

  function updateStrength(group: "hip" | "knee", side: "left" | "right", index: number, value: string) {
    if (readOnly) return;
    const key = `${group}${side === "left" ? "Left" : "Right"}` as
      | "hipLeft"
      | "hipRight"
      | "kneeLeft"
      | "kneeRight";
    const next = [...store.note.objective[key]];
    next[index] = value;
    store.patchObjective({ [key]: next });
  }

  return (
    <Section title="Objective">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Pain Assessment" />
        <Block>
          <RadioGroup
            label="Current Pain Level"
            options={PAIN_SCALE}
            value={pain.currentPain}
            onChange={(value) => setObjective({ currentPain: value })}
          />
          <RadioGroup
            label="Worst Pain Level"
            options={PAIN_SCALE}
            value={pain.worstPain}
            onChange={(value) => setObjective({ worstPain: value })}
          />
          <RadioGroup
            label="Best Pain Level"
            options={PAIN_SCALE}
            value={pain.bestPain}
            onChange={(value) => setObjective({ bestPain: value })}
          />
          <TextField
            label="Pain Description"
            value={pain.painDescription}
            onChange={(value) => setObjective({ painDescription: value })}
          />
        </Block>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Muscle Strength" />
        <Block>
          <p className="font-body text-[16px] font-medium leading-[20px] text-[#0a1e8f]">Hip</p>
          <MuscleTable
            rows={hipRows}
            left={strength.hipLeft}
            right={strength.hipRight}
            onChange={(side, index, value) => updateStrength("hip", side, index, value)}
          />
          <p className="font-body text-[16px] font-medium leading-[20px] text-[#0a1e8f]">Knee</p>
          <MuscleTable
            rows={kneeRows}
            left={strength.kneeLeft}
            right={strength.kneeRight}
            onChange={(side, index, value) => updateStrength("knee", side, index, value)}
          />
        </Block>
      </div>
    </Section>
  );
}
