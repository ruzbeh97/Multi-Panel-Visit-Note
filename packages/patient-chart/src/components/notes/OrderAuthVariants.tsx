import { useCallback, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import Icon from "../Icon";
import OrderDetailsForm, {
  ASSIGNEE_OPTIONS,
  AuthActivityTimeline,
  Dropdown,
  INSURANCE_OPTIONS,
  useAuthTimeline,
} from "./OrderDetailsForm";
import type { OrderDetailField, PickedOrder } from "./OrderPickerModal";
import {
  type AuthDetailPatch,
  type AuthRequestView,
  authGroupTone,
  authRequests,
  linkedOrderIds,
  orderStatusChipClass,
  publishAuthorizations,
  withAuthGroup,
  withLinkedAssignee,
  withLinkedAuthDetails,
  withLinkedInsurance,
  withRequestedAuthorization,
  withSentToRecipient,
  withoutAuthorization,
} from "./orderAuthorization";

const ICON_TONES = {
  blue: "text-[#1132ee]",
  orange: "text-[#c47a3a]",
  green: "text-[#2e7d32]",
};

export const AUTH_UX_VERSIONS = ["V1", "V2", "V3"] as const;

export type AuthUxVersion = (typeof AUTH_UX_VERSIONS)[number];

export const AUTH_VERSION_HINTS: Record<AuthUxVersion, string> = {
  V1: "Open an order and use its authorization section.",
  V2: "Flag an order with one click, or select several and group them into a single request.",
  V3: "Drag an order onto a request below to add it, or onto the dashed card to start a new one.",
};

/** Everything the grouping variants need to change an order. */
export type OrderAuthHandlers = {
  readOnly: boolean;
  onRemove: (orderId: string) => void;
  onRequestAuthorization: (orderId: string) => void;
  onSendToRecipient: (orderId: string) => void;
  /** Puts exactly these orders in one request; a single id becomes a request of its own. */
  onGroupOrders: (orderIds: string[]) => void;
  onRemoveFromAuthorization: (orderId: string) => void;
  onAssignedToChange: (orderId: string, assignee: string) => void;
  onInsuranceChange: (orderId: string, insurance: string) => void;
  onAuthDetailsChange: (orderId: string, patch: AuthDetailPatch) => void;
  onFieldsChange: (
    orderId: string,
    fields: { cptCode: string; cptUnits: string; authDetailFields: OrderDetailField[] },
  ) => void;
};

const AUTH_VERSION_STORAGE_KEY = "patient-chart:orders-auth-version";
const AUTH_VERSION_EVENT = "patient-chart:orders-auth-version";

function loadAuthVersion(): AuthUxVersion {
  try {
    const stored = window.localStorage.getItem(AUTH_VERSION_STORAGE_KEY);
    return AUTH_UX_VERSIONS.includes(stored as AuthUxVersion) ? (stored as AuthUxVersion) : "V1";
  } catch {
    return "V1";
  }
}

/** The note and the order set drawer follow one design choice between them. */
export function useAuthUxVersion(): [AuthUxVersion, (version: AuthUxVersion) => void] {
  const [version, setVersion] = useState<AuthUxVersion>(loadAuthVersion);

  useEffect(() => {
    function sync(event: Event) {
      const next = (event as CustomEvent<AuthUxVersion>).detail;
      setVersion(AUTH_UX_VERSIONS.includes(next) ? next : loadAuthVersion());
    }
    window.addEventListener(AUTH_VERSION_EVENT, sync);
    return () => window.removeEventListener(AUTH_VERSION_EVENT, sync);
  }, []);

  const choose = useCallback((next: AuthUxVersion) => {
    setVersion(next);
    try {
      window.localStorage.setItem(AUTH_VERSION_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private browsing; the choice still holds for this session.
    }
    window.dispatchEvent(new CustomEvent(AUTH_VERSION_EVENT, { detail: next }));
  }, []);

  return [version, choose];
}

type OrdersUpdater = (update: (orders: PickedOrder[]) => PickedOrder[]) => void;

/** Wires the grouping variants to an order list, used by the note and the order set drawer. */
export function createOrderAuthHandlers(setOrders: OrdersUpdater, readOnly = false): OrderAuthHandlers {
  // Regrouping or editing after a submission has to reach the tracker, which keys its rows
  // by authorization group.
  const republish = (next: PickedOrder[]) => {
    if (next.some((entry) => entry.status !== "Draft")) publishAuthorizations(next);
    return next;
  };

  return {
    readOnly,
    onRemove: (orderId) => setOrders((current) => current.filter((entry) => entry.id !== orderId)),
    onRequestAuthorization: (orderId) =>
      setOrders((current) => {
        const next = withRequestedAuthorization(current, linkedOrderIds(current, orderId));
        publishAuthorizations(next);
        return next;
      }),
    onSendToRecipient: (orderId) => setOrders((current) => withSentToRecipient(current, [orderId])),
    onGroupOrders: (orderIds) => setOrders((current) => republish(withAuthGroup(current, orderIds))),
    onRemoveFromAuthorization: (orderId) =>
      setOrders((current) => republish(withoutAuthorization(current, orderId))),
    onAssignedToChange: (orderId, assignee) =>
      setOrders((current) => republish(withLinkedAssignee(current, orderId, assignee || "Unassigned"))),
    onInsuranceChange: (orderId, insurance) =>
      setOrders((current) => republish(withLinkedInsurance(current, orderId, insurance))),
    onAuthDetailsChange: (orderId, patch) =>
      setOrders((current) => republish(withLinkedAuthDetails(current, orderId, patch))),
    onFieldsChange: (orderId, fields) =>
      setOrders((current) => {
        const entry = current.find((candidate) => candidate.id === orderId);
        if (
          !entry ||
          (entry.cptCode === fields.cptCode &&
            entry.cptUnits === fields.cptUnits &&
            JSON.stringify(entry.authDetailFields ?? []) === JSON.stringify(fields.authDetailFields))
        ) {
          // Same array identity keeps the form's sync effect from looping.
          return current;
        }
        return current.map((candidate) =>
          candidate.id === orderId ? { ...candidate, ...fields } : candidate,
        );
      }),
  };
}

export function AuthVersionSwitch({
  value,
  onChange,
}: {
  value: AuthUxVersion;
  onChange: (version: AuthUxVersion) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Authorization grouping design"
      className="flex shrink-0 items-center gap-3 rounded-full border border-[#e6e6e6] bg-white px-3 py-1.5"
    >
      {AUTH_UX_VERSIONS.map((version) => (
        <label key={version} className="flex cursor-pointer items-center gap-1.5" title={AUTH_VERSION_HINTS[version]}>
          <input
            type="radio"
            name="orders-auth-version"
            value={version}
            checked={value === version}
            onChange={() => onChange(version)}
            className="size-[15px] accent-[#1132ee]"
          />
          <span className="font-body text-[13px] font-medium leading-[18px] text-[#303030]">{version}</span>
        </label>
      ))}
    </div>
  );
}

function DeliveryChip({ order }: { order: PickedOrder }) {
  const sent = order.sent || order.status === "Sent";
  return (
    <span
      className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] ${orderStatusChipClass(
        sent ? "Sent" : "Draft",
      )}`}
    >
      {sent ? "Sent" : "Draft"}
    </span>
  );
}

function AuthStateChip({ status }: { status: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] ${orderStatusChipClass(
        status,
      )}`}
    >
      {status === "Needs Auth" ? "Needs Authorization" : status}
    </span>
  );
}

