import type { ReactNode } from "react";
import Badge from "./Badge";
import Icon from "./Icon";
import type { MEDICATIONS } from "../data/chart";

type Medication = (typeof MEDICATIONS)[number];
type LogEntry = Medication["log"][number];

function SectionTitle({
  icon,
  title,
  tall,
  children,
}: {
  icon: string;
  title: string;
  tall?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`flex w-full items-center justify-between border-b border-[#e6e6e6] ${tall ? "py-4" : "py-2"}`}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#dcefdd]">
          <Icon name={icon} size={16} className="text-[#1a1a1a]" />
        </span>
        <span className="truncate font-body text-[16px] font-medium leading-[24px] text-black">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, values, action }: { label: string; values: string[]; action?: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-start">
      <div className="flex w-full items-start gap-2">
        <p className="min-w-0 flex-1 font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{label}</p>
        {action}
      </div>
      {values.map((value, i) => (
        <p key={i} className="w-full font-body text-[16px] leading-[24px] text-[#666666]">
          {value}
        </p>
      ))}
    </div>
  );
}

function TimelineRow({ entry, last }: { entry: LogEntry; last: boolean }) {
  const completed = entry.status === "completed";
  return (
    <div className="flex w-full items-start gap-4 pr-5">
      <div className="flex w-[148px] shrink-0 items-center justify-end">
        <span className="truncate text-right font-body text-[14px] leading-[24px] text-[#666666]">{entry.date}</span>
      </div>
      <div className="flex w-3 shrink-0 flex-col items-center gap-2 self-stretch pt-1.5">
        <span
          className={`size-3 shrink-0 rounded-full ${completed ? "bg-[#181b1b]" : "border-2 border-[#bfbfbf]"}`}
        />
        {!last && (
          <div className="flex min-h-px w-full flex-1 flex-col items-center">
            <div className={`w-[2px] flex-1 rounded-sm ${completed ? "bg-[#181b1b]" : "bg-[#bfbfbf]"}`} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <p className="w-full font-body text-[16px] font-bold leading-[24px] text-[#1a1a1a]">{entry.title}</p>
        <p className="w-full font-body text-[14px] leading-[24px] text-[#1a1a1a]">{entry.detail}</p>
      </div>
    </div>
  );
}

export default function MedicationDetails({ medication }: { medication: Medication }) {
  return (
    <div className="flex w-full flex-col items-start gap-2 pt-4">
      <div className="flex w-full flex-col items-start gap-3">
        <SectionTitle icon="info" title="General Info" />
        <Field
          label="Associated Appointment"
          values={[medication.appointment]}
          action={
            <button
              type="button"
              className="shrink-0 font-body text-[16px] font-medium leading-[24px] text-[#1132ee] hover:underline"
            >
              Open Note
            </button>
          }
        />
        <Field label="Pharmacy" values={[medication.pharmacy.name, medication.pharmacy.address]} />
        <Field label="Prescribing Practitioner" values={[medication.prescriber]} />
      </div>

      <SectionTitle icon="list" title="Medication Details">
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-body text-[16px] font-medium leading-[24px] text-black">Status:</span>
          {medication.status === "Active" ? (
            <Badge tone="green" label="Active" icon="check_circle" />
          ) : (
            <Badge tone="grey" label={medication.status} icon="cancel" />
          )}
        </div>
      </SectionTitle>

      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex w-full items-start gap-4">
          <Field label="Medication" values={[medication.name]} />
          <Field label="Unit Code" values={[medication.unitCode]} />
        </div>
        <div className="flex w-full items-start gap-4">
          <Field label="Status" values={[medication.fillStatus]} />
          <Field label="Dose" values={[medication.dose]} />
        </div>
        <div className="flex w-full items-start gap-4">
          <Field label="Route" values={[medication.route]} />
          <Field label="Frequency" values={[medication.frequency]} />
        </div>
        <div className="flex w-full items-start gap-4">
          <Field label="Duration" values={[medication.duration]} />
          <Field label="Dispense" values={[medication.dispense]} />
        </div>
        <Field label="Refills" values={[medication.refills]} />

        <div className="flex w-full flex-col items-start gap-2 rounded-xl border border-[#a0adf8] bg-[#f1f3fe] px-4 pb-3 pt-[14px]">
          <div className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f1749d] to-[#ed457d] shadow-[0px_3px_4px_rgba(0,0,0,0.06)]">
              <Icon name="auto_awesome" size={14} filled className="text-white" />
            </span>
            <span className="font-body text-[16px] font-medium leading-[24px] text-black">SIG</span>
          </div>
          <p className="w-full font-body text-[14px] leading-[24px] text-[#1a1a1a]">{medication.sig}</p>
        </div>
      </div>

      <SectionTitle icon="notes" title="Notes" tall />
      <div className="flex w-full flex-col items-start gap-3">
        <Field label="External Notes" values={[medication.externalNotes]} />
        <Field label="Pharmacy Notes" values={[medication.pharmacyNotes]} />
      </div>

      <SectionTitle icon="history" title="Historical Log" tall />
      <div className="flex w-full flex-col items-start gap-3 rounded-lg bg-[#f7f7f7] py-6">
        {medication.log.map((entry, i) => (
          <TimelineRow key={`${entry.title}-${i}`} entry={entry} last={i === medication.log.length - 1} />
        ))}
      </div>
    </div>
  );
}
