import { useState } from "react";
import Icon from "./Icon";
import PdfViewer from "./pdf/PdfViewer";
import { timelineDocKey } from "./pdf/AttachmentDocument";
import { ENCOUNTERS, type Encounter, type EncounterItem } from "../data/chart";

const ROW_ICONS = {
  attachment: { icon: "attach_file", color: "text-[#1a1a1a]" },
  medication: { icon: "pill", color: "text-[#2fd0c0]" },
  order: { icon: "science", color: "text-[#479e4c]" },
} as const;

function rowLabel(item: EncounterItem) {
  return item.type === "attachment" ? item.file : item.title;
}

function documentFor(item: EncounterItem) {
  return item.type === "attachment" ? item.file : timelineDocKey(item);
}

function ItemRow({ item }: { item: EncounterItem }) {
  const [open, setOpen] = useState(false);
  const meta = ROW_ICONS[item.type];
  const label = rowLabel(item);

  return (
    <div className="flex w-full flex-col items-start justify-center overflow-clip rounded">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={`${open ? "Hide" : "View"} ${label}`}
        className={`flex w-full items-center rounded ${open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-[#f7f7f7]"}`}
      >
        <span className="flex shrink-0 items-start p-1">
          <Icon name={meta.icon} size={20} className={meta.color} />
        </span>
        <span className="min-w-0 truncate font-body text-[14px] leading-[22px] text-[#1a1a1a]">{label}</span>
        <span className="flex min-w-px flex-1 items-center justify-end p-1">
          <Icon name="picture_as_pdf" size={20} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
        </span>
      </button>

      {open && <PdfViewer fileName={documentFor(item)} />}
    </div>
  );
}

function TimelineItemBlock({ visit, collapsed }: { visit: Encounter; collapsed: boolean }) {
  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex w-3 shrink-0 flex-col items-center gap-2 self-stretch pt-1.5">
        <span className="size-3 shrink-0 rounded-full bg-[#1a1a1a]" />
        <span className="flex w-full flex-1 flex-col items-center pt-1.5">
          <span className="w-0.5 flex-1 rounded-sm bg-[#1a1a1a]" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="flex w-full flex-col items-start">
          <div className="flex w-full items-start gap-2 font-body text-[16px] leading-[24px] text-[#1a1a1a]">
            <span className="shrink-0 whitespace-nowrap font-medium">{visit.caseName}</span>
            <span className="min-w-0 truncate">{visit.title}</span>
          </div>
          <span className="w-full truncate font-body text-[14px] leading-[22px] text-[#666666]">
            {visit.date} | {visit.time} · {visit.visitType}
          </span>
        </div>

        {!collapsed && (
          <div className="flex w-full flex-col items-start justify-center gap-2">
            {visit.items.map((item) => (
              <ItemRow key={`${item.type}-${item.title}-${item.date}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChartTimelinePanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <div className="flex w-full flex-col items-start gap-2 pb-10">
        <div className="flex w-full items-center justify-between pb-4">
          <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Care Timeline</h2>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            aria-pressed={collapsed}
            className={`flex shrink-0 items-start rounded-full p-1 ${collapsed ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
            aria-label={collapsed ? "Expand every timeline section" : "Collapse every timeline section"}
          >
            <Icon
              name={collapsed ? "expand_content" : "collapse_content"}
              size={20}
              className={collapsed ? "text-[#1132ee]" : "text-[#1a1a1a]"}
            />
          </button>
        </div>

        <div className="flex w-full flex-col items-start gap-4">
          {ENCOUNTERS.map((visit) => (
            <TimelineItemBlock key={visit.id} visit={visit} collapsed={collapsed} />
          ))}
        </div>
      </div>
    </aside>
  );
}
