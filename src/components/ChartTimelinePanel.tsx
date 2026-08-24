import { useState } from "react";
import Icon from "./Icon";
import { CloseRightPanelButton, PanelSearchField, RailGroup, StickyPanelHeader } from "./chartPanelUi";
import PdfViewer from "./pdf/PdfViewer";
import { timelineDocKey } from "./pdf/AttachmentDocument";
import {
  ENCOUNTERS,
  OUTSIDE_VISIT_ACTIVITY,
  type Encounter,
  type EncounterItem,
  type OutsideVisitActivity,
} from "../data/chart";

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

function timestampFor(item: EncounterItem, source: { time: string }) {
  const time = "time" in item && item.time ? item.time : source.time;
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

function outsideSearchText(entry: OutsideVisitActivity) {
  return `${entry.item.title} ${fileNameFor(entry.item)} ${entry.provider} ${entry.item.date} ${entry.item.type} other activity`.toLowerCase();
}

const OTHER_ACTIVITY_ID = "other-activity";

const OTHER_ACTIVITY_GROUPS = [
  { type: "attachment", label: "Attachments" },
  { type: "order", label: "Orders" },
  { type: "medication", label: "Medications" },
] as const;

function ItemRow({ item, source }: { item: EncounterItem; source: { provider: string; time: string } }) {
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
          {source.provider} • {timestampFor(item, source)}, {item.date}
        </span>

        {open && <PdfViewer fileName={documentFor(item)} />}
      </div>
    </div>
  );
}

function TimelineItemBlock({
  visit,
  items,
  open,
  onToggle,
}: {
  visit: Encounter;
  items: EncounterItem[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-start">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-col items-start rounded-lg pb-2 text-left hover:bg-[#f7f7f7]"
      >
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2 font-body text-[16px] leading-[24px]">
            <span className="shrink-0 whitespace-nowrap font-medium text-[#1a1a1a]">{visit.caseName}</span>
            <span className="min-w-0 truncate text-[#666666]">{visit.visitType}</span>
          </div>
          <Icon
            name={open ? "expand_less" : "expand_more"}
            size={20}
            className="shrink-0 text-[#666666]"
          />
        </div>
        <span className="w-full truncate font-body text-[12px] leading-[17px] text-[#666666]">
          {visit.date} | {visit.time} · {visit.title}
        </span>
      </button>

      {open && (
        <div className="flex w-full flex-col items-start">
          {items.map((item) => (
            <ItemRow key={itemKey(item)} item={item} source={visit} />
          ))}
        </div>
      )}
    </div>
  );
}

function OtherActivityBlock({
  entries,
  open,
  onToggle,
}: {
  entries: OutsideVisitActivity[];
  open: boolean;
  onToggle: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    attachment: true,
    order: true,
    medication: true,
  });

  function toggleGroup(type: string) {
    setOpenGroups((current) => ({ ...current, [type]: !current[type] }));
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-start">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-col items-start rounded-lg pb-2 text-left hover:bg-[#f7f7f7]"
      >
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2 font-body text-[16px] leading-[24px]">
            <span className="shrink-0 whitespace-nowrap font-medium text-[#1a1a1a]">Other Activity</span>
            <span className="min-w-0 truncate text-[#666666]">Outside of appointments</span>
          </div>
          <Icon
            name={open ? "expand_less" : "expand_more"}
            size={20}
            className="shrink-0 text-[#666666]"
          />
        </div>
        <span className="w-full truncate font-body text-[12px] leading-[17px] text-[#666666]">
          Attachments, orders, and medications
        </span>
      </button>

      {open && (
        <div className="flex w-full flex-col items-start">
          {OTHER_ACTIVITY_GROUPS.map((group) => {
            const grouped = entries.filter((entry) => entry.item.type === group.type);
            if (grouped.length === 0) return null;
            return (
              <RailGroup
                key={group.type}
                label={group.label}
                count={grouped.length}
                open={openGroups[group.type]}
                accent
                onToggle={() => toggleGroup(group.type)}
              >
                {grouped.map((entry) => (
                  <ItemRow key={itemKey(entry.item)} item={entry.item} source={entry} />
                ))}
              </RailGroup>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChartTimelinePanel({ onClose }: { onClose: () => void }) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const visits = ENCOUNTERS.map((visit) => {
    const visitMatches = search ? visitSearchText(visit).includes(search) : true;
    const items = visit.items.filter((item) =>
      search ? visitMatches || itemSearchText(item, visit).includes(search) : true,
    );
    return { visit, items, visitMatches };
  }).filter((group) => (search ? group.visitMatches || group.items.length > 0 : true));

  const otherEntries = OUTSIDE_VISIT_ACTIVITY.filter((entry) =>
    search ? outsideSearchText(entry).includes(search) : true,
  );
  const sectionIds = [
    ...(otherEntries.length > 0 ? [OTHER_ACTIVITY_ID] : []),
    ...visits.map(({ visit }) => visit.id),
  ];
  const allCollapsed = sectionIds.length > 0 && sectionIds.every((id) => collapsedIds.has(id));

  function toggleAll() {
    setCollapsedIds(allCollapsed ? new Set() : new Set(sectionIds));
  }

  function toggleVisit(id: string) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white">
      <StickyPanelHeader>
        <div className="flex w-full items-center justify-between">
          <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Care Timeline</h2>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleAll}
              aria-pressed={allCollapsed}
              className={`flex size-7 shrink-0 items-center justify-center rounded-md ${allCollapsed ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
              aria-label={allCollapsed ? "Expand every timeline section" : "Collapse every timeline section"}
            >
              <Icon
                name={allCollapsed ? "expand_content" : "collapse_content"}
                size={20}
                className={allCollapsed ? "text-[#1132ee]" : "text-[#1a1a1a]"}
              />
            </button>
            <CloseRightPanelButton onClose={onClose} />
          </div>
        </div>

        <div className="flex w-full items-center gap-1.5 pb-3 pt-4">
          <PanelSearchField value={query} onChange={setQuery} ariaLabel="Search timeline" />
        </div>
      </StickyPanelHeader>

      <div className="flex w-full flex-col items-start gap-4 px-4 pb-10">
        {visits.length === 0 && otherEntries.length === 0 ? (
          <p className="w-full py-8 text-center font-body text-[14px] leading-[22px] text-[#666666]">
            No timeline items match the current search.
          </p>
        ) : (
          <>
            {otherEntries.length > 0 && (
              <OtherActivityBlock
                entries={otherEntries}
                open={!collapsedIds.has(OTHER_ACTIVITY_ID)}
                onToggle={() => toggleVisit(OTHER_ACTIVITY_ID)}
              />
            )}
            {visits.map(({ visit, items }) => (
              <TimelineItemBlock
                key={visit.id}
                visit={visit}
                items={items}
                open={!collapsedIds.has(visit.id)}
                onToggle={() => toggleVisit(visit.id)}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
