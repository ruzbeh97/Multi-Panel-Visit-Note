import { useRef, useState, type ReactNode } from "react";
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

type File = (typeof ATTACHMENT_GROUPS)[number]["files"][number];

function Badge({ tone, label, className = "" }: { tone: "grey" | "blue"; label: string; className?: string }) {
  const tones = {
    grey: "bg-[rgba(128,128,128,0.12)] text-[#0f0f0f]",
    blue: "bg-[rgba(27,131,228,0.12)] text-[#0f0f0f]",
  };

  return (
    <span
      className={`flex items-center rounded-full px-3 py-[5px] font-body text-[12px] font-medium leading-[18px] ${tones[tone]} ${className}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

function RailGroup({
  label,
  count,
  open,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-start">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-1 py-2">
        <span className="flex items-center gap-[10px]">
          <span aria-hidden className="h-[22px] w-[2px] shrink-0 bg-[#1132ee]" />
          <span className="font-body text-[14px] font-medium leading-[22px] text-[#1132ee]">
            {label} ({count})
          </span>
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} size={16} className="text-[#1132ee]" />
      </button>
      {open && children}
    </div>
  );
}

function FileRow({
  file,
  open,
  onToggle,
}: {
  file: File;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex w-full items-stretch gap-[10px]">
      <span aria-hidden className="w-[2px] shrink-0 bg-[#1132ee]" />
      <div className="flex min-w-0 flex-1 flex-col border-b border-[#e6e6e6] py-4">
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name="attach_file" size={20} className="text-[#1a1a1a]" />
          </span>
          <p className="min-w-0 flex-1 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {file.name}
          </p>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
              open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
            aria-label={`${open ? "Hide" : "Open"} ${file.name} as a PDF`}
          >
            <Icon name="picture_as_pdf" size={20} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-2 pt-2">
          <span className="shrink-0 font-body text-[14px] leading-[22px] text-[#1a1a1a]">{file.date}</span>
          <Badge tone="grey" label={file.tag} className="shrink-0" />
          <Badge tone="blue" label={file.case} className="min-w-0" />
        </div>

        {open && <PdfViewer fileName={file.name} />}
      </div>
    </div>
  );
}

export default function AttachmentsPanel() {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>(["Patient", "Other"]);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttachmentFilters>(EMPTY_ATTACHMENT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  function toggleGroup(label: string) {
    setCollapsed((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  const search = query.trim().toLowerCase();
  const filtersOn = attachmentFiltersActive(filters);
  const filterCount = attachmentFilterCount(filters);

  const groups = ATTACHMENT_GROUPS.map((group) => ({
    ...group,
    files: group.files.filter((file) => {
      if (!filePassesFilters(file, filters)) return false;
      if (!search) return true;
      return [file.name, file.date, file.tag, file.case].some((field) => field.toLowerCase().includes(search));
    }),
  })).filter((group) => group.files.length > 0 || (!search && !filtersOn));

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Attachments</h2>

      <div className="flex w-full flex-col items-start gap-2 pb-10 pt-4">
        <div className="flex w-full items-center gap-1.5">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
            <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search attachments"
              className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
                aria-label="Clear attachment search"
              >
                <Icon name="close" size={16} className="text-[#666666]" />
              </button>
            )}
          </label>
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            aria-haspopup="dialog"
            aria-expanded={filterOpen}
            className={`relative flex size-7 shrink-0 items-center justify-center rounded-full ${
              filterOpen || filtersOn ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
            aria-label="Filter attachments"
          >
            <Icon name="filter_alt" size={20} className={filtersOn || filterOpen ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
            {filtersOn && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#1132ee] font-body text-[10px] font-medium leading-none text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex w-full flex-col items-start">
          {groups.length === 0 ? (
            <p className="w-full py-8 text-center font-body text-[14px] leading-[22px] text-[#666666]">
              No attachments match the current filters.
            </p>
          ) : (
            groups.map((group) => {
              const open = !(collapsed.includes(group.label) && !(filtersOn || search));
              return (
                <RailGroup
                  key={group.label}
                  label={group.label}
                  count={group.files.length}
                  open={open}
                  onToggle={() => toggleGroup(group.label)}
                >
                  {group.files.map((file, i) => {
                    const key = `${group.label}-${i}-${file.name}`;
                    return (
                      <FileRow
                        key={key}
                        file={file}
                        open={openFile === key}
                        onToggle={() => setOpenFile((current) => (current === key ? null : key))}
                      />
                    );
                  })}
                </RailGroup>
              );
            })
          )}
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
    </aside>
  );
}
