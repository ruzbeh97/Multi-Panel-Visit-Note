import { useEffect, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon";

export type OrderKind = "Imaging" | "DME" | "Lab" | "Procedure" | "Medication";

export type OrderDetailField = {
  label: string;
  value: string;
};

export type PickedOrder = {
  id: string;
  type: OrderKind;
  code?: string;
  title: string;
  icon: string;
  tone: "blue" | "orange" | "green";
  meta: string;
  createdAt: string;
  status: string;
  requiresAuthorization: boolean;
  associatedOrderIds: string[];
  /** Billing code and quantity as they currently stand in the expanded order form. */
  cptCode?: string;
  cptUnits?: string;
  /** Snapshot of the visit-note order form shown in the authorization detail panel. */
  authDetailFields?: OrderDetailField[];
  /** Sticky label for the authorization group this order was first linked into. */
  authGroupNumber?: number;
};

type CatalogOrder = {
  id: string;
  type: OrderKind;
  title: string;
  code?: string;
  description?: string;
};

type OrderSet = {
  id: string;
  title: string;
  description: string;
  orders: CatalogOrder[];
};

const INDIVIDUAL_ORDERS: CatalogOrder[] = [
  { id: "imaging-free-text", type: "Imaging", title: "FREE TEXT — FREE TEXT" },
  { id: "dme-order", type: "DME", title: "DME order" },
  { id: "lab-free-text", type: "Lab", title: "FREE TEXT IN LABS" },
  { id: "procedure-j1010", type: "Procedure", title: "J1010", code: "J1010" },
  { id: "procedure-20610", type: "Procedure", title: "20610", code: "20610" },
  { id: "medication-ibu", type: "Medication", title: "IBU 600 mg tablet" },
];

const ORDER_SETS: OrderSet[] = [
  {
    id: "cpt-codes-wo",
    title: "CPT CODES WO",
    description: "FREE TEXT, CUSTOM NECK BRACE, FREE TEXT IN LABS, hip injection",
    orders: [
      INDIVIDUAL_ORDERS[0],
      { id: "dme-neck-brace", type: "DME", title: "CUSTOM NECK BRACE" },
      INDIVIDUAL_ORDERS[2],
    ],
  },
  {
    id: "hip-injection-copy",
    title: "Insert Hip Injection orders (Copy)",
    description: "J1010, 20610, Complete cbc, automated, Xray endovasc thoracic",
    orders: [
      { id: "imaging-thor-ao-place", type: "Imaging", title: "Xray place dist ext thor ao", code: "75959" },
      { id: "imaging-thor-ao-repr", type: "Imaging", title: "Xray endovasc thor ao repr", code: "75956" },
      { id: "lab-cbc", type: "Lab", title: "Complete cbc, automated", code: "85027" },
      { id: "procedure-joint-inj", type: "Procedure", title: "Drain/inj joint/bursa w/o us", code: "20610" },
      { id: "procedure-methylpred", type: "Procedure", title: "Injection, methylprednisolone acetate, 1 mg", code: "J1010" },
    ],
  },
  {
    id: "hip-injection",
    title: "Insert Hip Injection orders",
    description: "J1010",
    orders: [INDIVIDUAL_ORDERS[3]],
  },
  {
    id: "meds-non-meds",
    title: "Meds and Non Meds",
    description: "MRI brain stem w/o dye, IBU 600 mg tablet",
    orders: [
      { id: "imaging-mri-brain", type: "Imaging", title: "MRI brain stem w/o dye" },
      INDIVIDUAL_ORDERS[5],
    ],
  },
];

const TYPE_UI: Record<CatalogOrder["type"], { icon: string; tone: PickedOrder["tone"] }> = {
  Imaging: { icon: "radiology", tone: "blue" },
  DME: { icon: "personal_injury", tone: "orange" },
  Lab: { icon: "science", tone: "green" },
  Procedure: { icon: "vaccines", tone: "orange" },
  Medication: { icon: "medication", tone: "blue" },
};

const NAV_ITEMS = ["All", "Favorites", "Order Sets", "Medications", "Individual Orders"] as const;
type NavItem = (typeof NAV_ITEMS)[number];

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

function toPickedOrder(order: CatalogOrder, setTitle?: string): PickedOrder {
  const ui = TYPE_UI[order.type];
  const createdAt = formatCreatedAt(new Date());
  const created = `Created on ${createdAt} | -`;
  return {
    id: `${order.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
  };
}

const PANEL_WIDTH = 500;
const PANEL_HEIGHT = 470;
const VIEWPORT_MARGIN = 8;

export default function OrderPickerModal({
  anchorRef,
  onClose,
  onSelect,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onSelect: (orders: PickedOrder[]) => void;
}) {
  const [active, setActive] = useState<NavItem>("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => new Set(["cpt-codes-wo"]));
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Hang the panel off the Add Order button, then keep it inside the viewport.
  useLayoutEffect(() => {
    function update() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const maxLeft = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
      const maxTop = window.innerHeight - PANEL_HEIGHT - VIEWPORT_MARGIN;

      setPosition({
        top: Math.min(Math.max(rect.bottom + 6, VIEWPORT_MARGIN), Math.max(maxTop, VIEWPORT_MARGIN)),
        left: Math.min(Math.max(rect.right - PANEL_WIDTH, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN)),
      });
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const term = query.trim().toLowerCase();
  const sets = useMemo(
    () =>
      ORDER_SETS.filter(
        (set) =>
          (!term || `${set.title} ${set.description}`.toLowerCase().includes(term)) &&
          (active !== "Favorites" || favorites.has(set.id)),
      ),
    [active, favorites, term],
  );
  const orders = useMemo(
    () =>
      INDIVIDUAL_ORDERS.filter(
        (order) =>
          (!term || `${order.type} ${order.title}`.toLowerCase().includes(term)) &&
          active !== "Favorites" &&
          (active !== "Medications" || order.type === "Medication"),
      ),
    [active, term],
  );
  const showSets = active === "All" || active === "Favorites" || active === "Order Sets";
  const showOrders = active === "All" || active === "Individual Orders" || active === "Medications";

  function choose(selected: CatalogOrder[], setTitle?: string) {
    onSelect(selected.map((order) => toPickedOrder(order, setTitle)));
    onClose();
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add an order"
        style={{
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          width: PANEL_WIDTH,
          height: `min(${PANEL_HEIGHT}px, calc(100vh - ${VIEWPORT_MARGIN * 2}px))`,
        }}
        className="fixed flex overflow-hidden rounded-[10px] border border-[#dedede] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      >
        <nav className="w-[118px] shrink-0 border-r border-[#e6e6e6] bg-[#fafafa] px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActive(item)}
              className={`block w-full py-2 text-left font-body text-[13px] leading-5 ${
                active === item ? "font-medium text-[#1f1f1f]" : "text-[#858585] hover:text-[#333]"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-[#e6e6e6] p-3">
            <div className="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-md border border-[#dedede] px-3">
              <Icon name="search" size={18} className="shrink-0 text-[#626262]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Order Sets..."
                className="min-w-0 flex-1 bg-transparent font-body text-[13px] text-[#222] outline-none placeholder:text-[#a0a0a0]"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order picker"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#666] hover:bg-[#f1f1f1]"
            >
              <Icon name="close" size={17} />
            </button>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
            {showSets && sets.length > 0 && (
              <section>
                <div className="flex h-9 items-center gap-1.5 bg-[#f1f2ff] px-3">
                  <h3 className="font-body text-[13px] font-medium text-[#222]">Order Sets</h3>
                  <span className="font-body text-[12px] text-[#222]">({sets.length})</span>
                  <Icon name="chevron_right" size={16} className="text-[#858585]" />
                </div>
                {sets.map((set) => (
                  <div
                    key={set.id}
                    className="flex min-h-[52px] items-center border-b border-[#e6e6e6] pl-3 pr-2 hover:bg-[#fafafa]"
                  >
                    <button type="button" onClick={() => choose(set.orders, set.title)} className="min-w-0 flex-1 py-2 text-left">
                      <span className="block truncate font-body text-[13px] font-medium text-[#202020]">{set.title}</span>
                      <span className="mt-0.5 block truncate font-body text-[12px] text-[#8a8a8a]">{set.description}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(set.id)}
                      aria-label={`${favorites.has(set.id) ? "Remove" : "Add"} ${set.title} favorite`}
                      className="ml-2 flex size-7 shrink-0 items-center justify-center"
                    >
                      <Icon
                        name={favorites.has(set.id) ? "star" : "star_outline"}
                        size={19}
                        className={favorites.has(set.id) ? "text-[#a55d00]" : "text-[#898989]"}
                      />
                    </button>
                  </div>
                ))}
              </section>
            )}

            {showOrders && orders.length > 0 && (
              <section>
                <div className="flex h-9 items-center gap-1.5 bg-[#f5f5f5] px-3">
                  <h3 className="font-body text-[13px] font-medium text-[#222]">Individual Orders</h3>
                  <span className="font-body text-[12px] text-[#222]">({orders.length})</span>
                  <Icon name="chevron_right" size={16} className="text-[#858585]" />
                </div>
                {orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => choose([order])}
                    className="flex min-h-[38px] w-full items-center border-b border-[#e6e6e6] px-3 text-left font-body text-[13px] hover:bg-[#fafafa]"
                  >
                    <span className="mr-1 text-[#777]">{order.type}:</span>
                    <span className="truncate font-medium text-[#242424]">{order.title}</span>
                  </button>
                ))}
              </section>
            )}

            {((showSets && sets.length === 0) || (showOrders && orders.length === 0)) && (
              <p className="px-3 py-8 text-center font-body text-[13px] text-[#777]">No matching orders found.</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
