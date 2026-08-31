import { useState } from "react";
import { PatientChartPage } from "@visit-note/patient-chart";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [railOutside, setRailOutside] = useState(false);

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

            <div className="flex h-full min-h-0 w-full flex-1 items-start gap-2 pt-2">
              <PatientChartPage
                variant="demo"
                railOutside={railOutside}
                assistantOpen={assistantOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
