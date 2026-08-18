import { useRef, useState } from "react";
import Icon from "./Icon";
import PdfViewer from "./pdf/PdfViewer";
import { ATTACHMENT_GROUPS } from "../data/chart";
import AttachmentsFilterPopover, {
  EMPTY_ATTACHMENT_FILTERS,
  attachmentFilterCount,
  attachmentFiltersActive,
  filePassesFilters,
  type AttachmentFilters,
} from "./AttachmentsFilterPopover";

type AttachmentFile = (typeof ATTACHMENT_GROUPS)[number]["files"][number];

// Column widths are shared by the header and every row so the table lines up
// without a real <table> (rows expand to hold an inline PDF viewer).
const COLUMNS = "grid-cols-[40px_minmax(0,1fr)_150px_200px_220px_84px]";

// Group pill colors match the chart Attachments table (Fax / Case / Patient / Chart Note).
const GROUP_BADGE_TONES: Record<string, string> = {
  Imaging: "bg-[rgba(156,109,255,0.14)] text-[#5b2d9e]",
  Fax: "bg-[rgba(255,173,51,0.16)] text-[#8a5a00]",
  Patient: "bg-[rgba(79,176,115,0.16)] text-[#1f6b3a]",
  Other: "bg-[rgba(255,200,50,0.18)] text-[#8a6a00]",
};

