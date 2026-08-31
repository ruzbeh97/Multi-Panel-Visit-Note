import { useEffect, useRef, type Dispatch, type ReactNode, type SetStateAction } from "react";

export const SIDE_PANEL_MIN_WIDTH = 484;

function clamp(width: number, max: number) {
  return Math.min(Math.max(width, SIDE_PANEL_MIN_WIDTH), Math.max(SIDE_PANEL_MIN_WIDTH, max));
}

type Props = {
  width: number;
  onWidthChange: Dispatch<SetStateAction<number>>;
  children: ReactNode;
  // "inset" docks against the note; "standalone" is its own card beside the frame.
  variant?: "inset" | "standalone";
};

export default function ResizableSidePanel({
  width,
  onWidthChange,
  children,
  variant = "inset",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // The panel may grow to half of the region it shares with the note.
  function maxWidth() {
    const row = wrapperRef.current?.parentElement;
    return (row?.clientWidth ?? SIDE_PANEL_MIN_WIDTH * 2) / 2;
  }

  useEffect(() => {
    const row = wrapperRef.current?.parentElement;
    if (!row) return;

    const observer = new ResizeObserver(() => {
      if (draggingRef.current) return;
      onWidthChange((current) => clamp(current, row.clientWidth / 2));
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [onWidthChange]);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();

    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = wrapperRef.current?.getBoundingClientRect().width ?? width;
    const max = maxWidth();

    draggingRef.current = true;
    handle.setPointerCapture(event.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMove(moveEvent: PointerEvent) {
      onWidthChange(clamp(startWidth + (startX - moveEvent.clientX), max));
    }
    function onEnd() {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 48 : 16;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onWidthChange((current) => clamp(current + step, maxWidth()));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onWidthChange((current) => clamp(current - step, maxWidth()));
    } else if (event.key === "Home") {
      event.preventDefault();
      onWidthChange(SIDE_PANEL_MIN_WIDTH);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative flex h-full shrink-0 ${
        variant === "standalone" ? "bg-white" : "ml-4"
      }`}
      style={{ width }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        aria-valuenow={Math.round(width)}
        aria-valuemin={SIDE_PANEL_MIN_WIDTH}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={onKeyDown}
        onDoubleClick={() => onWidthChange(SIDE_PANEL_MIN_WIDTH)}
        className="group absolute -left-2 top-0 z-20 flex h-full w-4 cursor-col-resize items-center justify-center focus:outline-none"
      >
        <div className="h-full w-[3px] rounded-full bg-transparent transition-colors group-hover:bg-[rgba(17,50,238,0.35)] group-focus-visible:bg-[#1132ee]" />
      </div>
      {children}
    </div>
  );
}