/**
 * The order row the variants share: same title, meta, and expandable form as V1, but the
 * authorization controls are supplied by whichever variant is on screen.
 */
function VariantOrderRow({
  order,
  orders,
  handlers,
  leading,
  authControl,
  authGrouping = "external",
}: {
  order: PickedOrder;
  orders: PickedOrder[];
  handlers: OrderAuthHandlers;
  leading?: ReactNode;
  authControl?: ReactNode;
  authGrouping?: "external" | "hidden";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full items-start gap-2 py-2.5">
      {leading}
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
            {authControl}
            <DeliveryChip order={order} />
            {!handlers.readOnly && (
              <button
                type="button"
                onClick={() => handlers.onRemove(order.id)}
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
            relatedOrders={orders.filter((entry) => entry.id !== order.id)}
            authGrouping={authGrouping}
            onRequestAuthorization={() => handlers.onRequestAuthorization(order.id)}
            onSendToRecipient={() => handlers.onSendToRecipient(order.id)}
            onRequiresAuthorizationChange={(value) =>
              value ? handlers.onGroupOrders([order.id]) : handlers.onRemoveFromAuthorization(order.id)
            }
            onAssociateOrder={(orderIds) => handlers.onGroupOrders([order.id, ...orderIds])}
            onAssignedToChange={(assignee) => handlers.onAssignedToChange(order.id, assignee)}
            onInsuranceChange={(insurance) => handlers.onInsuranceChange(order.id, insurance)}
            onAuthDetailsChange={(patch) => handlers.onAuthDetailsChange(order.id, patch)}
            onFieldsChange={(fields) => handlers.onFieldsChange(order.id, fields)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Orders in a request can carry different payers and owners, so the header rolls them up
 * instead of claiming one value for the whole request.
 */
function requestSummaryText(request: AuthRequestView) {
  const payers = [
    ...new Set(request.orders.map((order) => order.insurance?.trim()).filter(Boolean)),
  ] as string[];
  const owners = [
    ...new Set(
      request.orders
        .map((order) => order.assignedTo?.trim())
        .filter((name): name is string => Boolean(name && name !== "Unassigned")),
    ),
  ];
  const unassigned = request.orders.length - request.orders.filter((order) => owners.includes(order.assignedTo?.trim() ?? "")).length;

  return [
    `${request.orders.length} ${request.orders.length === 1 ? "order" : "orders"}`,
    payers.length === 0 ? "No payer yet" : payers.length === 1 ? payers[0] : `${payers.length} payers`,
    owners.length === 0
      ? "Unassigned"
      : owners.length === 1
        ? `${owners[0]}${unassigned > 0 ? ` +${unassigned} unassigned` : ""}`
        : `${owners.length} assignees`,
  ].join(" · ");
}

function RequestSummary({ request }: { request: AuthRequestView }) {
  return (
    <span className="truncate font-body text-[13px] leading-[18px] text-[#666666]">
      {requestSummaryText(request)}
    </span>
  );
}

function RequestBadge({ number, accent }: { number: number; accent: string }) {
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full font-body text-[12px] font-medium text-white"
      style={{ background: accent }}
    >
      {number}
    </span>
  );
}

function SubmitRequestButton({
  request,
  handlers,
}: {
  request: AuthRequestView;
  handlers: OrderAuthHandlers;
}) {
  if (handlers.readOnly) return null;
  return (
    <button
      type="button"
      onClick={() => handlers.onRequestAuthorization(request.orders[0].id)}
      className="shrink-0 rounded-full bg-[#1132ee] px-3 py-1 font-body text-[13px] font-medium text-white hover:bg-[#0e28be]"
    >
      {request.submitted ? "Update request" : "Request Authorization"}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* V2 — flag with one click, select rows to group them into a single request  */
/* -------------------------------------------------------------------------- */

function SelectCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="size-4 accent-[#1132ee]"
      />
    </span>
  );
}

export function AuthSelectionList({
  orders,
  handlers,
}: {
  orders: PickedOrder[];
  handlers: OrderAuthHandlers;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const requests = authRequests(orders);
  const selected = selectedIds.filter((id) => orders.some((order) => order.id === id));

  function toggle(orderId: string) {
    setSelectedIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
    );
  }

  const requestByOrderId = new Map<string, AuthRequestView>();
  for (const request of requests) {
    for (const order of request.orders) requestByOrderId.set(order.id, request);
  }

  const drawn = new Set<string>();
  const rows: ReactNode[] = [];
  for (const order of orders) {
    const request = requestByOrderId.get(order.id);
    if (!request) {
      rows.push(
        <VariantOrderRow
          key={order.id}
          order={order}
          orders={orders}
          handlers={handlers}
          leading={
            handlers.readOnly ? undefined : (
              <SelectCheckbox
                checked={selected.includes(order.id)}
                label={`Select ${order.title}`}
                onChange={() => toggle(order.id)}
              />
            )
          }
          authControl={
            handlers.readOnly ? undefined : (
              <button
                type="button"
                onClick={() => handlers.onGroupOrders([order.id])}
                title="Start an authorization request for this order"
                className="flex shrink-0 items-center gap-1 rounded-md border border-[#c4c4c4] px-2 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#404040] hover:border-[#1132ee] hover:text-[#1132ee]"
              >
                <Icon name="add" size={14} />
                Needs auth
              </button>
            )
          }
        />,
      );
      continue;
    }

    if (drawn.has(request.key)) continue;
    drawn.add(request.key);

    const tone = authGroupTone(request.number);
    const additions = selected.filter((id) => !request.orders.some((entry) => entry.id === id));

    rows.push(
      <div
        key={request.key}
        className="my-1 flex w-full flex-col items-start gap-2 rounded-xl border p-3"
        style={{ borderColor: `${tone.accent}55`, background: tone.wash }}
      >
        <div className="flex w-full items-center gap-2">
          <RequestBadge number={request.number} accent={tone.accent} />
          <span className="shrink-0 font-body text-[14px] font-bold leading-[20px] text-[#1a1a1a]">
            Authorization request {request.number}
          </span>
          <RequestSummary request={request} />
          <div className="flex-1" />
          {request.submitted ? <AuthStateChip status={request.status} /> : null}
          {additions.length > 0 && !handlers.readOnly ? (
            <button
              type="button"
              onClick={() => {
                handlers.onGroupOrders([...request.orders.map((entry) => entry.id), ...additions]);
                setSelectedIds([]);
              }}
              className="shrink-0 rounded-full border border-[#1132ee] px-3 py-1 font-body text-[13px] font-medium text-[#1132ee] hover:bg-[rgba(17,50,238,0.06)]"
            >
              Add {additions.length} selected
            </button>
          ) : null}
          <SubmitRequestButton request={request} handlers={handlers} />
        </div>

        <div className="w-full rounded-lg bg-white px-2">
          {request.orders.map((member, index) => (
            <div key={member.id} className={index > 0 ? "border-t border-black/5" : ""}>
              <VariantOrderRow
                order={member}
                orders={orders}
                handlers={handlers}
                leading={
                  handlers.readOnly ? undefined : (
                    <SelectCheckbox
                      checked={selected.includes(member.id)}
                      label={`Select ${member.title}`}
                      onChange={() => toggle(member.id)}
                    />
                  )
                }
                authControl={
                  handlers.readOnly ? undefined : (
                    <button
                      type="button"
                      onClick={() => handlers.onRemoveFromAuthorization(member.id)}
                      title="Remove from this authorization request"
                      aria-label={`Remove ${member.title} from authorization request ${request.number}`}
                      className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
                    >
                      <Icon name="link_off" size={18} className="text-[#666666]" />
                    </button>
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>,
    );
  }

  return (
    <div className="flex w-full flex-col items-start">
      {rows}
      {selected.length > 0 && (
        <div className="sticky bottom-3 z-10 mt-2 flex w-full items-center gap-2 rounded-full border border-[rgba(17,50,238,0.25)] bg-white px-4 py-2 shadow-[0px_6px_18px_rgba(0,0,0,0.14)]">
          <span className="font-body text-[13px] font-medium leading-[18px] text-[#303030]">
            {selected.length} {selected.length === 1 ? "order" : "orders"} selected
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              handlers.onGroupOrders(selected);
              setSelectedIds([]);
            }}
            className="rounded-full bg-[#1132ee] px-3 py-1 font-body text-[13px] font-medium text-white hover:bg-[#0e28be]"
          >
            {selected.length > 1 ? "Group into one request" : "Needs authorization"}
          </button>
          {selected.length > 1 && (
            <button
              type="button"
              onClick={() => {
                selected.forEach((id) => handlers.onGroupOrders([id]));
                setSelectedIds([]);
              }}
              className="rounded-full border border-[#c4c4c4] px-3 py-1 font-body text-[13px] font-medium text-[#404040] hover:border-[#1132ee] hover:text-[#1132ee]"
            >
              Separate requests
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="rounded-full px-2 py-1 font-body text-[13px] font-medium text-[#666666] hover:text-[#1a1a1a]"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* V3 — drag orders onto request cards                                        */
/* -------------------------------------------------------------------------- */

/** Adds an order to a request without dragging; lives on the request itself. */
function AddOrderMenu({
  label,
  candidates,
  requestOf,
  onPick,
}: {
  label: string;
  candidates: PickedOrder[];
  requestOf: (orderId: string) => AuthRequestView | undefined;
  onPick: (orderId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={candidates.length === 0}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        title={candidates.length === 0 ? "Every order is already in this request" : label}
        className="flex items-center gap-1 rounded-full border border-[#c4c4c4] px-3 py-1 font-body text-[13px] font-medium text-[#404040] hover:border-[#1132ee] hover:text-[#1132ee] disabled:border-[#ededed] disabled:text-[#b3b3b3] disabled:hover:border-[#ededed] disabled:hover:text-[#b3b3b3]"
      >
        <Icon name="add" size={16} />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 max-h-[260px] w-[320px] overflow-y-auto rounded-lg border border-[#e6e6e6] bg-white py-1 shadow-[0px_6px_16px_rgba(0,0,0,0.14)]">
          {candidates.map((order) => {
            const from = requestOf(order.id);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => {
                  onPick(order.id);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left hover:bg-[#f4f4f4]"
              >
                <span className="w-full truncate font-body text-[13px] text-[#1a1a1a]">{order.title}</span>
                <span className="font-body text-[12px] leading-[16px] text-[#8a8a8a]">
                  {from ? `Currently in request ${from.number}` : "Not in a request yet"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="w-[130px] shrink-0 pt-1 font-body text-[13px] leading-[18px] text-[#8a8a8a]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function TrackerValue({ value }: { value?: string }) {
  if (!value?.trim()) {
    return <span className="font-body text-[13px] leading-[22px] text-[#b3b3b3]">Set in the tracker</span>;
  }
  return <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{value}</span>;
}

/** One set of authorization details, shared by every order in the request. */
function RequestAuthDetails({
  request,
  handlers,
}: {
  request: AuthRequestView;
  handlers: OrderAuthHandlers;
}) {
  // Payer and owner are written to the whole group, so the first order speaks for the request.
  const primary = request.orders[0];
  const timeline = useAuthTimeline(primary);
  const insuranceOptions =
    primary.insurance && !INSURANCE_OPTIONS.includes(primary.insurance)
      ? [...INSURANCE_OPTIONS, primary.insurance]
      : INSURANCE_OPTIONS;

  return (
    <div className="flex w-full flex-col items-start rounded-lg border border-[#ededed] bg-[#fbfbfc] px-3 py-2">
      <div className="flex w-full items-baseline gap-2 pb-1">
        <span className="font-body text-[13px] font-bold leading-[20px] text-[#1a1a1a]">
          Authorization details
        </span>
        <span className="font-body text-[12px] leading-[16px] text-[#8a8a8a]">
          Applies to all {request.orders.length} {request.orders.length === 1 ? "order" : "orders"} in
          this request
        </span>
      </div>
      <div className="grid w-full grid-cols-2 gap-x-8">
        <AuthField label="Insurance">
          <Dropdown
            value={primary.insurance ?? ""}
            placeholder="Select insurance"
            options={insuranceOptions}
            disabled={handlers.readOnly}
            compact
            onChange={(value) => handlers.onInsuranceChange(primary.id, value)}
          />
        </AuthField>
        <AuthField label="Assigned to">
          <Dropdown
            value={primary.assignedTo && primary.assignedTo !== "Unassigned" ? primary.assignedTo : ""}
            placeholder="Assign to..."
            options={ASSIGNEE_OPTIONS}
            disabled={handlers.readOnly}
            compact
            onChange={(value) => handlers.onAssignedToChange(primary.id, value)}
          />
        </AuthField>
        <AuthField label="Authorization Number">
          <TrackerValue value={primary.authNumber} />
        </AuthField>
        <AuthField label="Tracker state">
          <TrackerValue value={primary.status === "Draft" ? "" : primary.status} />
        </AuthField>
        <AuthField label="Start Date">
          <TrackerValue value={primary.startDate} />
        </AuthField>
        <AuthField label="End Date">
          <TrackerValue value={primary.endDate} />
        </AuthField>
      </div>
      <AuthField label="Authorization Notes">
        <TrackerValue value={primary.authNotes} />
      </AuthField>
      <AuthActivityTimeline entries={timeline} />
    </div>
  );
}

function RequestMemberRow({
  order,
  request,
  handlers,
  dragHandleProps,
}: {
  order: PickedOrder;
  request: AuthRequestView;
  handlers: OrderAuthHandlers;
  dragHandleProps: Record<string, unknown>;
}) {
  return (
    <div className="flex w-full items-center gap-2 px-2 py-1.5" {...dragHandleProps}>
      {!handlers.readOnly && (
        <span className="flex size-6 shrink-0 cursor-grab items-center justify-center text-[#b3b3b3]" aria-hidden>
          <Icon name="drag_indicator" size={16} />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate font-body text-[13px] font-medium leading-[20px] text-[#1a1a1a]">
        {order.title}
      </span>
      {!handlers.readOnly && (
        <button
          type="button"
          onClick={() => handlers.onRemoveFromAuthorization(order.id)}
          aria-label={`Remove ${order.title} from request ${request.number}`}
          title="Remove from this request"
          className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <Icon name="close" size={16} className="text-[#666666]" />
        </button>
      )}
    </div>
  );
}

export function AuthBundleBoard({
  orders,
  handlers,
}: {
  orders: PickedOrder[];
  handlers: OrderAuthHandlers;
}) {
  const requests = authRequests(orders);
  const [dragOrderId, setDragOrderId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const requestByOrderId = new Map<string, AuthRequestView>();
  for (const request of requests) {
    for (const order of request.orders) requestByOrderId.set(order.id, request);
  }

  function draggedId(event: DragEvent) {
    return event.dataTransfer.getData("text/plain") || dragOrderId;
  }

  function dragProps(orderId: string) {
    if (handlers.readOnly) return {};
    return {
      draggable: true,
      onDragStart: (event: DragEvent) => {
        event.dataTransfer.setData("text/plain", orderId);
        event.dataTransfer.effectAllowed = "move";
        setDragOrderId(orderId);
      },
      onDragEnd: () => {
        setDragOrderId(null);
        setDropTarget(null);
      },
    };
  }

  function dropProps(key: string, onReceive: (orderId: string) => void) {
    if (handlers.readOnly) return {};
    return {
      onDragOver: (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropTarget(key);
      },
      onDragLeave: () => setDropTarget((current) => (current === key ? null : current)),
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        const id = draggedId(event);
        if (id) onReceive(id);
        setDragOrderId(null);
        setDropTarget(null);
      },
    };
  }

  function requestOf(orderId: string) {
    return requestByOrderId.get(orderId);
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full flex-col items-start">
        {orders.map((order) => {
          const request = requestByOrderId.get(order.id);
          const tone = request ? authGroupTone(request.number) : null;
          return (
            <div
              key={order.id}
              {...dragProps(order.id)}
              className={`w-full rounded-lg transition-colors ${
                dragOrderId === order.id ? "bg-[rgba(17,50,238,0.05)]" : ""
              }`}
            >
              <VariantOrderRow
                order={order}
                orders={orders}
                handlers={handlers}
                authGrouping="hidden"
                leading={
                  handlers.readOnly ? undefined : (
                    <span
                      className="flex size-7 shrink-0 cursor-grab items-center justify-center text-[#b3b3b3]"
                      title="Drag onto an authorization request below"
                      aria-hidden
                    >
                      <Icon name="drag_indicator" size={18} />
                    </span>
                  )
                }
                authControl={
                  request && tone ? (
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 font-body text-[12px] font-medium leading-[18px]"
                      style={{ background: tone.wash, color: tone.accent }}
                    >
                      <span className="size-2 rounded-full" style={{ background: tone.accent }} />
                      Request {request.number}
                    </span>
                  ) : undefined
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-start gap-2 border-t border-[#ededed] pt-3">
        <div className="flex w-full items-center gap-2">
          <h3 className="font-body text-[14px] font-bold leading-[20px] text-[#1a1a1a]">
            Authorization requests
          </h3>
          <span className="font-body text-[13px] leading-[18px] text-[#666666]">
            {requests.length === 0
              ? "Nothing needs authorization yet"
              : `${requests.length} ${requests.length === 1 ? "request" : "requests"} will go to the tracker`}
          </span>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3">
          {requests.map((request) => {
            const tone = authGroupTone(request.number);
            const active = dropTarget === request.key;
            const memberIds = request.orders.map((entry) => entry.id);
            return (
              <div
                key={request.key}
                {...dropProps(request.key, (orderId) =>
                  handlers.onGroupOrders([...memberIds.filter((id) => id !== orderId), orderId]),
                )}
                className="flex w-full flex-col items-stretch gap-2 rounded-xl border-2 p-3 transition-colors"
                style={{
                  borderColor: active ? tone.accent : `${tone.accent}40`,
                  background: active ? tone.wash : "#ffffff",
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <RequestBadge number={request.number} accent={tone.accent} />
                  <span className="shrink-0 font-body text-[14px] font-bold leading-[20px] text-[#1a1a1a]">
                    Request {request.number}
                  </span>
                  <span className="shrink-0 font-body text-[13px] leading-[18px] text-[#666666]">
                    {request.orders.length} {request.orders.length === 1 ? "order" : "orders"}
                  </span>
                  <div className="flex-1" />
                  {request.submitted ? <AuthStateChip status={request.status} /> : null}
                  {!handlers.readOnly && (
                    <AddOrderMenu
                      label="Add order"
                      candidates={orders.filter((entry) => !memberIds.includes(entry.id))}
                      requestOf={requestOf}
                      onPick={(orderId) => handlers.onGroupOrders([...memberIds, orderId])}
                    />
                  )}
                  <SubmitRequestButton request={request} handlers={handlers} />
                </div>

                <div className="w-full overflow-hidden rounded-lg border border-[#ededed] bg-white">
                  {request.orders.map((member, index) => (
                    <div key={member.id} className={index > 0 ? "border-t border-[#ededed]" : ""}>
                      <RequestMemberRow
                        order={member}
                        request={request}
                        handlers={handlers}
                        dragHandleProps={dragProps(member.id)}
                      />
                    </div>
                  ))}
                </div>

                <RequestAuthDetails request={request} handlers={handlers} />

                {!handlers.readOnly && (
                  <span className="font-body text-[12px] leading-[16px] text-[#8a8a8a]">
                    Drop an order here to add it to this request.
                  </span>
                )}
              </div>
            );
          })}

          {!handlers.readOnly && (
            <div
              {...dropProps("new", (orderId) => handlers.onGroupOrders([orderId]))}
              className={`flex w-full flex-wrap items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                dropTarget === "new"
                  ? "border-[#1132ee] bg-[rgba(17,50,238,0.06)]"
                  : "border-[#d9d9d9] bg-white"
              }`}
            >
              <Icon name="add_circle" size={20} className="text-[#1132ee]" />
              <span className="font-body text-[13px] font-medium leading-[18px] text-[#303030]">
                New authorization request
              </span>
              <span className="font-body text-[12px] leading-[16px] text-[#8a8a8a]">
                Drop an order here, or
              </span>
              <AddOrderMenu
                label="Choose an order"
                candidates={orders.filter((entry) => {
                  const existing = requestByOrderId.get(entry.id);
                  return !existing || existing.orders.length > 1;
                })}
                requestOf={requestOf}
                onPick={(orderId) => handlers.onGroupOrders([orderId])}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