function Badge({ tone, label }: { tone: "grey" | "blue"; label: string }) {
  const tones = {
    grey: "bg-[rgba(128,128,128,0.12)] text-[#0f0f0f]",
    blue: "bg-[rgba(27,131,228,0.12)] text-[#0f0f0f]",
  };

  return (
    <span
      className={`flex max-w-full items-center rounded-full px-3 py-[5px] font-body text-[12px] font-medium leading-[18px] ${tones[tone]}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex size-7 cursor-pointer items-center justify-center">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} aria-label={label} />
      <span
        aria-hidden
        className={`flex size-[18px] items-center justify-center rounded-[2px] border-2 ${
          checked || indeterminate ? "border-[#1132ee] bg-[#1132ee]" : "border-[#666666] bg-white"
        }`}
      >
        {indeterminate && !checked && <span className="h-[2px] w-[10px] rounded-full bg-white" />}
        {checked && <Icon name="check" size={14} className="text-white" />}
      </span>
    </label>
  );
}

function ToolbarIconButton({
  icon,
  label,
  active,
  count,
  onClick,
  buttonRef,
}: {
  icon: string;
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative flex size-9 shrink-0 items-center justify-center rounded-lg ${
        active ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
      }`}
    >
      <Icon name={icon} size={20} className={active ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
      {count ? (
        <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#1132ee] font-body text-[10px] font-medium leading-none text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function FileRow({
  file,
  selected,
  onSelect,
  open,
  onToggle,
}: {
  file: AttachmentFile;
  selected: boolean;
  onSelect: () => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex w-full flex-col border-b border-[#e6e6e6] last:border-b-0">
      <div className={`grid w-full ${COLUMNS} items-center gap-3 px-3 py-2`}>
        <div className="flex items-center justify-center">
          <Checkbox checked={selected} onChange={onSelect} label={`Select ${file.name}`} />
        </div>

        <div className="flex min-w-0 items-center gap-2 pl-6">
          <Icon name="attach_file" size={18} className="shrink-0 text-[#666666]" />
          <span className="min-w-0 truncate font-body text-[14px] leading-[22px] text-[#1a1a1a]">{file.name}</span>
        </div>

        <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{file.date}</span>

        <div className="flex min-w-0">
          <Badge tone="grey" label={file.tag} />
        </div>

        <div className="flex min-w-0">
          <Badge tone="blue" label={file.case} />
        </div>

        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Preview"} ${file.name}`}
            className={`flex size-7 items-center justify-center rounded-full ${
              open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
          >
            <Icon name="visibility" size={18} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
          </button>
          <button
            type="button"
            aria-label={`Download ${file.name}`}
            className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
          >
            <Icon name="download" size={18} className="text-[#1a1a1a]" />
          </button>
        </div>
      </div>

      {open && (
        <div className="w-full px-3 pb-4 pl-[76px]">
          <PdfViewer fileName={file.name} />
        </div>
      )}
    </div>
  );
}

export default function AttachmentsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AttachmentFilters>(EMPTY_ATTACHMENT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const search = query.trim().toLowerCase();
  const filtersOn = attachmentFiltersActive(filters);

  const groups = ATTACHMENT_GROUPS.map((group) => ({
    ...group,
    files: group.files.filter((file) => {
      if (!filePassesFilters(file, filters)) return false;
      return search ? file.name.toLowerCase().includes(search) : true;
    }),
  }));

  const visibleFiles = groups.flatMap((group) => group.files.map((file) => file.name));
  const allSelected = visibleFiles.length > 0 && visibleFiles.every((name) => selected.includes(name));
  const someSelected = visibleFiles.some((name) => selected.includes(name));

  function toggleGroup(label: string) {
    setOpenGroups((current) =>
      current.includes(label) ? current.filter((entry) => entry !== label) : [...current, label],
    );
  }

  function toggleFile(name: string) {
    setSelected((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name],
    );
  }

  function toggleGroupSelection(names: string[]) {
    const everySelected = names.length > 0 && names.every((name) => selected.includes(name));
    setSelected((current) =>
      everySelected
        ? current.filter((name) => !names.includes(name))
        : [...new Set([...current, ...names])],
    );
  }

  return (
    <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col items-start overflow-y-auto bg-white px-6 py-5">
      <div className="flex w-full items-center justify-between gap-4">
        <h1 className="font-body text-[20px] font-medium leading-[28px] text-[#1a1a1a]">Attachments</h1>

        <div className="flex shrink-0 items-center gap-2">
          <label className="flex h-9 w-[260px] items-center gap-2 rounded-lg border border-[#e6e6e6] bg-white pl-3 pr-2">
            <Icon name="search" size={18} className="shrink-0 text-[#666666]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search attachments by file name"
              aria-label="Search attachments by file name"
              className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none placeholder:text-[#666666]"
            />
          </label>

          <ToolbarIconButton icon="tune" label="Table settings" />
          <ToolbarIconButton
            icon="filter_list"
            label="Filter attachments"
            active={filterOpen || filtersOn}
            count={filtersOn ? attachmentFilterCount(filters) : undefined}
            onClick={() => setFilterOpen((open) => !open)}
            buttonRef={filterButtonRef}
          />

          <button
            type="button"
            className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#1132ee] pl-3 pr-4 hover:bg-[#0f2dd7]"
          >
            <Icon name="add" size={18} className="text-white" />
            <span className="whitespace-nowrap font-body text-[14px] font-medium leading-[22px] text-white">Add</span>
          </button>
        </div>
      </div>

      <div className="mt-4 w-full overflow-hidden rounded-lg border border-[#e6e6e6]">
        <div className="scrollbar-thin w-full overflow-x-auto">
        <div className="flex min-w-[860px] flex-col items-start">
        <div
          className={`grid w-full ${COLUMNS} items-center gap-3 border-b border-[#e6e6e6] bg-white px-3 py-2.5`}
        >
          <div className="flex items-center justify-center">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={() => toggleGroupSelection(visibleFiles)}
              label="Select all attachments"
            />
          </div>
          <span className="font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">Name</span>
          <span className="flex items-center gap-1 font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            Document Date
            <Icon name="arrow_downward" size={16} className="text-[#666666]" />
          </span>
          <span className="font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">Tags</span>
          <span className="font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">Cases</span>
          <span className="text-right font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">Actions</span>
        </div>

        {groups.every((group) => group.files.length === 0) ? (
          <p className="w-full py-10 text-center font-body text-[14px] leading-[22px] text-[#666666]">
            No attachments match the current filters.
          </p>
        ) : (
          groups.map((group) => {
            const names = group.files.map((file) => file.name);
            const open = openGroups.includes(group.label) || Boolean(search) || filtersOn;
            const groupSelected = names.length > 0 && names.every((name) => selected.includes(name));

            return (
              <div key={group.label} className="flex w-full flex-col border-b border-[#e6e6e6] last:border-b-0">
                <div className={`grid w-full ${COLUMNS} items-center gap-3 bg-[#fafafa] px-3 py-2`}>
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={groupSelected}
                      indeterminate={!groupSelected && names.some((name) => selected.includes(name))}
                      onChange={() => toggleGroupSelection(names)}
                      label={`Select all ${group.label} attachments`}
                    />
                  </div>

                  <div className="col-span-5 flex min-w-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      aria-expanded={open}
                      aria-label={`${open ? "Collapse" : "Expand"} ${group.label}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
                    >
                      <Icon
                        name={open ? "expand_less" : "expand_more"}
                        size={20}
                        className="text-[#1a1a1a]"
                      />
                    </button>
                    <span
                      className={`flex items-center rounded-full px-2 py-[3px] font-body text-[13px] font-medium leading-[20px] ${
                        GROUP_BADGE_TONES[group.label] ?? "bg-[rgba(128,128,128,0.12)] text-[#0f0f0f]"
                      }`}
                    >
                      {group.label} ({group.files.length})
                    </span>
                  </div>
                </div>

                {open &&
                  group.files.map((file) => (
                    <FileRow
                      key={file.name}
                      file={file}
                      selected={selected.includes(file.name)}
                      onSelect={() => toggleFile(file.name)}
                      open={openFile === file.name}
                      onToggle={() => setOpenFile((current) => (current === file.name ? null : file.name))}
                    />
                  ))}
              </div>
            );
          })
        )}
        </div>
        </div>
      </div>

      {filterOpen && filterButtonRef.current && (
        <AttachmentsFilterPopover
          anchor={filterButtonRef.current}
          value={filters}
          onChange={setFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
