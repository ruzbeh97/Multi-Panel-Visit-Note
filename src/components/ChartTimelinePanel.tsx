import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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

type MatchTarget = "visit" | "item";

type TimelineMatch = {
  id: string;
  visitId: string;
  target: MatchTarget;
  itemKey?: string;
};

function itemKey(item: EncounterItem) {
  return `${item.type}-${item.title}-${item.date}`;
}

function documentFor(item: EncounterItem) {
  return item.type === "attachment" ? item.file : timelineDocKey(item);
}

// Orders and prescriptions generate their document on the fly, so the row needs
// a file name to show beside the paperclip.
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

function itemSearchText(item: EncounterItem) {
  // Only fields shown on the timeline row, so highlights match what the user sees.
  return `${item.title} ${fileNameFor(item)}`.toLowerCase();
}

function collectMatches(query: string): TimelineMatch[] {
  const search = query.trim().toLowerCase();
  if (!search) return [];

  const matches: TimelineMatch[] = [];
  // ENCOUNTERS is newest-first, so matches stay most-recent → oldest.
  for (const visit of ENCOUNTERS) {
    if (visitSearchText(visit).includes(search)) {
      matches.push({ id: `visit:${visit.id}`, visitId: visit.id, target: "visit" });
    }
    for (const item of visit.items) {
      if (itemSearchText(item).includes(search)) {
        const key = itemKey(item);
        matches.push({
          id: `item:${visit.id}:${key}`,
          visitId: visit.id,
          target: "item",
          itemKey: key,
        });
      }
    }
  }
  return matches;
}

