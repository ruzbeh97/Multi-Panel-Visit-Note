import Section, { Block } from "./Section";
import SnippetTextField from "./snippets/SnippetTextField";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore, usePastNoteSource } from "./noteStore";
import { pastVisitNote } from "../../data/chart";

export default function ObjectiveSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();
  const pastNote = pastVisitNote(usePastNoteSource());
  const value =
    readOnly && pastNote ? pastNote.objective.painDescription : store.note.objective.painDescription;

  return (
    <Section title="Objective">
      <div className="flex w-full flex-col items-start gap-4">
        <Block>
          <SnippetTextField
            label="Objective"
            noteSection="Objective"
            value={value}
            onChange={(next) => {
              if (!readOnly) store.patchObjective({ painDescription: next });
            }}
          />
        </Block>
      </div>
    </Section>
  );
}
