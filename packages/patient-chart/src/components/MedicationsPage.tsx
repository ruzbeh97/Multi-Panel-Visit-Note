import { useRef, useState } from "react";
import Icon from "./Icon";
import FilterMenuPopover from "./FilterMenuPopover";
import { MEDICATIONS } from "../data/chart";

const TABS = ["Prescribed", "Medication History", "Pending Approvals"] as const;
type Tab = (typeof TABS)[number];

const FILL_STATUSES = ["Received", "Denied", "Paper Prescription", "Record"] as const;

type PharmacyStatus = (typeof FILL_STATUSES)[number];

type TableMed = {
  id: string;
  date: string;
  drugName: string;
  description: string;
  activity: (typeof MEDICATIONS)[number]["status"];
  internalNote: string;
  sig: string;
  pharmacyName: string;
  pharmacyStatus: PharmacyStatus;
  selectable: boolean;
  canPrint: boolean;
  canCancel: boolean;
  pendingApproval: boolean;
};

function shortDrugName(name: string) {
  return name.replace(/\s+\d.+$/, "").replace(/\s+tablet$/i, "");
}

function pharmacyStatusFor(med: (typeof MEDICATIONS)[number], index: number): PharmacyStatus {
  if (med.fillStatus === "Denied") return "Denied";
  if (index === 2) return "Paper Prescription";
  if (index === 4) return "Record";
  return "Received";
}

function pharmacyNameFor(med: (typeof MEDICATIONS)[number], index: number) {
  if (index === 2 || index === 3) return "Placeholder Pharmacy";
  if (index === 1) return "Lakeside Pharmacy #2197";
  if (index === 5) return "Lakeside Pharmacy #1568";
  return med.pharmacy.name;
}

const TABLE_MEDS: TableMed[] = MEDICATIONS.map((med, index) => ({
  id: `${med.name}-${med.date}`,
  date: med.date,
  drugName: shortDrugName(med.name),
  description: med.name,
  activity: med.status,
  internalNote: "No Internal Notes",
  sig: med.sig,
  pharmacyName: pharmacyNameFor(med, index),
  pharmacyStatus: pharmacyStatusFor(med, index),
  selectable: index >= 2,
  canPrint: index === 2 || index === 3,
  canCancel: med.status !== "Discontinued" || index !== 4,
  pendingApproval: med.pendingApproval,
}));

function medsForTab(tab: Tab) {
  if (tab === "Medication History") return TABLE_MEDS.filter((med) => med.activity !== "Active");
  if (tab === "Pending Approvals") return TABLE_MEDS.filter((med) => med.pendingApproval);
  return TABLE_MEDS;
}

function ActivityBadge({ status }: { status: TableMed["activity"] }) {
  const styles = {
    Active: { wrap: "bg-[rgba(79,176,115,0.12)] text-[#1f6b3a]", icon: "check", iconClass: "text-[#4fb073]" },
    Expired: { wrap: "bg-[rgba(128,128,128,0.12)] text-[#454545]", icon: "cancel", iconClass: "text-[#808080]" },
    Discontinued: { wrap: "bg-[rgba(230,25,42,0.12)] text-[#b42318]", icon: "cancel", iconClass: "text-[#e6192a]" },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full py-[5px] pl-2 pr-3 font-body text-[12px] font-medium leading-[18px] ${styles.wrap}`}
    >
      <Icon name={styles.icon} size={16} filled className={styles.iconClass} />
      {status}
    </span>
  );
}

function PharmacyStatusBadge({ status }: { status: PharmacyStatus }) {
  const styles = {
    Received: {
      wrap: "bg-[rgba(79,176,115,0.12)] text-[#1f6b3a]",
      icon: "check",
      iconClass: "text-[#4fb073]",
    },
    Denied: {
      wrap: "bg-[rgba(230,25,42,0.12)] text-[#b42318]",
      icon: "cancel",
      iconClass: "text-[#e6192a]",
    },
    "Paper Prescription": {
      wrap: "bg-[rgba(79,176,115,0.12)] text-[#1f6b3a]",
      icon: "description",
      iconClass: "text-[#4fb073]",
    },
    Record: {
      wrap: "bg-[rgba(27,131,228,0.12)] text-[#0f5fad]",
      icon: "warning",
      iconClass: "text-[#1b83e4]",
    },
  }[status];

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full py-[5px] pl-2 pr-3 font-body text-[12px] font-medium leading-[18px] ${styles.wrap}`}
    >
      <Icon name={styles.icon} size={16} filled className={`shrink-0 ${styles.iconClass}`} />
      <span className="truncate">{status}</span>
    </span>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex size-7 cursor-pointer items-center justify-center">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} aria-label={label} />
      <span
        aria-hidden
        className={`flex size-[18px] items-center justify-center rounded-[2px] border-2 ${
          checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#666666] bg-white"
        }`}
      >
        {checked && <Icon name="check" size={14} className="text-white" />}
      </span>
    </label>
  );
}

