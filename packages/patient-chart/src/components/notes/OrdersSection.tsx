import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";
import Section from "./Section";
import { useNoteReadOnly } from "./readOnly";
import OrderPickerModal, { type OrderDetailField, type OrderKind, type PickedOrder } from "./OrderPickerModal";
import OrderDetailsForm from "./OrderDetailsForm";
import { CURRENT_VISIT_NOTE_ID, VISIT_NOTE_ORDERS } from "../../data/chart";
import { useNoteStore, usePastNoteSource } from "./noteStore";
import { useOptionalSnippetEffects } from "./snippets/SnippetEffectsContext";
import {
  ORDER_AUTH_STATE_EVENT,
  type AuthDetailPatch,
  linkedOrderIds,
  loadStoredOrders,
  orderStatusChipClass,
  publishAuthorizations,
  storeOrders,
  withAuthGroupNumbers,
  withLinkedAssignee,
  withLinkedAuthDetails,
  withLinkedAuthorization,
  withLinkedInsurance,
  withRequestedAuthorization,
  withSentToRecipient,
  withTrackerAuthStates,
} from "./orderAuthorization";
import {
  AUTH_VERSION_HINTS,
  AuthBundleBoard,
  AuthSelectionList,
  AuthVersionSwitch,
  createOrderAuthHandlers,
  useAuthUxVersion,
  type AuthUxVersion,
} from "./OrderAuthVariants";

// The authorization model lives in its own module now; other components still reach it here.
export {
  ORDER_AUTHORIZATIONS_EVENT,
  ORDER_AUTH_STATE_EVENT,
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
} from "./orderAuthorization";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#c47a3a]",
  green: "text-[#2e7d32]",
};

const CARRY_DISABLED_MESSAGE =
  "Can't carry forward — the current note has no Orders section to import into.";

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
  onRequestAuthorization,
  onSendToRecipient,
  onRequiresAuthorizationChange,
  onAssociateOrder,
  onAssignedToChange,
  onInsuranceChange,
  onAuthDetailsChange,
  onFieldsChange,
}: {
  order: NoteOrder;
  relatedOrders: NoteOrder[];
  readOnly: boolean;
  authGroupNumber?: number;
  onRemove: () => void;
  onRequestAuthorization: () => void;
  onSendToRecipient: () => void;
  onRequiresAuthorizationChange: (value: boolean) => void;
  onAssociateOrder: (orderIds: string[]) => void;
  onAssignedToChange: (assignee: string) => void;
  onInsuranceChange: (insurance: string) => void;
  onAuthDetailsChange: (patch: AuthDetailPatch) => void;
  onFieldsChange: (fields: {
    cptCode: string;
    cptUnits: string;
    authDetailFields: OrderDetailField[];
  }) => void;
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
                className="flex size-6 items-center justify-center rounded-full bg-[#ececec] font-body text-[12px] font-medium text-[#5f5f5f]"
                title={authGroupNumber ? `Authorization group ${authGroupNumber}` : "Requires authorization"}
                aria-label={authGroupNumber ? `Authorization group ${authGroupNumber}` : "Requires authorization"}
              >
                {authGroupNumber ? authGroupNumber : <Icon name="assignment" size={16} className="text-[#5f5f5f]" />}
              </span>
            )}
            {order.requiresAuthorization &&
            order.status !== "Draft" &&
            order.status !== "Sent" ? (
              <span
                className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] ${orderStatusChipClass(order.status)}`}
              >
                {order.status === "Needs Auth" ? "Needs Authorization" : order.status}
              </span>
            ) : null}
            <span
              className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] ${
                order.sent || order.status === "Sent"
                  ? orderStatusChipClass("Sent")
                  : orderStatusChipClass("Draft")
              }`}
            >
              {order.sent || order.status === "Sent" ? "Sent" : "Draft"}
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
            onRequestAuthorization={onRequestAuthorization}
            onSendToRecipient={onSendToRecipient}
            onRequiresAuthorizationChange={onRequiresAuthorizationChange}
            onAssociateOrder={onAssociateOrder}
            onAssignedToChange={onAssignedToChange}
            onInsuranceChange={onInsuranceChange}
            onAuthDetailsChange={onAuthDetailsChange}
            onFieldsChange={onFieldsChange}
          />
        </div>
      </div>
    </div>
  );
}

// A signed note's orders, rebuilt from the encounter so the read-only view shows
// what that visit actually ordered.
function signedOrderKind(item: { icon: string; title: string }): OrderKind {
  if (item.icon === "radiology" || /MRI|x-?ray|radiograph/i.test(item.title)) return "Imaging";
  if (item.icon === "science" || /lab|cbc|panel|blood/i.test(item.title)) return "Lab";
  if (item.icon === "personal_injury" || /brace|crutches|immobilizer|orthosis|CPM/i.test(item.title)) return "DME";
  if (item.icon === "medication") return "Medication";
  return "Procedure";
}

function signedVisitOrders(noteId: string): PickedOrder[] {
  return (VISIT_NOTE_ORDERS[noteId] ?? []).map((item, index) => ({
    id: `${noteId}-order-${index}`,
    type: signedOrderKind(item),
    title: item.title,
    icon: item.icon,
    tone: item.tone,
    meta: `${item.detail} · ${item.orderSet} · ${item.date} ${item.time}`,
    createdAt: `${item.date} ${item.time}`,
    status: "Sent",
    requiresAuthorization: false,
    associatedOrderIds: [],
  }));
}

