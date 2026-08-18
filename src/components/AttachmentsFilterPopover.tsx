import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { ATTACHMENT_GROUPS } from "../data/chart";

const GAP = 6;
const CARD_WIDTH = 265;

export type AttachmentFilters = {
  cases: string[];
  tags: string[];
};

export const EMPTY_ATTACHMENT_FILTERS: AttachmentFilters = {
  cases: [],
  tags: [],
};

export function attachmentFiltersActive(filters: AttachmentFilters) {
  return filters.cases.length > 0 || filters.tags.length > 0;
}

export function attachmentFilterCount(filters: AttachmentFilters) {
  return filters.cases.length + filters.tags.length;
}

export function filePassesFilters(file: { case: string; tag: string }, filters: AttachmentFilters) {
  if (filters.cases.length > 0 && !filters.cases.includes(file.case)) return false;
  if (filters.tags.length > 0 && !filters.tags.includes(file.tag)) return false;
  return true;
}

const ALL_FILES = ATTACHMENT_GROUPS.flatMap((group) => group.files);

type FilterOption = { value: string; kind: "Tag" | "Case" };

const FILTER_OPTIONS: FilterOption[] = [
  ...[...new Set(ALL_FILES.map((file) => file.tag))]
    .sort()
    .map((value): FilterOption => ({ value, kind: "Tag" })),
  ...[...new Set(ALL_FILES.map((file) => file.case))]
    .sort()
    .map((value): FilterOption => ({ value, kind: "Case" })),
];

type AttachmentsFilterPopoverProps = {
  anchor: HTMLElement;
  value: AttachmentFilters;
  onChange: (next: AttachmentFilters) => void;
  onClose: () => void;
};

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function AttachmentsFilterPopover({
  anchor,
  value,
  onChange,
  onClose,
}: AttachmentsFilterPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const options = FILTER_OPTIONS.filter((option) =>
    search ? option.value.toLowerCase().includes(search) : true,
  );

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const target = anchor.getBoundingClientRect();
    const { width, height } = card.getBoundingClientRect();
    const left = Math.min(Math.max(target.right - width, GAP), window.innerWidth - width - GAP);
    const below = target.bottom + GAP;
    const top =
      below + height > window.innerHeight - GAP ? Math.max(GAP, target.top - height - GAP) : below;

    setPosition({ top, left });
  }, [anchor, options.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!cardRef.current?.contains(target) && !anchor.contains(target)) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [anchor, onClose]);

  function toggleOption(option: FilterOption) {
    if (option.kind === "Tag") {
      onChange({ ...value, tags: toggleValue(value.tags, option.value) });
      return;
    }
    onChange({ ...value, cases: toggleValue(value.cases, option.value) });
  }

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Filter attachments"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        width: CARD_WIDTH,
        visibility: position ? "visible" : "hidden",
      }}
      className="fixed z-50 flex max-h-[min(420px,calc(100vh-24px))] flex-col overflow-hidden rounded-md border border-[#e6e6e6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.06)]"
    >
      <div className="flex w-full shrink-0 flex-col items-start px-2 pt-2">
        <div className="flex h-9 w-full items-center gap-2 rounded-md border border-[#e6e6e6] bg-white pl-3 pr-2">
          <Icon name="search" size={20} className="shrink-0 text-[#666666]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search filters"
            className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none placeholder:text-[#666666]"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col gap-0.5 overflow-y-auto py-2">
        {options.length === 0 ? (
          <p className="px-3 py-2 font-body text-[14px] leading-[22px] text-[#666666]">No matches.</p>
        ) : (
          options.map((option) => {
            const checked =
              option.kind === "Tag"
                ? value.tags.includes(option.value)
                : value.cases.includes(option.value);

            return (
              <label
                key={`${option.kind}-${option.value}`}
                className="flex w-full cursor-pointer flex-col items-start justify-center py-1 pl-3 pr-2 hover:bg-[#f7f7f7]"
              >
                <span className="flex w-full items-center gap-1">
                  <span className="flex items-center justify-center p-[5px]">
                    <span
                      aria-hidden
                      className={`flex size-[18px] items-center justify-center rounded-[2px] border-2 ${
                        checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#666666] bg-white"
                      }`}
                    >
                      {checked && <Icon name="check" size={14} className="text-white" />}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleOption(option)}
                  />
                  <span className="min-w-0 flex-1 truncate font-body text-[16px] leading-[24px] text-[#1a1a1a]">
                    {option.value}
                  </span>
                </span>
                <span className="flex w-full items-center">
                  <span aria-hidden className="w-8 shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-body text-[14px] leading-[22px] text-[#666666]">
                    {option.kind}
                  </span>
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}