function MatchHighlight({
  active,
  matched,
  children,
  className = "",
}: {
  active: boolean;
  matched: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg transition-colors ${
        active
          ? "bg-[rgba(17,50,238,0.14)] ring-1 ring-[#1132ee]/40"
          : matched
            ? "bg-[rgba(17,50,238,0.06)]"
            : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function ItemRow({
  item,
  visit,
  matched,
  active,
  onActivate,
}: {
  item: EncounterItem;
  visit: Encounter;
  matched: boolean;
  active: boolean;
  onActivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = ROW_ICONS[item.type];
  const file = fileNameFor(item);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !rowRef.current) return;
    rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <div className="flex w-full items-stretch">
      <div className="flex w-5 shrink-0 flex-col items-center">
        <span className="flex size-5 shrink-0 items-center justify-center">
          <Icon name={meta.icon} size={16} className={meta.color} />
        </span>
        <span aria-hidden className="mt-1.5 w-px flex-1 bg-[#e6e6e6]" />
      </div>

      <MatchHighlight active={active} matched={matched} className="ml-2 min-w-0 flex-1">
        <div
          ref={rowRef}
          data-timeline-match={active ? "active" : matched ? "match" : undefined}
          className="flex w-full min-w-0 flex-col items-start pb-4"
        >
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
            <span className="min-w-0 flex-1 truncate font-body text-[14px] leading-[21px] text-[#454545]">
              {file}
            </span>
            <button
              type="button"
              onClick={() => {
                onActivate();
                setOpen((current) => !current);
              }}
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
      </MatchHighlight>
    </div>
  );
}

function TimelineItemBlock({
  visit,
  collapsed,
  activeMatch,
  matchedVisit,
  matchedItemKeys,
  onActivateMatch,
}: {
  visit: Encounter;
  collapsed: boolean;
  activeMatch: TimelineMatch | null;
  matchedVisit: boolean;
  matchedItemKeys: Set<string>;
  onActivateMatch: (id: string) => void;
}) {
  const visitActive = activeMatch?.target === "visit" && activeMatch.visitId === visit.id;
  const visitRef = useRef<HTMLDivElement>(null);
  const showItems = !collapsed || matchedItemKeys.size > 0;

  useEffect(() => {
    if (!visitActive || !visitRef.current) return;
    visitRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [visitActive]);

  return (
    <div className="flex w-full min-w-0 flex-col items-start">
      <MatchHighlight active={visitActive} matched={matchedVisit} className="w-full">
        <div
          ref={visitRef}
          data-timeline-match={visitActive ? "active" : matchedVisit ? "match" : undefined}
          className="flex w-full cursor-pointer flex-col items-start rounded-lg pb-2"
          onClick={() => matchedVisit && onActivateMatch(`visit:${visit.id}`)}
        >
          <div className="flex w-full min-w-0 items-baseline gap-2 font-body text-[16px] leading-[24px]">
            <span className="shrink-0 whitespace-nowrap font-medium text-[#1a1a1a]">{visit.caseName}</span>
            <span className="min-w-0 truncate text-[#666666]">{visit.visitType}</span>
          </div>
          <span className="w-full truncate font-body text-[12px] leading-[17px] text-[#666666]">
            {visit.date} | {visit.time} · {visit.title}
          </span>
        </div>
      </MatchHighlight>

      {showItems && (
        <div className="flex w-full flex-col items-start">
          {visit.items.map((item) => {
            const key = itemKey(item);
            const matched = matchedItemKeys.has(key);
            const active =
              activeMatch?.target === "item" && activeMatch.itemKey === key && activeMatch.visitId === visit.id;
            return (
              <ItemRow
                key={key}
                item={item}
                visit={visit}
                matched={matched}
                active={active}
                onActivate={() => matched && onActivateMatch(`item:${visit.id}:${key}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChartTimelinePanel({ onClose }: { onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => collectMatches(query), [query]);
  const activeMatch = matches.length > 0 ? matches[Math.min(activeIndex, matches.length - 1)] : null;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= matches.length && matches.length > 0) {
      setActiveIndex(matches.length - 1);
    }
  }, [activeIndex, matches.length]);

  // Searching item rows needs them visible even if the panel was collapsed.
  useEffect(() => {
    if (matches.some((match) => match.target === "item")) {
      setCollapsed(false);
    }
  }, [matches]);

  function goTo(delta: number) {
    if (matches.length === 0) return;
    setActiveIndex((current) => (current + delta + matches.length) % matches.length);
  }

  function activateMatch(id: string) {
    const index = matches.findIndex((match) => match.id === id);
    if (index >= 0) setActiveIndex(index);
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (matches.length === 0) return;
    if (event.key === "ArrowDown" || (event.key === "Enter" && !event.shiftKey)) {
      event.preventDefault();
      goTo(1);
    } else if (event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey)) {
      event.preventDefault();
      goTo(-1);
    } else if (event.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  }

  const matchLookup = useMemo(() => {
    const visits = new Set<string>();
    const itemsByVisit = new Map<string, Set<string>>();
    for (const match of matches) {
      if (match.target === "visit") {
        visits.add(match.visitId);
      } else if (match.itemKey) {
        const set = itemsByVisit.get(match.visitId) ?? new Set<string>();
        set.add(match.itemKey);
        itemsByVisit.set(match.visitId, set);
      }
    }
    return { visits, itemsByVisit };
  }, [matches]);

  const hasQuery = query.trim().length > 0;

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
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search timeline"
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

          {hasQuery && (
            <div className="flex shrink-0 items-center gap-0.5">
              <span
                className="whitespace-nowrap px-1 font-body text-[13px] leading-[18px] text-[#666666]"
                aria-live="polite"
              >
                {matches.length === 0 ? "0 results" : `${activeIndex + 1} of ${matches.length}`}
              </span>
              <button
                type="button"
                onClick={() => goTo(-1)}
                disabled={matches.length === 0}
                className="flex items-start rounded-full p-1 hover:bg-black/5 disabled:opacity-30"
                aria-label="Previous match"
              >
                <Icon name="keyboard_arrow_up" size={20} className="text-[#1a1a1a]" />
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={matches.length === 0}
                className="flex items-start rounded-full p-1 hover:bg-black/5 disabled:opacity-30"
                aria-label="Next match"
              >
                <Icon name="keyboard_arrow_down" size={20} className="text-[#1a1a1a]" />
              </button>
            </div>
          )}
        </div>
      </StickyPanelHeader>

      <div className="flex w-full flex-col items-start gap-4 px-4 pb-10">
        {ENCOUNTERS.map((visit) => (
          <TimelineItemBlock
            key={visit.id}
            visit={visit}
            collapsed={collapsed}
            activeMatch={activeMatch}
            matchedVisit={matchLookup.visits.has(visit.id)}
            matchedItemKeys={matchLookup.itemsByVisit.get(visit.id) ?? new Set()}
            onActivateMatch={activateMatch}
          />
        ))}
      </div>
    </aside>
  );
}
