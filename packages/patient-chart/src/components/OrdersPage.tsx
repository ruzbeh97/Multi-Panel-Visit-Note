import { Fragment, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import CustomTemplateBuilder from "./CustomTemplateBuilder";
import ManageTemplatesDrawer, {
  INITIAL_TEMPLATES,
  type SavedTemplate,
} from "./ManageTemplatesDrawer";
import NewOrderDrawer from "./NewOrderDrawer";
import { ASSOCIATE_PROVIDER, CLINIC_ASSISTANT, PATIENT, PROVIDER } from "../data/chart";

type OrderStatus =
  | "Draft"
  | "Sent"
  | "Cancelled"
  | "In Progress"
  | "Completed"
  | "Denied"
  | "PAPER_PRESCRIPTION"
  | "RECORD";
type Cell = string | React.ReactNode;
type OrderRow = Record<string, Cell> & { id: string; status: OrderStatus };
type Column = { key: string; label: string; minWidth?: string };

const ORDER_TYPES = [
  "Medication",
  "Outbound Referral",
  "Imaging",
  "Lab",
  "HealthGorilla Labs",
  "DME",
  "Procedures & Injections",
  "Custom",
];

const SHARED_COLUMNS: Column[] = [
  { key: "status", label: "Status", minWidth: "82px" },
  { key: "patient", label: "Patient Name", minWidth: "135px" },
  { key: "expects", label: "Expects Response", minWidth: "125px" },
  { key: "priority", label: "Priority", minWidth: "95px" },
  { key: "provider", label: "Ordering Provider", minWidth: "145px" },
  { key: "recipients", label: "Recipients", minWidth: "120px" },
  { key: "date", label: "Order Date", minWidth: "105px" },
];

const REFERRAL_COLUMNS: Column[] = [
  ...SHARED_COLUMNS,
  { key: "referralProvider", label: "Referral Provider", minWidth: "135px" },
  { key: "facility", label: "Facility Name", minWidth: "125px" },
  { key: "appointment", label: "Appointment ID", minWidth: "115px" },
  { key: "note", label: "Note", minWidth: "130px" },
];

const IMAGING_COLUMNS: Column[] = [
  ...SHARED_COLUMNS,
  { key: "medium", label: "Results Medium", minWidth: "110px" },
  { key: "description", label: "Imaging Description", minWidth: "220px" },
  { key: "appointment", label: "Appointment ID", minWidth: "115px" },
  { key: "note", label: "Note", minWidth: "165px" },
];

const LAB_COLUMNS: Column[] = [
  ...SHARED_COLUMNS,
  { key: "facility", label: "Facility Name", minWidth: "125px" },
  { key: "appointment", label: "Appointment ID", minWidth: "115px" },
  { key: "note", label: "Note", minWidth: "125px" },
];

const HEALTH_GORILLA_COLUMNS: Column[] = [
  { key: "status", label: "Status", minWidth: "95px" },
  { key: "interpretation", label: "Interpretation", minWidth: "145px" },
  { key: "patient", label: "Patient Name", minWidth: "140px" },
  { key: "priority", label: "Priority", minWidth: "100px" },
  { key: "provider", label: "Ordering Provider", minWidth: "145px" },
  { key: "date", label: "Order Date", minWidth: "110px" },
  { key: "facility", label: "Facility Name", minWidth: "140px" },
  { key: "updated", label: "Last Updated", minWidth: "130px" },
];

const DME_COLUMNS: Column[] = [
  ...SHARED_COLUMNS,
  { key: "facility", label: "Facility Name", minWidth: "125px" },
  { key: "appointment", label: "Appointment ID", minWidth: "115px" },
  { key: "prescription", label: "Prescription", minWidth: "105px" },
  { key: "note", label: "Note", minWidth: "120px" },
];

const PROCEDURE_COLUMNS: Column[] = [
  ...SHARED_COLUMNS,
  { key: "procedure", label: "Procedure", minWidth: "130px" },
  { key: "facility", label: "Facility Name", minWidth: "125px" },
  { key: "appointment", label: "Appointment ID", minWidth: "115px" },
  { key: "note", label: "Note", minWidth: "120px" },
];

const MEDICATION_COLUMNS: Column[] = [
  { key: "status", label: "Status", minWidth: "170px" },
  { key: "patient", label: "Patient", minWidth: "145px" },
  { key: "drug", label: "Drug Name", minWidth: "130px" },
  { key: "sig", label: "Sig", minWidth: "190px" },
  { key: "controlled", label: "Controlled", minWidth: "95px" },
  { key: "provider", label: "Provider", minWidth: "135px" },
  { key: "createdBy", label: "Created By", minWidth: "125px" },
  { key: "quantity", label: "Qty", minWidth: "55px" },
  { key: "refills", label: "Refills", minWidth: "70px" },
  { key: "pharmacy", label: "Pharmacy", minWidth: "150px" },
  { key: "date", label: "Order Date", minWidth: "105px" },
];

const patient = PATIENT.name;
const SITE_PATIENTS = ["Avery Patel", "Morgan Lee", "Casey Brooks", "Taylor Nguyen"];

function siteRows(rows: OrderRow[], repeat = false): OrderRow[] {
  const source = repeat ? [...rows, ...rows] : rows;
  return source.map((entry, index) => ({
    ...entry,
    id: `site-${index}-${entry.id}`,
    patient: SITE_PATIENTS[index % SITE_PATIENTS.length],
  }));
}

function row(
  id: string,
  status: OrderStatus,
  date: string,
  overrides: Partial<OrderRow> = {},
): OrderRow {
  return {
    id,
    status,
    patient,
    expects: "No",
    priority: "-",
    provider: status === "Draft" ? ASSOCIATE_PROVIDER : PROVIDER.name,
    recipients: "-",
    date,
    facility: status === "Draft" ? "MAIN OFFICE" : "Riverside Imaging",
    appointment: `APT-${id.replace(/\D/g, "").padStart(6, "0")}`,
    note: "-",
    ...overrides,
  };
}

const REFERRALS: OrderRow[] = [
  row("r8311", "Draft", "08/27/2026", { provider: ASSOCIATE_PROVIDER, facility: "MAIN OFFICE" }),
  row("r8282", "Draft", "08/25/2026", { provider: PROVIDER.name, facility: "MAIN OFFICE" }),
  row("r8050", "Sent", "08/14/2026", { provider: CLINIC_ASSISTANT, facility: "MAIN OFFICE" }),
  row("r7707", "Sent", "07/30/2026", { recipients: "PT Scheduling", facility: "MAIN OFFICE" }),
  row("r7523", "Sent", "07/23/2026", { recipients: "Northside PT", facility: "MAIN OFFICE" }),
];

const IMAGING: OrderRow[] = [
  row("i8050", "Sent", "08/18/2026", {
    provider: CLINIC_ASSISTANT,
    medium: "-",
    description: "X-ray exam knee; 2 views",
    note: "Post-operative surveillance",
  }),
  row("i7998", "Draft", "08/12/2026", { medium: "-", description: "MRI knee without contrast" }),
  row("i7523", "Sent", "07/22/2026", {
    medium: "-",
    description: "X-ray exam knee; 2 views",
    note: "Review at follow-up",
  }),
  row("i6564", "Draft", "07/17/2026", { medium: "-", description: "MRI knee without contrast" }),
];

const LABS: OrderRow[] = [
  row("l6561", "Sent", "07/29/2026", { priority: "No Priority", facility: "Athelas Core Lab" }),
  row("l6562", "Draft", "07/29/2026", { priority: "No Priority", facility: "Athelas Core Lab" }),
  row("l6563", "Draft", "07/17/2026", { priority: "No Priority", facility: "Athelas Core Lab" }),
  row("l6564", "Sent", "07/08/2026", { priority: "No Priority", facility: "Athelas Core Lab" }),
  row("l6565", "Sent", "06/23/2026", { priority: "No Priority", facility: "Athelas Core Lab" }),
];

const DME: OrderRow[] = [
  row("d8298", "Draft", "08/26/2026", { facility: "MAIN OFFICE", prescription: "-" }),
  row("d6561", "Draft", "07/17/2026", { facility: "Northside DME", prescription: "-" }),
  row("d6562", "Sent", "07/08/2026", { facility: "Northside DME", prescription: "-" }),
  row("d6563", "Sent", "06/23/2026", { recipients: "DME Intake", facility: "Northside DME", prescription: "-" }),
];

const PROCEDURES: OrderRow[] = [
  row("p8259", "Draft", "08/27/2026", { provider: CLINIC_ASSISTANT, procedure: "-", facility: "MAIN OFFICE" }),
  row("p8299", "Sent", "08/26/2026", { procedure: "Functional testing", facility: "MAIN OFFICE" }),
  row("p8304", "Sent", "08/26/2026", { procedure: "Joint examination", facility: "MAIN OFFICE" }),
  row("p8305", "Sent", "08/26/2026", { procedure: "Therapeutic injection", facility: "MAIN OFFICE" }),
];

const HEALTH_GORILLA: OrderRow[] = [
  row("hg1", "Cancelled", "08/21/2026", { interpretation: "-", priority: "Routine", provider: PROVIDER.name, facility: "Hale Orthopedics", updated: "08/21/2026" }),
  row("hg2", "Cancelled", "08/19/2026", { interpretation: "-", priority: "Routine", provider: PROVIDER.name, facility: "Hale Orthopedics", updated: "08/19/2026" }),
  row("hg3", "Cancelled", "08/19/2026", { interpretation: "-", priority: "Routine", provider: PROVIDER.name, facility: "Hale Orthopedics", updated: "08/19/2026" }),
  row("hg4", "Cancelled", "08/19/2026", { interpretation: "-", priority: "Routine", provider: ASSOCIATE_PROVIDER, facility: "Hale Orthopedics", updated: "08/19/2026" }),
  row("hg5", "Cancelled", "08/10/2026", { interpretation: "-", priority: "Routine", provider: PROVIDER.name, facility: "Hale Orthopedics", updated: "08/10/2026" }),
  row("hg6", "Cancelled", "05/20/2026", { interpretation: "-", priority: "Routine", provider: ASSOCIATE_PROVIDER, facility: "Hale Orthopedics", updated: "07/02/2026" }),
  row("hg7", "Cancelled", "04/16/2026", { interpretation: "-", priority: "Routine", provider: PROVIDER.name, facility: "Hale Orthopedics", updated: "07/02/2026" }),
  row("hg8", "In Progress", "04/06/2026", { interpretation: "-", priority: "Routine", provider: ASSOCIATE_PROVIDER, facility: "Athelas Core Lab", updated: "07/02/2026" }),
  row("hg9", "Completed", "04/06/2026", { interpretation: "-", priority: "Routine", provider: ASSOCIATE_PROVIDER, facility: "Athelas Core Lab", updated: "07/03/2026" }),
  row("hg10", "In Progress", "04/06/2026", { interpretation: "-", priority: "Routine", provider: ASSOCIATE_PROVIDER, facility: "Athelas Core Lab", updated: "07/02/2026" }),
];

const MEDICATIONS: OrderRow[] = [
  row("m1", "Denied", "06/05/2026", {
    drug: "Bactrim DS",
    sig: "1",
    controlled: "Non-Ctrl",
    provider: PROVIDER.name,
    createdBy: CLINIC_ASSISTANT,
    quantity: "1",
    refills: "0",
    pharmacy: "Safeway Pharmacy",
  }),
  row("m2", "Denied", "02/24/2026", {
    drug: "Vitamin C",
    sig: "1 tablet of Vitamin C 100 mg by mouth daily",
    controlled: "Non-Ctrl",
    provider: PROVIDER.name,
    createdBy: ASSOCIATE_PROVIDER,
    quantity: "1",
    refills: "0",
    pharmacy: "CVS Pharmacy",
  }),
  row("m3", "Sent", "02/10/2026", {
    drug: "cephalexin",
    sig: "Take as directed",
    controlled: "Non-Ctrl",
    provider: PROVIDER.name,
    createdBy: CLINIC_ASSISTANT,
    quantity: "2",
    refills: "2",
    pharmacy: "CVS Pharmacy",
  }),
  row("m4", "PAPER_PRESCRIPTION", "10/30/2025", {
    drug: "Bactrim DS",
    sig: "Take as directed",
    controlled: "Non-Ctrl",
    provider: PROVIDER.name,
    createdBy: PROVIDER.name,
    quantity: "2",
    refills: "2",
    pharmacy: "Hale Orthopedics Pharmacy",
  }),
  row("m5", "RECORD", "10/28/2025", {
    drug: "Bactrim DS",
    sig: "Take as directed",
    controlled: "Non-Ctrl",
    provider: PROVIDER.name,
    createdBy: PROVIDER.name,
    quantity: "2",
    refills: "2",
    pharmacy: "Hale Orthopedics Pharmacy",
  }),
  row("m6", "Denied", "09/22/2025", {
    drug: "cephalexin",
    sig: "Take 1 capsule by mouth every 6 hours",
    controlled: "Non-Ctrl",
    provider: PROVIDER.name,
    createdBy: "-",
    quantity: "2",
    refills: "2",
    pharmacy: "CVS Pharmacy",
  }),
];

function StatusPill({ status }: { status: OrderStatus }) {
  if (status === "Cancelled" || status === "Denied") {
    return (
      <span className="inline-flex rounded-full bg-[#fde8e8] px-2.5 py-0.5 font-body text-[11px] font-medium text-[#c62828]">
        {status}
      </span>
    );
  }
  if (status === "In Progress" || status === "Completed") {
    return (
      <span className="inline-flex rounded-full bg-[#e6f4ea] px-2.5 py-0.5 font-body text-[11px] font-medium text-[#137333]">
        {status}
      </span>
    );
  }
  if (status === "PAPER_PRESCRIPTION" || status === "RECORD") {
    return (
      <span className="inline-flex rounded-full bg-[#ececec] px-2.5 py-0.5 font-body text-[11px] font-medium text-[#5f5f5f]">
        {status}
      </span>
    );
  }
  if (status === "Sent") {
    return (
      <span className="inline-flex rounded-full bg-[#e6f4ea] px-2.5 py-0.5 font-body text-[11px] font-medium text-[#137333]">
        Sent
      </span>
    );
  }
  return (
    <span className="inline-flex rounded bg-[#e8eeff] px-2 py-0.5 font-body text-[11px] font-medium text-[#454545]">
      Draft
    </span>
  );
}

function Pager({ count }: { count: number }) {
  return (
    <div className="flex h-10 items-center justify-end gap-5 border-t border-[#e6e6e6] px-4">
      <div className="flex items-center gap-2 font-body text-[11px] text-[#555]">
        <span>Rows per page:</span>
        <button type="button" className="flex h-7 items-center gap-1 rounded border border-[#dedede] bg-white px-2">
          10
          <Icon name="arrow_drop_down" size={15} />
        </button>
      </div>
      <span className="font-body text-[11px] text-[#555]">{count ? `1–${count} of ${count}` : "0–0 of 0"}</span>
      <div className="flex gap-3 text-[#c4c4c4]">
        <Icon name="chevron_left" size={17} />
        <Icon name="chevron_right" size={17} />
      </div>
    </div>
  );
}

function OrderTable({
  title,
  columns,
  rows,
  emptyMessage,
  actions = "default",
  groupLabel,
  pagerCount,
  groupByPatient = false,
}: {
  title: string;
  columns: Column[];
  rows: OrderRow[];
  emptyMessage?: string;
  actions?: "default" | "view" | "none";
  groupLabel?: string;
  pagerCount?: number;
  groupByPatient?: boolean;
}) {
  const showActions = actions !== "none";
  const colSpan = columns.length + (showActions ? 1 : 0);

  return (
    <section className="overflow-hidden rounded-lg border border-[#e6e6e6]">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="bg-[#f1f2f2] text-left">
              {showActions ? (
                <th
                  className="whitespace-nowrap px-3 py-2 font-body text-[12px] font-medium text-[#303030]"
                  style={{ minWidth: "108px" }}
                >
                  {title}
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-3 py-2 font-body text-[12px] font-medium text-[#303030]"
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="h-20 text-center font-body text-[13px] text-[#404040]"
                >
                  {emptyMessage ?? `No ${title.toLowerCase()} orders found`}
                </td>
              </tr>
            ) : (
              <>
                {groupLabel ? (
                  <tr className="border-t border-[#e6e6e6] bg-white">
                    <td colSpan={colSpan} className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Icon name="expand_less" size={18} className="text-[#555]" />
                        <span className="font-body text-[13px] font-semibold text-[#1a1a1a]">{groupLabel}</span>
                      </div>
                    </td>
                  </tr>
                ) : null}
                {rows.map((order, index) => (
                  <Fragment key={order.id}>
                  {groupByPatient && (index === 0 || rows[index - 1]?.patient !== order.patient) ? (
                    <tr key={`${order.id}-group`} className="border-t border-[#e6e6e6] bg-white">
                      <td colSpan={colSpan} className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Icon name="expand_less" size={18} className="text-[#555]" />
                          <span className="font-body text-[13px] font-semibold text-[#1a1a1a]">
                            {String(order.patient)} ({rows.filter((entry) => entry.patient === order.patient).length} medications)
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-t border-[#e6e6e6] hover:bg-[#fafafa]">
                    {showActions ? (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 text-[#1a1a1a]">
                          {actions === "view" ? (
                            <>
                              <button type="button" aria-label="View order">
                                <Icon name="visibility" size={15} />
                              </button>
                              <button type="button" aria-label="Download order">
                                <Icon name="arrow_downward" size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" aria-label="Edit order">
                                <Icon name="edit" size={15} />
                              </button>
                              <button type="button" aria-label="Comment on order">
                                <Icon name="chat" size={15} />
                              </button>
                              <button type="button" aria-label={order.status === "Sent" ? "Archive order" : "Delete order"}>
                                <Icon name={order.status === "Sent" ? "archive" : "delete"} size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap px-3 py-2.5 font-body text-[12px] text-[#303030] ${
                          column.key === "patient" ? "font-medium text-[#1132ee]" : ""
                        } ${column.key === "drug" ? "font-semibold" : ""}`}
                      >
                        {column.key === "status" ? (
                          <StatusPill status={order.status} />
                        ) : column.key === "controlled" && order.controlled ? (
                          <span className="inline-flex rounded-full bg-[#ececec] px-2.5 py-0.5 font-body text-[11px] font-medium text-[#5f5f5f]">
                            {order.controlled}
                          </span>
                        ) : (
                          <span className={column.key === "sig" || column.key === "pharmacy" ? "inline-block max-w-[180px] truncate align-bottom" : undefined}>
                            {order[column.key] || "-"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  </Fragment>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      <Pager count={pagerCount ?? rows.length} />
    </section>
  );
}

function MedicationSection({ siteWide = false }: { siteWide?: boolean }) {
  const [tab, setTab] = useState<"Controlled" | "Non-Controlled">("Non-Controlled");
  const rows = tab === "Non-Controlled"
    ? siteWide
      ? siteRows(MEDICATIONS, true).sort((a, b) => String(a.patient).localeCompare(String(b.patient)))
      : MEDICATIONS
    : [];

  return (
    <div>
      <div className="flex h-9 items-end gap-6">
        {(["Controlled", "Non-Controlled"] as const).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setTab(entry)}
            className={`h-9 border-b-2 px-1 font-body text-[12px] font-medium ${
              tab === entry ? "border-[#1132ee] text-[#1132ee]" : "border-transparent text-[#555]"
            }`}
          >
            {entry}
          </button>
        ))}
      </div>
      <OrderTable
        title="Status"
        columns={MEDICATION_COLUMNS}
        rows={rows}
        emptyMessage="No medication orders found"
        actions="none"
        groupLabel={!siteWide && rows.length ? `${patient} (${rows.length} medications)` : undefined}
        groupByPatient={siteWide}
        pagerCount={rows.length}
      />
    </div>
  );
}

export type OrdersPageProps = {
  siteWide?: boolean;
};

export default function OrdersPage({ siteWide = false }: OrdersPageProps) {
  const [statusTab, setStatusTab] = useState("All");
  const [orderOpen, setOrderOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [templateBuilderOpen, setTemplateBuilderOpen] = useState(false);
  const [manageTemplatesOpen, setManageTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<SavedTemplate[]>(INITIAL_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!templateMenuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!templateMenuRef.current?.contains(event.target as Node)) {
        setTemplateMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setTemplateMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [templateMenuOpen]);

  if (templateBuilderOpen) {
    return (
      <CustomTemplateBuilder
        initialName={editingTemplate?.name}
        initialContent={editingTemplate?.content}
        onCancel={() => {
          setTemplateBuilderOpen(false);
          setEditingTemplate(null);
        }}
        onSave={(template) => {
          setTemplates((current) => {
            if (editingTemplate) {
              return current.map((entry) =>
                entry.id === editingTemplate.id
                  ? { ...entry, name: template.name, content: template.content }
                  : entry,
              );
            }
            return [
              {
                id: `tpl-${Date.now()}`,
                name: template.name,
                content: template.content,
                archived: false,
              },
              ...current,
            ];
          });
          setTemplateBuilderOpen(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      {orderOpen ? <NewOrderDrawer onClose={() => setOrderOpen(false)} /> : null}
      {manageTemplatesOpen ? (
        <ManageTemplatesDrawer
          templates={templates}
          onClose={() => setManageTemplatesOpen(false)}
          onPreview={(template) => {
            setManageTemplatesOpen(false);
            setEditingTemplate(template);
            setTemplateBuilderOpen(true);
          }}
          onArchive={(id) =>
            setTemplates((current) =>
              current.map((template) => (template.id === id ? { ...template, archived: true } : template)),
            )
          }
          onRestore={(id) =>
            setTemplates((current) =>
              current.map((template) => (template.id === id ? { ...template, archived: false } : template)),
            )
          }
        />
      ) : null}
      <div className="flex w-full flex-col gap-4 px-4 py-4">
        <div className="flex items-center justify-between px-2">
          <h1 className="font-body text-[22px] font-medium leading-[28px] text-[#1a1a1a]">Orders</h1>
          <div className="flex items-center gap-2">
            <div ref={templateMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={templateMenuOpen}
                aria-haspopup="menu"
                onClick={() => setTemplateMenuOpen((open) => !open)}
                className="flex h-8 items-center gap-1 rounded-full border border-[#1132ee] bg-white px-3.5 text-[#1132ee]"
              >
                <Icon name="add" size={16} />
                <span className="font-body text-[13px] font-medium">Custom Order/Letter</span>
                <Icon name={templateMenuOpen ? "arrow_drop_up" : "arrow_drop_down"} size={18} />
              </button>
              {templateMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[210px] overflow-hidden rounded-lg bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setTemplateMenuOpen(false);
                      setEditingTemplate(null);
                      setTemplateBuilderOpen(true);
                    }}
                    className="flex h-10 w-full items-center px-4 text-left font-body text-[14px] text-[#1a1a1a] hover:bg-[#f5f5f5]"
                  >
                    Add Custom Template
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setTemplateMenuOpen(false);
                      setManageTemplatesOpen(true);
                    }}
                    className="flex h-10 w-full items-center px-4 text-left font-body text-[14px] text-[#1a1a1a] hover:bg-[#f5f5f5]"
                  >
                    Manage Templates
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="flex h-8 items-center gap-1 rounded-full bg-[#1132ee] px-4 text-white"
            >
              <Icon name="add" size={16} />
              <span className="font-body text-[13px] font-medium">Order</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="ml-1 flex h-8 w-fit items-center gap-1.5 rounded-full border border-[#e6e6e6] px-3"
        >
          <Icon name="filter_list" size={16} />
          <span className="font-body text-[12px] font-medium text-[#303030]">Filter</span>
        </button>

        <div className="flex items-end justify-between gap-4">
          <div className="flex shrink-0 gap-5">
            {["All", "Draft", "Outbound", "Inbound", "Archived"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`border-b-2 px-1 pb-2 font-body text-[12px] font-medium ${
                  statusTab === tab ? "border-[#1132ee] text-[#1132ee]" : "border-transparent text-[#555]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="scrollbar-thin flex min-w-0 items-center gap-1 overflow-x-auto rounded border border-[#e6e6e6] p-1">
            <span className="px-1 font-body text-[10px] text-[#666]">Order Types</span>
            {ORDER_TYPES.map((type) => (
              <span
                key={type}
                className="inline-flex shrink-0 items-center gap-1 rounded bg-[#f1f1f1] px-2 py-1 font-body text-[10px] text-[#303030]"
              >
                {type}
                <Icon name="close" size={11} />
              </span>
            ))}
          </div>
        </div>

        <MedicationSection siteWide={siteWide} />
        <OrderTable title="Referral" columns={REFERRAL_COLUMNS} rows={siteWide ? siteRows(REFERRALS) : REFERRALS} />
        <OrderTable title="Imaging" columns={IMAGING_COLUMNS} rows={siteWide ? siteRows(IMAGING) : IMAGING} />
        <OrderTable title="Lab" columns={LAB_COLUMNS} rows={siteWide ? siteRows(LABS) : LABS} />
        <OrderTable title="HealthGorilla Labs" columns={HEALTH_GORILLA_COLUMNS} rows={siteWide ? siteRows(HEALTH_GORILLA) : HEALTH_GORILLA} actions="view" />
        <OrderTable title="DME" columns={DME_COLUMNS} rows={siteWide ? siteRows(DME) : DME} />
        <OrderTable title="Procedures & Injections" columns={PROCEDURE_COLUMNS} rows={siteWide ? siteRows(PROCEDURES) : PROCEDURES} />
        <OrderTable
          title="Custom"
          columns={SHARED_COLUMNS}
          rows={[]}
          emptyMessage="No custom orders found"
        />
      </div>
    </div>
  );
}
