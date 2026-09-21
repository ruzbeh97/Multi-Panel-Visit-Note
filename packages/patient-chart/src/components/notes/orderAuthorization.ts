import { CASE, PATIENT, PROVIDER } from "../../data/chart";
import type { OrderDetailField, PickedOrder } from "./OrderPickerModal";
import { DEFAULT_NOTE_VISIT_ID } from "./noteStore";

export const ORDER_AUTHORIZATIONS_EVENT = "patient-chart:order-authorizations";
export const ORDER_AUTH_STATE_EVENT = "patient-chart:order-auth-state";

const ORDERS_STORAGE_KEY = "patient-chart:note-orders";
const ORDER_AUTH_STORAGE_KEY = "prior-auth:order-records";

export function ordersStorageKey(visitId: string) {
  return visitId === DEFAULT_NOTE_VISIT_ID ? ORDERS_STORAGE_KEY : `${ORDERS_STORAGE_KEY}:${visitId}`;
}

const TRACKER_CHIP_STATES = new Set([
  "Needs Authorization",
  "Auth Requested",
  "Authorized",
  "Ready To Schedule",
  "Scheduled",
  "Schedule Attempt 1",
  "Schedule Attempt 2",
  "Schedule Attempt 3",
  "Archived",
]);

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

// The prototype has no backend, so the working note survives a refresh via localStorage.
export function loadStoredOrders(visitId: string): PickedOrder[] {
  try {
    const raw = window.localStorage.getItem(ordersStorageKey(visitId));
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as PickedOrder[]) : [];
  } catch {
    return [];
  }
}

