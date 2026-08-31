import { useCallback, useEffect, useRef, useState } from "react";

type Heading = { id: string; title: string; level: "section" | "sub" };
type Group = { heading: Heading; items: Heading[] };

function readHeadings(scroller: HTMLElement): Heading[] {
  const note = scroller.querySelector<HTMLElement>("[data-note-main]") ?? scroller;
  return Array.from(note.querySelectorAll<HTMLElement>("[data-note-heading]")).map((node) => ({
    id: node.id,
    title: node.dataset.noteTitle ?? "",
    level: node.dataset.noteHeading === "section" ? "section" : "sub",
  }));
}

function toGroups(headings: Heading[]): Group[] {
  const groups: Group[] = [];
  for (const heading of headings) {
    if (heading.level === "section" || groups.length === 0) {
      groups.push({ heading, items: [] });
    } else {
      groups[groups.length - 1].items.push(heading);
    }
  }
  return groups;
}

export default function NoteOutlineRail({ offsetClass = "pt-14" }: { offsetClass?: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const getScroller = useCallback(
    () => railRef.current?.closest<HTMLElement>("[data-note-scroll]") ?? null,
    [],
  );

  useEffect(() => {
    const scroller = getScroller();
    if (scroller) setHeadings(readHeadings(scroller));
  }, [getScroller]);

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller || headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // Treat the heading nearest the top of the viewport as the current position.
      const threshold = scroller.getBoundingClientRect().top + 120;
      let current = headings[0].id;
      for (const heading of headings) {
        const node = document.getElementById(heading.id);
        if (node && node.getBoundingClientRect().top <= threshold) current = heading.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [getScroller, headings]);

  const show = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const scroller = getScroller();
    if (scroller) setHeadings(readHeadings(scroller));
    setOpen(true);
  };

  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setOpen(false);
  };

  const groups = toGroups(headings);

  return (
    <div
      ref={railRef}
      className={`sticky top-0 z-20 flex w-[33px] shrink-0 items-start self-start ${offsetClass}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Jump to section"
          aria-expanded={open}
          onFocus={show}
          onBlur={hide}
          onClick={() => (open ? setOpen(false) : show())}
          className="flex cursor-pointer flex-col gap-[7px] pl-2 pr-1 outline-none"
        >
          {headings.map((heading) => (
            <span
              key={heading.id}
              className={`block h-px transition-colors ${heading.level === "section" ? "w-[19px]" : "w-[13px]"} ${
                activeId === heading.id ? "bg-[#1a1a1a]" : "bg-[#cccccc]"
              }`}
            />
          ))}
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Note sections"
            className="scrollbar-thin absolute -top-6 left-0 flex max-h-[60vh] w-[268px] flex-col overflow-y-auto rounded-xl border border-[#e6e6e6] bg-white py-3 shadow-[0px_12px_32px_rgba(0,0,0,0.14)]"
          >
            {groups.map((group) => (
              <div key={group.heading.id} className="flex w-full flex-col">
                <span className="px-4 pb-1 pt-3 font-body text-[12px] font-medium leading-5 text-[#999999]">
                  {group.heading.title}
                </span>
                {(group.items.length > 0 ? group.items : [group.heading]).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => jumpTo(item.id)}
                    className={`mx-2 flex cursor-pointer items-center rounded-lg px-4 py-2 text-left font-body text-[15px] leading-5 ${
                      activeId === item.id
                        ? "bg-[rgba(17,50,238,0.08)] text-[#1132ee]"
                        : "text-[#1a1a1a] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
