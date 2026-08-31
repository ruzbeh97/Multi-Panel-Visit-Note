import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

export const PAST_NOTE_ICON = "note_alt";
export const PINNED_NOTES_ICON = "keep";
export const CONTACT_BOOK_ICON = "import_contacts";
export const ATTACHMENTS_ICON = "file_present";
export const DIAGNOSIS_ICON = "stethoscope";
export const MEDICAL_HISTORY_ICON = DIAGNOSIS_ICON;
export const MEDICATIONS_ICON = "pill";
export const ALLERGIES_ICON = "sick";
export const ORDERS_ICON = "outgoing_mail";
export const MESSAGES_ICON = "forum";
export const ACTIVITY_ICON = "route";
export const TIMELINE_ICON = "conversion_path";

const NAV_ICONS = [
  PAST_NOTE_ICON,
  ATTACHMENTS_ICON,
  DIAGNOSIS_ICON,
  MEDICATIONS_ICON,
  ALLERGIES_ICON,
  ORDERS_ICON,
  TIMELINE_ICON,
];

export const ICON_LABELS: Record<string, string> = {
  [PAST_NOTE_ICON]: "Past Notes",
  [ATTACHMENTS_ICON]: "Attachments",
  [DIAGNOSIS_ICON]: "Diagnosis",
  [MEDICATIONS_ICON]: "Medications",
  [ALLERGIES_ICON]: "Allergies",
  [ORDERS_ICON]: "Orders",
  [TIMELINE_ICON]: "Care Timeline",
  [CONTACT_BOOK_ICON]: "Contact Book",
  [PINNED_NOTES_ICON]: "Pinned Notes",
  [ACTIVITY_ICON]: "Activity",
  [MESSAGES_ICON]: "Messages",
};

function NavTooltip({ label, top, left }: { label: string; top: number; left: number }) {
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 flex items-center"
      style={{ top, left, transform: "translate(-100%, -50%)" }}
    >
      <span className="whitespace-nowrap rounded-md bg-[#292929] px-2.5 py-1.5 font-body text-[12px] font-medium leading-[16px] text-white shadow-[0px_4px_12px_rgba(0,0,0,0.18)]">
        {label}
      </span>
      <span
        aria-hidden
        className="h-0 w-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-[#292929]"
      />
    </div>,
    document.body,
  );
}

function NavIcon({
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
        top: rect.top + rect.height / 2,
        left: rect.left - 6,
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
        className={`flex w-full items-center gap-1.5 rounded-lg p-3 ${active ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
      >
        <div className="flex flex-1 items-center gap-3">
          <Icon name={icon} size={24} className={active ? "text-[#1132ee]" : "text-[#333]"} />
        </div>
      </button>
      {hovered && position && <NavTooltip label={label} top={position.top} left={position.left} />}
    </>
  );
}

type PanelNavBarProps = {
  active: string | null;
  onSelect: (icon: string) => void;
  // "inset" sits inside the chart frame; "standalone" is its own card beside it.
  variant?: "inset" | "standalone";
};

export default function PanelNavBar({ active, onSelect, variant = "inset" }: PanelNavBarProps) {
  return (
    <div
      className={`flex h-full min-h-0 shrink-0 flex-col items-center overflow-clip border-[#e6e6e6] bg-white py-4 ${
        variant === "standalone" ? "border-l" : "sticky top-0 border-[0.5px]"
      }`}
    >
      <div className="flex min-h-0 w-16 flex-1 flex-col items-center">
        <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col items-start overflow-y-auto px-2">
          <div className="flex w-full shrink-0 flex-col gap-1">
            {NAV_ICONS.map((icon) => (
              <NavIcon
                key={icon}
                icon={icon}
                label={ICON_LABELS[icon]}
                active={active === icon}
                onClick={() => onSelect(icon)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
