import Icon from "./Icon";
import type { MEDICATIONS } from "../data/chart";

type Medication = (typeof MEDICATIONS)[number];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start">
      <span className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{label}</span>
      <span className="w-full font-body text-[16px] leading-[24px] text-[#666666]">{value}</span>
    </div>
  );
}

export default function MedicationDetails({ medication }: { medication: Medication }) {
  return (
    <div className="flex w-full flex-col items-start gap-4 pt-4">
      <div className="flex w-full flex-col items-start gap-2 rounded-xl border border-[#a0adf8] bg-[#f1f3fe] px-4 pb-3 pt-[14px]">
        <div className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f1749d] to-[#ed457d] shadow-[0px_3px_4px_rgba(0,0,0,0.06)]">
            <Icon name="auto_awesome" size={14} filled className="text-white" />
          </span>
          <span className="font-body text-[16px] font-medium leading-[24px] text-black">SIG</span>
        </div>
        <p className="w-full font-body text-[16px] leading-[24px] text-[#1a1a1a]">{medication.sig}</p>
      </div>

      <div className="flex w-full items-start gap-4">
        <Metric label="Duration" value={medication.duration} />
        <Metric label="Dispense" value={medication.dispense} />
        <Metric label="Refills" value={medication.refills} />
      </div>

      <div className="flex w-full min-w-0 flex-col items-start">
        <span className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Pharmacy</span>
        <span className="w-full font-body text-[16px] leading-[24px] text-[#666666]">{medication.pharmacy.name}</span>
        <p className="w-full min-w-0 whitespace-normal break-words font-body text-[16px] leading-[24px] text-[#666666]">
          {medication.pharmacy.address}
        </p>
      </div>
    </div>
  );
}
