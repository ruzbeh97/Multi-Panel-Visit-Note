import Section, { SubHeading, Block } from "./Section";
import TextField from "./fields/TextField";
import DateField from "./fields/DateField";
import RadioGroup from "./fields/RadioGroup";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore } from "./noteStore";
import { PREVIOUS_VISIT } from "../../data/chart";

export default function SubjectiveSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();
  const values = readOnly ? PREVIOUS_VISIT.subjective : store.note.subjective;
  const set = (patch: Partial<typeof store.note.subjective>) => {
    if (!readOnly) store.patchSubjective(patch);
  };

  return (
    <Section title="Subjective">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Chief Complaint & History" />
        <Block>
          <TextField
            label="Chief Complaint"
            value={values.chiefComplaint}
            onChange={(value) => set({ chiefComplaint: value })}
          />
          <DateField
            label="Date of Onset"
            value={values.dateOfOnset}
            onChange={(value) => set({ dateOfOnset: value })}
            inline={false}
          />
          <RadioGroup
            label="State of Condition"
            options={["New", "Chronic", "Insidious", "N/A"]}
            value={values.stateOfCondition}
            onChange={(value) => set({ stateOfCondition: value })}
          />
          <RadioGroup
            label="Side of Issue"
            options={["Left", "Right", "Both", "N/A"]}
            value={values.sideOfIssue}
            onChange={(value) => set({ sideOfIssue: value })}
          />
          <RadioGroup
            label="Previous Knee Surgery"
            options={["Yes", "No"]}
            value={values.previousSurgery}
            onChange={(value) => set({ previousSurgery: value })}
            labelWidth={181}
          />
          <TextField
            label="Name of Previous Surgery"
            value={values.surgeryName}
            onChange={(value) => set({ surgeryName: value })}
            labelWidth={206}
          />
          <DateField
            label="Surgery Date (if applicable)"
            value={values.surgeryDate}
            onChange={(value) => set({ surgeryDate: value })}
            inline={false}
            labelWidth={220}
          />
          <TextField
            label="History of Condition"
            value={values.historyOfCondition}
            onChange={(value) => set({ historyOfCondition: value })}
          />
        </Block>
      </div>
    </Section>
  );
}
