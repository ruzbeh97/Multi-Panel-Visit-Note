import { useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PatientHeader from "./components/PatientHeader";
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
import AttachmentsPage from "./components/AttachmentsPage";
import MedicationsPage from "./components/MedicationsPage";
import AttachmentsPanel from "./components/AttachmentsPanel";
import DiagnosisPanel from "./components/DiagnosisPanel";
import MedicationsPanel from "./components/MedicationsPanel";
import AllergiesPanel from "./components/AllergiesPanel";
import OrdersPanel from "./components/OrdersPanel";
import MessagesPanel from "./components/MessagesPanel";
import PatientActivityPanel from "./components/PatientActivityPanel";
import ChartTimelinePanel from "./components/ChartTimelinePanel";
import ResizableSidePanel, { SIDE_PANEL_MIN_WIDTH } from "./components/ResizableSidePanel";
import OverlayScrollbar from "./components/OverlayScrollbar";
import AssistantColumn from "./components/AssistantColumn";
import NoteOutlineRail from "./components/NoteOutlineRail";
import AiSummaryCard from "./components/notes/AiSummaryCard";
import SubjectiveSection from "./components/notes/SubjectiveSection";
import ObjectiveSection from "./components/notes/ObjectiveSection";
import AssessmentSection from "./components/notes/AssessmentSection";
import PlanSection from "./components/notes/PlanSection";
import OrdersSection from "./components/notes/OrdersSection";
import { NoteStoreProvider } from "./components/notes/noteStore";

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

function App() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(SIDE_PANEL_MIN_WIDTH);
  const [openedPastNoteId, setOpenedPastNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Appointments");
  const [railOutside, setRailOutside] = useState(false);
  const noteScrollRef = useRef<HTMLDivElement>(null);
  const attachmentsTabOpen = activeTab === "Attachments";
  const medicationsTabOpen = activeTab === "Medications";
  const sidePanelOpen =
    openedPastNoteId === null && activePanel !== null && SIDE_PANELS.includes(activePanel);

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
      {activePanel === PAST_NOTE_ICON && <PastNotePanel onClose={closePanel} onOpenVisit={openPastVisit} />}
      {activePanel === ATTACHMENTS_ICON && <AttachmentsPanel onClose={closePanel} />}
      {activePanel === DIAGNOSIS_ICON && <DiagnosisPanel onClose={closePanel} />}
      {activePanel === MEDICATIONS_ICON && <MedicationsPanel onClose={closePanel} />}
      {activePanel === ALLERGIES_ICON && <AllergiesPanel onClose={closePanel} />}
      {activePanel === ORDERS_ICON && <OrdersPanel onClose={closePanel} />}
      {activePanel === MESSAGES_ICON && <MessagesPanel onClose={closePanel} />}
      {activePanel === ACTIVITY_ICON && <PatientActivityPanel onClose={closePanel} />}
      {activePanel === TIMELINE_ICON && <ChartTimelinePanel onClose={closePanel} />}
    </>
  );

  return (
    <div className="flex h-screen w-full items-start justify-center border border-black/10 bg-[#f1f3fe] p-0">
      <div className="flex h-full w-full flex-1 flex-col items-start">
        <div className="flex h-full w-full flex-1 items-center justify-between bg-[#f1f3fe]">
          {sidebarOpen && (
            <Sidebar
              railOutside={railOutside}
              onToggleRailOutside={() => setRailOutside((current) => !current)}
            />
          )}

          <div className={`flex h-full min-w-0 flex-1 flex-col items-start py-2 pr-2 ${sidebarOpen ? "" : "pl-2"}`}>
            <div className="w-full px-2">
              <TopBar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((open) => !open)}
                assistantOpen={assistantOpen}
                onToggleAssistant={() => setAssistantOpen((open) => !open)}
              />
            </div>

            <NoteStoreProvider>
            <div className="flex h-full min-h-0 w-full flex-1 items-start gap-2 pt-2">
              {/* In the detached layout the frame, panel, and rail share one bordered surface. */}
              <div
                className={
                  railOutside
                    ? "flex h-full min-h-0 min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-[#e6e6e6] bg-white"
                    : "flex h-full min-h-0 min-w-0 flex-1 items-stretch"
                }
              >
              <div
                className={`flex h-full min-w-0 flex-1 flex-col items-start overflow-hidden bg-white ${
                  railOutside ? "" : "rounded-lg border border-[#e6e6e6]"
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

                <div className="flex min-h-0 w-full flex-1 flex-col items-start bg-[#f7f7f7]">
                  <div className="flex min-h-0 w-full flex-1 items-start gap-0 bg-white">
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
                    {sidePanelOpen && !railOutside && (
                      <ResizableSidePanel width={panelWidth} onWidthChange={setPanelWidth}>
                        {panelContent}
                      </ResizableSidePanel>
                    )}
                    {!railOutside && (
                      <PanelNavBar
                        active={openedPastNoteId ? null : activePanel}
                        onSelect={selectNavPanel}
                      />
                    )}
                  </div>
                </div>
              </div>

              {railOutside && sidePanelOpen && (
                <ResizableSidePanel
                  variant="standalone"
                  width={panelWidth}
                  onWidthChange={setPanelWidth}
                >
                  {panelContent}
                </ResizableSidePanel>
              )}

              {railOutside && (
                <PanelNavBar
                  variant="standalone"
                  active={openedPastNoteId ? null : activePanel}
                  onSelect={selectNavPanel}
                />
              )}
              </div>

              {assistantOpen && <AssistantColumn />}
            </div>
            </NoteStoreProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
