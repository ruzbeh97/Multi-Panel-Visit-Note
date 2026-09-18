import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { useAssigneeGroupRecords } from "../assigneeGroups";

export const ASSIGNEE_PICKER_WIDTH = 444;

const TABS = [
  { id: "all", label: "All" },
  { id: "groups", label: "Groups" },
  { id: "individuals", label: "Individuals" },
] as const;

type AssigneePickerTab = (typeof TABS)[number]["id"];

const SEARCH_PLACEHOLDERS: Record<AssigneePickerTab, string> = {
  all: "Search Groups or Individuals",
  groups: "Search Groups",
  individuals: "Search Individuals",
};

interface PanelProps {
  /** Names currently assigned, whether they are groups or individuals. */
  selected: string[];
  onSelect: (name: string) => void;
  /** Directory names to offer alongside the members of each group. */
  individuals?: string[];
}

function SectionHeader({ label, tone }: { label: string; tone: "groups" | "individuals" }) {
  return (
    <div
      className={`px-2 font-body text-[14px] font-medium leading-[22px] text-[#666666] ${
        tone === "groups" ? "bg-[#f1f3fe]" : "bg-[#fffdf0]"
      }`}
    >
      {label}
    </div>
  );
}

function PickerRow({
  title,
  subtitle,
  isSelected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 border-b border-[#e6e6e6] pb-2 pl-2 pr-4 pt-1 text-left transition-colors ${
        isSelected ? "bg-[#eceefe]" : "bg-white hover:bg-[#f5f5f5]"
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">{title}</span>
        {subtitle ? (
          <span className="truncate font-body text-[12px] font-medium leading-[18px] text-[#666666]">{subtitle}</span>
        ) : null}
      </span>
      {isSelected ? <Icon name="check" size={16} className="shrink-0 text-[#1132ee]" /> : null}
    </button>
  );
}

export function AssigneePickerPanel({ selected, onSelect, individuals = [] }: PanelProps) {
  const groups = useAssigneeGroupRecords();
  const [tab, setTab] = useState<AssigneePickerTab>("all");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Individuals show the groups they belong to, which is how the directory reads both ways.
  const groupsByMember = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const group of groups) {
      for (const member of group.members) {
        map.set(member, [...(map.get(member) ?? []), group.name]);
      }
    }
    return map;
  }, [groups]);

  const people = useMemo(() => {
    const groupNames = new Set(groups.map((group) => group.name));
    const names = [...individuals, ...groupsByMember.keys()];
    return [...new Set(names.filter((name) => name && !groupNames.has(name)))];
  }, [groups, groupsByMember, individuals]);

  const query = search.trim().toLowerCase();
  const hits = (values: string[]) => !query || values.some((value) => value.toLowerCase().includes(query));

  const visibleGroups = tab === "individuals" ? [] : groups.filter((group) => hits([group.name, ...group.members]));
  const visiblePeople =
    tab === "groups" ? [] : people.filter((name) => hits([name, ...(groupsByMember.get(name) ?? [])]));

  return (
    <div className="flex items-stretch" style={{ width: ASSIGNEE_PICKER_WIDTH }}>
      <div className="flex w-[104px] shrink-0 flex-col gap-0.5 border-r border-[#e6e6e6] bg-[#f7f7f7] px-2 py-4">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            className={`flex h-[27px] items-center rounded-md px-2 text-left font-body text-[12px] font-medium leading-[18px] transition-colors ${
              tab === entry.id ? "bg-[#e6e6e6] text-[#1a1a1a]" : "text-[#1a1a1a] hover:bg-[#ececec]"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center border-b border-[#e6e6e6] p-2">
          <input
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={SEARCH_PLACEHOLDERS[tab]}
            className="h-7 min-w-0 flex-1 rounded-lg bg-transparent px-1.5 font-body text-[14px] leading-6 text-[#1a1a1a] outline-none placeholder:text-[#808080]"
          />
        </div>
        <div className="max-h-[360px] flex-1 overflow-y-auto">
          {visibleGroups.length > 0 ? (
            <>
              <SectionHeader label="Groups" tone="groups" />
              {visibleGroups.map((group) => (
                <PickerRow
                  key={group.id}
                  title={`${group.name} (${group.members.length})`}
                  subtitle={group.members.join(", ")}
                  isSelected={selectedSet.has(group.name)}
                  onClick={() => onSelect(group.name)}
                />
              ))}
            </>
          ) : null}
          {visiblePeople.length > 0 ? (
            <>
              <SectionHeader label="Individuals" tone="individuals" />
              {visiblePeople.map((name) => (
                <PickerRow
                  key={name}
                  title={name}
                  subtitle={groupsByMember.get(name)?.join(", ")}
                  isSelected={selectedSet.has(name)}
                  onClick={() => onSelect(name)}
                />
              ))}
            </>
          ) : null}
          {visibleGroups.length === 0 && visiblePeople.length === 0 ? (
            <div className="px-3 py-4 font-body text-[14px] leading-[22px] text-[#666666]">
              No matches for “{search.trim()}”
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The panel anchored to a trigger and rendered above the drawer. */
export function AssigneePickerPopover({
  anchorRef,
  align = "left",
  onDismiss,
  ...panelProps
}: PanelProps & {
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: "left" | "right";
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const height = 404;
    let left = align === "right" ? rect.right - ASSIGNEE_PICKER_WIDTH : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - ASSIGNEE_PICKER_WIDTH - 8);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < height ? Math.max(8, rect.top - height) : rect.bottom + 4;
    setPos({ top, left });
  }, [anchorRef, align]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target)) return;
      // The trigger closes the picker through its own toggle.
      if (anchorRef.current?.contains(target)) return;
      onDismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onDismiss]);

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, zIndex: 10050 }}
      className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <AssigneePickerPanel {...panelProps} />
    </div>,
    document.body,
  );
}
