import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { PINNED_NOTE, PROVIDER } from "../data/chart";

const GAP = 8;

type PinnedNotesPopoverProps = {
  anchor: HTMLElement;
  onClose: () => void;
};

function formatEditedAt(date: Date) {
  const day = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const time = date
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(/^(\d):/, "0$1:");
  return `${day} ${time}`;
}

export default function PinnedNotesPopover({ anchor, onClose }: PinnedNotesPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [note, setNote] = useState(PINNED_NOTE.body);
  const [editedBy, setEditedBy] = useState(PINNED_NOTE.editedBy);
  const [editedAt, setEditedAt] = useState(PINNED_NOTE.editedAt);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  const canSave = draft.trim().length > 0 && draft.trim() !== note;

  function cancelEdit() {
    setDraft(note);
    setEditing(false);
  }

  function save() {
    if (!canSave) return;
    setNote(draft.trim());
    setEditedBy(PROVIDER.name);
    setEditedAt(formatEditedAt(new Date()));
    setEditing(false);
  }

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const target = anchor.getBoundingClientRect();
    const { width, height } = card.getBoundingClientRect();

    // Prefer sitting immediately right of the rail icon, but the rail hugs the
    // right edge of most window sizes, so flip to the left when it would clip.
    const right = target.right + GAP;
    const left = right + width > window.innerWidth - GAP ? target.left - width - GAP : right;
    const top = Math.min(Math.max(target.top, GAP), window.innerHeight - height - GAP);

    setPosition({ top, left });
  }, [anchor, editing, note]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editing) cancelEdit();
      else onClose();
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!cardRef.current?.contains(target) && !anchor.contains(target)) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [anchor, onClose, editing, note]);

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Pinned patient notes"
      style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? "visible" : "hidden" }}
      className="fixed z-50 w-[376px] rounded-xl bg-white px-5 py-4 shadow-[0px_8px_28px_rgba(0,0,0,0.16)]"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <h2 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">Pinned Patient Notes</h2>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={editing}
            onClick={() => {
              setDraft(note);
              setEditing(true);
            }}
            className={`flex size-7 items-center justify-center rounded-full ${editing ? "" : "hover:bg-black/5"}`}
            aria-label="Edit pinned notes"
          >
            <Icon name="edit" size={20} filled className={editing ? "text-[#b3b3b3]" : "text-[#1a1a1a]"} />
          </button>
          <button
            type="button"
            disabled={editing}
            className={`flex size-7 items-center justify-center rounded-full ${editing ? "" : "hover:bg-black/5"}`}
            aria-label="Delete pinned notes"
          >
            <Icon name="delete" size={20} filled className={editing ? "text-[#b3b3b3]" : "text-[#1a1a1a]"} />
          </button>
        </div>
      </div>

      {editing ? (
        <>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Pinned note"
            className="mt-3 min-h-[105px] w-full resize-none rounded-lg border border-[#e6e6e6] px-3 py-2.5 font-body text-[15px] leading-[22px] text-[#1a1a1a] outline-none"
          />
          <div className="flex w-full items-center justify-end gap-2 pt-2.5">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex h-8 items-center justify-center rounded-full border border-[#1132ee] px-4 font-body text-[15px] font-medium text-[#1132ee] hover:bg-[rgba(17,50,238,0.06)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className={`flex h-8 items-center justify-center rounded-full px-4 font-body text-[15px] font-medium ${
                canSave ? "bg-[#1132ee] text-white hover:bg-[#0f2dd7]" : "bg-[#f2f2f2] text-[#b3b3b3]"
              }`}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="pt-3 font-body text-[15px] leading-[22px] text-[#1a1a1a]">{note}</p>
          <p className="pt-3 font-body text-[13px] leading-[20px] text-[#666666]">
            Last edited by {editedBy} on {editedAt}
          </p>
        </>
      )}
    </div>,
    document.body,
  );
}
