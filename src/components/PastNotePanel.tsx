import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import NoteOutlineRail from "./NoteOutlineRail";
import { NoteReadOnlyProvider } from "./notes/readOnly";
import { PastNoteSourceProvider, useNoteStore, CARRY_FORWARD_SECTIONS } from "./notes/noteStore";
import SubjectiveSection from "./notes/SubjectiveSection";
import ObjectiveSection from "./notes/ObjectiveSection";
import AssessmentSection from "./notes/AssessmentSection";
import PlanSection from "./notes/PlanSection";
import OrdersSection from "./notes/OrdersSection";
import { PanelTitle } from "./chartPanelUi";
import { PAST_NOTES } from "../data/chart";

function noteLabel(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} | ${note.visitType} | ${note.provider} ${note.date} ${note.time}`;
}

function noteMeta(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} · ${note.visitType} · ${note.provider} · ${note.date} · ${note.time}`;
}

function CarrySectionRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center justify-center py-1 pl-3 pr-2 hover:bg-[#f7f7f7]"
    >
      <span className="flex w-full items-center gap-1">
        <span className="flex shrink-0 items-center justify-center p-[5px]">
          <span
            aria-hidden
            className={`flex size-[18px] items-center justify-center rounded-[2px] border-2 ${
              checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#666666] bg-white"
            }`}
          >
            {checked ? <Icon name="check" size={14} className="text-white" /> : null}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-left font-body text-[16px] leading-[24px] text-[#1a1a1a]">
          {label}
        </span>
      </span>
    </button>
  );
}

type PastNotePanelProps = {
  onClose: () => void;
  onOpenVisit?: (noteId: string) => void;
};

export default function PastNotePanel({ onClose, onOpenVisit }: PastNotePanelProps) {
  const [selectedId, setSelectedId] = useState(PAST_NOTES[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [carryOpen, setCarryOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(
    CARRY_FORWARD_SECTIONS.filter((section) => section.label !== "Entire note").map((section) => section.label),
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const carryRef = useRef<HTMLDivElement>(null);
  const store = useNoteStore();
  const carriedForward = store.canUndoImportWholeNote;

  const selected = PAST_NOTES.find((note) => note.id === selectedId) ?? PAST_NOTES[0];
  const sectionChoices = CARRY_FORWARD_SECTIONS.filter((section) => section.label !== "Entire note");
  const allSectionsSelected = sectionChoices.every((section) => selectedSections.includes(section.label));

  useEffect(() => {
    if (!menuOpen && !carryOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setCarryOpen(false);
      }
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) setMenuOpen(false);
      if (!carryRef.current?.contains(target)) setCarryOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen, carryOpen]);

  function toggleSection(label: string) {
    setSelectedSections((current) =>
      current.includes(label) ? current.filter((entry) => entry !== label) : [...current, label],
    );
  }

  function carrySelected() {
    const titles = sectionChoices
      .filter((section) => selectedSections.includes(section.label))
      .flatMap((section) => [...section.titles]);
    store.importSections(titles);
    setCarryOpen(false);
  }

  return (
    <aside
      data-note-scroll
      className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white"
    >
      <div className="w-full px-4 pt-5">
        <PanelTitle title="Past Notes" onClose={onClose} />
      </div>
      <div className="w-full px-4 pt-3">
        <div className="flex w-full items-center gap-2 overflow-clip rounded-lg bg-[#f1f3fe] pr-3">
          <div className="h-9 w-1 shrink-0 bg-[#1132ee]" />
          <Icon name="comments_disabled" size={20} className="text-[#1132ee]" />
          <span className="min-w-0 flex-1 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
            This visit note is read only.
          </span>
        </div>
      </div>

      <div className="flex w-full items-start px-4 pt-2">
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

            <div ref={carryRef} className="relative flex shrink-0 items-start">
              {carriedForward ? (
                <button
                  type="button"
                  onClick={() => store.undoImportWholeNote()}
                  className="flex shrink-0 items-center rounded-full p-1 bg-[rgba(17,50,238,0.08)]"
                  aria-label="Undo carrying this note into the current note"
                  title="Undo carry forward"
                >
                  <Icon name="undo" size={20} className="text-[#1132ee]" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCarryOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={carryOpen}
                    aria-label="Carry this note forward"
                    title="Carry this note forward"
                    className={`flex shrink-0 items-center rounded-full py-1 pl-1 pr-0.5 ${
                      carryOpen ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
                    }`}
                  >
                    <Icon name="move_up" size={20} className="text-[#1132ee]" />
                    <Icon
                      name="arrow_drop_down"
                      size={16}
                      className={`-ml-0.5 text-[#1132ee] transition-transform ${carryOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {carryOpen && (
                    <div
                      role="menu"
                      aria-label="Carry forward sections"
                      className="absolute right-0 top-[calc(100%+4px)] z-30 flex w-[265px] flex-col overflow-hidden rounded-[6px] border border-[#e6e6e6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex w-full flex-col items-start gap-0.5 py-2">
                        <CarrySectionRow
                          label="All Sections"
                          checked={allSectionsSelected}
                          onToggle={() =>
                            setSelectedSections(
                              allSectionsSelected ? [] : sectionChoices.map((section) => section.label),
                            )
                          }
                        />
                        {sectionChoices.map((section) => (
                          <CarrySectionRow
                            key={section.label}
                            label={section.label}
                            checked={selectedSections.includes(section.label)}
                            onToggle={() => toggleSection(section.label)}
                          />
                        ))}
                      </div>
                      <div className="flex h-12 w-full items-center justify-center border-t border-[#e6e6e6]">
                        <button
                          type="button"
                          disabled={selectedSections.length === 0}
                          onClick={carrySelected}
                          className="flex h-9 w-full items-center justify-center rounded-full px-3 font-body text-[14px] font-medium leading-[22px] text-[#1132ee] hover:bg-[rgba(17,50,238,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Carry Over Sections
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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
