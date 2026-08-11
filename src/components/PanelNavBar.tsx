import { useState, type MouseEvent } from "react";
import Icon from "./Icon";
import PinnedNotesPopover from "./PinnedNotesPopover";
import ContactBookModal from "./ContactBookModal";

export const PAST_NOTE_ICON = "note_alt";
export const PINNED_NOTES_ICON = "keep";
export const CONTACT_BOOK_ICON = "import_contacts";
export const ATTACHMENTS_ICON = "file_present";
export const MEDICAL_HISTORY_ICON = "stethoscope";
export const ORDERS_ICON = "outgoing_mail";
export const MESSAGES_ICON = "forum";

const TOP_ICONS = [PAST_NOTE_ICON, ATTACHMENTS_ICON, MEDICAL_HISTORY_ICON, ORDERS_ICON, "conversion_path"];
const BOTTOM_ICONS = [CONTACT_BOOK_ICON, PINNED_NOTES_ICON, "route", MESSAGES_ICON];

function NavIcon({
  icon,
  active,
  onClick,
}: {
  icon: string;
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-lg p-3 ${active ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
    >
      <div className="flex flex-1 items-center gap-3">
        <Icon name={icon} size={24} className={active ? "text-[#1132ee]" : "text-[#333]"} />
      </div>
    </button>
  );
}

type PanelNavBarProps = {
  active: string | null;
  onSelect: (icon: string) => void;
};

export default function PanelNavBar({ active, onSelect }: PanelNavBarProps) {
  const [pinnedAnchor, setPinnedAnchor] = useState<HTMLElement | null>(null);
  const [contactBookOpen, setContactBookOpen] = useState(false);

  function handleClick(icon: string, event: MouseEvent<HTMLButtonElement>) {
    if (icon === PINNED_NOTES_ICON) {
      const button = event.currentTarget;
      setPinnedAnchor((current) => (current ? null : button));
      return;
    }
    if (icon === CONTACT_BOOK_ICON) {
      setContactBookOpen((current) => !current);
      return;
    }
    onSelect(icon);
  }

  function isActive(icon: string) {
    if (icon === PINNED_NOTES_ICON) return pinnedAnchor !== null;
    if (icon === CONTACT_BOOK_ICON) return contactBookOpen;
    return active === icon;
  }

  return (
    <div className="sticky top-0 flex h-full min-h-0 shrink-0 flex-col items-center overflow-clip border-[0.5px] border-[#e6e6e6] bg-white py-4">
      <div className="flex min-h-0 w-16 flex-1 flex-col items-center">
        <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col items-start overflow-y-auto px-2">
          <div className="flex w-full shrink-0 flex-col gap-1">
            {TOP_ICONS.map((icon) => (
              <NavIcon
                key={icon}
                icon={icon}
                active={isActive(icon)}
                onClick={(event) => handleClick(icon, event)}
              />
            ))}
          </div>
          {/* Grows to push the second group down, and collapses first when the
              rail is too short for every icon so nothing scrolls out of reach. */}
          <div className="min-h-4 w-full flex-1" aria-hidden="true" />
          <div className="flex w-full shrink-0 flex-col gap-1">
            {BOTTOM_ICONS.map((icon) => (
              <NavIcon
                key={icon}
                icon={icon}
                active={isActive(icon)}
                onClick={(event) => handleClick(icon, event)}
              />
            ))}
          </div>
        </div>
      </div>

      {pinnedAnchor && <PinnedNotesPopover anchor={pinnedAnchor} onClose={() => setPinnedAnchor(null)} />}
      {contactBookOpen && <ContactBookModal onClose={() => setContactBookOpen(false)} />}
    </div>
  );
}
