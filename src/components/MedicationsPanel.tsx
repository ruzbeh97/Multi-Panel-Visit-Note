import { useRef, useState } from "react";
import Badge, { type Tone } from "./Badge";
import Icon from "./Icon";
import MedicationDetails from "./MedicationDetails";
import FilterMenuPopover from "./FilterMenuPopover";
import { PanelShell, RailGroup, RailRow, ShowMore, TabGroup } from "./chartPanelUi";
import { MEDICATIONS } from "../data/chart";

const MEDICATION_TABS = ["Prescribed", "Medication History", "Pending Approvals"];

type Medication = (typeof MEDICATIONS)[number];
type MedicationStatus = Medication["status"];

const MEDICATION_STATUS_GROUPS: MedicationStatus[] = ["Active", "Expired", "Discontinued"];

function medicationsForTab(tab: string) {
  if (tab === "Medication History") return MEDICATIONS.filter((med) => med.status !== "Active");
  if (tab === "Pending Approvals") return MEDICATIONS.filter((med) => med.pendingApproval);
  return MEDICATIONS;
}

const FILL_STATUS_TONES: Record<string, { tone: Tone; icon: string }> = {
  Received: { tone: "green", icon: "check" },
  Denied: { tone: "red", icon: "cancel" },
};

const FILL_STATUS_FILTERS = ["Received", "Denied"];

function MedicationRow({
  medication,
  accent,
  open,
  onToggle,
}: {
  medication: Medication;
  accent: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const fill = FILL_STATUS_TONES[medication.fillStatus] ?? { tone: "grey" as Tone, icon: "" };

  return (
    <RailRow accent={accent}>
      <>
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name="pill" size={20} className="text-[#2fd0c0]" />
          </span>
          <span className="min-w-0 flex-1 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {medication.name}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "View"} ${medication.name} details`}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
              open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
          >
            <Icon name="visibility" size={20} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
          </button>
        </div>

        <div className="flex w-full items-center gap-2 pt-1.5">
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{medication.date}</span>
          <Badge tone={fill.tone} label={medication.fillStatus} icon={fill.icon || undefined} />
        </div>

        {open && <MedicationDetails medication={medication} />}
      </>
    </RailRow>
  );
}

export default function MedicationsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(MEDICATION_TABS[0]);
  const [openMedication, setOpenMedication] = useState<string | null>(null);
  const [closedStatuses, setClosedStatuses] = useState<MedicationStatus[]>([]);
  const [query, setQuery] = useState("");
  const [fillStatuses, setFillStatuses] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const search = query.trim().toLowerCase();
  const medications = medicationsForTab(tab)
    .filter((med) => (fillStatuses.length > 0 ? fillStatuses.includes(med.fillStatus) : true))
    .filter((med) =>
      search ? [med.name, med.date, med.fillStatus].some((field) => field.toLowerCase().includes(search)) : true,
    );

  const groups = MEDICATION_STATUS_GROUPS.map((status) => ({
    status,
    medications: medications.filter((med) => med.status === status),
  })).filter((group) => group.medications.length > 0);

  function toggleStatus(status: MedicationStatus) {
    setClosedStatuses((prev) =>
      prev.includes(status) ? prev.filter((entry) => entry !== status) : [...prev, status],
    );
  }

  return (
    <PanelShell
      title="Medications"
      onClose={onClose}
      toolbar={
        <>
          <div className="flex w-full items-center gap-1.5">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
              <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search medications"
                className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
                  aria-label="Clear medication search"
                >
                  <Icon name="close" size={16} className="text-[#666666]" />
                </button>
              )}
            </label>
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-haspopup="dialog"
              aria-expanded={filterOpen}
              className={`relative flex size-7 shrink-0 items-center justify-center rounded-full ${
                filterOpen || fillStatuses.length > 0 ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
              }`}
              aria-label="Filter medications"
            >
              <Icon
                name="filter_alt"
                size={20}
                className={filterOpen || fillStatuses.length > 0 ? "text-[#1132ee]" : "text-[#1a1a1a]"}
              />
              {fillStatuses.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#1132ee] font-body text-[10px] font-medium leading-none text-white">
                  {fillStatuses.length}
                </span>
              )}
            </button>
          </div>
          <TabGroup tabs={MEDICATION_TABS} active={tab} onSelect={setTab} />
          <div className="flex w-full flex-wrap items-center gap-2">
            {MEDICATION_STATUS_GROUPS.map((status) => (
              <span key={status} className="font-body text-[14px] leading-[22px] text-[#666666]">
                {MEDICATIONS.filter((med) => med.status === status).length} {status}
              </span>
            ))}
          </div>
        </>
      }
    >
      {filterOpen && filterButtonRef.current && (
        <FilterMenuPopover
          anchor={filterButtonRef.current}
          ariaLabel="Filter medications"
          options={FILL_STATUS_FILTERS.map((status) => ({
            value: status,
            kind: "Fill Status",
            checked: fillStatuses.includes(status),
          }))}
          onToggle={(option) =>
            setFillStatuses((current) =>
              current.includes(option.value)
                ? current.filter((entry) => entry !== option.value)
                : [...current, option.value],
            )
          }
          onClose={() => setFilterOpen(false)}
        />
      )}

      <div className="flex w-full flex-col items-start">
        {groups.map((group) => (
          <RailGroup
            key={group.status}
            label={group.status}
            count={group.medications.length}
            open={!closedStatuses.includes(group.status)}
            accent={group.status === "Active"}
            onToggle={() => toggleStatus(group.status)}
          >
            {group.medications.map((med) => (
              <MedicationRow
                key={med.name}
                medication={med}
                accent={group.status === "Active"}
                open={openMedication === med.name}
                onToggle={() => setOpenMedication((current) => (current === med.name ? null : med.name))}
              />
            ))}
          </RailGroup>
        ))}

        {groups.length === 0 && (
          <p className="w-full py-4 font-body text-[14px] leading-[22px] text-[#666666]">No medications to show.</p>
        )}
      </div>

      <ShowMore />
    </PanelShell>
  );
}
