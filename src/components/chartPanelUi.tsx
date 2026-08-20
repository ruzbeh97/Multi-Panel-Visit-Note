import type { ReactNode } from "react";
import Icon from "./Icon";

export function CloseRightPanelButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close right panel"
      title="Close right panel"
      className="flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-black/5"
    >
      <Icon name="right_panel_close" size={20} className="text-[#1a1a1a]" />
    </button>
  );
}

export function PanelTitle({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <h2 className="min-w-0 font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{title}</h2>
      <div className="flex shrink-0 items-center gap-1">
        {children}
        <CloseRightPanelButton onClose={onClose} />
      </div>
    </div>
  );
}

export function StickyPanelHeader({ children }: { children: ReactNode }) {
  return <div className="sticky top-0 z-10 bg-white px-4 pt-5">{children}</div>;
}

export function PanelShell({
  title,
  onClose,
  toolbar,
  children,
}: {
  title: string;
  onClose: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white">
      <StickyPanelHeader>
        <PanelTitle title={title} onClose={onClose} />
        {toolbar ? <div className="flex w-full flex-col items-start gap-2 pb-3 pt-4">{toolbar}</div> : null}
      </StickyPanelHeader>
      <div className="flex w-full flex-col items-start px-4 pb-10">{children}</div>
    </aside>
  );
}

export function ShowMore() {
  return (
    <div className="flex w-full items-center justify-end py-2">
      <button
        type="button"
        className="flex h-7 items-center rounded-md px-2 font-body text-[14px] font-medium leading-[22px] text-[#1132ee] hover:bg-[rgba(17,50,238,0.08)]"
      >
        Show More
      </button>
    </div>
  );
}

export function TabGroup({
  tabs,
  active,
  onSelect,
}: {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <div className="flex items-center gap-[2px] rounded-lg bg-[#f2f2f2] p-[2px]">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={`flex h-7 items-center justify-center rounded-md px-[10px] font-body text-[14px] font-medium leading-[24px] ${
            active === tab
              ? "bg-white text-[#1132ee] shadow-[0px_0px_2px_rgba(0,0,0,0.03),0px_1px_0.5px_rgba(0,0,0,0.08)]"
              : "text-[#666666]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function RailGroup({
  label,
  count,
  open,
  accent = false,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  accent?: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const tint = accent ? "text-[#1132ee]" : "text-[#666666]";

  return (
    <div className="flex w-full flex-col items-start">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-1 py-2">
        <span className="flex items-center gap-[10px]">
          <span aria-hidden className={`h-[22px] w-[2px] shrink-0 ${accent ? "bg-[#1132ee]" : "bg-[#cccccc]"}`} />
          <span className={`font-body text-[14px] font-medium leading-[22px] ${tint}`}>
            {label} ({count})
          </span>
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} size={16} className={tint} />
      </button>

      {open && children}
    </div>
  );
}

export function RailRow({ accent = false, children }: { accent?: boolean; children: ReactNode }) {
  return (
    <div className="flex w-full items-stretch gap-[10px]">
      <span aria-hidden className={`my-1 w-[2px] shrink-0 ${accent ? "bg-[#1132ee]" : "bg-[#cccccc]"}`} />
      <div className="flex min-w-0 flex-1 flex-col border-b border-[#e6e6e6] py-4">{children}</div>
    </div>
  );
}
