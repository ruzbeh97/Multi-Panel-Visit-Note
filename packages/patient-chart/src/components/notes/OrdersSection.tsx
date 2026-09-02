import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";
import Section from "./Section";
import { useNoteReadOnly } from "./readOnly";
import OrderPickerModal, { type PickedOrder } from "./OrderPickerModal";
import OrderDetailsForm from "./OrderDetailsForm";
import { PATIENT, PROVIDER } from "../../data/chart";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#c47a3a]",
  green: "text-[#2e7d32]",
};

const CARRY_DISABLED_MESSAGE =
  "Can't carry forward — the current note has no Orders section to import into.";

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export const ORDER_AUTHORIZATIONS_EVENT = "patient-chart:order-authorizations";

const ORDERS_STORAGE_KEY = "patient-chart:note-orders";

// The prototype has no backend, so the working note survives a refresh via localStorage.
function loadStoredOrders(): PickedOrder[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as PickedOrder[]) : [];
  } catch {
    return [];
  }
}

function storeOrders(orders: PickedOrder[]) {
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Storage can be unavailable in private browsing; the note still works in memory.
  }
}

type OrderAuthorizationGroup = {
  id: string;
  patient: {
    name: string;
    dob: string;
    mrn: string;
    insurance: string;
  };
  provider: string;
  orders: Array<{
    id: string;
    title: string;
    code: string;
    trackingType: "Units";
    units: string;
  }>;
};

function authorizationGroups(orders: PickedOrder[]): OrderAuthorizationGroup[] {
  const eligible = orders.filter((order) => order.requiresAuthorization);
  const byId = new Map(eligible.map((order) => [order.id, order]));
  const visited = new Set<string>();
  const groups: OrderAuthorizationGroup[] = [];

  for (const order of eligible) {
    if (visited.has(order.id)) continue;

    const component: PickedOrder[] = [];
    const queue = [order.id];
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id || visited.has(id)) continue;
      const current = byId.get(id);
      if (!current) continue;
      visited.add(id);
      component.push(current);

      for (const linkedId of current.associatedOrderIds ?? []) {
        if (byId.has(linkedId) && !visited.has(linkedId)) queue.push(linkedId);
      }
      for (const candidate of eligible) {
        if ((candidate.associatedOrderIds ?? []).includes(id) && !visited.has(candidate.id)) {
          queue.push(candidate.id);
        }
      }
    }

    const ids = component.map((entry) => entry.id).sort();
    groups.push({
      id: ids.join("--"),
      patient: {
        name: PATIENT.name,
        dob: PATIENT.dob,
        mrn: PATIENT.mrn,
        insurance: PATIENT.insurance,
      },
      provider: PROVIDER.display,
      orders: component.map((entry) => ({
        id: entry.id,
        title: entry.title,
        code: entry.cptCode || entry.code || "",
        trackingType: "Units",
        units: entry.cptUnits ?? (entry.code === "J1010" ? "40" : ""),
      })),
    });
  }

  return groups;
}

// A group keeps the number it was first given, so later authorizations become 2, 3, and so on
// even when earlier groups grow, shrink, or get removed. A standalone order that requires
// authorization counts as its own group.
function withAuthGroupNumbers(orders: PickedOrder[]): PickedOrder[] {
  const assigned = new Map<string, number>();
  let highest = orders.reduce((max, entry) => Math.max(max, entry.authGroupNumber ?? 0), 0);

  for (const group of authorizationGroups(orders)) {
    const existing = group.orders
      .map((entry) => orders.find((candidate) => candidate.id === entry.id)?.authGroupNumber)
      .filter((value): value is number => typeof value === "number");
    const number = existing.length > 0 ? Math.min(...existing) : (highest += 1);
    for (const entry of group.orders) assigned.set(entry.id, number);
  }

  if (assigned.size === 0) return orders;
  return orders.map((entry) => {
    const number = assigned.get(entry.id);
    return number && number !== entry.authGroupNumber ? { ...entry, authGroupNumber: number } : entry;
  });
}

