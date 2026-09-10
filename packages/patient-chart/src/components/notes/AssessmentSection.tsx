import Section, { SubHeading, Block } from "./Section";
import TextField from "./fields/TextField";
import SnippetTextField from "./snippets/SnippetTextField";
import DateField from "./fields/DateField";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore, usePastNoteSource } from "./noteStore";
import { pastVisitNote } from "../../data/chart";

export default function AssessmentSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();

  const pastNote = pastVisitNote(usePastNoteSource());
  const values =
    readOnly && pastNote
      ? {
          primaryDiagnosis: pastNote.assessment.primaryDiagnosis,
          dateOfOnset: pastNote.assessment.dateOfOnset,
          rehabPotential: pastNote.assessment.rehabPotential,
          keyFindings: pastNote.assessment.keyFindings,
        }
      : store.note.assessment;

  const setAssessment = (patch: Partial<typeof store.note.assessment>) => {
    if (!readOnly) store.patchAssessment(patch);
  };

  return (
    <Section title="Assessment">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Diagnosis & Findings" />
        <Block>
          <SnippetTextField
            label="Primary Diagnosis"
            noteSection="Assessment"
            value={values.primaryDiagnosis}
            onChange={(value) => setAssessment({ primaryDiagnosis: value })}
          />
          <DateField
            label="Date of Onset"
            value={values.dateOfOnset}
            onChange={(value) => setAssessment({ dateOfOnset: value })}
            inline={false}
            disabled
          />
          <TextField
            label="Recovery Potential"
            value={values.rehabPotential}
            onChange={(value) => setAssessment({ rehabPotential: value })}
          />
          <SnippetTextField
            label="Key Findings"
            noteSection="Assessment"
            value={values.keyFindings}
            onChange={(value) => setAssessment({ keyFindings: value })}
          />
        </Block>
      </div>
    </Section>
  );
}
