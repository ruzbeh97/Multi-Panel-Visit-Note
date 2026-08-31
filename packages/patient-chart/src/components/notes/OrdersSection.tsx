import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";
import Section from "./Section";
import { useNoteReadOnly } from "./readOnly";
import { NOTE_ORDERS } from "../../data/chart";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#ffad33]",
};

const CARRY_DISABLED_MESSAGE =
  "Can't carry forward — the current note has no Orders section to import into.";

type NoteOrder = (typeof NOTE_ORDERS)[number];

const TOOLTIP_WIDTH = 240;
const TOOLTIP_MARGIN = 8;

function CarryDisabledTooltip({
  label,
  top,
  left,
  arrowLeft,
}: {
  label: string;
  top: number;
  left: number;
  arrowLeft: number;
}) {
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 flex flex-col items-start"
      style={{ top, left, width: TOOLTIP_WIDTH }}
    >
      <span
        aria-hidden
        className="h-0 w-0 border-x-[5px] border-x-transparent border-b-[6px] border-b-[#292929]"
        style={{ marginLeft: arrowLeft - 5 }}
      />
      <span className="w-full rounded-md bg-[#292929] px-2.5 py-1.5 font-body text-[12px] font-medium leading-[16px] text-white shadow-[0px_4px_12px_rgba(0,0,0,0.18)]">
        {label}
      </span>
    </div>,
    document.body,
  );
}

function DisabledCarryForwardButton() {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; arrowLeft: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!hovered || !wrapperRef.current) {
      setPosition(null);
      return;
    }

    function update() {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const anchorCenter = rect.left + rect.width / 2;
      // Keep the card inside the viewport, then point the arrow back at the icon.
      const maxLeft = Math.max(window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_MARGIN, TOOLTIP_MARGIN);
      const left = Math.min(Math.max(anchorCenter - TOOLTIP_WIDTH / 2, TOOLTIP_MARGIN), maxLeft);

      setPosition({
        top: rect.bottom + 6,
        left,
        arrowLeft: Math.min(Math.max(anchorCenter - left, 12), TOOLTIP_WIDTH - 12),
      });
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [hovered]);

  return (
    <span
      ref={wrapperRef}
      className="flex shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-disabled="true"
        aria-label={CARRY_DISABLED_MESSAGE}
        onClick={(event) => event.preventDefault()}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="flex cursor-not-allowed items-start rounded-full p-1"
      >
        <Icon name="move_up" size={20} className="text-[#c1c1cd]" />
      </button>
      {hovered && position && (
        <CarryDisabledTooltip
          label={CARRY_DISABLED_MESSAGE}
          top={position.top}
          left={position.left}
          arrowLeft={position.arrowLeft}
        />
      )}
    </span>
  );
}

function OrderRow({
  order,
  readOnly,
  onRemove,
}: {
  order: NoteOrder;
  readOnly: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex w-full items-start gap-2 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon name={order.icon} size={20} className={ICON_TONES[order.tone]} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <div className="flex w-full items-start gap-2">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-0.5 text-left"
            aria-label={`Open ${order.title}`}
          >
            <span className="min-w-0 truncate font-body text-[14px] font-bold leading-[20px] text-[#1a1a1a]">
              {order.title}
            </span>
            <Icon name="chevron_right" size={18} className="shrink-0 text-[#1a1a1a]" />
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-md bg-[rgba(17,50,238,0.08)] px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#1132ee]">
              {order.status}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={onRemove}
                className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
                aria-label={`Remove ${order.title}`}
              >
                <Icon name="close" size={18} className="text-[#1a1a1a]" />
              </button>
            )}
          </div>
        </div>

        <p className="w-full font-body text-[13px] leading-[18px] text-[#666666]">{order.meta}</p>
      </div>
    </div>
  );
}

export default function OrdersSection() {
  const readOnly = useNoteReadOnly();
  const [orders, setOrders] = useState(NOTE_ORDERS);

  return (
    <Section title="Orders">
      <div className="flex w-full flex-col items-start gap-2">
        <div className="flex w-full items-center justify-between gap-3">
          <h2 className="font-body text-[24px] font-bold leading-none text-black">Orders</h2>
          {readOnly ? (
            <DisabledCarryForwardButton />
          ) : (
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                className="font-body text-[14px] font-medium leading-[20px] text-[#1132ee] hover:underline"
              >
                Add Order
              </button>
              <button
                type="button"
                className="font-body text-[14px] font-medium leading-[20px] text-[#1132ee] hover:underline"
              >
                Submit All
              </button>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-start">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              readOnly={readOnly}
              onRemove={() => setOrders((current) => current.filter((entry) => entry.id !== order.id))}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
