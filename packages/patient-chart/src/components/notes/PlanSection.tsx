import Section, { SubHeading, Block } from "./Section";
import SnippetTextField from "./snippets/SnippetTextField";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore, usePastNoteSource } from "./noteStore";
import { pastVisitNote } from "../../data/chart";

export default function PlanSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();
  const pastNote = pastVisitNote(usePastNoteSource());
  const value = readOnly && pastNote ? pastNote.plan.patientGoal : store.note.plan.patientGoal;

  return (
    <Section title="Plan">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Visit Plan" />
        <Block>
          <SnippetTextField
            label="Plan"
            noteSection="Plan"
            value={value}
            onChange={(next) => {
              if (!readOnly) store.patchPlan({ patientGoal: next });
            }}
          />
        </Block>
      </div>
    </Section>
  );
}
