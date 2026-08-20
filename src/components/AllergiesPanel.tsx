import { useState } from "react";
import Badge, { type Tone } from "./Badge";
import Icon from "./Icon";
import { PanelShell, RailGroup, RailRow } from "./chartPanelUi";
import { ALLERGIES } from "../data/chart";

const SEVERITY_TONES: Record<string, Tone> = { Severe: "red", Moderate: "yellow", Mild: "grey" };

function AllergyRow({
  allergy,
  accent,
}: {
  allergy: (typeof ALLERGIES)[number];
  accent: boolean;
}) {
  return (
    <RailRow accent={accent}>
      <>
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name="sick" size={20} className="text-[#1a1a1a]" />
          </span>
          <span className="min-w-0 flex-1 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {allergy.name}
          </span>
        </div>
        <div className="flex w-full items-center gap-2 pt-1.5">
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{allergy.date}</span>
          <Badge tone={SEVERITY_TONES[allergy.severity] ?? "grey"} label={allergy.severity} />
        </div>
      </>
    </RailRow>
  );
}

export default function AllergiesPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [closedStatuses, setClosedStatuses] = useState<string[]>([]);

  const search = query.trim().toLowerCase();
  const allergies = ALLERGIES.filter((allergy) =>
    search
      ? [allergy.name, allergy.date, allergy.severity, allergy.status].some((field) =>
          field.toLowerCase().includes(search),
        )
      : true,
  );

  const groups = (["Active", "Inactive"] as const)
    .map((status) => ({
      status,
      allergies: allergies.filter((allergy) => allergy.status === status),
    }))
    .filter((group) => group.allergies.length > 0);

  function toggleStatus(status: string) {
    setClosedStatuses((prev) =>
      prev.includes(status) ? prev.filter((entry) => entry !== status) : [...prev, status],
    );
  }

  return (
    <PanelShell
      title="Allergies"
      onClose={onClose}
      toolbar={
        <div className="flex w-full items-center gap-1.5">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
            <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search allergies"
              className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
                aria-label="Clear allergy search"
              >
                <Icon name="close" size={16} className="text-[#666666]" />
              </button>
            )}
          </label>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="Filter allergies"
          >
            <Icon name="filter_alt" size={20} className="text-[#1a1a1a]" />
          </button>
        </div>
      }
    >
      <div className="flex w-full flex-col items-start gap-2">
        <div className="flex w-full flex-wrap items-center gap-2">
          {(["Active", "Inactive"] as const).map((status) => (
            <span key={status} className="font-body text-[14px] leading-[22px] text-[#666666]">
              {ALLERGIES.filter((allergy) => allergy.status === status).length} {status}
            </span>
          ))}
        </div>

        <div className="flex w-full flex-col items-start">
          {groups.map((group) => (
            <RailGroup
              key={group.status}
              label={group.status}
              count={group.allergies.length}
              open={!closedStatuses.includes(group.status)}
              accent={group.status === "Active"}
              onToggle={() => toggleStatus(group.status)}
            >
              {group.allergies.map((allergy) => (
                <AllergyRow key={allergy.name} allergy={allergy} accent={group.status === "Active"} />
              ))}
            </RailGroup>
          ))}

          {groups.length === 0 && (
            <p className="w-full py-4 font-body text-[14px] leading-[22px] text-[#666666]">No allergies to show.</p>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
