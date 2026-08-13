import { useState } from "react";
import Section, { SubHeading, Block } from "./Section";
import RadioGroup from "./fields/RadioGroup";
import MultiSelectGroup from "./fields/MultiSelectGroup";
import { AutoGrowTextarea } from "./fields/TextField";
import { useNoteReadOnly } from "./readOnly";
import {
  CURRENT_VISIT,
  EDUCATION_OPTIONS,
  GOAL_OPTIONS,
  PLAN_FORWARD_OPTIONS,
  PREVIOUS_VISIT,
  TREATMENT_OPTIONS,
} from "../../data/chart";

export default function PlanSection() {
  const readOnly = useNoteReadOnly();
  const { plan } = readOnly ? PREVIOUS_VISIT : CURRENT_VISIT;
  const [patientGoal, setPatientGoal] = useState(plan.patientGoal);
  const [educationTopics, setEducationTopics] = useState<string[]>(plan.educationTopics);
  const [goals, setGoals] = useState<string[]>(plan.goals);
  const [treatments, setTreatments] = useState<string[]>(plan.treatments);
  const [planForward, setPlanForward] = useState<string[]>(plan.planForward);
  const [careAgreement, setCareAgreement] = useState(plan.careAgreement);

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
              value={patientGoal}
              onChange={(e) => setPatientGoal(e.target.value)}
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
            values={educationTopics}
            onChange={setEducationTopics}
          />

          <MultiSelectGroup label="Goals" options={GOAL_OPTIONS} values={goals} onChange={setGoals} />

          <MultiSelectGroup
            label="Included Treatments"
            options={TREATMENT_OPTIONS}
            values={treatments}
            onChange={setTreatments}
          />

          <MultiSelectGroup
            label="Plan Moving Forward"
            options={PLAN_FORWARD_OPTIONS}
            values={planForward}
            onChange={setPlanForward}
          />

          <RadioGroup label="Patient Agreement?" options={["Yes", "No"]} value={careAgreement} onChange={setCareAgreement} />
        </Block>
      </div>
    </Section>
  );
}
