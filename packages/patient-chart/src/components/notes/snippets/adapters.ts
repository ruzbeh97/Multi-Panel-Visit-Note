import type { OrderKind, PickedOrder } from "../OrderPickerModal";
import type { TextSnippetRow, SnippetServiceGroup } from "./types";

type ServiceKind = "procedure" | "hcpcs";

export type SnippetServiceLine = {
  id: string;
  kind: ServiceKind;
  code: string;
  description: string;
  modifier: string;
  icd10: string[];
  units: string;
  bookmarked: boolean;
};

const TYPE_UI: Record<OrderKind, { icon: string; tone: PickedOrder["tone"] }> = {
  Imaging: { icon: "radiology", tone: "blue" },
  DME: { icon: "personal_injury", tone: "orange" },
  Lab: { icon: "science", tone: "green" },
  Procedure: { icon: "vaccines", tone: "orange" },
  Medication: { icon: "medication", tone: "blue" },
};

/** Catalog used to expand known preference order-set titles into visit-note orders. */
const ORDER_SET_CATALOG: Record<string, Array<{ type: OrderKind; title: string; code?: string }>> = {
  "Insert Hip Injection orders (Copy)": [
    { type: "Imaging", title: "Xray place dist ext thor ao", code: "75959" },
    { type: "Imaging", title: "Xray endovasc thor ao repr", code: "75956" },
    { type: "Lab", title: "Complete cbc, automated", code: "85027" },
    { type: "Procedure", title: "Drain/inj joint/bursa w/o us", code: "20610" },
    { type: "Procedure", title: "Injection, methylprednisolone acetate, 1 mg", code: "J1010" },
  ],
  "Hip Injection Only": [
    { type: "Procedure", title: "Drain/inj joint/bursa w/o us", code: "20610" },
    { type: "Procedure", title: "Injection, methylprednisolone acetate, 1 mg", code: "J1010" },
  ],
  "Insert Hip Injection orders": [
    { type: "Procedure", title: "Injection, methylprednisolone acetate, 1 mg", code: "J1010" },
  ],
  "Right Knee Osteoarthritis Order Set": [
    { type: "Procedure", title: "Arthrocentesis, aspiration and/or injection; major joint (knee)", code: "20610" },
    { type: "Medication", title: "Hylan G-F 20 (Synvisc), per 1 mg", code: "J7325" },
  ],
  "Knee Assessment Order Set": [{ type: "Imaging", title: "Radiologic examination, knee; 3 views", code: "73562" }],
  "Knee Arthroscopy Order Set": [
    { type: "Procedure", title: "Arthroscopy, knee, surgical; with meniscectomy", code: "29881" },
    { type: "Imaging", title: "Radiologic examination, knee; 3 views", code: "73562" },
  ],
  "Shoulder Eval Order Set": [
    { type: "Imaging", title: "MRI, any joint of upper extremity", code: "73221" },
    { type: "Procedure", title: "Therapeutic exercises", code: "97110" },
  ],
};

const NAME_ORDER_HINTS: Array<{ match: RegExp; type: OrderKind; code?: string }> = [
  { match: /xray|radiologic|mri|imaging/i, type: "Imaging" },
  { match: /cbc|lab|specimen|panel/i, type: "Lab" },
  { match: /brace|orthosis|dme/i, type: "DME" },
  { match: /tablet|capsule|synvisc|hylan|mg\b/i, type: "Medication" },
  { match: /inject|drain|arthro|procedure/i, type: "Procedure" },
];

function formatCreatedAt(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = String(((hours + 11) % 12) + 1).padStart(2, "0");
  return `${month}/${day}/${year} ${hour12}:${minutes} ${period}`;
}

