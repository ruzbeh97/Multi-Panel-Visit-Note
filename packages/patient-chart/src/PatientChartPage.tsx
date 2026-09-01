import { useRef, useState } from "react";
import AllergiesPanel from "./components/AllergiesPanel";
import AssistantColumn from "./components/AssistantColumn";
import AttachmentsPage from "./components/AttachmentsPage";
import AttachmentsPanel from "./components/AttachmentsPanel";
import ChartTimelinePanel from "./components/ChartTimelinePanel";
import DiagnosisPanel from "./components/DiagnosisPanel";
import DemographicsPage from "./components/DemographicsPage";
import TasksPage from "./components/TasksPage";
import AllergiesPage from "./components/AllergiesPage";
import VitalsPage from "./components/VitalsPage";
import ImmunizationsPage from "./components/ImmunizationsPage";
import ProblemListPage from "./components/ProblemListPage";
import OrdersPage from "./components/OrdersPage";
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
}: PatientChartPageProps) {
  const demo = variant === "demo";
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const internalAssistantOpen = false;
  const [panelWidth, setPanelWidth] = useState(SIDE_PANEL_MIN_WIDTH);
  const [openedPastNoteId, setOpenedPastNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Appointments");
  const noteScrollRef = useRef<HTMLDivElement>(null);

  const assistantOpen = assistantOpenProp ?? internalAssistantOpen;

  const attachmentsTabOpen = activeTab === "Attachments";
  const demographicsTabOpen = activeTab === "Demographics";
  const tasksTabOpen = activeTab === "Tasks";
  const allergiesTabOpen = activeTab === "Allergies";
  const vitalsTabOpen = activeTab === "Vitals";
  const immunizationsTabOpen = activeTab === "Immunizations";
  const problemListTabOpen = activeTab === "Problem List";
  const ordersTabOpen = activeTab === "Orders";
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
            className={`flex min-h-0 w-full flex-1 self-stretch items-start ${demo ? "gap-0 bg-white" : ""}`}
          >
            {demographicsTabOpen ? (
              <DemographicsPage />
            ) : tasksTabOpen ? (
              <TasksPage />
            ) : allergiesTabOpen ? (
              <AllergiesPage />
            ) : vitalsTabOpen ? (
              <VitalsPage />
            ) : immunizationsTabOpen ? (
              <ImmunizationsPage />
            ) : problemListTabOpen ? (
              <ProblemListPage />
            ) : ordersTabOpen ? (
              <OrdersPage />
            ) : attachmentsTabOpen ? (
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
