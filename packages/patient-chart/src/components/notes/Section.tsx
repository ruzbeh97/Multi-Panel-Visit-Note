import type { ReactNode } from "react";
import Icon from "../Icon";
import { useNoteReadOnly } from "./readOnly";
import { useNoteStore } from "./noteStore";

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
  const store = useNoteStore();

  function carryForward() {
    store.importSection(title, store.carryAction);
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
        <button
          type="button"
          onClick={carryForward}
          className="flex shrink-0 items-start rounded-full p-1 hover:bg-black/5"
          aria-label={`Carry ${title} forward into the current note (${store.carryAction})`}
        >
          <Icon name="move_up" size={20} className="text-[#1132ee]" />
        </button>
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
      <div className="pointer-events-none flex shrink-0 items-center gap-1 rounded-lg border border-[#e6e6e6] bg-white px-1 py-0.5 opacity-0 shadow-[0px_4px_5px_rgba(0,0,0,0.06)] transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => store.clearSection(title)}
          aria-label={`Clear ${title}`}
          className="flex w-[46px] flex-col items-start px-1.5"
        >
          <span className="font-body text-[14px] font-medium leading-[20px] text-[#1132ee]">Clear</span>
        </button>
        <div className="h-5 w-px bg-[#e6e6e6]" />
        <button
          type="button"
          onClick={carryForward}
          className="flex items-start rounded-full p-1 hover:bg-black/5"
          aria-label={`Import ${title} from a previous visit (${store.carryAction})`}
        >
          <Icon name="move_up" size={20} className="text-[#1a1a1a]" />
        </button>
        <button type="button" className="flex items-start rounded-full p-1 hover:bg-black/5" aria-label="Delete">
          <Icon name="delete" size={20} className="text-[#1a1a1a]" />
        </button>
      </div>
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
