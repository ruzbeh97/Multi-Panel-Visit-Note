import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const HIDE_DELAY = 900;
const MIN_THUMB = 32;

type Props = {
  targetRef: RefObject<HTMLElement | null>;
};

/** A scrollbar that floats over the right edge of `targetRef` and fades out when idle. */
export default function OverlayScrollbar({ targetRef }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const [thumb, setThumb] = useState({ top: 0, height: 0, scrollable: false });
  const [visible, setVisible] = useState(false);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight - clientHeight;
    if (overflow <= 1) {
      setThumb({ top: 0, height: 0, scrollable: false });
      return;
    }

    const height = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * clientHeight);
    setThumb({ top: (scrollTop / overflow) * (clientHeight - height), height, scrollable: true });
  }, [targetRef]);

  const reveal = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (dragging.current || hovering.current) return;
      setVisible(false);
    }, HIDE_DELAY);
  }, []);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    function onScroll() {
      measure();
      reveal();
    }

    el.addEventListener("scroll", onScroll, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    measure();
    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [measure, reveal, targetRef]);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    const el = targetRef.current;
    if (!el || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startY = event.clientY;
    const startScroll = el.scrollTop;
    const overflow = el.scrollHeight - el.clientHeight;
    const range = el.clientHeight - thumb.height;

    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.userSelect = "none";

    function onMove(moveEvent: PointerEvent) {
      if (range <= 0) return;
      el!.scrollTop = startScroll + ((moveEvent.clientY - startY) * overflow) / range;
    }
    function onEnd() {
      dragging.current = false;
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      reveal();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function jumpToClick(event: React.PointerEvent<HTMLDivElement>) {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track || event.target !== track) return;

    const offset = event.clientY - track.getBoundingClientRect().top - thumb.height / 2;
    const range = el.clientHeight - thumb.height;
    if (range <= 0) return;
    el.scrollTop = (offset / range) * (el.scrollHeight - el.clientHeight);
  }

  if (!thumb.scrollable) return null;

  return (
    <div
      ref={trackRef}
      onPointerDown={jumpToClick}
      onPointerEnter={() => {
        hovering.current = true;
        reveal();
      }}
      onPointerLeave={() => {
        hovering.current = false;
        reveal();
      }}
      onWheel={(event) => {
        const el = targetRef.current;
        if (el) el.scrollTop += event.deltaY;
      }}
      className={`absolute right-0 top-0 z-10 h-full w-3 transition-opacity duration-200 ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onPointerDown={startDrag}
        style={{ transform: `translateY(${thumb.top}px)`, height: thumb.height }}
        className="absolute right-[3px] top-0 w-1.5 cursor-default rounded-full bg-black/25 hover:bg-black/40"
      />
    </div>
  );
}
