import { useRef } from "react";
import Icon from "./Icon";
import NoteOutlineRail from "./NoteOutlineRail";
import OverlayScrollbar from "./OverlayScrollbar";
import { NoteReadOnlyProvider } from "./notes/readOnly";
import { PastNoteSourceProvider } from "./notes/noteStore";
import SubjectiveSection from "./notes/SubjectiveSection";
import ObjectiveSection from "./notes/ObjectiveSection";
import AssessmentSection from "./notes/AssessmentSection";
import PlanSection from "./notes/PlanSection";
import OrdersSection from "./notes/OrdersSection";
import { PAST_NOTES } from "../data/chart";

type PastVisitNoteViewProps = {
  noteId: string;
  onBack: () => void;
};

function noteLabel(note: (typeof PAST_NOTES)[number]) {
  return `${note.caseName} | ${note.provider} | ${note.visitType} | ${note.date} ${note.time}`;
}

export default function PastVisitNoteView({ noteId, onBack }: PastVisitNoteViewProps) {
  const noteScrollRef = useRef<HTMLDivElement>(null);
  const note = PAST_NOTES.find((entry) => entry.id === noteId) ?? PAST_NOTES[0];

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 self-stretch">
      <div
        ref={noteScrollRef}
        data-note-scroll
        className="scrollbar-none flex h-full min-h-0 w-full items-stretch gap-[60px] overflow-x-clip overflow-y-auto pr-[60px]"
      >
        <NoteOutlineRail />
        <div data-note-main className="flex min-h-full min-w-0 flex-1 items-start justify-center">
          <main className="flex w-full max-w-[900px] flex-col items-start gap-6 px-4 py-10">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 hover:bg-[rgba(17,50,238,0.06)]"
              aria-label="Back to current visit note"
            >
              <Icon name="arrow_back" size={20} className="text-[#1132ee]" />
              <span className="font-body text-[14px] font-medium leading-[20px] text-[#1132ee]">
                Back to current visit
              </span>
            </button>

            <div className="flex w-full items-center gap-2 overflow-clip rounded-lg bg-[#f1f3fe] pr-3">
              <div className="h-9 w-1 shrink-0 bg-[#1132ee]" />
              <Icon name="comments_disabled" size={20} className="text-[#1132ee]" />
              <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                This visit note is read only.
              </span>
            </div>

            <div className="flex w-full flex-col items-start gap-1">
              <h2 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">{note.title}</h2>
              <p className="font-body text-[14px] leading-[20px] text-[#666666]">{noteLabel(note)}</p>
            </div>

            <NoteReadOnlyProvider>
              <PastNoteSourceProvider noteId={note.id}>
                <div className="flex w-full flex-col items-start gap-10">
                  <SubjectiveSection />
                  <ObjectiveSection />
                  <AssessmentSection />
                  <PlanSection />
                  <OrdersSection />
                </div>
              </PastNoteSourceProvider>
            </NoteReadOnlyProvider>
          </main>
        </div>
      </div>
      <OverlayScrollbar targetRef={noteScrollRef} />
    </div>
  );
}
