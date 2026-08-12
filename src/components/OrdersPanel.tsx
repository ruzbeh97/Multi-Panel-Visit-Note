import { useState } from "react";
import Icon from "./Icon";
import PdfViewer from "./pdf/PdfViewer";
import { pastOrderDocKey } from "./pdf/AttachmentDocument";
import { PAST_ORDERS } from "../data/chart";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#ffad33]",
};

function OrderRow({ order }: { order: (typeof PAST_ORDERS)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col px-2 py-2">
      <div className="flex h-7 w-full items-center gap-2">
        <Icon name={order.icon} size={16} className={`shrink-0 ${ICON_TONES[order.tone]}`} />
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

      <div className="flex h-7 items-center">
        <span className="flex items-center gap-1 rounded-full bg-[rgba(79,176,115,0.12)] py-[5px] pl-2 pr-[14px] font-body text-[12px] font-medium leading-[18px] text-[#0f0f0f]">
          <Icon name="check" size={16} className="text-[#4fb073]" />
          {order.status}
        </span>
      </div>

      <p className="w-full pr-3 pt-1 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
        {order.orderSet} - Created on {order.created} | {order.recipient}
      </p>

      {open && <PdfViewer fileName={pastOrderDocKey(order)} />}
    </div>
  );
}

export default function OrdersPanel() {
  return (
    <aside className="scrollbar-thin sticky top-0 ml-4 flex h-full w-[484px] shrink-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Past Orders</h2>

      <div className="flex w-full flex-col gap-2 pb-10 pt-4">
        {PAST_ORDERS.map((order) => (
          <OrderRow key={order.title} order={order} />
        ))}
      </div>
    </aside>
  );
}
