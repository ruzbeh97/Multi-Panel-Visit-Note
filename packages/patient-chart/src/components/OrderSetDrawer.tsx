import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import OrderDetailsForm from "./notes/OrderDetailsForm";
import OrderPickerModal, {
  type OrderDetailField,
  type PickedOrder,
} from "./notes/OrderPickerModal";
import {
  linkedOrderIds,
  orderStatusChipClass,
  publishAuthorizations,
  withAuthGroupNumbers,
  withLinkedAssignee,
  withLinkedAuthDetails,
  withLinkedAuthorization,
  withLinkedInsurance,
  withRequestedAuthorization,
  withSentToRecipient,
} from "./notes/orderAuthorization";
import {
  AUTH_VERSION_HINTS,
  AuthBundleBoard,
  AuthSelectionList,
  AuthVersionSwitch,
  createOrderAuthHandlers,
  useAuthUxVersion,
} from "./notes/OrderAuthVariants";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#c47a3a]",
  green: "text-[#2e7d32]",
};

function deliveryStatus(order: PickedOrder) {
  return order.sent || order.status === "Sent" ? "Sent" : "Draft";
}

function DrawerOrderRow({
  order,
  orders,
  onOrdersChange,
  onFieldsChange,
  onRemove,
}: {
  order: PickedOrder;
  orders: PickedOrder[];
  onOrdersChange: (update: (orders: PickedOrder[]) => PickedOrder[]) => void;
  onFieldsChange: (fields: {
    cptCode: string;
    cptUnits: string;
    authDetailFields: OrderDetailField[];
  }) => void;
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
            {order.requiresAuthorization && (
              <span
                className="flex size-6 items-center justify-center rounded-full bg-[#ececec] font-body text-[12px] font-medium text-[#5f5f5f]"
                title={
                  order.authGroupNumber
                    ? `Authorization group ${order.authGroupNumber}`
                    : "Requires authorization"
                }
                aria-label={
                  order.authGroupNumber
                    ? `Authorization group ${order.authGroupNumber}`
                    : "Requires authorization"
                }
              >
                {order.authGroupNumber ? (
                  order.authGroupNumber
                ) : (
                  <Icon name="assignment" size={16} className="text-[#5f5f5f]" />
                )}
              </span>
            )}
            {order.requiresAuthorization &&
            order.status !== "Draft" &&
            order.status !== "Sent" ? (
              <span
                className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-4.5 ${orderStatusChipClass(order.status)}`}
              >
                {order.status === "Needs Auth" ? "Needs Authorization" : order.status}
              </span>
            ) : null}
            <span
              className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-4.5 ${orderStatusChipClass(delivery)}`}
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
                onOrdersChange((current) => {
                  const next = withRequestedAuthorization(
                    current,
                    linkedOrderIds(current, order.id),
                  );
                  publishAuthorizations(next);
                  return next;
                })
              }
              onSendToRecipient={() =>
                onOrdersChange((current) => withSentToRecipient(current, [order.id]))
              }
              onRequiresAuthorizationChange={(value) =>
                onOrdersChange((current) =>
                  withLinkedAuthorization(current, order.id, { requiresAuthorization: value }),
                )
              }
              onAssociateOrder={(associatedOrderIds) =>
                onOrdersChange((current) =>
                  withLinkedAuthorization(current, order.id, { associatedOrderIds }),
                )
              }
              onAssignedToChange={(assignee) =>
                onOrdersChange((current) => {
                  const next = withLinkedAssignee(current, order.id, assignee || "Unassigned");
                  if (next.some((entry) => entry.status !== "Draft")) publishAuthorizations(next);
                  return next;
                })
              }
              onInsuranceChange={(insurance) =>
                onOrdersChange((current) => {
                  const next = withLinkedInsurance(current, order.id, insurance);
                  if (next.some((entry) => entry.status !== "Draft")) publishAuthorizations(next);
                  return next;
                })
              }
              onAuthDetailsChange={(patch) =>
                onOrdersChange((current) => {
                  const next = withLinkedAuthDetails(current, order.id, patch);
                  if (next.some((entry) => entry.status !== "Draft")) publishAuthorizations(next);
                  return next;
                })
              }
              onFieldsChange={onFieldsChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function OrderSetDrawer({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (orders: PickedOrder[], appointment: string) => void;
}) {
  const [appointment, setAppointment] = useState("08/10/2026 11:50 AM");
  const [orders, setOrdersState] = useState<PickedOrder[]>([]);
  const [authVersion, setAuthVersion] = useAuthUxVersion();
  const [pickerOpen, setPickerOpen] = useState(false);
  const addOrderRef = useRef<HTMLButtonElement>(null);

  // Closing hands the orders to the Orders page, so drafts land in their tables.
  const saveRef = useRef<() => void>(() => {});
  saveRef.current = () => {
    if (orders.length > 0) onSave?.(orders, appointment);
    onClose();
  };
  const closeDrawer = () => saveRef.current();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pickerOpen) saveRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pickerOpen]);

  // Authorization groups renumber on every change, exactly as they do in the note.
  const setOrders = (update: (orders: PickedOrder[]) => PickedOrder[]) => {
    setOrdersState((current) => withAuthGroupNumbers(update(current)));
  };

  const authHandlers = createOrderAuthHandlers(setOrders);

  return (
    <div className="fixed inset-0 z-80 flex justify-end">
      <button
        type="button"
        aria-label="Close order set"
        className="absolute inset-0 bg-black/20"
        onClick={closeDrawer}
      />
      <aside className="relative flex h-full w-[min(1000px,100vw)] flex-col bg-[#f7f7f7] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dedede] bg-white px-7">
          <h2 className="font-body text-[20px] font-medium text-[#1a1a1a]">Order Set</h2>
          <button
            type="button"
            onClick={closeDrawer}
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

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <AuthVersionSwitch value={authVersion} onChange={setAuthVersion} />
            <div className="flex items-center gap-8">
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
                setOrders((current) => {
                  const ids = current.map((entry) => entry.id);
                  const next = withSentToRecipient(
                    withRequestedAuthorization(current, ids),
                    ids,
                  );
                  publishAuthorizations(next);
                  return next;
                })
              }
              className="font-body text-[14px] font-medium text-[#1132ee] hover:underline disabled:text-[#c4c4c4] disabled:no-underline"
            >
              Submit All
            </button>
            </div>
          </div>

          {authVersion === "V1" ? null : (
            <p className="mt-3 w-full font-body text-[13px] leading-[18px] text-[#8a8a8a]">
              {AUTH_VERSION_HINTS[authVersion]}
            </p>
          )}

          <div className="mt-3 flex w-full flex-col">
            {orders.length === 0 ? (
              <p className="py-14 text-center font-body text-[14px] text-[#8a8a8a]">
                Add an order or order set to begin.
              </p>
            ) : authVersion === "V2" ? (
              <AuthSelectionList orders={orders} handlers={authHandlers} />
            ) : authVersion === "V3" ? (
              <AuthBundleBoard orders={orders} handlers={authHandlers} />
            ) : (
              orders.map((order) => (
                <DrawerOrderRow
                  key={order.id}
                  order={order}
                  orders={orders}
                  onOrdersChange={setOrders}
                  onFieldsChange={(fields) =>
                    setOrders((current) => {
                      const entry = current.find((candidate) => candidate.id === order.id);
                      if (
                        !entry ||
                        (entry.cptCode === fields.cptCode &&
                          entry.cptUnits === fields.cptUnits &&
                          JSON.stringify(entry.authDetailFields ?? []) ===
                            JSON.stringify(fields.authDetailFields))
                      ) {
                        // Same array identity keeps the form's sync effect from looping.
                        return current;
                      }
                      return current.map((candidate) =>
                        candidate.id === order.id ? { ...candidate, ...fields } : candidate,
                      );
                    })
                  }
                  onRemove={() =>
                    setOrders((current) => current.filter((entry) => entry.id !== order.id))
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
            onSelect={(selected) => setOrders((current) => [...current, ...selected])}
          />
        ) : null}
      </aside>
    </div>
  );
}
