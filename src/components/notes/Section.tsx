import { useState, type MouseEvent, type ReactNode } from "react";
import Icon from "../Icon";
import ImportContentModal from "../ImportContentModal";
import { useNoteReadOnly } from "./readOnly";

export function headingId(title: string, readOnly = false) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // The read-only copy renders the same headings, so it needs its own id namespace.
  return `${readOnly ? "past-note" : "note"}-${slug}`;
}

export function SectionHeading({ title }: { title: string }) {
  const readOnly = useNoteReadOnly();
  return (
    <div
      id={headingId(title, readOnly)}
      data-note-heading="section"
      data-note-title={title}
      className="flex w-full scroll-mt-6 items-center justify-center gap-[127px] py-1"
    >
      <div className="flex flex-1 items-center gap-2">
        <h1 className="flex-1 font-body text-[34px] font-bold leading-none text-black">{title}</h1>
      </div>
    </div>
  );
}

export function SubHeading({ title }: { title: string }) {
  const readOnly = useNoteReadOnly();
  const [importAnchor, setImportAnchor] = useState<HTMLElement | null>(null);

  function toggleImport(event: MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    setImportAnchor((current) => (current ? null : button));
  }

  if (readOnly) {
    return (
      <div
        id={headingId(title, true)}
        data-note-heading="sub"
        data-note-title={title}
        className="flex w-full scroll-mt-6 items-center justify-between gap-4"
      >
        <div className="flex flex-1 items-center gap-1 py-1">
          <h2 className="flex-1 font-body text-[24px] font-bold leading-none text-black">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center rounded-lg border border-[#e6e6e6] bg-white px-1 py-0.5 shadow-[0px_4px_5px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            className="flex items-start rounded-full p-1 hover:bg-black/5"
            aria-label={`Copy ${title} into the current note`}
          >
            <Icon name="move_up" size={20} className="text-[#1132ee]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={headingId(title)}
      data-note-heading="sub"
      data-note-title={title}
      className="group flex w-full scroll-mt-6 items-center justify-between gap-4"
    >
      <div className="flex flex-1 items-center gap-1 py-1">
        <h2 className="flex-1 font-body text-[24px] font-bold leading-none text-black">{title}</h2>
      </div>
      <div
        className={`flex shrink-0 items-center gap-1 rounded-lg border border-[#e6e6e6] bg-white px-1 py-0.5 shadow-[0px_4px_5px_rgba(0,0,0,0.06)] transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 ${
          importAnchor ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button type="button" className="flex w-[46px] flex-col items-start px-1.5">
          <span className="font-body text-[14px] font-medium leading-[20px] text-[#1132ee]">Clear</span>
        </button>
        <div className="h-5 w-px bg-[#e6e6e6]" />
        <button
          type="button"
          onClick={toggleImport}
          aria-haspopup="dialog"
          aria-expanded={importAnchor !== null}
          className={`flex items-start rounded-full p-1 ${importAnchor ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"}`}
          aria-label={`Import ${title} from a previous visit`}
        >
          <Icon name="move_up" size={20} className={importAnchor ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
        </button>
        <button type="button" className="flex items-start rounded-full p-1 hover:bg-black/5" aria-label="Delete">
          <Icon name="delete" size={20} className="text-[#1a1a1a]" />
        </button>
      </div>

      {importAnchor && (
        <ImportContentModal anchor={importAnchor} sectionTitle={title} onClose={() => setImportAnchor(null)} />
      )}
    </div>
  );
}

export function Block({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col items-start gap-6">{children}</div>;
}

export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <SectionHeading title={title} />
      {children}
    </div>
  );
}