function linkedOrderIds(orders: PickedOrder[], sourceId: string) {
  const source = orders.find((entry) => entry.id === sourceId);
  const ids = new Set<string>([sourceId, ...(source?.associatedOrderIds ?? [])]);
  for (const entry of orders) {
    if ((entry.associatedOrderIds ?? []).includes(sourceId)) ids.add(entry.id);
  }
  return [...ids];
}

function withSubmittedStatus(orders: PickedOrder[], ids: string[]) {
  const submit = new Set(ids);
  return orders.map((entry) => {
    if (!submit.has(entry.id)) return entry;
    return { ...entry, status: entry.requiresAuthorization ? "Needs Auth" : "Sent" };
  });
}

function publishAuthorizations(orders: PickedOrder[]) {
  const submitted = orders.filter((order) => order.status === "Needs Auth" || order.status === "Sent");
  window.dispatchEvent(
    new CustomEvent(ORDER_AUTHORIZATIONS_EVENT, {
      detail: { source: "visit-note", groups: authorizationGroups(submitted) },
    }),
  );
}

function withLinkedAuthorization(
  orders: PickedOrder[],
  sourceId: string,
  patch: Partial<Pick<PickedOrder, "requiresAuthorization" | "associatedOrderIds">>,
): PickedOrder[] {
  const selectedPartnerIds = patch.associatedOrderIds;
  const next = orders.map((entry) => {
    if (entry.id === sourceId) return { ...entry, ...patch };
    if (!selectedPartnerIds) return entry;

    const withoutSource = (entry.associatedOrderIds ?? []).filter((id) => id !== sourceId);
    return {
      ...entry,
      associatedOrderIds: selectedPartnerIds.includes(entry.id)
        ? uniqueIds([...withoutSource, sourceId])
        : withoutSource,
    };
  });
  const source = next.find((entry) => entry.id === sourceId);
  if (!source) return next;

  const partnerIds = source.associatedOrderIds ?? [];
  const linkedIds = new Set<string>([sourceId, ...partnerIds]);
  for (const entry of next) {
    if ((entry.associatedOrderIds ?? []).includes(sourceId)) linkedIds.add(entry.id);
  }

  const anyRequiresAuth = [...linkedIds].some(
    (id) => next.find((entry) => entry.id === id)?.requiresAuthorization,
  );

  if (!anyRequiresAuth) return next;

  return next.map((entry) => {
    if (!linkedIds.has(entry.id)) return entry;
    const updated = entry.requiresAuthorization ? entry : { ...entry, requiresAuthorization: true };
    return updated;
  });
}

