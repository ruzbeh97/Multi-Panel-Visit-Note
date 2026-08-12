import { useState } from "react";
import Icon from "./Icon";
import PdfViewer from "./pdf/PdfViewer";
import { ATTACHMENT_GROUPS } from "../data/chart";

type Tone = "magenta" | "yellow" | "green" | "grey" | "blue";

const TONES: Record<Tone, string> = {
  magenta: "bg-[rgba(232,22,92,0.12)]",
  yellow: "bg-[rgba(255,204,0,0.16)]",
  green: "bg-[rgba(79,176,115,0.12)]",
  grey: "bg-[rgba(128,128,128,0.12)]",
  blue: "bg-[rgba(27,131,228,0.12)]",
};

const GROUP_TONES: Record<string, Tone> = {
  Imaging: "magenta",
  Fax: "yellow",
  Patient: "green",
  Other: "grey",
};

const GROUPS = ATTACHMENT_GROUPS.map((group) => ({ ...group, tone: GROUP_TONES[group.label] ?? "grey" }));

type File = (typeof ATTACHMENT_GROUPS)[number]["files"][number];

function Badge({ tone, label, className = "" }: { tone: Tone; label: string; className?: string }) {
  return (
    <span
      className={`flex items-center rounded-full px-3 py-[5px] font-body text-[12px] font-medium leading-[18px] text-[#0f0f0f] ${TONES[tone]} ${className}`}
    >
      <span className="truncate">{label}</span>
    </span>
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
    <div className="flex w-full flex-col border-b border-[#e6e6e6] py-4">
      <div className="flex w-full items-start gap-1">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="truncate font-body text-[14px] leading-[22px] text-[#1a1a1a]">{file.name}</p>
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-body text-[14px] leading-[22px] text-[#1a1a1a]">{file.date}</span>
            <Badge tone="grey" label={file.tag} className="shrink-0" />
            <Badge tone="blue" label={file.case} className="min-w-0" />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`flex shrink-0 items-start rounded-full p-1 ${open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
          aria-label={`${open ? "Hide" : "Open"} ${file.name} as a PDF`}
        >
          <Icon name="picture_as_pdf" size={20} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
        </button>
      </div>
      {open && <PdfViewer fileName={file.name} />}
    </div>
  );
}

export default function AttachmentsPanel() {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>(["Patient", "Other"]);
  const [openFile, setOpenFile] = useState<string | null>(null);

  function toggleGroup(label: string) {
    setCollapsed((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  const search = query.trim().toLowerCase();
  const groups = GROUPS.map((group) => ({
    ...group,
    files: search
      ? group.files.filter((file) =>
          [file.name, file.date, file.tag, file.case].some((field) => field.toLowerCase().includes(search)),
        )
      : group.files,
  })).filter((group) => group.files.length > 0 || !search);

  return (
    <aside className="scrollbar-thin sticky top-0 ml-4 flex h-full w-[484px] shrink-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <div className="flex w-full flex-col items-start gap-2 pb-4">
        <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Attachments</h2>
        <div className="flex w-full items-center gap-1.5">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
            <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files"
              className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
            />
          </label>
          <button type="button" className="flex shrink-0 items-start rounded-full p-1 hover:bg-black/5" aria-label="Filter attachments">
            <Icon name="filter_alt" size={20} className="text-[#1a1a1a]" />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start pb-10">
        {groups.map((group) => {
          const isCollapsed = collapsed.includes(group.label);
          return (
            <div key={group.label} className="flex w-full flex-col items-start">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={!isCollapsed}
                className={`flex w-full items-center gap-2 py-2 pr-3 ${isCollapsed ? "border-b border-[#e6e6e6]" : ""}`}
              >
                <Badge tone={group.tone} label={group.label} />
                <span className="font-body text-[14px] leading-[22px] text-[#666]">({group.files.length})</span>
                <Icon name={isCollapsed ? "expand_more" : "expand_less"} size={16} className="text-[#1a1a1a]" />
              </button>
              {!isCollapsed &&
                group.files.map((file, i) => {
                  const key = `${group.label}-${i}`;
                  return (
                    <FileRow
                      key={key}
                      file={file}
                      open={openFile === key}
                      onToggle={() => setOpenFile((current) => (current === key ? null : key))}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
