import { useRef, useState } from "react";
import AllergiesPanel from "./components/AllergiesPanel";
import AssistantColumn from "./components/AssistantColumn";
import AttachmentsPage from "./components/AttachmentsPage";
import AttachmentsPanel from "./components/AttachmentsPanel";
import ChartTimelinePanel from "./components/ChartTimelinePanel";
import DiagnosisPanel from "./components/DiagnosisPanel";
import Icon from "./components/Icon";
import MedicationsPage from "./components/MedicationsPage";
import MedicationsPanel from "./components/MedicationsPanel";
import MessagesPanel from "./components/MessagesPanel";
import NoteOutlineRail from "./components/NoteOutlineRail";
import OrdersPanel from "./components/OrdersPanel";
import OverlayScrollbar from "./components/OverlayScrollbar";
import PanelNavBar, {
  ACTIVITY_ICON,
  ALLERGIES_ICON,
  ATTACHMENTS_ICON,
  DIAGNOSIS_ICON,
  MEDICATIONS_ICON,
  MESSAGES_ICON,
  ORDERS_ICON,
  PAST_NOTE_ICON,
  TIMELINE_ICON,
} from "./components/PanelNavBar";
import PastNotePanel from "./components/PastNotePanel";
import PastVisitNoteView from "./components/PastVisitNoteView";
import PatientActivityPanel from "./components/PatientActivityPanel";
import PatientHeader from "./components/PatientHeader";
import ResizableSidePanel, {
  SIDE_PANEL_MIN_WIDTH,
} from "./components/ResizableSidePanel";
import AiSummaryCard from "./components/notes/AiSummaryCard";
import AssessmentSection from "./components/notes/AssessmentSection";
import { NoteStoreProvider } from "./components/notes/noteStore";
import ObjectiveSection from "./components/notes/ObjectiveSection";
import OrdersSection from "./components/notes/OrdersSection";
import PlanSection from "./components/notes/PlanSection";
import SubjectiveSection from "./components/notes/SubjectiveSection";

const SIDE_PANELS = [
  PAST_NOTE_ICON,
  ATTACHMENTS_ICON,
  DIAGNOSIS_ICON,
  MEDICATIONS_ICON,
  ALLERGIES_ICON,
  ORDERS_ICON,
  MESSAGES_ICON,
  ACTIVITY_ICON,
  TIMELINE_ICON,
];

export type PatientChartPageProps = {
  /** demo = standalone visit-note chrome. embedded = hosted inside another app shell. */
  variant?: "demo" | "embedded";
  railOutside?: boolean;
  assistantOpen?: boolean;
  onAssistantOpenChange?: (open: boolean) => void;
};

