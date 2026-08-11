import { useState } from "react";
import Section, { SubHeading, Block } from "./Section";
import TextField from "./fields/TextField";
import DateField from "./fields/DateField";
import RadioGroup from "./fields/RadioGroup";
import { useNoteReadOnly } from "./readOnly";
import { CURRENT_VISIT, PREVIOUS_VISIT } from "../../data/chart";

export default function SubjectiveSection() {
  const visit = useNoteReadOnly() ? PREVIOUS_VISIT : CURRENT_VISIT;
  const [chiefComplaint, setChiefComplaint] = useState(visit.subjective.chiefComplaint);
  const [dateOfOnset, setDateOfOnset] = useState(visit.subjective.dateOfOnset);
  const [stateOfCondition, setStateOfCondition] = useState(visit.subjective.stateOfCondition);
  const [sideOfIssue, setSideOfIssue] = useState(visit.subjective.sideOfIssue);
  const [previousSurgery, setPreviousSurgery] = useState(visit.subjective.previousSurgery);
  const [surgeryName, setSurgeryName] = useState(visit.subjective.surgeryName);
  const [surgeryDate, setSurgeryDate] = useState(visit.subjective.surgeryDate);
  const [historyOfCondition, setHistoryOfCondition] = useState(visit.subjective.historyOfCondition);

  return (
    <Section title="Subjective">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Chief Complaint & History" />
        <Block>
          <TextField label="Chief Complaint" value={chiefComplaint} onChange={setChiefComplaint} />
          <DateField label="Date of Onset" value={dateOfOnset} onChange={setDateOfOnset} inline={false} />
          <RadioGroup
            label="State of Condition"
            options={["New", "Chronic", "Insidious", "N/A"]}
            value={stateOfCondition}
            onChange={setStateOfCondition}
          />
          <RadioGroup label="Side of Issue" options={["Left", "Right", "Both", "N/A"]} value={sideOfIssue} onChange={setSideOfIssue} />
          <RadioGroup
            label="Previous Knee Surgery"
            options={["Yes", "No"]}
            value={previousSurgery}
            onChange={setPreviousSurgery}
            labelWidth={181}
          />
          <TextField label="Name of Previous Surgery" value={surgeryName} onChange={setSurgeryName} labelWidth={206} />
          <DateField label="Surgery Date (if applicable)" value={surgeryDate} onChange={setSurgeryDate} inline={false} labelWidth={220} />
          <TextField label="History of Condition" value={historyOfCondition} onChange={setHistoryOfCondition} />
        </Block>
      </div>
    </Section>
  );
}
