import { useState } from "react";
import Section, { SubHeading, Block } from "./Section";
import RadioGroup from "./fields/RadioGroup";
import TextField from "./fields/TextField";
import MuscleTable from "./fields/MuscleTable";
import { useNoteReadOnly } from "./readOnly";
import { CURRENT_VISIT, PREVIOUS_VISIT } from "../../data/chart";

const PAIN_SCALE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function ObjectiveSection() {
  const { objective } = useNoteReadOnly() ? PREVIOUS_VISIT : CURRENT_VISIT;
  const [currentPain, setCurrentPain] = useState(objective.currentPain);
  const [worstPain, setWorstPain] = useState(objective.worstPain);
  const [bestPain, setBestPain] = useState(objective.bestPain);
  const [painDescription, setPainDescription] = useState(objective.painDescription);

  return (
    <Section title="Objective">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Pain Assessment" />
        <Block>
          <RadioGroup label="Current Pain Level" options={PAIN_SCALE} value={currentPain} onChange={setCurrentPain} />
          <RadioGroup label="Worst Pain Level" options={PAIN_SCALE} value={worstPain} onChange={setWorstPain} />
          <RadioGroup label="Best Pain Level" options={PAIN_SCALE} value={bestPain} onChange={setBestPain} />
          <TextField label="Pain Description" value={painDescription} onChange={setPainDescription} />
        </Block>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Muscle Strength" />
        <Block>
          <p className="font-body text-[16px] font-medium leading-[20px] text-[#0a1e8f]">Hip</p>
          <MuscleTable rows={objective.hip.rows} initialLeft={objective.hip.left} initialRight={objective.hip.right} />
          <p className="font-body text-[16px] font-medium leading-[20px] text-[#0a1e8f]">Knee</p>
          <MuscleTable rows={objective.knee.rows} initialLeft={objective.knee.left} initialRight={objective.knee.right} />
        </Block>
      </div>
    </Section>
  );
}
