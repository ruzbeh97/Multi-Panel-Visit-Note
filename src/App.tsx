import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PatientHeader from "./components/PatientHeader";
import PanelNavBar, {
  ACTIVITY_ICON,
  ATTACHMENTS_ICON,
  MEDICAL_HISTORY_ICON,
  MESSAGES_ICON,
  ORDERS_ICON,
  PAST_NOTE_ICON,
  TIMELINE_ICON,
} from "./components/PanelNavBar";
import PastNotePanel from "./components/PastNotePanel";
import AttachmentsPanel from "./components/AttachmentsPanel";
import MedicalHistoryPanel from "./components/MedicalHistoryPanel";
import OrdersPanel from "./components/OrdersPanel";
import MessagesPanel from "./components/MessagesPanel";
import PatientActivityPanel from "./components/PatientActivityPanel";
import ChartTimelinePanel from "./components/ChartTimelinePanel";
import AssistantColumn from "./components/AssistantColumn";
import NoteOutlineRail from "./components/NoteOutlineRail";
import SubjectiveSection from "./components/notes/SubjectiveSection";
import ObjectiveSection from "./components/notes/ObjectiveSection";
import AssessmentSection from "./components/notes/AssessmentSection";
import PlanSection from "./components/notes/PlanSection";

const SIDE_PANELS = [
  PAST_NOTE_ICON,
  ATTACHMENTS_ICON,
  MEDICAL_HISTORY_ICON,
  ORDERS_ICON,
  MESSAGES_ICON,
  ACTIVITY_ICON,
  TIMELINE_ICON,
];

function App() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const sidePanelOpen = activePanel !== null && SIDE_PANELS.includes(activePanel);

  function selectPanel(icon: string) {
    setActivePanel((current) => (current === icon ? null : icon));
  }

  return (
    <div className="flex h-screen w-full items-start justify-center border border-black/10 bg-[#f1f3fe] p-0">
      <div className="flex h-full w-full flex-1 flex-col items-start">
        <div className="flex h-full w-full flex-1 items-center justify-between bg-[#f1f3fe]">
          {sidebarOpen && <Sidebar />}

          <div className={`flex h-full min-w-0 flex-1 flex-col items-start py-2 pr-2 ${sidebarOpen ? "" : "pl-2"}`}>
            <div className="w-full px-2">
              <TopBar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((open) => !open)}
                assistantOpen={assistantOpen}
                onToggleAssistant={() => setAssistantOpen((open) => !open)}
              />
            </div>

            <div className="flex h-full min-h-0 w-full flex-1 items-start gap-2 pt-2">
              <div className="flex h-full min-w-0 flex-1 flex-col items-start overflow-hidden rounded-lg border border-[#e6e6e6] bg-white">
                <PatientHeader />

                <div className="flex min-h-0 w-full flex-1 flex-col items-start bg-[#f7f7f7]">
                  <div
                    className={`flex min-h-0 w-full flex-1 items-start bg-white ${
                      sidePanelOpen ? "gap-0" : "gap-[60px]"
                    }`}
                  >
                    <div
                      data-note-scroll
                      className={`scrollbar-thin flex min-h-0 min-w-0 flex-1 items-stretch self-stretch overflow-x-clip overflow-y-auto ${
                        sidePanelOpen ? "gap-0" : "gap-[60px]"
                      }`}
                    >
                      <NoteOutlineRail />
                      <div
                        data-note-main
                        className={`flex min-h-full min-w-0 flex-1 items-start ${sidePanelOpen ? "" : "justify-center"}`}
                      >
                        <main
                          className={`flex w-full flex-col items-start gap-10 px-4 py-10 ${
                            sidePanelOpen ? "" : "max-w-[900px]"
                          }`}
                        >
                          <SubjectiveSection />
                          <ObjectiveSection />
                          <AssessmentSection />
                          <PlanSection />
                        </main>
                      </div>
                    </div>
                    {activePanel === PAST_NOTE_ICON && <PastNotePanel />}
                    {activePanel === ATTACHMENTS_ICON && <AttachmentsPanel />}
                    {activePanel === MEDICAL_HISTORY_ICON && <MedicalHistoryPanel />}
                    {activePanel === ORDERS_ICON && <OrdersPanel />}
                    {activePanel === MESSAGES_ICON && <MessagesPanel />}
                    {activePanel === ACTIVITY_ICON && <PatientActivityPanel />}
                    {activePanel === TIMELINE_ICON && <ChartTimelinePanel />}
                    <PanelNavBar active={activePanel} onSelect={selectPanel} />
                  </div>
                </div>
              </div>

              {assistantOpen && <AssistantColumn />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
