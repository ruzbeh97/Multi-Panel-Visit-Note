import { useState } from "react";
import Icon from "../Icon";
import AttachmentDocument, { DOC_HEIGHT, DOC_WIDTH } from "./AttachmentDocument";

const PAGE_COUNT = 1;
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];
// The page renders at half the document's intrinsic size when zoom is 100%.
const BASE_SCALE = 0.5;

function NavButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#e6e6e6] hover:bg-black/5"
    >
      <Icon name={icon} size={20} className="text-[#1a1a1a]" />
    </button>
  );
}

function ToolButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
    >
      <Icon name={icon} size={20} className="text-[#1a1a1a]" />
    </button>
  );
}

export default function PdfViewer({ fileName }: { fileName: string }) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const factor = zoom / 100;
  const scale = BASE_SCALE * factor;

  function goToPage(value: number) {
    setPage(Math.min(PAGE_COUNT, Math.max(1, value)));
  }

  function stepZoom(direction: 1 | -1) {
    setZoom((current) => {
      const index = ZOOM_LEVELS.indexOf(current);
      const next = index === -1 ? 100 : index + direction;
      return ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, next))];
    });
  }

  return (
    <div className="flex w-full flex-col">
      <div className="scrollbar-thin w-full overflow-x-auto py-[18px]">
        <div className="flex w-[580px] items-center gap-3 pl-3">
          <NavButton icon="keyboard_arrow_up" label="Previous page" onClick={() => goToPage(page - 1)} />

          <input
            value={page}
            onChange={(e) => goToPage(Number(e.target.value.replace(/\D/g, "")) || 1)}
            aria-label="Page number"
            className="h-9 w-12 shrink-0 rounded-md border border-[#e6e6e6] bg-white pl-3 pr-2 font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none focus:ring-2 focus:ring-[#1132ee]/30"
          />
          <span className="w-10 shrink-0 font-body text-[14px] leading-[24px] text-[#1a1a1a]">of {PAGE_COUNT}</span>

          <NavButton icon="keyboard_arrow_down" label="Next page" onClick={() => goToPage(page + 1)} />
          <ToolButton icon="zoom_out" label="Zoom out" onClick={() => stepZoom(-1)} />

          <div className="relative flex h-9 w-24 shrink-0 items-center rounded-md border border-[#e6e6e6] bg-white pl-3 pr-2">
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom level"
              className="w-full appearance-none bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none"
            >
              {ZOOM_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}%
                </option>
              ))}
            </select>
            <Icon name="arrow_drop_down" size={20} className="pointer-events-none text-[#1a1a1a]" />
          </div>

          <ToolButton icon="fit_screen" label="Fit to page" onClick={() => setZoom(100)} />
          <ToolButton icon="zoom_in" label="Zoom in" onClick={() => stepZoom(1)} />
          <ToolButton icon="rotate_left" label="Rotate left" />
          <ToolButton icon="rotate_right" label="Rotate right" />
          <ToolButton icon="download" label="Download" />
          <ToolButton icon="print" label="Print" />
        </div>
      </div>

      {/* The page is centred with auto margins rather than justify-center, which
          would push overflow past the left edge where it cannot be scrolled to. */}
      <div className="scrollbar-thin flex w-full overflow-x-auto bg-[#f7f7f7] px-5 py-5">
        <div className="mx-auto shrink-0 rounded-md border border-[#e6e6e6] bg-white p-5">
          <div className="overflow-hidden" style={{ width: DOC_WIDTH * scale, height: DOC_HEIGHT * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <AttachmentDocument fileName={fileName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
