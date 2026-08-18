import FilterMenuPopover, { type FilterMenuOption } from "./FilterMenuPopover";
import { ATTACHMENT_GROUPS } from "../data/chart";

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

const TAG_VALUES = [...new Set(ALL_FILES.map((file) => file.tag))].sort();
const CASE_VALUES = [...new Set(ALL_FILES.map((file) => file.case))].sort();

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
  const options: FilterMenuOption[] = [
    ...TAG_VALUES.map((tag) => ({ value: tag, kind: "Tag", checked: value.tags.includes(tag) })),
    ...CASE_VALUES.map((entry) => ({
      value: entry,
      kind: "Case",
      checked: value.cases.includes(entry),
    })),
  ];

  return (
    <FilterMenuPopover
      anchor={anchor}
      ariaLabel="Filter attachments"
      options={options}
      onClose={onClose}
      onToggle={(option) =>
        option.kind === "Tag"
          ? onChange({ ...value, tags: toggleValue(value.tags, option.value) })
          : onChange({ ...value, cases: toggleValue(value.cases, option.value) })
      }
    />
  );
}
