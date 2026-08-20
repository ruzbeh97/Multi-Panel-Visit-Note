import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import { PanelTitle, StickyPanelHeader } from "./chartPanelUi";
import PdfViewer from "./pdf/PdfViewer";
import { pastOrderDocKey } from "./pdf/AttachmentDocument";
import {
  ORDER_CATEGORIES,
  ORDER_CATEGORY_LABELS,
  PAST_ORDERS,
  type OrderCategory,
} from "../data/chart";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#ffad33]",
};

type PastOrder = (typeof PAST_ORDERS)[number];

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

function OrderRow({ order }: { order: PastOrder }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full items-stretch gap-[10px]">
      <span aria-hidden className="my-1 w-[2px] shrink-0 bg-[#1132ee]" />
      <div className="flex min-w-0 flex-1 flex-col border-b border-[#e6e6e6] py-4">
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name={order.icon} size={20} className={ICON_TONES[order.tone]} />
          </span>
          <p className="min-w-0 flex-1 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {order.title}
          </p>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
              open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
            aria-label={`${open ? "Hide" : "Open"} the ${order.title} order as a PDF`}
          >
            <Icon name="picture_as_pdf" size={20} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
          </button>
        </div>

        <p className="w-full pt-2 font-body text-[14px] leading-[22px] text-[#666666]">
          {order.orderSet} - Created on {order.created} | {order.recipient}
        </p>

        <div className="flex items-center pt-2">
          <span className="flex items-center gap-1 rounded-full bg-[rgba(79,176,115,0.12)] py-[5px] pl-2 pr-[14px] font-body text-[12px] font-medium leading-[18px] text-[#0f0f0f]">
            <Icon name="check" size={16} className="text-[#4fb073]" />
            {order.status}
          </span>
        </div>

        {open && <PdfViewer fileName={pastOrderDocKey(order)} />}
      </div>
    </div>
  );
}

export default function OrdersPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [closedCategories, setClosedCategories] = useState<OrderCategory[]>([]);

  const search = query.trim().toLowerCase();
  const orders = PAST_ORDERS.filter((order) =>
    search
      ? [order.title, order.orderSet, order.created, order.recipient, order.status].some((field) =>
          field.toLowerCase().includes(search),
        )
      : true,
  );

  const groups = ORDER_CATEGORIES.map((category) => ({
    category,
    orders: orders.filter((order) => order.category === category),
  })).filter((group) => group.orders.length > 0);

  function toggleCategory(category: OrderCategory) {
    setClosedCategories((prev) =>
      prev.includes(category) ? prev.filter((entry) => entry !== category) : [...prev, category],
    );
  }

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white">
      <StickyPanelHeader>
        <PanelTitle title="Orders" onClose={onClose} />
        <div className="flex w-full items-center gap-1.5 pt-4">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
            <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search orders"
              className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
                aria-label="Clear order search"
              >
                <Icon name="close" size={16} className="text-[#666666]" />
              </button>
            )}
          </label>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="Filter orders"
          >
            <Icon name="filter_alt" size={20} className="text-[#1a1a1a]" />
          </button>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 pb-3 pt-2">
          {ORDER_CATEGORIES.map((category) => (
            <span key={category} className="font-body text-[14px] leading-[22px] text-[#666666]">
              {PAST_ORDERS.filter((order) => order.category === category).length} {category}
            </span>
          ))}
        </div>
      </StickyPanelHeader>

      <div className="flex w-full flex-col items-start px-4 pb-10">
        {groups.map((group) => (
          <RailGroup
            key={group.category}
            label={ORDER_CATEGORY_LABELS[group.category]}
            count={group.orders.length}
            open={!closedCategories.includes(group.category)}
            onToggle={() => toggleCategory(group.category)}
          >
            {group.orders.map((order) => (
              <OrderRow key={`${order.title}-${order.created}`} order={order} />
            ))}
          </RailGroup>
        ))}

        {groups.length === 0 && (
          <p className="w-full py-4 font-body text-[14px] leading-[22px] text-[#666666]">No orders to show.</p>
        )}
      </div>
    </aside>
  );
}
