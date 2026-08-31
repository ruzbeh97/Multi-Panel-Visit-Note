import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

const GAP = 6;
const CARD_WIDTH = 265;

export type FilterMenuOption = {
  value: string;
  kind: string;
  checked: boolean;
};

type FilterMenuPopoverProps = {
  anchor: HTMLElement;
  ariaLabel: string;
  options: FilterMenuOption[];
  onToggle: (option: FilterMenuOption) => void;
  onClose: () => void;
};

export default function FilterMenuPopover({
  anchor,
  ariaLabel,
  options,
  onToggle,
  onClose,
}: FilterMenuPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const visible = options.filter((option) =>
    search ? option.value.toLowerCase().includes(search) : true,
  );

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const target = anchor.getBoundingClientRect();
    const { width, height } = card.getBoundingClientRect();
    const left = Math.min(Math.max(target.right - width, GAP), window.innerWidth - width - GAP);
    const below = target.bottom + GAP;
    const top =
      below + height > window.innerHeight - GAP ? Math.max(GAP, target.top - height - GAP) : below;

    setPosition({ top, left });
  }, [anchor, visible.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!cardRef.current?.contains(target) && !anchor.contains(target)) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-label={ariaLabel}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        width: CARD_WIDTH,
        visibility: position ? "visible" : "hidden",
      }}
      className="fixed z-50 flex max-h-[min(420px,calc(100vh-24px))] flex-col overflow-hidden rounded-md border border-[#e6e6e6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.06)]"
    >
      <div className="flex w-full shrink-0 flex-col items-start px-2 pt-2">
        <div className="flex h-9 w-full items-center gap-2 rounded-md border border-[#e6e6e6] bg-white pl-3 pr-2">
          <Icon name="search" size={20} className="shrink-0 text-[#666666]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label={`Search ${ariaLabel.toLowerCase()} options`}
            className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none placeholder:text-[#666666]"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col gap-0.5 overflow-y-auto py-2">
        {visible.length === 0 ? (
          <p className="px-3 py-2 font-body text-[14px] leading-[22px] text-[#666666]">No matches.</p>
        ) : (
          visible.map((option) => (
            <label
              key={`${option.kind}-${option.value}`}
              className="flex w-full cursor-pointer flex-col items-start justify-center py-1 pl-3 pr-2 hover:bg-[#f7f7f7]"
            >
              <span className="flex w-full items-center gap-1">
                <span className="flex items-center justify-center p-[5px]">
                  <span
                    aria-hidden
                    className={`flex size-[18px] items-center justify-center rounded-[2px] border-2 ${
                      option.checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#666666] bg-white"
                    }`}
                  >
                    {option.checked && <Icon name="check" size={14} className="text-white" />}
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={option.checked}
                  onChange={() => onToggle(option)}
                />
                <span className="min-w-0 flex-1 truncate font-body text-[16px] leading-[24px] text-[#1a1a1a]">
                  {option.value}
                </span>
              </span>
              <span className="flex w-full items-center">
                <span aria-hidden className="w-8 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-body text-[14px] leading-[22px] text-[#666666]">
                  {option.kind}
                </span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>,
    document.body,
  );
}
