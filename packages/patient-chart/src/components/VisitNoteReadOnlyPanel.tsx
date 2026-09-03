import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { NoteReadOnlyProvider } from "./notes/readOnly";
import { NoteStoreProvider, PastNoteSourceProvider } from "./notes/noteStore";
import SubjectiveSection from "./notes/SubjectiveSection";
import ObjectiveSection from "./notes/ObjectiveSection";
import AssessmentSection from "./notes/AssessmentSection";
import PlanSection from "./notes/PlanSection";
import OrdersSection from "./notes/OrdersSection";
import BillingDetailsSection from "./notes/BillingDetailsSection";
import { PAST_NOTES } from "../data/chart";

function noteLabel(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} | ${note.visitType} | ${note.provider} ${note.date} ${note.time}`;
}

function noteMeta(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} · ${note.visitType} · ${note.provider} · ${note.date} · ${note.time}`;
}

export type VisitNoteReadOnlyPanelProps = {
  /** Preselects a note; defaults to the most recent visit. */
  noteId?: string;
};

/**
 * Read-only visit note for hosts that only need the note body — no panel chrome
 * and no carry-forward controls, since there is no editable note to import into.
 */
export default function VisitNoteReadOnlyPanel({ noteId }: VisitNoteReadOnlyPanelProps) {
  const [selectedId, setSelectedId] = useState(noteId ?? PAST_NOTES[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = PAST_NOTES.find((note) => note.id === selectedId) ?? PAST_NOTES[0];

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
      <div className="z-10 shrink-0 bg-white px-4 pt-4">
        <div className="flex w-full items-center gap-2 overflow-clip rounded-lg bg-[#f1f3fe] pr-3">
          <div className="h-9 w-1 shrink-0 bg-[#1132ee]" />
          <Icon name="comments_disabled" size={20} className="text-[#1132ee]" />
          <span className="min-w-0 flex-1 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
            This visit note is read only.
          </span>
        </div>

        <div ref={menuRef} className="relative mt-3 pb-3">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label="Select a visit note"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex w-full items-start rounded-lg text-left hover:bg-[rgba(17,50,238,0.06)]"
          >
            <span className="min-w-0 flex-1 whitespace-normal break-words font-body text-[14px] font-medium leading-[20px] text-[#1132ee]">
              {noteLabel(selected)}
            </span>
            <Icon
              name="arrow_drop_down"
              size={20}
              className={`shrink-0 text-[#1132ee] transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div
              role="listbox"
              aria-label="Visit notes"
              className="scrollbar-thin absolute left-0 top-[calc(100%+4px)] z-30 flex max-h-[320px] w-full flex-col overflow-y-auto rounded-xl border border-[#e6e6e6] bg-white py-2 shadow-[0px_12px_32px_rgba(0,0,0,0.14)]"
            >
              {PAST_NOTES.map((note) => {
                const active = note.id === selected.id;
                return (
                  <button
                    key={note.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setSelectedId(note.id);
                      setMenuOpen(false);
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
                    <span className="font-body text-[13px] leading-[18px] text-[#666666]">{noteMeta(note)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        data-note-scroll
        className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col items-start overflow-y-auto px-4 pb-10"
      >
        <NoteStoreProvider>
          <NoteReadOnlyProvider>
            <PastNoteSourceProvider noteId={selected.id}>
              <div className="flex w-full flex-col items-start gap-10">
                <SubjectiveSection />
                <ObjectiveSection />
                <AssessmentSection />
                <PlanSection />
                <OrdersSection />
                <BillingDetailsSection />
              </div>
            </PastNoteSourceProvider>
          </NoteReadOnlyProvider>
        </NoteStoreProvider>
      </div>
    </div>
  );
}
