import { useState } from "react";
import Icon from "./Icon";
import { CloseRightPanelButton, StickyPanelHeader } from "./chartPanelUi";
import PdfViewer from "./pdf/PdfViewer";
import { timelineDocKey } from "./pdf/AttachmentDocument";
import { ENCOUNTERS, type Encounter, type EncounterItem } from "../data/chart";

const ROW_ICONS = {
  attachment: { icon: "attach_file", color: "text-[#1a1a1a]" },
  medication: { icon: "pill", color: "text-[#2fd0c0]" },
  order: { icon: "science", color: "text-[#479e4c]" },
} as const;

function itemKey(item: EncounterItem) {
  return `${item.type}-${item.title}-${item.date}`;
}

function documentFor(item: EncounterItem) {
  return item.type === "attachment" ? item.file : timelineDocKey(item);
}

function fileNameFor(item: EncounterItem) {
  if (item.type === "attachment") return item.file;
  const slug = item.title.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  const stamp = item.date.replaceAll("/", "");
  return `${slug}_${item.type === "order" ? "Requisition" : "Prescription"}_${stamp}.pdf`;
}

function timestampFor(item: EncounterItem, visit: Encounter) {
  const time = "time" in item && item.time ? item.time : visit.time;
  return time.toLowerCase().replace(/\s+/g, "");
}

function visitSearchText(visit: Encounter) {
  return [visit.caseName, visit.title, visit.date, visit.time, visit.visitType, visit.provider]
    .join(" ")
    .toLowerCase();
}

function itemSearchText(item: EncounterItem, visit: Encounter) {
  return `${item.title} ${fileNameFor(item)} ${timestampFor(item, visit)} ${item.date} ${visit.provider}`.toLowerCase();
}

function ItemRow({ item, visit }: { item: EncounterItem; visit: Encounter }) {
  const [open, setOpen] = useState(false);
  const meta = ROW_ICONS[item.type];
  const file = fileNameFor(item);

  return (
    <div className="flex w-full items-stretch">
      <div className="flex w-5 shrink-0 flex-col items-center">
        <span className="flex size-5 shrink-0 items-center justify-center">
          <Icon name={meta.icon} size={16} className={meta.color} />
        </span>
        <span aria-hidden className="mt-1.5 w-px flex-1 bg-[#e6e6e6]" />
      </div>

      <div className="ml-2 flex min-w-0 flex-1 flex-col items-start pb-4">
        <span className="w-full truncate font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">
          {item.title}
        </span>

        <div
          className={`mt-0.5 flex h-9 w-full items-center gap-2 rounded-lg border px-1 ${
            open ? "border-[#1132ee] bg-[rgba(17,50,238,0.04)]" : "border-[#e6e6e6] bg-white"
          }`}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[rgba(17,50,238,0.08)]">
            <Icon name="attach_file" size={18} className="text-[#1132ee]" />
          </span>
          <span className="min-w-0 flex-1 truncate font-body text-[14px] leading-[21px] text-[#454545]">{file}</span>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "View"} ${file}`}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
              open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
          >
            <Icon name="visibility" size={20} className={open ? "text-[#1132ee]" : "text-[#666666]"} />
          </button>
        </div>

        <span className="mt-1 w-full truncate font-body text-[12px] leading-[17px] text-[#666666]">
          {visit.provider} • {timestampFor(item, visit)}, {item.date}
        </span>

        {open && <PdfViewer fileName={documentFor(item)} />}
      </div>
    </div>
  );
}

function TimelineItemBlock({
  visit,
  items,
  collapsed,
}: {
  visit: Encounter;
  items: EncounterItem[];
  collapsed: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-start">
      <div className="flex w-full flex-col items-start rounded-lg pb-2">
        <div className="flex w-full min-w-0 items-baseline gap-2 font-body text-[16px] leading-[24px]">
          <span className="shrink-0 whitespace-nowrap font-medium text-[#1a1a1a]">{visit.caseName}</span>
          <span className="min-w-0 truncate text-[#666666]">{visit.visitType}</span>
        </div>
        <span className="w-full truncate font-body text-[12px] leading-[17px] text-[#666666]">
          {visit.date} | {visit.time} · {visit.title}
        </span>
      </div>

      {!collapsed && (
        <div className="flex w-full flex-col items-start">
          {items.map((item) => (
            <ItemRow key={itemKey(item)} item={item} visit={visit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChartTimelinePanel({ onClose }: { onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const visits = ENCOUNTERS.map((visit) => {
    const visitMatches = search ? visitSearchText(visit).includes(search) : true;
    const items = visit.items.filter((item) =>
      search ? visitMatches || itemSearchText(item, visit).includes(search) : true,
    );
    return { visit, items, visitMatches };
  }).filter((group) => (search ? group.visitMatches || group.items.length > 0 : true));

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white">
      <StickyPanelHeader>
        <div className="flex w-full items-center justify-between">
          <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Care Timeline</h2>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              aria-pressed={collapsed}
              className={`flex size-7 shrink-0 items-center justify-center rounded-md ${collapsed ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
              aria-label={collapsed ? "Expand every timeline section" : "Collapse every timeline section"}
            >
              <Icon
                name={collapsed ? "expand_content" : "collapse_content"}
                size={20}
                className={collapsed ? "text-[#1132ee]" : "text-[#1a1a1a]"}
              />
            </button>
            <CloseRightPanelButton onClose={onClose} />
          </div>
        </div>

        <div className="flex w-full items-center gap-1.5 pb-3 pt-4">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
            <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search timeline"
              className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
                aria-label="Clear search"
              >
                <Icon name="close" size={16} className="text-[#666666]" />
              </button>
            )}
          </label>
        </div>
      </StickyPanelHeader>

      <div className="flex w-full flex-col items-start gap-4 px-4 pb-10">
        {visits.length === 0 ? (
          <p className="w-full py-8 text-center font-body text-[14px] leading-[22px] text-[#666666]">
            No timeline items match the current search.
          </p>
        ) : (
          visits.map(({ visit, items }) => (
            <TimelineItemBlock key={visit.id} visit={visit} items={items} collapsed={collapsed} />
          ))
        )}
      </div>
    </aside>
  );
}
