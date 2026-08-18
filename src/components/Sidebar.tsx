import Icon from "./Icon";

type NavItem = {
  icon: string;
  label: string;
  active?: boolean;
};

type NavGroup = {
  heading: string;
  items: NavItem[];
};

const topItems: NavItem[] = [
  { icon: "home", label: "Home" },
  { icon: "calendar_today", label: "Visits" },
  { icon: "task_alt", label: "Tasks" },
];

const groups: NavGroup[] = [
  {
    heading: "Medical Records",
    items: [
      { icon: "group", label: "Patients", active: true },
      { icon: "inbox", label: "Inbox" },
      { icon: "description", label: "Order Manager" },
      { icon: "sports_gymnastics", label: "Interventions" },
      { icon: "medication", label: "Pharmacy Requests" },
    ],
  },
  {
    heading: "Revenue Cycle",
    items: [
      { icon: "supervisor_account", label: "Encounters" },
      { icon: "receipt_long", label: "Claims" },
      { icon: "remove_selection", label: "Denials" },
      { icon: "payments", label: "Remittances" },
    ],
  },
  {
    heading: "Reporting",
    items: [
      { icon: "legend_toggle", label: "Practice Pulse" },
      { icon: "bar_chart", label: "EMR Reports" },
      { icon: "insights", label: "AI Report Builder" },
    ],
  },
];

function SidebarItem({ icon, label, active }: NavItem) {
  return (
    <div
      className={`flex w-full items-center rounded-lg px-2 ${
        active ? "bg-[rgba(17,50,238,0.1)]" : "hover:bg-black/5"
      }`}
    >
      <div className="flex h-[28px] flex-1 items-center gap-1.5">
        <Icon name={icon} size={16} className={active ? "text-[#0d28bf]" : "text-[#454545]"} />
        <p
          className={`flex-1 truncate font-ui text-[13px] leading-[1.6] ${
            active ? "text-[#0d28bf] font-medium" : "text-[#454545]"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function SidebarGroup({ heading, items }: NavGroup) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex h-[28px] w-full items-center gap-1.5">
        <Icon name="circle" size={16} className="text-[#454545]" />
        <p className="whitespace-nowrap font-ui text-[13px] font-medium text-[#454545]">{heading}</p>
        <Icon name="keyboard_arrow_down" size={20} className="ml-auto rotate-180 text-[#454545]" />
      </div>
      <div className="flex w-full items-start">
        <div className="flex shrink-0 flex-col items-center justify-center self-stretch px-1 pb-3">
          <div className="h-full w-px min-h-px flex-1 bg-black/10" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-3">
          {items.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

type SidebarProps = {
  railOutside: boolean;
  onToggleRailOutside: () => void;
};

export default function Sidebar({ railOutside, onToggleRailOutside }: SidebarProps) {
  return (
    <div className="flex h-full w-[200px] shrink-0 flex-col gap-4 p-2">
      <div className="flex w-full flex-col items-start">
        <div className="flex items-center gap-1 px-1 py-1">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
            role="img"
            aria-label="Air"
          >
            <g stroke="#1f1f1f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.8 2.4L13.3 9Q13.6 10.8 15.9 11.1L21.4 11.8" />
              <path d="M12.2 21.6L10.7 15Q10.4 13.2 8.1 12.9L2.6 12.2" />
            </g>
          </svg>
          <span className="font-body text-[19px] font-bold leading-none tracking-[-0.01em] text-[#1f1f1f]">Air</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-start overflow-hidden border-b border-black/10">
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full flex-col gap-0.5 pb-3">
            {topItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
          {groups.map((group) => (
            <SidebarGroup key={group.heading} {...group} />
          ))}
        </div>
      </div>
      <div className="flex h-9 w-full items-center justify-between pt-2">
        <div className="flex flex-1 items-center gap-2">
          <div className="size-7 shrink-0 overflow-hidden rounded-full border border-black/20 bg-[#ffad33]" />
          <button className="flex size-7 items-center justify-center rounded-lg hover:bg-black/5" aria-label="Settings">
            <Icon name="settings" size={16} className="text-[#454545]" />
          </button>
          <button className="flex size-7 items-center justify-center rounded-lg hover:bg-black/5" aria-label="Help">
            <Icon name="help" size={16} className="text-[#454545]" />
          </button>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={railOutside}
          onClick={onToggleRailOutside}
          aria-label="Dock the panel rail outside the chart frame"
          title="Dock the panel rail outside the chart frame"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-black/5"
        >
          <Icon
            name="dock_to_right"
            size={16}
            className={railOutside ? "text-[#0d28bf]" : "text-[#454545]"}
          />
          <span
            aria-hidden
            className={`flex h-3.5 w-6 shrink-0 items-center rounded-full px-0.5 transition-colors ${
              railOutside ? "bg-[#1132ee]" : "bg-black/20"
            }`}
          >
            <span
              className={`size-2.5 rounded-full bg-white transition-transform ${
                railOutside ? "translate-x-[10px]" : ""
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