function ActionButton({
  icon,
  label,
  disabled = false,
}: {
  icon: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex size-7 items-center justify-center rounded-full ${
        disabled ? "cursor-not-allowed opacity-35" : "hover:bg-black/5"
      }`}
    >
      <Icon name={icon} size={18} className="text-[#454545]" />
    </button>
  );
}

export default function MedicationsPage() {
  const [tab, setTab] = useState<Tab>("Prescribed");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [fillFilters, setFillFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const search = query.trim().toLowerCase();
  const rows = medsForTab(tab).filter((med) => {
    if (fillFilters.length > 0 && !fillFilters.includes(med.pharmacyStatus)) return false;
    if (!search) return true;
    return [med.drugName, med.description, med.sig, med.pharmacyName, med.activity].some((field) =>
      field.toLowerCase().includes(search),
    );
  });

  function toggleRow(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  return (
    <div className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col items-start overflow-y-auto bg-white px-6 py-4">
      <div className="flex w-full items-center gap-6 border-b border-[#e6e6e6]">
        {TABS.map((entry) => {
          const active = entry === tab;
          return (
            <button
              key={entry}
              type="button"
              onClick={() => setTab(entry)}
              className={`shrink-0 pb-2.5 font-body text-[14px] font-medium leading-[22px] ${
                active ? "border-b-2 border-[#1132ee] text-[#1132ee]" : "text-[#666666] hover:text-[#1a1a1a]"
              }`}
            >
              {entry}
            </button>
          );
        })}
      </div>

      <div className="flex w-full items-center justify-between gap-3 pt-4">
        <label className="flex h-9 w-[280px] items-center gap-2 rounded-[6px] border border-[#e6e6e6] bg-white pl-3 pr-2">
          <Icon name="search" size={20} className="shrink-0 text-[#666666]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Drug Name"
            aria-label="Search drug name"
            className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none placeholder:text-[#999999]"
          />
        </label>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e6e6e6] px-3 hover:bg-[#f7f7f7]"
          >
            <Icon name="description" size={18} className="text-[#1a1a1a]" />
            <span className="font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">PDMP</span>
          </button>
          <button
            type="button"
            aria-label="Medication history"
            className="flex size-9 items-center justify-center rounded-lg hover:bg-black/5"
          >
            <Icon name="history" size={20} className="text-[#1a1a1a]" />
          </button>
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            aria-label="Filter medications"
            aria-haspopup="dialog"
            aria-expanded={filterOpen}
            className={`relative flex size-9 items-center justify-center rounded-lg ${
              filterOpen || fillFilters.length > 0 ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
          >
            <Icon
              name="tune"
              size={20}
              className={filterOpen || fillFilters.length > 0 ? "text-[#1132ee]" : "text-[#1a1a1a]"}
            />
            {fillFilters.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#1132ee] font-body text-[10px] font-medium leading-none text-white">
                {fillFilters.length}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Download medications"
            className="flex size-9 items-center justify-center rounded-lg hover:bg-black/5"
          >
            <Icon name="download" size={20} className="text-[#1a1a1a]" />
          </button>
          <button
            type="button"
            className="ml-1 flex h-9 items-center gap-1 rounded-full bg-[#1132ee] pl-4 pr-3 hover:bg-[#0f2dd7]"
          >
            <span className="font-body text-[14px] font-medium leading-[22px] text-white">Create New</span>
            <Icon name="arrow_drop_down" size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="mt-4 w-full overflow-hidden rounded-lg border border-[#e6e6e6]">
        <div className="scrollbar-thin w-full overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7] text-left">
                <th className="w-10 px-2 py-2.5" />
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">Actions</th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">Date</th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                  Drug Name
                </th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                  Description
                </th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">Activity</th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                  Internal Note
                </th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">SIG</th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                  Pharmacy Name
                </th>
                <th className="px-2 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                  Pharmacy Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-10 text-center font-body text-[14px] leading-[22px] text-[#666666]"
                  >
                    No medications match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map((med) => (
                  <tr key={med.id} className="border-t border-[#e6e6e6] align-top">
                    <td className="px-2 py-3">
                      {med.selectable ? (
                        <Checkbox
                          checked={selected.includes(med.id)}
                          onChange={() => toggleRow(med.id)}
                          label={`Select ${med.drugName}`}
                        />
                      ) : (
                        <span className="flex size-7 items-center justify-center font-body text-[16px] text-[#808080]">
                          –
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <ActionButton icon="visibility" label={`View ${med.drugName}`} />
                        <ActionButton icon="autorenew" label={`Renew ${med.drugName}`} />
                        <ActionButton
                          icon="cancel"
                          label={`Cancel ${med.drugName}`}
                          disabled={!med.canCancel}
                        />
                        {med.canPrint && <ActionButton icon="print" label={`Print ${med.drugName}`} />}
                        <ActionButton icon="open_in_new" label={`Open ${med.drugName}`} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                      {med.date}
                    </td>
                    <td className="px-2 py-3 font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
                      {med.drugName}
                    </td>
                    <td className="max-w-[220px] px-2 py-3 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                      {med.description}
                    </td>
                    <td className="px-2 py-3">
                      <ActivityBadge status={med.activity} />
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                      {med.internalNote}
                    </td>
                    <td className="max-w-[240px] px-2 py-3 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                      {med.sig}
                    </td>
                    <td className="px-2 py-3 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                      {med.pharmacyName}
                    </td>
                    <td className="px-2 py-3">
                      <PharmacyStatusBadge status={med.pharmacyStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filterOpen && filterButtonRef.current && (
        <FilterMenuPopover
          anchor={filterButtonRef.current}
          ariaLabel="Filter medications"
          options={FILL_STATUSES.map((status) => ({
            value: status,
            kind: "Pharmacy Status",
            checked: fillFilters.includes(status),
          }))}
          onToggle={(option) =>
            setFillFilters((current) =>
              current.includes(option.value)
                ? current.filter((entry) => entry !== option.value)
                : [...current, option.value],
            )
          }
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