export function storeOrders(visitId: string, orders: PickedOrder[]) {
  try {
    window.localStorage.setItem(ordersStorageKey(visitId), JSON.stringify(orders));
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
  caseName: string;
  assignedTo: string;
  authNumber: string;
  startDate: string;
  endDate: string;
  authNotes: string;
  orders: Array<{
    id: string;
    title: string;
    code: string;
    trackingType: "Units";
    units: string;
    details: OrderDetailField[];
  }>;
};

function groupAssignedTo(orders: PickedOrder[]): string {
  const assigned = orders
    .map((entry) => entry.assignedTo?.trim())
    .filter((value): value is string => Boolean(value && value !== "Unassigned"));
  return assigned.length > 0 ? [...new Set(assigned)].join(", ") : "Unassigned";
}

function groupInsurance(orders: PickedOrder[]): string {
  const selected = orders
    .map((entry) => entry.insurance?.trim())
    .filter((value): value is string => Boolean(value));
  return selected[0] || PATIENT.insurance;
}

function firstFilled(orders: PickedOrder[], key: "authNumber" | "startDate" | "endDate" | "authNotes"): string {
  for (const entry of orders) {
    const value = entry[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

// Orders that require authorization form a graph through associatedOrderIds. Every connected
// piece of that graph is one authorization request, so a flagged order with no links is a
// request of one.
export function authComponents(orders: PickedOrder[]): PickedOrder[][] {
  const eligible = orders.filter((order) => order.requiresAuthorization);
  const byId = new Map(eligible.map((order) => [order.id, order]));
  const visited = new Set<string>();
  const components: PickedOrder[][] = [];

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

    components.push(component);
  }

  return components;
}

function authorizationGroups(orders: PickedOrder[]): OrderAuthorizationGroup[] {
  return authComponents(orders).map((component) => {
    const ids = component.map((entry) => entry.id).sort();
    return {
      id: ids.join("--"),
      patient: {
        name: PATIENT.name,
        dob: PATIENT.dob,
        mrn: PATIENT.mrn,
        insurance: groupInsurance(component),
      },
      provider: PROVIDER.display,
      caseName: CASE.name,
      assignedTo: groupAssignedTo(component),
      authNumber: firstFilled(component, "authNumber"),
      startDate: firstFilled(component, "startDate"),
      endDate: firstFilled(component, "endDate"),
      authNotes: firstFilled(component, "authNotes"),
      orders: component.map((entry) => ({
        id: entry.id,
        title: entry.title,
        code: entry.cptCode || entry.code || "",
        trackingType: "Units",
        units: entry.cptUnits ?? (entry.code === "J1010" ? "40" : ""),
        details: entry.authDetailFields ?? [],
      })),
    };
  });
}

// A group keeps the number it was first given, so later authorizations become 2, 3, and so on
// even when earlier groups grow, shrink, or get removed. A standalone order that requires
// authorization counts as its own group.
export function withAuthGroupNumbers(orders: PickedOrder[]): PickedOrder[] {
  const assigned = new Map<string, number>();
  let highest = orders.reduce((max, entry) => Math.max(max, entry.authGroupNumber ?? 0), 0);

  const claims = authComponents(orders).map((component) => {
    const existing = component
      .map((entry) => entry.authGroupNumber)
      .filter((value): value is number => typeof value === "number");
    const wanted = existing.length > 0 ? Math.min(...existing) : undefined;
    return {
      component,
      wanted,
      // Splitting a group leaves both halves holding its old number, so the half that still
      // carries most of it keeps the number and the other half is renumbered.
      holders: wanted === undefined ? 0 : existing.filter((value) => value === wanted).length,
    };
  });

  const taken = new Set<number>();
  const byClaimStrength = [...claims].sort(
    (a, b) => b.holders - a.holders || b.component.length - a.component.length,
  );

  for (const claim of byClaimStrength) {
    const number = claim.wanted !== undefined && !taken.has(claim.wanted) ? claim.wanted : (highest += 1);
    taken.add(number);
    for (const entry of claim.component) assigned.set(entry.id, number);
  }

  if (assigned.size === 0) return orders;
  return orders.map((entry) => {
    const number = assigned.get(entry.id);
    return number && number !== entry.authGroupNumber ? { ...entry, authGroupNumber: number } : entry;
  });
}

export function linkedOrderIds(orders: PickedOrder[], sourceId: string) {
  const source = orders.find((entry) => entry.id === sourceId);
  const ids = new Set<string>([sourceId, ...(source?.associatedOrderIds ?? [])]);
  for (const entry of orders) {
    if ((entry.associatedOrderIds ?? []).includes(sourceId)) ids.add(entry.id);
  }
  return [...ids];
}

function trackerFieldsByOrderId(): Map<
  string,
  {
    state?: string;
    insurance?: string;
    authNumber?: string;
    startDate?: string;
    endDate?: string;
    authNotes?: string;
  }
> {
  try {
    const raw = window.localStorage.getItem(ORDER_AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return new Map();
    const fields = new Map<
      string,
      {
        state?: string;
        insurance?: string;
        authNumber?: string;
        startDate?: string;
        endDate?: string;
        authNotes?: string;
      }
    >();
    for (const record of parsed as Array<{
      state?: string;
      payer?: { name?: string };
      authNumber?: string;
      startDate?: string;
      endDate?: string;
      authNotes?: string;
      orderCpts?: Array<{ orderId?: string }>;
    }>) {
      for (const cpt of record.orderCpts ?? []) {
        if (!cpt.orderId) continue;
        fields.set(cpt.orderId, {
          state: record.state,
          insurance: record.payer?.name,
          authNumber: record.authNumber,
          startDate: record.startDate,
          endDate: record.endDate,
          authNotes: record.authNotes,
        });
      }
    }
    return fields;
  } catch {
    return new Map();
  }
}

export function withTrackerAuthStates(orders: PickedOrder[]): PickedOrder[] {
  const fields = trackerFieldsByOrderId();
  if (fields.size === 0) return orders;
  return orders.map((entry) => {
    if (!entry.requiresAuthorization || entry.status === "Draft") return entry;
    const next = fields.get(entry.id);
    if (!next) return entry;
    const patched: PickedOrder = {
      ...entry,
      status: next.state && next.state !== entry.status ? next.state : entry.status,
      insurance: next.insurance ?? entry.insurance,
      authNumber: next.authNumber ?? entry.authNumber,
      startDate: next.startDate ?? entry.startDate,
      endDate: next.endDate ?? entry.endDate,
      authNotes: next.authNotes ?? entry.authNotes,
    };
    return patched;
  });
}

export function withRequestedAuthorization(orders: PickedOrder[], ids: string[]) {
  const submit = new Set(ids);
  return orders.map((entry) => {
    if (!submit.has(entry.id) || !entry.requiresAuthorization) return entry;
    const nextStatus = TRACKER_CHIP_STATES.has(entry.status) ? entry.status : "Needs Authorization";
    return {
      ...entry,
      status: nextStatus,
      insurance: entry.insurance || PATIENT.insurance,
    };
  });
}

export function withSentToRecipient(orders: PickedOrder[], ids: string[]) {
  const submit = new Set(ids);
  return orders.map((entry) =>
    submit.has(entry.id)
      ? {
          ...entry,
          sent: true,
          // Non-auth orders do not need a separate tracker state.
          status: entry.requiresAuthorization ? entry.status : "Sent",
        }
      : entry,
  );
}

export function publishAuthorizations(orders: PickedOrder[]) {
  const submitted = orders.filter((order) => order.status !== "Draft");
  window.dispatchEvent(
    new CustomEvent(ORDER_AUTHORIZATIONS_EVENT, {
      detail: { source: "visit-note", groups: authorizationGroups(submitted) },
    }),
  );
}

export function orderStatusChipClass(status: string) {
  if (status === "Sent" || status === "Authorized" || status === "Scheduled" || status === "Ready To Schedule") {
    return "bg-[#e6f4ea] text-[#137333]";
  }
  if (status === "Draft") {
    return "bg-[rgba(17,50,238,0.08)] text-[#1132ee]";
  }
  return "bg-[#ececec] text-[#5f5f5f]";
}

export function withLinkedAssignee(orders: PickedOrder[], sourceId: string, assignedTo: string): PickedOrder[] {
  const linkedIds = new Set(linkedOrderIds(orders, sourceId));
  return orders.map((entry) => (linkedIds.has(entry.id) ? { ...entry, assignedTo } : entry));
}

export function withLinkedInsurance(orders: PickedOrder[], sourceId: string, insurance: string): PickedOrder[] {
  const linkedIds = new Set(linkedOrderIds(orders, sourceId));
  return orders.map((entry) => (linkedIds.has(entry.id) ? { ...entry, insurance } : entry));
}

export type AuthDetailPatch = Pick<PickedOrder, "authNumber" | "startDate" | "endDate" | "authNotes">;

export function withLinkedAuthDetails(orders: PickedOrder[], sourceId: string, patch: AuthDetailPatch): PickedOrder[] {
  const linkedIds = new Set(linkedOrderIds(orders, sourceId));
  return orders.map((entry) => (linkedIds.has(entry.id) ? { ...entry, ...patch } : entry));
}

export function withLinkedAuthorization(
  orders: PickedOrder[],
  sourceId: string,
  patch: Partial<Pick<PickedOrder, "requiresAuthorization" | "associatedOrderIds">>,
): PickedOrder[] {
  // Clearing the checkbox drops the order out of its authorization group, in both
  // directions, so the group's shared flag can't immediately re-check it.
  if (patch.requiresAuthorization === false) {
    return orders.map((entry) => {
      if (entry.id === sourceId) {
        return { ...entry, ...patch, requiresAuthorization: false, associatedOrderIds: [] };
      }
      const associated = entry.associatedOrderIds ?? [];
      if (!associated.includes(sourceId)) return entry;
      return { ...entry, associatedOrderIds: associated.filter((id) => id !== sourceId) };
    });
  }

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

/**
 * Puts exactly these orders into one authorization request and pulls them out of any request
 * they were in before. Passing a single id makes that order a request of its own.
 */
export function withAuthGroup(orders: PickedOrder[], ids: string[]): PickedOrder[] {
  const group = new Set(ids);
  if (group.size === 0) return orders;

  return orders.map((entry) => {
    if (group.has(entry.id)) {
      return {
        ...entry,
        requiresAuthorization: true,
        associatedOrderIds: ids.filter((id) => id !== entry.id && group.has(id)),
      };
    }
    const associated = entry.associatedOrderIds ?? [];
    const kept = associated.filter((id) => !group.has(id));
    return kept.length === associated.length ? entry : { ...entry, associatedOrderIds: kept };
  });
}

/** Drops an order out of its authorization request and clears its flag. */
export function withoutAuthorization(orders: PickedOrder[], id: string): PickedOrder[] {
  return withLinkedAuthorization(orders, id, { requiresAuthorization: false });
}

export type AuthRequestView = {
  /** Stable across membership changes, so an open card keeps its identity. */
  key: string;
  number: number;
  orders: PickedOrder[];
  insurance: string;
  assignedTo: string;
  /** Tracker state once submitted, otherwise "Draft". */
  status: string;
  submitted: boolean;
};

/** The authorization requests as the grouping UIs draw them. */
export function authRequests(orders: PickedOrder[]): AuthRequestView[] {
  return authComponents(orders)
    .map((component) => {
      const number = component.reduce(
        (lowest, entry) => Math.min(lowest, entry.authGroupNumber ?? Number.MAX_SAFE_INTEGER),
        Number.MAX_SAFE_INTEGER,
      );
      const tracked = component.find((entry) => TRACKER_CHIP_STATES.has(entry.status));
      return {
        key: `auth-request-${number}`,
        number: number === Number.MAX_SAFE_INTEGER ? 0 : number,
        orders: component,
        insurance: groupInsurance(component),
        assignedTo: groupAssignedTo(component),
        status: tracked?.status ?? "Draft",
        submitted: component.some((entry) => entry.status !== "Draft"),
      };
    })
    .sort((a, b) => a.number - b.number);
}

export type AuthGroupTone = {
  /** Accent used for the rail, badge, and drop highlight. */
  accent: string;
  /** Faint wash behind a request card. */
  wash: string;
};

const AUTH_GROUP_TONES: AuthGroupTone[] = [
  { accent: "#1132ee", wash: "rgba(17, 50, 238, 0.05)" },
  { accent: "#c47a3a", wash: "rgba(196, 122, 58, 0.07)" },
  { accent: "#2e7d32", wash: "rgba(46, 125, 50, 0.07)" },
  { accent: "#8e24aa", wash: "rgba(142, 36, 170, 0.07)" },
  { accent: "#0097a7", wash: "rgba(0, 151, 167, 0.08)" },
];

export function authGroupTone(number: number): AuthGroupTone {
  const index = Math.max(0, number - 1) % AUTH_GROUP_TONES.length;
  return AUTH_GROUP_TONES[index];
}
