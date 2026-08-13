import Section, { SubHeading, Block } from "./Section";
import RadioGroup from "./fields/RadioGroup";
import MultiSelectGroup from "./fields/MultiSelectGroup";
import { AutoGrowTextarea } from "./fields/TextField";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore } from "./noteStore";
import {
  EDUCATION_OPTIONS,
  GOAL_OPTIONS,
  PLAN_FORWARD_OPTIONS,
  PREVIOUS_VISIT,
  TREATMENT_OPTIONS,
} from "../../data/chart";

export default function PlanSection() {
  const readOnly = useNoteReadOnly();
  const store = useNoteStore();
  const values = readOnly ? PREVIOUS_VISIT.plan : store.note.plan;

  const setPlan = (patch: Partial<typeof store.note.plan>) => {
    if (!readOnly) store.patchPlan(patch);
  };

  return (
    <Section title="Plan">
      <div className="flex w-full flex-col items-start gap-4">
        <SubHeading title="Visit Plan" />
        <Block>
          <div className="flex w-full flex-col items-start gap-1">
            <div className="flex items-start py-0.5" style={{ width: 160 }}>
              <span className="font-body text-[16px] font-medium leading-[20px] text-[#0a1e8f]">Patient Goal</span>
            </div>
            <AutoGrowTextarea
              value={values.patientGoal}
              onChange={(e) => setPlan({ patientGoal: e.target.value })}
              placeholder="Write something here..."
              readOnly={readOnly}
              className={`min-h-[40px] w-full resize-none rounded-lg px-1.5 py-0.5 font-body text-[14px] leading-[24px] outline-none placeholder:text-[#808080] ${
                readOnly
                  ? "bg-transparent text-[#666]"
                  : "text-[#1a1a1a] hover:bg-[#f7f7f7] focus:bg-white focus:ring-2 focus:ring-[#1132ee]/30"
              }`}
            />
          </div>

          <MultiSelectGroup
            label="Education Topics Discussed"
            options={EDUCATION_OPTIONS}
            values={values.educationTopics}
            onChange={(next) => setPlan({ educationTopics: next })}
          />

          <MultiSelectGroup
            label="Goals"
            options={GOAL_OPTIONS}
            values={values.goals}
            onChange={(next) => setPlan({ goals: next })}
          />

          <MultiSelectGroup
            label="Included Treatments"
            options={TREATMENT_OPTIONS}
            values={values.treatments}
            onChange={(next) => setPlan({ treatments: next })}
          />

          <MultiSelectGroup
            label="Plan Moving Forward"
            options={PLAN_FORWARD_OPTIONS}
            values={values.planForward}
            onChange={(next) => setPlan({ planForward: next })}
          />

          <RadioGroup
            label="Patient Agreement?"
            options={["Yes", "No"]}
            value={values.careAgreement}
            onChange={(value) => setPlan({ careAgreement: value })}
          />
        </Block>
      </div>
    </Section>
  );
}
