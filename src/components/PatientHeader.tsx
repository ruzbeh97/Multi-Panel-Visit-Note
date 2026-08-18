import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import PinnedNotesPopover from "./PinnedNotesPopover";
import ContactBookModal from "./ContactBookModal";
import {
  ACTIVITY_ICON,
  CONTACT_BOOK_ICON,
  ICON_LABELS,
  MESSAGES_ICON,
  PINNED_NOTES_ICON,
} from "./PanelNavBar";
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

const HEADER_ACTIONS = [CONTACT_BOOK_ICON, PINNED_NOTES_ICON, ACTIVITY_ICON, MESSAGES_ICON] as const;

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

function HeaderTooltip({ label, top, left }: { label: string; top: number; left: number }) {
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 flex flex-col items-center"
      style={{ top, left, transform: "translate(-50%, 0)" }}
    >
      <span
        aria-hidden
        className="h-0 w-0 border-x-[5px] border-x-transparent border-b-[6px] border-b-[#292929]"
      />
      <span className="whitespace-nowrap rounded-md bg-[#292929] px-2.5 py-1.5 font-body text-[12px] font-medium leading-[16px] text-white shadow-[0px_4px_12px_rgba(0,0,0,0.18)]">
        {label}
      </span>
    </div>,
    document.body,
  );
}

function HeaderActionIcon({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!hovered || !buttonRef.current) {
      setPosition(null);
      return;
    }

    function update() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left + rect.width / 2,
      });
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [hovered]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={`flex items-center justify-center rounded-lg p-2 ${
          active ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
        }`}
      >
        <Icon name={icon} size={20} className={active ? "text-[#1132ee]" : "text-[#333]"} />
      </button>
      {hovered && position && <HeaderTooltip label={label} top={position.top} left={position.left} />}
    </>
  );
}

type PatientHeaderProps = {
  activePanel: string | null;
  onSelectPanel: (icon: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
};

export default function PatientHeader({
  activePanel,
  onSelectPanel,
  activeTab,
  onSelectTab,
}: PatientHeaderProps) {
  const [pinnedAnchor, setPinnedAnchor] = useState<HTMLElement | null>(null);
  const [contactBookOpen, setContactBookOpen] = useState(false);

  function handleAction(icon: string, event: MouseEvent<HTMLButtonElement>) {
    if (icon === PINNED_NOTES_ICON) {
      const button = event.currentTarget;
      setPinnedAnchor((current) => (current ? null : button));
      return;
    }
    if (icon === CONTACT_BOOK_ICON) {
      setContactBookOpen((current) => !current);
      return;
    }
    onSelectPanel(icon);
  }

  function isActive(icon: string) {
    if (icon === PINNED_NOTES_ICON) return pinnedAnchor !== null;
    if (icon === CONTACT_BOOK_ICON) return contactBookOpen;
    return activePanel === icon;
  }

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
            <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[24px] text-[#181b1b]">Book Appointment</span>
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

        <div className="flex shrink-0 items-center gap-0.5 self-stretch pb-0.5">
          {HEADER_ACTIONS.map((icon) => (
            <HeaderActionIcon
              key={icon}
              icon={icon}
              label={ICON_LABELS[icon]}
              active={isActive(icon)}
              onClick={(event) => handleAction(icon, event)}
            />
          ))}
        </div>
      </div>

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
              <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[22px] text-[#1132ee]">Expand</span>
            </button>
          </div>
        </div>
      </div>

      {pinnedAnchor && <PinnedNotesPopover anchor={pinnedAnchor} onClose={() => setPinnedAnchor(null)} />}
      {contactBookOpen && <ContactBookModal onClose={() => setContactBookOpen(false)} />}
    </div>
  );
}
