import Icon from "./Icon";

type TopBarProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
};

export default function TopBar({ sidebarOpen, onToggleSidebar, assistantOpen, onToggleAssistant }: TopBarProps) {
  return (
    <div className="relative flex w-full items-center justify-between py-1">
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Hide navigation" : "Show navigation"}
          className="flex size-7 items-center justify-center rounded-lg hover:bg-black/5"
        >
          <Icon name="dock_to_right" size={16} className="text-[#1f1f1f]" />
        </button>
        <div className="flex h-7 items-center gap-0">
          <div className="flex items-center gap-3 pr-3">
            <span className="font-ui text-[13px] text-[#737373]">Appointments</span>
            <span className="font-ui text-[13px] text-[rgba(0,0,0,0.2)]">/</span>
          </div>
          <span className="whitespace-nowrap font-ui text-[13px] font-medium text-[#1f1f1f]">Established Patient</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="flex h-7 items-center gap-1.5 rounded-lg bg-[#1132ee] px-2">
          <Icon name="mic" size={16} className="text-white" />
          <span className="whitespace-nowrap font-ui text-[13px] font-medium text-white">Scribe</span>
        </div>
        <button
          onClick={onToggleAssistant}
          aria-pressed={assistantOpen}
          className={`flex h-7 items-center gap-1.5 rounded-lg p-2 ${
            assistantOpen ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-[rgba(17,50,238,0.06)]"
          }`}
        >
          <Icon name="auto_awesome" size={18} className="text-[#1132ee]" filled={assistantOpen} />
          <span className="whitespace-nowrap font-ui text-[13px] font-medium text-[#1132ee]">Athelas AI</span>
        </button>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1 flex -translate-x-1/2 items-center gap-1">
        <button className="pointer-events-auto flex size-7 items-center justify-center rounded-lg" aria-label="Notifications">
          <Icon name="notifications" size={16} className="text-[#454545]" />
        </button>
        <div className="pointer-events-auto flex w-[320px] items-center justify-center gap-1.5 rounded-lg bg-black/5 px-1.5 py-[3px]">
          <div className="flex items-center gap-1">
            <Icon name="search" size={18} className="text-[#454545]" />
            <span className="whitespace-nowrap font-body text-[14px] text-[#737373]">Global Search</span>
          </div>
          <span className="ml-auto whitespace-nowrap font-body text-[12px] text-black/40">ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