function toPickedOrder(
  order: { type: OrderKind; title: string; code?: string },
  setTitle?: string,
): PickedOrder {
  const ui = TYPE_UI[order.type];
  const createdAt = formatCreatedAt(new Date());
  const created = `Created on ${createdAt} | -`;
  return {
    id: `snippet-${order.code || order.title}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: order.type,
    code: order.code,
    title: `${order.title} (${order.type === "DME" ? "Dme" : order.type} Order)`,
    icon: ui.icon,
    tone: ui.tone,
    meta: setTitle ? `${setTitle} • ${created}` : created,
    createdAt,
    status: "Draft",
    requiresAuthorization: false,
    associatedOrderIds: [],
    cptCode: order.code,
    cptUnits: order.code === "J1010" ? "40" : "",
  };
}

function inferOrderKind(name: string, type?: string): OrderKind {
  if (type === "med") return "Medication";
  if (type === "brace") return "DME";
  for (const hint of NAME_ORDER_HINTS) {
    if (hint.match.test(name)) return hint.type;
  }
  return "Procedure";
}

function inferCodeFromName(name: string): string | undefined {
  const codeMatch = name.match(/\b([A-Z]?\d{4,5}[A-Z]?)\b/);
  return codeMatch?.[1];
}

export function ordersFromSnippet(snippet: TextSnippetRow): PickedOrder[] {
  const picked: PickedOrder[] = [];
  const seen = new Set<string>();

  const push = (order: { type: OrderKind; title: string; code?: string }, setTitle?: string) => {
    const key = `${order.code || ""}::${order.title}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    picked.push(toPickedOrder(order, setTitle));
  };

  snippet.orderSelections?.forEach((selection) => {
    const catalog = ORDER_SET_CATALOG[selection];
    if (catalog) {
      catalog.forEach((order) => push(order, selection));
      return;
    }
    push(
      {
        type: inferOrderKind(selection),
        title: selection,
        code: inferCodeFromName(selection),
      },
      selection,
    );
  });

  // Snippets saved by the editor list their sections, and their order selections are
  // authoritative — an empty Order Set section must insert nothing, even if an earlier
  // save left expanded orders behind. Seeded snippets have no sections and still rely
  // on snippetOrders.
  const selectionsAreAuthoritative = Array.isArray(snippet.configItemTypes);
  if (!selectionsAreAuthoritative) {
    snippet.snippetOrders?.forEach((order) => {
      push({
        type: inferOrderKind(order.name, order.type),
        title: order.name,
        code: inferCodeFromName(order.name),
      });
    });
  }

  return picked;
}

function kindForCpt(cpt: string): ServiceKind {
  return /^[A-Z]/i.test(cpt) ? "hcpcs" : "procedure";
}

export function servicesFromSnippet(snippet: TextSnippetRow): SnippetServiceLine[] {
  const groups: SnippetServiceGroup[] = snippet.snippetServiceGroups?.length
    ? snippet.snippetServiceGroups
    : [];

  // Prefer prebuilt groups from Preferences; otherwise flatten procedureCodeConfig.
  if (!groups.length && snippet.procedureCodeConfig?.length) {
    return snippet.procedureCodeConfig
      .filter((row) => row.cptCode)
      .map((row, index) => ({
        id: `snippet-svc-${row.cptCode}-${Date.now()}-${index}`,
        kind: kindForCpt(row.cptCode),
        code: row.cptCode,
        description: row.description || row.cptCode,
        modifier: row.modifiers?.find(Boolean) || "",
        icd10: (row.icds || []).filter(Boolean),
        units: row.units || "1",
        bookmarked: false,
      }));
  }

  return groups.flatMap((group) =>
    group.rows.map((row, index) => ({
      id: `snippet-svc-${row.cpt}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
      kind: kindForCpt(row.cpt),
      code: row.cpt,
      description: row.description,
      modifier: row.mods?.find((mod) => mod && mod !== "Mod") || "",
      icd10: (row.icds || []).filter(Boolean),
      units: row.cpt === "J1010" ? "40" : "1",
      bookmarked: false,
    })),
  );
}
