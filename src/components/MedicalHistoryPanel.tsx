import { useState } from "react";
import Badge, { type Tone } from "./Badge";
import Icon from "./Icon";
import MedicationDetails from "./MedicationDetails";
import {
  ALLERGIES,
  DIAGNOSIS_ENCOUNTERS,
  DIAGNOSIS_CODES,
  DIAGNOSIS_HISTORY,
  MEDICATIONS,
  type DiagnosisRecord,
} from "../data/chart";

const SEVERITY_TONES: Record<string, Tone> = { Severe: "red", Moderate: "yellow", Mild: "grey" };

const DIAGNOSIS_TABS = ["By Diagnosis", "By Visit"];
const DIAGNOSIS_PREVIEW_COUNT = 5;

const MEDICATION_TABS = ["Prescribed", "Medication History", "Pending Approvals"];

function medicationsForTab(tab: string) {
  if (tab === "Prescribed") return MEDICATIONS.filter((med) => med.status === "Active");
  if (tab === "Pending Approvals") return MEDICATIONS.filter((med) => med.pendingApproval);
  return MEDICATIONS;
}

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex items-center gap-1 py-2">
      <span className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{title}</span>
      <Icon name={open ? "expand_less" : "expand_more"} size={24} className="text-[#1a1a1a]" />
    </button>
  );
}

function ShowMore({ label = "Show More", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <div className="flex w-full items-center justify-end py-2">
      <button
        type="button"
        onClick={onClick}
        className="flex h-7 items-center rounded-md px-2 font-body text-[14px] font-medium leading-[22px] text-[#1132ee] hover:bg-[rgba(17,50,238,0.08)]"
      >
        {label}
      </button>
    </div>
  );
}