type NoteOrder = PickedOrder;

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
  relatedOrders,
  readOnly,
  authGroupNumber,
  onRemove,
  onComplete,
  onRequiresAuthorizationChange,
  onAssociateOrder,
  onFieldsChange,
}: {
  order: NoteOrder;
  relatedOrders: NoteOrder[];
  readOnly: boolean;
  authGroupNumber?: number;
  onRemove: () => void;
  onComplete: () => void;
  onRequiresAuthorizationChange: (value: boolean) => void;
  onAssociateOrder: (orderIds: string[]) => void;
  onFieldsChange: (fields: { cptCode: string; cptUnits: string }) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full items-start gap-2 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon name={order.icon} size={20} className={ICON_TONES[order.tone]} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <div className="flex w-full items-start gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-0.5 text-left"
            aria-label={`${open ? "Collapse" : "Expand"} ${order.title}`}
          >
            <span
              className={`min-w-0 font-body text-[14px] font-bold leading-[20px] text-[#1a1a1a] ${
                open ? "" : "truncate"
              }`}
            >
              {order.title}
            </span>
            {open ? (
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#ececec]">
                <Icon name="keyboard_arrow_down" size={16} className="text-[#1a1a1a]" />
              </span>
            ) : (
              <Icon name="chevron_right" size={18} className="shrink-0 text-[#1a1a1a]" />
            )}
          </button>

          <div className="flex shrink-0 items-center gap-2">
            {order.requiresAuthorization && (
              <span
                className="flex size-6 items-center justify-center rounded-full bg-[rgba(17,50,238,0.08)] font-body text-[12px] font-medium text-[#1132ee]"
                title={authGroupNumber ? `Authorization group ${authGroupNumber}` : "Requires authorization"}
                aria-label={authGroupNumber ? `Authorization group ${authGroupNumber}` : "Requires authorization"}
              >
                {authGroupNumber ? authGroupNumber : <Icon name="assignment" size={16} className="text-[#1132ee]" />}
              </span>
            )}
            <span
              className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] ${
                order.status === "Sent"
                  ? "bg-[#e6f4ea] text-[#137333]"
                  : order.status === "Needs Auth"
                    ? "bg-[#ececec] text-[#5f5f5f]"
                    : "bg-[rgba(17,50,238,0.08)] text-[#1132ee]"
              }`}
            >
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
        <div className={open ? "w-full" : "hidden"}>
          <OrderDetailsForm
            order={order}
            relatedOrders={relatedOrders}
            onComplete={onComplete}
            onRequiresAuthorizationChange={onRequiresAuthorizationChange}
            onAssociateOrder={onAssociateOrder}
            onFieldsChange={onFieldsChange}
          />
        </div>
      </div>
    </div>
  );
}

export default function OrdersSection() {
  const readOnly = useNoteReadOnly();
  // Past notes render their own read-only copy, so only the editable note restores drafts.
  const [orders, setOrdersState] = useState<PickedOrder[]>(() =>
    readOnly ? [] : withAuthGroupNumbers(loadStoredOrders()),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const addOrderRef = useRef<HTMLButtonElement>(null);

  const setOrders: typeof setOrdersState = (update) => {
    setOrdersState((current) => {
      const updated =
        typeof update === "function" ? (update as (value: PickedOrder[]) => PickedOrder[])(current) : update;
      const next = withAuthGroupNumbers(updated);
      if (!readOnly && next !== current) storeOrders(next);
      return next;
    });
  };


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
                ref={addOrderRef}
                type="button"
                onClick={() => setPickerOpen(true)}
                className="font-body text-[14px] font-medium leading-[20px] text-[#1132ee] hover:underline"
              >
                Add Order
              </button>
              <button
                type="button"
                onClick={() =>
                  setOrders((current) => {
                    const next = withSubmittedStatus(
                      current,
                      current.map((entry) => entry.id),
                    );
                    publishAuthorizations(next);
                    return next;
                  })
                }
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
              relatedOrders={orders.filter((entry) => entry.id !== order.id)}
              readOnly={readOnly}
              authGroupNumber={order.authGroupNumber}
              onRemove={() => setOrders((current) => current.filter((entry) => entry.id !== order.id))}
              onComplete={() =>
                setOrders((current) => {
                  const next = withSubmittedStatus(current, linkedOrderIds(current, order.id));
                  publishAuthorizations(next);
                  return next;
                })
              }
              onRequiresAuthorizationChange={(value) =>
                setOrders((current) => withLinkedAuthorization(current, order.id, { requiresAuthorization: value }))
              }
              onAssociateOrder={(orderIds) =>
                setOrders((current) =>
                  withLinkedAuthorization(current, order.id, {
                    associatedOrderIds: orderIds,
                  }),
                )
              }
              onFieldsChange={(fields) =>
                setOrders((current) => {
                  const entry = current.find((candidate) => candidate.id === order.id);
                  if (
                    !entry ||
                    (entry.cptCode === fields.cptCode && entry.cptUnits === fields.cptUnits)
                  ) {
                    // Same array identity keeps the form's sync effect from looping.
                    return current;
                  }
                  return current.map((candidate) =>
                    candidate.id === order.id ? { ...candidate, ...fields } : candidate,
                  );
                })
              }
            />
          ))}
        </div>
      </div>
      {pickerOpen && (
        <OrderPickerModal
          anchorRef={addOrderRef}
          onClose={() => setPickerOpen(false)}
          onSelect={(selected) => setOrders((current) => [...current, ...selected])}
        />
      )}
    </Section>
  );
}