export default function OrdersSection() {
  const readOnly = useNoteReadOnly();
  const { visitId } = useNoteStore();
  const pastNoteId = usePastNoteSource();
  const snippetEffects = useOptionalSnippetEffects();
  // Past notes render their own read-only copy, so only the editable note restores drafts.
  const [orders, setOrdersState] = useState<PickedOrder[]>(() => {
    if (!readOnly) return withAuthGroupNumbers(withTrackerAuthStates(loadStoredOrders(visitId)));
    // Today's note is still being written, so read-only views of it mirror its live orders.
    if (!pastNoteId || pastNoteId === CURRENT_VISIT_NOTE_ID) {
      return withAuthGroupNumbers(withTrackerAuthStates(loadStoredOrders(visitId)));
    }
    return signedVisitOrders(pastNoteId);
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [authVersion, setAuthVersion] = useAuthUxVersion();
  const addOrderRef = useRef<HTMLButtonElement>(null);
  // Read-only copies of a note have no authorization controls, so they always draw V1.
  const version: AuthUxVersion = readOnly ? "V1" : authVersion;

  const setOrders: typeof setOrdersState = (update) => {
    setOrdersState((current) => {
      const updated =
        typeof update === "function" ? (update as (value: PickedOrder[]) => PickedOrder[])(current) : update;
      const next = withAuthGroupNumbers(updated);
      if (!readOnly && next !== current) storeOrders(visitId, next);
      return next;
    });
  };

  useEffect(() => {
    if (readOnly || !snippetEffects) return;
    snippetEffects.registerOrdersHandler((incoming) => {
      setOrders((current) => {
        const existing = new Set(current.map((order) => order.title.replace(/ \([^)]+ Order\)$/, "").toLowerCase()));
        const added = incoming.filter((order) => {
          const bare = order.title.replace(/ \([^)]+ Order\)$/, "").toLowerCase();
          if (existing.has(bare)) return false;
          existing.add(bare);
          return true;
        });
        return added.length ? [...current, ...added] : current;
      });
    });
    return () => snippetEffects.registerOrdersHandler(null);
  }, [readOnly, snippetEffects]);

  useEffect(() => {
    function applyAuthState(event: Event) {
      const detail = (
        event as CustomEvent<{
          orderIds?: string[];
          state?: string;
          insurance?: string;
          authNumber?: string;
          startDate?: string;
          endDate?: string;
          authNotes?: string;
        }>
      ).detail;
      if (!detail.orderIds?.length) return;
      setOrders((current) =>
        current.map((entry) => {
          if (!detail.orderIds?.includes(entry.id)) return entry;
          return {
            ...entry,
            ...(detail.state != null ? { status: detail.state } : {}),
            ...(detail.insurance != null ? { insurance: detail.insurance } : {}),
            ...(detail.authNumber != null ? { authNumber: detail.authNumber } : {}),
            ...(detail.startDate != null ? { startDate: detail.startDate } : {}),
            ...(detail.endDate != null ? { endDate: detail.endDate } : {}),
            ...(detail.authNotes != null ? { authNotes: detail.authNotes } : {}),
          };
        }),
      );
    }
    window.addEventListener(ORDER_AUTH_STATE_EVENT, applyAuthState);
    return () => window.removeEventListener(ORDER_AUTH_STATE_EVENT, applyAuthState);
  }, []);

  // V2 and V3 move flagging and grouping out of the order form, so they drive the model
  // through these instead of the per-row callbacks V1 uses.
  const authHandlers = createOrderAuthHandlers(setOrders, readOnly);

  return (
    <Section
      title="Orders"
      action={
        readOnly ? undefined : (
          <AuthVersionSwitch value={authVersion} onChange={setAuthVersion} />
        )
      }
    >
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
                    const ids = current.map((entry) => entry.id);
                    const requested = withRequestedAuthorization(
                      current,
                      ids,
                    );
                    const next = withSentToRecipient(requested, ids);
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

        {version === "V1" ? null : (
          <p className="w-full font-body text-[13px] leading-[18px] text-[#8a8a8a]">
            {AUTH_VERSION_HINTS[version]}
          </p>
        )}

        {version === "V2" ? (
          <AuthSelectionList orders={orders} handlers={authHandlers} />
        ) : version === "V3" ? (
          <AuthBundleBoard orders={orders} handlers={authHandlers} />
        ) : (
        <div className="flex w-full flex-col items-start">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              relatedOrders={orders.filter((entry) => entry.id !== order.id)}
              readOnly={readOnly}
              authGroupNumber={order.authGroupNumber}
              onRemove={() => setOrders((current) => current.filter((entry) => entry.id !== order.id))}
              onRequestAuthorization={() =>
                setOrders((current) => {
                  const next = withRequestedAuthorization(current, linkedOrderIds(current, order.id));
                  publishAuthorizations(next);
                  return next;
                })
              }
              onSendToRecipient={() =>
                setOrders((current) => withSentToRecipient(current, [order.id]))
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
              onAssignedToChange={(assignee) =>
                setOrders((current) => {
                  const next = withLinkedAssignee(current, order.id, assignee || "Unassigned");
                  if (next.some((entry) => entry.status !== "Draft")) {
                    publishAuthorizations(next);
                  }
                  return next;
                })
              }
              onInsuranceChange={(insurance) =>
                setOrders((current) => {
                  const next = withLinkedInsurance(current, order.id, insurance);
                  if (next.some((entry) => entry.status !== "Draft")) {
                    publishAuthorizations(next);
                  }
                  return next;
                })
              }
              onAuthDetailsChange={(patch) =>
                setOrders((current) => {
                  const next = withLinkedAuthDetails(current, order.id, patch);
                  if (next.some((entry) => entry.status !== "Draft")) {
                    publishAuthorizations(next);
                  }
                  return next;
                })
              }
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
            />
          ))}
        </div>
        )}
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
