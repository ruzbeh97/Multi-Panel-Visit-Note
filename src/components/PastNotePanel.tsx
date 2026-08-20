import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import NoteOutlineRail from "./NoteOutlineRail";
import { NoteReadOnlyProvider } from "./notes/readOnly";
import { PastNoteSourceProvider, useNoteStore } from "./notes/noteStore";
import SubjectiveSection from "./notes/SubjectiveSection";
import ObjectiveSection from "./notes/ObjectiveSection";
import AssessmentSection from "./notes/AssessmentSection";
import PlanSection from "./notes/PlanSection";
import OrdersSection from "./notes/OrdersSection";
import { PAST_NOTES } from "../data/chart";

function noteLabel(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} | ${note.visitType} | ${note.provider} ${note.date} ${note.time}`;
}

function noteMeta(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} · ${note.visitType} · ${note.provider} · ${note.date} · ${note.time}`;
}

type PastNotePanelProps = {
  onOpenVisit?: (noteId: string) => void;
};

export default function PastNotePanel({ onOpenVisit }: PastNotePanelProps) {
  const [selectedId, setSelectedId] = useState(PAST_NOTES[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const store = useNoteStore();
  const carriedForward = store.canUndoImportWholeNote;

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
    <aside
      data-note-scroll
      className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white pr-4 pt-5"
    >
      <div className="w-full pl-[49px]">
        <div className="flex w-full items-center gap-2 overflow-clip rounded-lg bg-[#f1f3fe] pr-3">
          <div className="h-9 w-1 shrink-0 bg-[#1132ee]" />
          <Icon name="comments_disabled" size={20} className="text-[#1132ee]" />
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">This visit note is read only.</span>
        </div>
      </div>

      <div className="flex w-full items-start pt-2">
        <NoteOutlineRail />

        <div className="ml-4 flex min-w-0 flex-1 flex-col items-start gap-3 pb-10">
          <div className="flex w-full items-start gap-1">
            <div ref={menuRef} className="relative min-w-0 max-w-[300px]">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                aria-label="Select a past visit note"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex min-w-0 max-w-full items-start rounded-lg hover:bg-[rgba(17,50,238,0.06)]"
              >
                <span className="min-w-0 flex-1 whitespace-normal break-words text-left font-body text-[14px] font-medium leading-[20px] text-[#1132ee]">
                  {noteLabel(selected)}
                </span>
                <Icon
                  name="arrow_drop_down"
                  size={20}
                  className={`mt-0 shrink-0 text-[#1132ee] transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="listbox"
                  aria-label="Past visit notes"
                  className="scrollbar-thin absolute left-0 top-[calc(100%+4px)] z-30 flex max-h-[320px] w-[min(360px,calc(100vw-48px))] flex-col overflow-y-auto rounded-xl border border-[#e6e6e6] bg-white py-2 shadow-[0px_12px_32px_rgba(0,0,0,0.14)]"
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
                          active
                            ? "bg-[rgba(17,50,238,0.08)]"
                            : "hover:bg-[#f7f7f7]"
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
                          {noteMeta(note)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-start gap-1">
              <button
                type="button"
                className="flex shrink-0 items-start rounded-full p-1 hover:bg-black/5"
                aria-label={`Open visit note: ${noteLabel(selected)}`}
                title="Open visit note"
                onClick={() => onOpenVisit?.(selected.id)}
              >
                <Icon name="link" size={20} className="text-[#1132ee]" />
              </button>

              <button
                type="button"
                onClick={() => (carriedForward ? store.undoImportWholeNote() : store.importWholeNote())}
                className={`flex shrink-0 items-start rounded-full p-1 ${
                  carriedForward ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
                }`}
                aria-label={
                  carriedForward
                    ? "Undo carrying this note into the current note"
                    : "Copy this note into the current note"
                }
                title={carriedForward ? "Undo carry forward" : "Carry this note forward"}
              >
                <Icon name={carriedForward ? "undo" : "move_up"} size={20} className="text-[#1132ee]" />
              </button>
            </div>
          </div>

          <NoteReadOnlyProvider>
            <PastNoteSourceProvider noteId={selected.id}>
              <div className="flex w-full flex-col items-start gap-10">
                <SubjectiveSection />
                <ObjectiveSection />
                <AssessmentSection />
                <PlanSection />
                <OrdersSection />
              </div>
            </PastNoteSourceProvider>
          </NoteReadOnlyProvider>
        </div>
      </div>
    </aside>
  );
}
