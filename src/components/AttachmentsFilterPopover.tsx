import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { ATTACHMENT_GROUPS } from "../data/chart";

const GAP = 6;

export type AttachmentFilters = {
  cases: string[];
  tags: string[];
  sources: string[];
};

export const EMPTY_ATTACHMENT_FILTERS: AttachmentFilters = {
  cases: [],
  tags: [],
  sources: [],
};

export function attachmentFiltersActive(filters: AttachmentFilters) {
  return filters.cases.length > 0 || filters.tags.length > 0 || filters.sources.length > 0;
}

export function attachmentFilterCount(filters: AttachmentFilters) {
  return filters.cases.length + filters.tags.length + filters.sources.length;
}

export function filePassesFilters(
  file: { case: string; tag: string },
  source: string,
  filters: AttachmentFilters,
) {
  if (filters.cases.length > 0 && !filters.cases.includes(file.case)) return false;
  if (filters.tags.length > 0 && !filters.tags.includes(file.tag)) return false;
  if (filters.sources.length > 0 && !filters.sources.includes(source)) return false;
  return true;
}

const ALL_FILES = ATTACHMENT_GROUPS.flatMap((group) =>
  group.files.map((file) => ({ ...file, source: group.label })),
);

const FILTER_OPTIONS = {
  cases: [...new Set(ALL_FILES.map((file) => file.case))].sort(),
  tags: [...new Set(ALL_FILES.map((file) => file.tag))].sort(),
  sources: ATTACHMENT_GROUPS.map((group) => group.label),
};

type AttachmentsFilterPopoverProps = {
  anchor: HTMLElement;
  value: AttachmentFilters;
  onChange: (next: AttachmentFilters) => void;
  onClose: () => void;
};

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <span className="px-1 font-body text-[12px] font-medium uppercase tracking-[0.04em] leading-[18px] text-[#666666]">
        {title}
      </span>
      <div className="flex w-full flex-col">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className="flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-[#f7f7f7]"
            >
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                  checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#b3b3b3] bg-white"
                }`}
                aria-hidden
              >
                {checked && <Icon name="check" size={12} className="text-white" />}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onToggle(option)}
              />
              <span className="min-w-0 flex-1 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function AttachmentsFilterPopover({
  anchor,
  value,
  onChange,
  onClose,
}: AttachmentsFilterPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const active = useMemo(() => attachmentFiltersActive(value), [value]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const target = anchor.getBoundingClientRect();
    const { width, height } = card.getBoundingClientRect();
    const left = Math.min(Math.max(target.right - width, GAP), window.innerWidth - width - GAP);
    const below = target.bottom + GAP;
    const top =
      below + height > window.innerHeight - GAP
        ? Math.max(GAP, target.top - height - GAP)
        : below;

    setPosition({ top, left });
  }, [anchor, value]);

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

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Filter attachments"
      style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? "visible" : "hidden" }}
      className="fixed z-50 flex w-[280px] max-h-[min(420px,calc(100vh-24px))] flex-col overflow-hidden rounded-xl border border-[#e6e6e6] bg-white shadow-[0px_12px_32px_rgba(0,0,0,0.14)]"
    >
      <div className="flex w-full shrink-0 items-center justify-between gap-3 border-b border-[#e6e6e6] px-3 py-2.5">
        <span className="font-body text-[14px] font-medium leading-[20px] text-[#1a1a1a]">Filters</span>
        <button
          type="button"
          disabled={!active}
          onClick={() => onChange(EMPTY_ATTACHMENT_FILTERS)}
          className={`font-body text-[13px] font-medium leading-[18px] ${
            active ? "text-[#1132ee] hover:underline" : "text-[#b3b3b3]"
          }`}
        >
          Clear all
        </button>
      </div>

      <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 py-3">
        <FilterSection
          title="Case"
          options={FILTER_OPTIONS.cases}
          selected={value.cases}
          onToggle={(option) => onChange({ ...value, cases: toggleValue(value.cases, option) })}
        />
        <div className="mx-1 h-px bg-[#e6e6e6]" />
        <FilterSection
          title="Document type"
          options={FILTER_OPTIONS.tags}
          selected={value.tags}
          onToggle={(option) => onChange({ ...value, tags: toggleValue(value.tags, option) })}
        />
        <div className="mx-1 h-px bg-[#e6e6e6]" />
        <FilterSection
          title="Source"
          options={FILTER_OPTIONS.sources}
          selected={value.sources}
          onToggle={(option) => onChange({ ...value, sources: toggleValue(value.sources, option) })}
        />
      </div>
    </div>,
    document.body,
  );
}
