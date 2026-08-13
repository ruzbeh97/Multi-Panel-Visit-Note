import Section, { SubHeading, Block } from "./Section";
import TextField from "./fields/TextField";
import DateField from "./fields/DateField";
import GoalCard from "./fields/GoalCard";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore } from "./noteStore";
import { CURRENT_VISIT, PREVIOUS_VISIT } from "../../data/chart";

export default function AssessmentSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();

  const source = PREVIOUS_VISIT.assessment;
  const values = readOnly
    ? {
        primaryDiagnosis: source.primaryDiagnosis,
        dateOfOnset: source.dateOfOnset,
        rehabPotential: source.rehabPotential,
        keyFindings: source.keyFindings,
      }
    : store.note.assessment;

  const setAssessment = (patch: Partial<typeof store.note.assessment>) => {
    if (!readOnly) store.patchAssessment(patch);
  };

  // The past note shows its own goals; the live note carries forward this
  // visit's goal list and overlays the progress scored so far.
  const goals = readOnly ? source.goals : CURRENT_VISIT.assessment.goals;
  const goalProgress = readOnly ? source.goals.map((goal) => goal.initialProgress) : store.note.assessment.goalProgress;

  function setGoalProgress(index: number, value: string) {
    if (readOnly) return;
    const next = [...store.note.assessment.goalProgress];
    next[index] = value;
    store.patchAssessment({ goalProgress: next });
  }

  return (
    <Section title="Assessment">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Diagnosis & Findings" />
        <Block>
          <TextField
            label="Primary Diagnosis"
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
          <TextField
            label="Key Findings"
            value={values.keyFindings}
            onChange={(value) => setAssessment({ keyFindings: value })}
          />
        </Block>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Goals & Progress" />
        <Block>
          {goals.map((goal, i) => (
            <GoalCard
              key={i}
              title={goal.title}
              description={goal.description}
              initialValue={goal.initialValue}
              previousVisit={goal.previousVisit}
              goalTarget={goal.goalTarget}
              progress={goalProgress[i] ?? ""}
              onProgressChange={(value) => setGoalProgress(i, value)}
            />
          ))}
        </Block>
      </div>
    </Section>
  );
}
