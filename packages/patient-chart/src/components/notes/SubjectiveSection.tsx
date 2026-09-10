import Section, { SubHeading, Block } from "./Section";
import SnippetTextField from "./snippets/SnippetTextField";
import DateField from "./fields/DateField";
import RadioGroup from "./fields/RadioGroup";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore, usePastNoteSource } from "./noteStore";
import { pastVisitNote } from "../../data/chart";

export default function SubjectiveSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();
  const pastNote = pastVisitNote(usePastNoteSource());
  const values = readOnly && pastNote ? pastNote.subjective : store.note.subjective;
  const set = (patch: Partial<typeof store.note.subjective>) => {
    if (!readOnly) store.patchSubjective(patch);
  };

  return (
    <Section title="Subjective">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Chief Complaint & History" />
        <Block>
          <SnippetTextField
            label="Chief Complaint"
            noteSection="Subjective"
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
          <SnippetTextField
            label="Name of Previous Surgery"
            noteSection="Subjective"
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
          <SnippetTextField
            label="History of Condition"
            noteSection="Subjective"
            value={values.historyOfCondition}
            onChange={(value) => set({ historyOfCondition: value })}
          />
        </Block>
      </div>
    </Section>
  );
}
