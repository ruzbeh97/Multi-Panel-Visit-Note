import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import OrderDetailsForm from "./notes/OrderDetailsForm";
import OrderPickerModal, {
  type OrderDetailField,
  type PickedOrder,
} from "./notes/OrderPickerModal";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#c47a3a]",
  green: "text-[#2e7d32]",
};

function deliveryStatus(order: PickedOrder) {
  return order.sent || order.status === "Sent" ? "Sent" : "Draft";
}

function statusClass(status: string) {
  return status === "Sent"
    ? "bg-[#e6f4ea] text-[#137333]"
    : "bg-[rgba(17,50,238,0.08)] text-[#1132ee]";
}

function DrawerOrderRow({
  order,
  orders,
  onChange,
  onRemove,
}: {
  order: PickedOrder;
  orders: PickedOrder[];
  onChange: (update: (order: PickedOrder) => PickedOrder) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const delivery = deliveryStatus(order);

  return (
    <div className="flex w-full items-start gap-2 border-b border-[#ececec] py-3 last:border-b-0">
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon name={order.icon} size={20} className={ICON_TONES[order.tone]} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex w-full items-start gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
          >
            <span className="truncate font-body text-[14px] font-bold leading-5 text-[#1a1a1a]">
              {order.title}
            </span>
            <Icon
              name={open ? "keyboard_arrow_down" : "chevron_right"}
              size={18}
              className="shrink-0 text-[#303030]"
            />
          </button>
          <div className="flex shrink-0 items-center gap-2">
            {order.requiresAuthorization && order.status !== "Draft" && order.status !== "Sent" ? (
              <span className="whitespace-nowrap rounded-md bg-[#ececec] px-2 py-0.5 font-body text-[12px] font-medium leading-4.5 text-[#5f5f5f]">
                {order.status}
              </span>
            ) : null}
            <span
              className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-4.5 ${statusClass(delivery)}`}
            >
              {delivery}
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
              aria-label={`Remove ${order.title}`}
            >
              <Icon name="close" size={18} className="text-[#1a1a1a]" />
            </button>
          </div>
        </div>
        <p className="font-body text-[13px] leading-4.5 text-[#666666]">{order.meta}</p>
        {open ? (
          <div className="w-full">
            <OrderDetailsForm
              order={order}
              relatedOrders={orders.filter((entry) => entry.id !== order.id)}
              onRequestAuthorization={() =>
                onChange((entry) => ({
                  ...entry,
                  status: entry.requiresAuthorization ? "Needs Authorization" : entry.status,
                }))
              }
              onSendToRecipient={() => onChange((entry) => ({ ...entry, sent: true }))}
              onRequiresAuthorizationChange={(value) =>
                onChange((entry) => ({
                  ...entry,
                  requiresAuthorization: value,
                  status: value ? entry.status : "Draft",
                  associatedOrderIds: value ? entry.associatedOrderIds : [],
                }))
              }
              onAssociateOrder={(associatedOrderIds) =>
                onChange((entry) => ({ ...entry, associatedOrderIds }))
              }
              onAssignedToChange={(assignedTo) =>
                onChange((entry) => ({ ...entry, assignedTo }))
              }
              onInsuranceChange={(insurance) =>
                onChange((entry) => ({ ...entry, insurance }))
              }
              onAuthDetailsChange={(patch) =>
                onChange((entry) => ({ ...entry, ...patch }))
              }
              onFieldsChange={(fields: {
                cptCode: string;
                cptUnits: string;
                authDetailFields: OrderDetailField[];
              }) =>
                onChange((entry) => {
                  if (
                    entry.cptCode === fields.cptCode &&
                    entry.cptUnits === fields.cptUnits &&
                    JSON.stringify(entry.authDetailFields ?? []) ===
                      JSON.stringify(fields.authDetailFields)
                  ) {
                    return entry;
                  }
                  return { ...entry, ...fields };
                })
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function OrderSetDrawer({ onClose }: { onClose: () => void }) {
  const [appointment, setAppointment] = useState("08/10/2026 11:50 AM");
  const [orders, setOrders] = useState<PickedOrder[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const addOrderRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pickerOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, pickerOpen]);

  const updateOrder = (
    orderId: string,
    update: (order: PickedOrder) => PickedOrder,
  ) => {
    setOrders((current) =>
      current.map((entry) => (entry.id === orderId ? update(entry) : entry)),
    );
  };

  return (
    <div className="fixed inset-0 z-80 flex justify-end">
      <button
        type="button"
        aria-label="Close order set"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-[min(1000px,100vw)] flex-col bg-[#f7f7f7] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dedede] bg-white px-7">
          <h2 className="font-body text-[20px] font-medium text-[#1a1a1a]">Order Set</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full border border-[#e1e1e1] text-[#666666] hover:bg-[#f5f5f5]"
          >
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-7 py-7">
          <label className="block">
            <span className="mb-3 block font-body text-[16px] font-medium text-[#303030]">
              Associated Appointment
            </span>
            <span className="relative block">
              <select
                value={appointment}
                onChange={(event) => setAppointment(event.target.value)}
                className="h-11 w-full appearance-none rounded-md border border-[#dedede] bg-white px-4 pr-10 font-body text-[15px] text-[#303030] outline-none focus:border-[#1132ee]"
              >
                <option>08/10/2026 11:50 AM</option>
                <option>07/27/2026 10:15 AM</option>
                <option>06/17/2026 11:00 AM</option>
              </select>
              <Icon
                name="arrow_drop_down"
                size={20}
                className="pointer-events-none absolute right-3 top-3 text-[#777777]"
              />
            </span>
          </label>

          <div className="mt-7 flex items-center justify-end gap-8">
            <button
              ref={addOrderRef}
              type="button"
              onClick={() => setPickerOpen(true)}
              className="font-body text-[14px] font-medium text-[#1132ee] hover:underline"
            >
              Add Order
            </button>
            <button
              type="button"
              disabled
              className="font-body text-[14px] font-medium text-[#c4c4c4]"
            >
              Download Submitted Orders
            </button>
            <button
              type="button"
              disabled={orders.length === 0}
              onClick={() =>
                setOrders((current) =>
                  current.map((entry) => ({
                    ...entry,
                    sent: true,
                    status: entry.requiresAuthorization
                      ? entry.status === "Draft"
                        ? "Needs Authorization"
                        : entry.status
                      : "Sent",
                  })),
                )
              }
              className="font-body text-[14px] font-medium text-[#1132ee] hover:underline disabled:text-[#c4c4c4] disabled:no-underline"
            >
              Submit All
            </button>
          </div>

          <div className="mt-3 flex w-full flex-col">
            {orders.length === 0 ? (
              <p className="py-14 text-center font-body text-[14px] text-[#8a8a8a]">
                Add an order or order set to begin.
              </p>
            ) : (
              orders.map((order) => (
                <DrawerOrderRow
                  key={order.id}
                  order={order}
                  orders={orders}
                  onChange={(update) => updateOrder(order.id, update)}
                  onRemove={() =>
                    setOrders((current) =>
                      current.filter((entry) => entry.id !== order.id),
                    )
                  }
                />
              ))
            )}
          </div>
        </div>

        {pickerOpen ? (
          <OrderPickerModal
            anchorRef={addOrderRef}
            onClose={() => setPickerOpen(false)}
            onSelect={(selected) =>
              setOrders((current) => [...current, ...selected])
            }
          />
        ) : null}
      </aside>
    </div>
  );
}