export default function PatientChartPage({
  variant = "embedded",
  railOutside = false,
  assistantOpen: assistantOpenProp,
  onAssistantOpenChange,
}: PatientChartPageProps) {
  const demo = variant === "demo";
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [internalAssistantOpen, setInternalAssistantOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(SIDE_PANEL_MIN_WIDTH);
  const [openedPastNoteId, setOpenedPastNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Appointments");
  const noteScrollRef = useRef<HTMLDivElement>(null);

  const assistantOpen = assistantOpenProp ?? internalAssistantOpen;
  function setAssistantOpen(open: boolean) {
    onAssistantOpenChange?.(open);
    if (assistantOpenProp === undefined) setInternalAssistantOpen(open);
  }

  const attachmentsTabOpen = activeTab === "Attachments";
  const medicationsTabOpen = activeTab === "Medications";
  const sidePanelOpen =
    openedPastNoteId === null &&
    activePanel !== null &&
    SIDE_PANELS.includes(activePanel);

  function selectPanel(icon: string) {
    setActivePanel((current) => (current === icon ? null : icon));
  }

  function openPastVisit(noteId: string) {
    setOpenedPastNoteId(noteId);
    setActivePanel(null);
  }

  function selectNavPanel(icon: string) {
    if (openedPastNoteId) {
      setOpenedPastNoteId(null);
      setActivePanel(icon);
      return;
    }
    selectPanel(icon);
  }

  function closePanel() {
    setActivePanel(null);
  }

  const panelContent = (
    <>
      {activePanel === PAST_NOTE_ICON && (
        <PastNotePanel onClose={closePanel} onOpenVisit={openPastVisit} />
      )}
      {activePanel === ATTACHMENTS_ICON && (
        <AttachmentsPanel onClose={closePanel} />
      )}
      {activePanel === DIAGNOSIS_ICON && (
        <DiagnosisPanel onClose={closePanel} />
      )}
      {activePanel === MEDICATIONS_ICON && (
        <MedicationsPanel onClose={closePanel} />
      )}
      {activePanel === ALLERGIES_ICON && (
        <AllergiesPanel onClose={closePanel} />
      )}
      {activePanel === ORDERS_ICON && <OrdersPanel onClose={closePanel} />}
      {activePanel === MESSAGES_ICON && (
        <MessagesPanel onClose={closePanel} />
      )}
      {activePanel === ACTIVITY_ICON && (
        <PatientActivityPanel onClose={closePanel} />
      )}
      {activePanel === TIMELINE_ICON && (
        <ChartTimelinePanel onClose={closePanel} />
      )}
    </>
  );

  const noteFrame = (
    <div
      className={
        demo && railOutside
          ? "flex h-full min-h-0 min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-[#e6e6e6] bg-white"
          : "flex h-full min-h-0 min-w-0 flex-1 items-stretch"
      }
    >
      <div
        className={`flex h-full min-w-0 flex-1 flex-col items-start overflow-hidden bg-white ${
          demo && railOutside ? "" : "rounded-lg border border-[#e6e6e6]"
        }`}
      >
        <PatientHeader
          activePanel={openedPastNoteId ? null : activePanel}
          onSelectPanel={(icon) => {
            if (openedPastNoteId) {
              setOpenedPastNoteId(null);
              setActivePanel(icon);
              return;
            }
            selectPanel(icon);
          }}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        <div
          className={`flex min-h-0 w-full flex-1 items-start bg-white ${
            demo ? "flex-col bg-[#f7f7f7]" : ""
          }`}
        >
          <div
            className={`flex min-h-0 w-full flex-1 items-start ${demo ? "gap-0 bg-white" : ""}`}
          >
            {attachmentsTabOpen ? (
              <AttachmentsPage />
            ) : medicationsTabOpen ? (
              <MedicationsPage />
            ) : openedPastNoteId ? (
              <PastVisitNoteView
                noteId={openedPastNoteId}
                onBack={() => setOpenedPastNoteId(null)}
              />
            ) : (
              <div className="relative flex min-h-0 min-w-0 flex-1 self-stretch">
                <div
                  ref={noteScrollRef}
                  data-note-scroll
                  className={`scrollbar-none flex h-full min-h-0 w-full items-stretch overflow-x-clip overflow-y-auto ${
                    sidePanelOpen ? "gap-0" : "gap-[60px] pr-[60px]"
                  }`}
                >
                  <NoteOutlineRail />
                  <div
                    data-note-main
                    className={`flex min-h-full min-w-0 flex-1 items-start ${
                      sidePanelOpen ? "" : "justify-center"
                    }`}
                  >
                    <main
                      className={`flex w-full flex-col items-start gap-10 px-4 py-10 ${
                        sidePanelOpen ? "" : "max-w-[900px]"
                      }`}
                    >
                      <AiSummaryCard />
                      <SubjectiveSection />
                      <ObjectiveSection />
                      <AssessmentSection />
                      <PlanSection />
                      <OrdersSection />
                    </main>
                  </div>
                </div>
                <OverlayScrollbar targetRef={noteScrollRef} />
              </div>
            )}

            {sidePanelOpen && (!demo || !railOutside) && (
              <ResizableSidePanel width={panelWidth} onWidthChange={setPanelWidth}>
                {panelContent}
              </ResizableSidePanel>
            )}
            {(!demo || !railOutside) && (
              <PanelNavBar
                active={openedPastNoteId ? null : activePanel}
                onSelect={selectNavPanel}
              />
            )}
          </div>
        </div>
      </div>

      {demo && railOutside && sidePanelOpen && (
        <ResizableSidePanel
          variant="standalone"
          width={panelWidth}
          onWidthChange={setPanelWidth}
        >
          {panelContent}
        </ResizableSidePanel>
      )}

      {demo && railOutside && (
        <PanelNavBar
          variant="standalone"
          active={openedPastNoteId ? null : activePanel}
          onSelect={selectNavPanel}
        />
      )}
    </div>
  );

  const chart = (
    <NoteStoreProvider>
      <div
        className={
          demo
            ? "flex h-full min-h-0 w-full flex-1 items-start gap-2"
            : "flex h-full min-h-0 min-w-0 flex-1 items-stretch"
        }
      >
        {noteFrame}
        {demo && assistantOpen && <AssistantColumn />}
      </div>

      {!demo &&
        (assistantOpen ? (
          <div className="relative flex h-full min-h-0 shrink-0 pt-8">
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setAssistantOpen(false)}
              className="absolute right-0 top-0 flex h-7 items-center gap-1 rounded-lg px-2 font-ui text-[13px] font-medium text-[#1132ee] hover:bg-[rgba(17,50,238,0.08)]"
            >
              <Icon name="close" size={16} />
              Assistant
            </button>
            <AssistantColumn />
          </div>
        ) : (
          <button
            type="button"
            aria-label="Open assistant"
            onClick={() => setAssistantOpen(true)}
            className="absolute right-4 top-4 z-20 flex h-7 items-center gap-1.5 rounded-lg bg-white px-2 font-ui text-[13px] font-medium text-[#1132ee] shadow-sm hover:bg-[#f7f7f7]"
          >
            <Icon name="auto_awesome" size={18} />
            Assistant
          </button>
        ))}
    </NoteStoreProvider>
  );

  if (demo) {
    return chart;
  }

  return (
    <div className="relative flex h-full min-h-0 w-full items-stretch gap-2 bg-[#f1f3fe] p-2">
      {chart}
    </div>
  );
}
