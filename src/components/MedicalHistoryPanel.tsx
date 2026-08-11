import { useState } from "react";
import Icon from "./Icon";
import { ALLERGIES, MEDICATIONS, PAST_DIAGNOSES } from "../data/chart";

type Tone = "grey" | "blue" | "red" | "green" | "yellow";

const TONES: Record<Tone, string> = {
  grey: "bg-[rgba(128,128,128,0.12)]",
  blue: "bg-[rgba(27,131,228,0.12)]",
  red: "bg-[rgba(230,25,42,0.12)]",
  green: "bg-[rgba(79,176,115,0.12)]",
  yellow: "bg-[rgba(255,204,0,0.16)]",
};

const SEVERITY_TONES: Record<string, Tone> = { Severe: "red", Moderate: "yellow", Mild: "grey" };

const MEDICATION_TABS = ["Prescribed", "Medication History"];

type Medication = (typeof MEDICATIONS)[number];

function Badge({ tone, label, icon }: { tone: Tone; label: string; icon?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full py-[5px] font-body text-[12px] font-medium leading-[18px] text-[#0f0f0f] ${
        icon ? "pl-2 pr-[14px]" : "px-3"
      } ${TONES[tone]}`}
    >
      {icon && <Icon name={icon} size={16} filled className="text-[#454545]" />}
      {label}
    </span>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-start">
      <span className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{label}</span>
      <span className="font-body text-[16px] leading-[24px] text-[#666666]">{value}</span>
    </div>
  );
}

function MedicationDetails({ medication }: { medication: Medication }) {
  return (
    <div className="flex w-full flex-col gap-3 pt-4">
      <div className="flex w-full flex-col gap-2 rounded-xl border border-[#a0adf8] bg-[#f1f3fe] px-4 pb-3 pt-[14px]">
        <div className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f1749d] to-[#ed457d] shadow-[0px_3px_4px_rgba(0,0,0,0.06)]">
            <Icon name="auto_awesome" size={14} filled className="text-white" />
          </span>
          <span className="font-body text-[16px] font-medium leading-[24px] text-black">SIG</span>
        </div>
        <p className="font-body text-[14px] leading-[24px] text-[#1a1a1a]">{medication.sig}</p>
      </div>
      <div className="flex w-full items-start gap-4">
        <InfoField label="Duration" value={medication.duration} />
        <InfoField label="Dispense" value={medication.dispense} />
      </div>
      <InfoField label="Refills" value={medication.refills} />
    </div>
  );
}

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex items-center gap-1 py-2">
      <span className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{title}</span>
      <Icon name={open ? "expand_less" : "expand_more"} size={24} className="text-[#1a1a1a]" />
    </button>
  );
}

function ShowMore() {
  return (
    <div className="flex w-full items-center justify-end py-2">
      <button
        type="button"
        className="flex h-7 items-center rounded-md px-2 font-body text-[14px] font-medium leading-[22px] text-[#1132ee] hover:bg-[rgba(17,50,238,0.08)]"
      >
        Show More
      </button>
    </div>
  );
}

export default function MedicalHistoryPanel() {
  const [openSections, setOpenSections] = useState<string[]>(["Past Diagnosis", "Medications", "Allergies"]);
  const [medicationTab, setMedicationTab] = useState(MEDICATION_TABS[0]);
  const [openMedication, setOpenMedication] = useState<number | null>(null);

  function toggleSection(title: string) {
    setOpenSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  }

  const isOpen = (title: string) => openSections.includes(title);

  return (
    <aside className="scrollbar-thin sticky top-0 ml-4 flex h-full w-[484px] shrink-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Patient Medical History</h2>

      <div className="flex w-full flex-col items-start pt-4">
        <SectionHeader
          title="Past Diagnosis"
          open={isOpen("Past Diagnosis")}
          onToggle={() => toggleSection("Past Diagnosis")}
        />
        {isOpen("Past Diagnosis") && (
          <div className="flex w-full flex-col items-start">
            {PAST_DIAGNOSES.map((row, i) => (
              <div
                key={`${row.type}-${i}`}
                className={`flex w-full items-start gap-2 py-2 ${
                  i === PAST_DIAGNOSES.length - 1 ? "" : "border-b border-[#e6e6e6]"
                }`}
              >
                <div className="flex w-[117px] shrink-0 flex-col">
                  <span className="truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
                    {row.type}
                  </span>
                  <span className="truncate font-body text-[14px] leading-[22px] text-[#666666]">{row.provider}</span>
                  <span className="truncate font-body text-[14px] leading-[22px] text-[#666666]">{row.date}</span>
                </div>
                <p className="min-w-0 flex-1 font-body text-[14px] leading-[22px] text-[#1a1a1a]">{row.diagnosis}</p>
              </div>
            ))}
            <ShowMore />
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-start pt-2">
        <SectionHeader title="Medications" open={isOpen("Medications")} onToggle={() => toggleSection("Medications")} />
        {isOpen("Medications") && (
          <div className="flex w-full flex-col items-start">
            <div className="flex items-center gap-[2px] rounded-lg bg-[#f2f2f2] p-[2px]">
              {MEDICATION_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMedicationTab(tab)}
                  className={`flex h-7 items-center justify-center rounded-md px-[10px] font-body text-[14px] font-medium leading-[24px] ${
                    medicationTab === tab
                      ? "bg-white text-[#1132ee] shadow-[0px_0px_2px_rgba(0,0,0,0.03),0px_1px_0.5px_rgba(0,0,0,0.08)]"
                      : "text-[#666666]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {MEDICATIONS.map((med, i) => {
              const detailsOpen = openMedication === i;
              return (
                <div key={`${med.name}-${i}`} className="flex w-full flex-col border-b border-[#e6e6e6] py-4">
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
                      onClick={() => setOpenMedication((current) => (current === i ? null : i))}
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
