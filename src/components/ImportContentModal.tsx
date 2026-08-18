import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { PAST_NOTES } from "../data/chart";
import type { ImportAction } from "./notes/noteStore";

const GAP = 8;

const ACTIONS = [
  {
    id: "overwrite",
    label: "Overwrite",
    icon: "edit",
    helper: "This will overwrite any existing data in this section of the note.",
  },
  {
    id: "append",
    label: "Append",
    icon: "keyboard_tab",
    helper: "This will add the imported content after any existing data in this section.",
  },
  {
    id: "prepend",
    label: "Prepend",
    icon: "keyboard_tab_rtl",
    helper: "This will add the imported content before any existing data in this section.",
  },
  {
    id: "blend",
    label: "Blend",
    icon: "auto_awesome",
    helper: "Athelas AI will merge the imported content with what is already in this section.",
  },
] as const;

type ImportContentModalProps = {
  anchor: HTMLElement;
  sectionTitle: string;
  defaultNoteId?: string | null;
  onImport?: (noteId: string, action: ImportAction) => void;
  onClose: () => void;
};

export default function ImportContentModal({
  anchor,
  sectionTitle,
  defaultNoteId = null,
  onImport,
  onClose,
}: ImportContentModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [noteId, setNoteId] = useState<string | null>(defaultNoteId);
  const [listOpen, setListOpen] = useState(false);
  const [action, setAction] = useState<ImportAction>("overwrite");

  const noteLocked = Boolean(defaultNoteId);
  const selected = PAST_NOTES.find((note) => note.id === noteId) ?? null;
  const helper = ACTIONS.find((option) => option.id === action)?.helper ?? "";

  useLayoutEffect(() => {
    function update() {
      const card = cardRef.current;
      if (!card) return;

      const target = anchor.getBoundingClientRect();
      const { width, height } = card.getBoundingClientRect();

      const top = Math.min(Math.max(target.bottom + GAP, GAP), Math.max(window.innerHeight - height - GAP, GAP));
      // Right-align under the icon, then keep the card inside the viewport.
      const left = Math.min(Math.max(target.right - width, GAP), Math.max(window.innerWidth - width - GAP, GAP));

      setPosition({ top, left });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor, listOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (listOpen) setListOpen(false);
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
  }, [anchor, onClose, listOpen]);

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Import content from a previous visit"
      style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? "visible" : "hidden" }}
      className="fixed z-50 flex w-[min(560px,calc(100vw-16px))] flex-col gap-6 rounded-2xl border border-[#e6e6e6] bg-white p-8 shadow-[0px_12px_32px_rgba(0,0,0,0.14)]"
    >
      <h2 className="w-full font-body text-[24px] font-bold leading-[32px] tracking-[-0.5px] text-[#1a1a1a]">
        Import Content from Last Visit
      </h2>

      {!noteLocked && (
        <div className="relative w-full">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={listOpen}
            onClick={() => setListOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#e6e6e6] bg-white px-4 py-3 hover:bg-[#f7f7f7]"
          >
            <span
              className={`min-w-0 truncate font-body text-[16px] ${selected ? "text-[#1a1a1a]" : "text-[#666666]"}`}
            >
              {selected
                ? `${selected.title} · ${selected.provider} · ${selected.visitType} · ${selected.date} · ${selected.time}`
                : "Select a previous chart note"}
            </span>
            <Icon
              name="keyboard_arrow_down"
              size={16}
              className={`shrink-0 text-[#1a1a1a] transition-transform ${listOpen ? "rotate-180" : ""}`}
            />
          </button>

          {listOpen && (
            <div
              role="listbox"
              aria-label="Previous chart notes"
              className="scrollbar-thin absolute left-0 top-[calc(100%+4px)] z-10 flex max-h-[240px] w-full flex-col overflow-y-auto rounded-xl border border-[#e6e6e6] bg-white py-2 shadow-[0px_12px_32px_rgba(0,0,0,0.14)]"
            >
              {PAST_NOTES.map((note) => {
                const active = note.id === noteId;
                return (
                  <button
                    key={note.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setNoteId(note.id);
                      setListOpen(false);
                    }}
                    className={`mx-2 flex flex-col items-start rounded-lg px-3 py-2 text-left ${
                      active ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <span
                      className={`font-body text-[14px] font-medium leading-[20px] ${
                        active ? "text-[#1132ee]" : "text-[#1a1a1a]"
                      }`}
                    >
                      {note.title}
                    </span>
                    <span className="font-body text-[13px] leading-[18px] text-[#666666]">
                      {note.caseName} · {note.provider} · {note.visitType} · {note.date} · {note.time}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex w-full items-center justify-between gap-4 whitespace-nowrap font-body text-[15px]">
        <span className="font-medium text-[#1132ee]">Pulling From Section:</span>
        <span className="truncate font-bold text-[#1a1a1a]">{sectionTitle}</span>
      </div>

      <div className="flex w-full items-center gap-4">
        <span className="w-[60px] shrink-0 font-body text-[15px] font-medium text-[#1132ee]">Action</span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {ACTIONS.map((option) => {
            const active = option.id === action;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setAction(option.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 font-body text-[14px] ${
                  active
                    ? "border-[rgba(17,50,238,0.2)] bg-[rgba(17,50,238,0.08)] font-bold text-[#1132ee]"
                    : "border-[#e6e6e6] bg-[#f7f7f7] font-medium text-[#666666] hover:bg-[#f0f0f0]"
                }`}
              >
                <Icon name={option.icon} size={14} className={active ? "text-[#1132ee]" : "text-[#666666]"} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-full items-start gap-2">
        <span className="flex shrink-0 pt-0.5">
          <Icon name="settings" size={16} className="text-[#666666]" />
        </span>
        <p className="min-w-0 flex-1 font-body text-[14px] leading-[20px] text-[#666666]">{helper}</p>
      </div>

      <div className="flex w-full items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-3xl border border-[#1132ee] bg-white px-6 py-3 font-body text-[15px] font-bold text-[#1132ee] hover:bg-[rgba(17,50,238,0.06)]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (selected) onImport?.(selected.id, action);
            onClose();
          }}
          className={`flex items-center justify-center rounded-3xl px-6 py-3 font-body text-[15px] font-bold ${
            selected ? "bg-[#1132ee] text-white hover:bg-[#0f2dd7]" : "bg-[#f5f5f7] text-[#c1c1cd]"
          }`}
        >
          Import
        </button>
      </div>
    </div>,
    document.body,
  );
}