function TabGroup({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect: (tab: string) => void }) {
  return (
    <div className="flex items-center gap-[2px] rounded-lg bg-[#f2f2f2] p-[2px]">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={`flex h-7 items-center justify-center rounded-md px-[10px] font-body text-[14px] font-medium leading-[24px] ${
            active === tab
              ? "bg-white text-[#1132ee] shadow-[0px_0px_2px_rgba(0,0,0,0.03),0px_1px_0.5px_rgba(0,0,0,0.08)]"
              : "text-[#666666]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

const diagnosisRowId = (code: string) => `diagnosis-${code.replace(".", "-")}`;

function CodeChip({ code, onSelect }: { code: string; onSelect: (code: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      title={DIAGNOSIS_CODES[code]?.description}
      aria-label={`View ${code} history`}
      className="flex shrink-0 items-center rounded-md bg-[#f2f2f2] px-2 py-[3px] font-body text-[12px] font-medium leading-[18px] text-[#0f0f0f] hover:bg-[rgba(17,50,238,0.08)] hover:text-[#1132ee]"
    >
      {code}
    </button>
  );
}

function DiagnosisRow({
  record,
  open,
  onToggle,
}: {
  record: DiagnosisRecord;
  open: boolean;
  onToggle: () => void;
}) {
  const visitCount = record.encounters.length;

  return (
    <div id={diagnosisRowId(record.code)} className="flex w-full flex-col border-b border-[#e6e6e6] py-3">
      <div className="flex w-full items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">{record.code}</span>
            {record.status === "Active" ? (
              <Badge tone="green" label="Active" icon="check_circle" />
            ) : (
              <Badge tone="grey" label="Resolved" />
            )}
          </div>
          <p className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{record.description}</p>
          <span className="font-body text-[13px] leading-[18px] text-[#666666]">
            First noted {record.firstNoted} · Last addressed {record.lastAddressed}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "Show"} the ${visitCount} visit${
            visitCount === 1 ? "" : "s"
          } that addressed ${record.code}`}
          className={`flex shrink-0 items-center gap-0.5 rounded-md py-0.5 pl-2 pr-1 font-body text-[13px] font-medium leading-[18px] hover:bg-[rgba(17,50,238,0.08)] ${
            open ? "bg-[rgba(17,50,238,0.08)] text-[#1132ee]" : "text-[#666666]"
          }`}
        >
          {visitCount} {visitCount === 1 ? "visit" : "visits"}
          <Icon name={open ? "expand_less" : "expand_more"} size={18} />
        </button>
      </div>

      {open && (
        <div className="mt-2 flex w-full flex-col gap-1 border-l-2 border-[#e6e6e6] pl-3">
          {record.encounters.map((visit) => (
            <div key={`${visit.date}-${visit.type}`} className="flex w-full items-baseline gap-2">
              <span className="w-[86px] shrink-0 font-body text-[13px] leading-[20px] text-[#666666]">
                {visit.date}
              </span>
              <span className="min-w-0 flex-1 font-body text-[13px] leading-[20px] text-[#1a1a1a]">
                {visit.type} · {visit.provider}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiagnosisByVisit({ onSelectCode }: { onSelectCode: (code: string) => void }) {
  return (
    <div className="flex w-full flex-col items-start">
      {DIAGNOSIS_ENCOUNTERS.map((visit) => (
        <div key={`${visit.date}-${visit.type}`} className="flex w-full flex-col gap-2 border-b border-[#e6e6e6] py-3">
          <div className="flex w-full items-baseline justify-between gap-2">
            <span className="min-w-0 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
              {visit.type}
            </span>
            <span className="shrink-0 font-body text-[13px] leading-[20px] text-[#666666]">{visit.date}</span>
          </div>
          <span className="font-body text-[13px] leading-[18px] text-[#666666]">{visit.provider}</span>
          <div className="flex w-full flex-wrap items-center gap-1.5">
            {visit.codes.map((code) => (
              <CodeChip key={code} code={code} onSelect={onSelectCode} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PastDiagnosisSection() {
  const [tab, setTab] = useState(DIAGNOSIS_TABS[0]);
  const [expanded, setExpanded] = useState(false);

  const activeCount = DIAGNOSIS_HISTORY.filter((record) => record.status === "Active").length;
  const visible = expanded ? DIAGNOSIS_HISTORY : DIAGNOSIS_HISTORY.slice(0, DIAGNOSIS_PREVIEW_COUNT);
  const hidden = DIAGNOSIS_HISTORY.length - visible.length;

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <TabGroup tabs={DIAGNOSIS_TABS} active={tab} onSelect={setTab} />
        <span className="shrink-0 font-body text-[13px] leading-[18px] text-[#666666]">
          {DIAGNOSIS_HISTORY.length} codes · {activeCount} active
        </span>
      </div>

      {tab === "By Diagnosis" ? (
        <div className="flex w-full flex-col items-start">
          {visible.map((record) => (
            <DiagnosisRow key={record.code} record={record} />
          ))}
          {hidden > 0 ? (
            <ShowMore label={`Show ${hidden} More`} onClick={() => setExpanded(true)} />
          ) : (
            DIAGNOSIS_HISTORY.length > DIAGNOSIS_PREVIEW_COUNT && (
              <ShowMore label="Show Less" onClick={() => setExpanded(false)} />
            )
          )}
        </div>
      ) : (
        <DiagnosisByVisit />
      )}
    </div>
  );
}

export default function MedicalHistoryPanel() {
  const [openSections, setOpenSections] = useState<string[]>(["Past Diagnosis", "Medications", "Allergies"]);
  const [medicationTab, setMedicationTab] = useState(MEDICATION_TABS[0]);
  const [openMedication, setOpenMedication] = useState<string | null>(null);

  function toggleSection(title: string) {
    setOpenSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  }

  const isOpen = (title: string) => openSections.includes(title);

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Patient Medical History</h2>

      <div className="flex w-full flex-col items-start pt-4">
        <SectionHeader
          title="Past Diagnosis"
          open={isOpen("Past Diagnosis")}
          onToggle={() => toggleSection("Past Diagnosis")}
        />
        {isOpen("Past Diagnosis") && <PastDiagnosisSection />}
      </div>

      <div className="flex w-full flex-col items-start pt-2">
        <SectionHeader title="Medications" open={isOpen("Medications")} onToggle={() => toggleSection("Medications")} />
        {isOpen("Medications") && (
          <div className="flex w-full flex-col items-start">
            <TabGroup tabs={MEDICATION_TABS} active={medicationTab} onSelect={setMedicationTab} />

            {medicationsForTab(medicationTab).map((med) => {
              const detailsOpen = openMedication === med.name;
              return (
                <div key={med.name} className="flex w-full flex-col border-b border-[#e6e6e6] py-4">
                  <div className="flex w-full items-start gap-1">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
                          {med.name}
                        </span>
                        {med.status === "Active" ? (
                          <Badge tone="green" label="Active" icon="check_circle" />
                        ) : (
                          <Badge tone="grey" label="Expired" icon="cancel" />
                        )}
                      </div>
                      <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{med.date}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenMedication((current) => (current === med.name ? null : med.name))}
                      aria-expanded={detailsOpen}
                      className="flex shrink-0 items-start rounded-full p-1 hover:bg-black/5"
                      aria-label={`${detailsOpen ? "Hide" : "View"} ${med.name} details`}
                    >
                      <Icon name="visibility" size={20} className="text-[#1a1a1a]" />
                    </button>
                  </div>
                  {detailsOpen && <MedicationDetails medication={med} />}
                </div>
              );
            })}
            {medicationsForTab(medicationTab).length === 0 && (
              <p className="w-full py-4 font-body text-[14px] leading-[22px] text-[#666666]">
                No medications to show.
              </p>
            )}
            <ShowMore />
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-start pb-10 pt-2">
        <SectionHeader title="Allergies" open={isOpen("Allergies")} onToggle={() => toggleSection("Allergies")} />
        {isOpen("Allergies") && (
          <div className="flex w-full flex-col items-start">
            {ALLERGIES.map((allergy, i) => (
              <div
                key={`${allergy.name}-${i}`}
                className="flex w-full items-center gap-1 border-b border-[#e6e6e6] py-4"
              >
                <div className="flex min-w-0 flex-1 items-center">
                  <span className="w-[80px] shrink-0 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
                    {allergy.name}
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge tone="blue" label={allergy.status} />
                    <Badge tone={SEVERITY_TONES[allergy.severity] ?? "grey"} label={allergy.severity} />
                  </div>
                </div>
                <span className="shrink-0 font-body text-[14px] leading-[22px] text-[#1a1a1a]">{allergy.date}</span>
              </div>
            ))}
            <ShowMore />
          </div>
        )}
      </div>
    </aside>
  );
}
