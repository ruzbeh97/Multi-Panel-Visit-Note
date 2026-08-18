import Icon from "./Icon";
import { CASE, PATIENT } from "../data/chart";

const TABS = [
  "Demographics",
  "Appointments",
  "Attachments",
  "Tasks",
  "Medications",
  "Allergies",
  "Vitals",
  "Immunizations",
  "Problem List",
  "Orders",
  "Labs",
];

function IconButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="group relative flex items-start rounded-full p-1 hover:bg-black/5" aria-label={label} title={label}>
      <Icon name={icon} size={20} className="text-[#1a1a1a]" />
    </button>
  );
}

function Divider() {
  return <div className="h-full w-px shrink-0 self-stretch bg-[#e6e6e6]" />;
}

function SelectField({ label }: { label: string }) {
  return (
    <div className="flex w-[200px] flex-col items-start">
      <div className="flex h-9 w-full flex-col items-start justify-center rounded-md border border-[#e6e6e6] bg-white pl-3 pr-2">
        <div className="flex w-full items-center gap-2 py-1.5">
          <span className="flex-1 truncate font-body text-[14px] text-[#1a1a1a]">{label}</span>
          <Icon name="arrow_drop_down" size={20} className="shrink-0 text-[#666]" />
        </div>
      </div>
    </div>
  );
}

type PatientHeaderProps = {
  activeTab: string;
  onSelectTab: (tab: string) => void;
};

export default function PatientHeader({ activeTab, onSelectTab }: PatientHeaderProps) {
  return (
    <div className="flex w-full flex-col items-start pt-2">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ffad33]">
            <span className="font-body text-[26px] font-medium leading-none text-[#1a1a1a]">{PATIENT.initial}</span>
          </div>
          <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[22px] text-[#1132ee]">{PATIENT.name}</span>
          <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[22px] text-[#666]">
            (MRN: {PATIENT.mrn}, DOB: {PATIENT.dob})
          </span>
          <IconButton icon="expand_more" label="Expand patient info" />
          <IconButton icon="content_copy" label="Copy" />
          <IconButton icon="account_balance_wallet" label="Wallet" />
          <IconButton icon="print" label="Print" />
        </div>
        <div className="flex w-[237px] items-center justify-between">
          <IconButton icon="history" label="History" />
          <IconButton icon="flag" label="Flag" />
          <button className="flex items-center justify-center gap-2 rounded-full border border-[#181b1b] py-1.5 pl-3 pr-4">
            <Icon name="edit_calendar" size={20} className="text-[#181b1b]" />
            <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[24px] text-[#181b1b]">
              Book Appointment
            </span>
          </button>
        </div>
      </div>

      <div className="flex w-full items-center gap-4 border-b border-[#e6e6e6] pl-4 pr-3">
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-4 overflow-x-auto">
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`flex shrink-0 items-center justify-center gap-0.5 whitespace-nowrap px-1.5 pb-2.5 pt-2 font-body text-[14px] font-medium leading-[22px] ${
                  active ? "border-b-2 border-[#1132ee] text-[#1132ee]" : "text-[#666] hover:text-[#1a1a1a]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "Appointments" && (
        <div className="flex h-[94px] w-full flex-col items-start border-b border-[#e6e6e6] bg-white px-4 py-3">
          <div className="flex w-full flex-col items-start gap-1.5">
            <div className="flex w-full items-center justify-between">
              <h1 className="font-body text-[20px] font-medium leading-[28px] text-[#1a1a1a]">{CASE.name}</h1>
              <div className="flex h-full items-center gap-4">
                <span className="whitespace-nowrap font-body text-[16px] text-[#1a1a1a]">{CASE.visitDate}</span>
                <Divider />
                <SelectField label="Established Patient" />
                <Divider />
                <SelectField label="Clinical Note Type" />
                <Divider />
                <SelectField label="ONC Clinical Note Type" />
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">
                <span className="whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Next follow-up: </span>
                  <span className="text-[#303536]">{CASE.nextFollowUp}</span>
                </span>
                <span className="whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Pending Visits </span>
                  <span className="text-[#1a1a1a]">{CASE.pendingVisits}</span>
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Prior Auth:</span>
                  <button className="text-[14px] font-medium text-[#1132ee]">Add</button>
                </span>
                <span className="whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Primary Insurance: </span>
                  <span className="text-[#1a1a1a]">{PATIENT.insurance}</span>
                </span>
                <span className="whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Gender: </span>
                  <span className="text-[#1a1a1a]">{PATIENT.gender}</span>
                </span>
                <span className="whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Age: </span>
                  <span className="text-[#1a1a1a]">{PATIENT.age}</span>
                </span>
                <span className="whitespace-nowrap font-body text-[14px] font-medium">
                  <span className="text-[#666]">Date of Birth: </span>
                  <span className="text-[#1a1a1a]">{PATIENT.dob}</span>
                </span>
              </div>
              <button className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-[3px]">
                <Icon name="open_in_full" size={14} className="text-[#1132ee]" />
                <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[22px] text-[#1132ee]">
                  Expand
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
