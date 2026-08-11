import { useState } from "react";
import Section, { SubHeading, Block } from "./Section";
import TextField from "./fields/TextField";
import DateField from "./fields/DateField";
import GoalCard from "./fields/GoalCard";
import { useNoteReadOnly } from "./readOnly";
import { CURRENT_VISIT, PREVIOUS_VISIT } from "../../data/chart";

export default function AssessmentSection() {
  const { assessment } = useNoteReadOnly() ? PREVIOUS_VISIT : CURRENT_VISIT;
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState(assessment.primaryDiagnosis);
  const [dateOfOnset, setDateOfOnset] = useState(assessment.dateOfOnset);
  const [rehabPotential, setRehabPotential] = useState(assessment.rehabPotential);
  const [keyFindings, setKeyFindings] = useState(assessment.keyFindings);

  return (
    <Section title="Assessment">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Diagnosis & Findings" />
        <Block>
          <TextField label="Primary Diagnosis" value={primaryDiagnosis} onChange={setPrimaryDiagnosis} />
          <DateField label="Date of Onset" value={dateOfOnset} onChange={setDateOfOnset} inline={false} disabled />
          <TextField label="Rehab Potential" value={rehabPotential} onChange={setRehabPotential} />
          <TextField label="Key Findings" value={keyFindings} onChange={setKeyFindings} />
        </Block>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Goals & Progress" />
        <Block>
          {assessment.goals.map((goal, i) => (
            <GoalCard key={i} {...goal} />
          ))}
        </Block>
      </div>
    </Section>
  );
}
