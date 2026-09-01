import Icon from "./Icon";
import { ALLERGIES } from "../data/chart";

type AllergyRow = {
  name: string;
  reaction: string;
  onsetDate: string;
  status: "Active" | "Inactive";
  severity: "Severe" | "Moderate" | "Mild";
  type: string;
  reason: string;
};

const ROWS: AllergyRow[] = ALLERGIES.map((allergy, index) => ({
  name: allergy.name === "Penicillin" ? "Penicillins" : allergy.name,
  reaction: index === 0 ? "Swelling (finding)" : "",
  onsetDate: allergy.date,
  status: allergy.status,
  severity: allergy.severity === "Mild" ? "Moderate" : allergy.severity,
  type: "",
  reason: "",
}));

function StatusBadge({ value }: { value: AllergyRow["status"] }) {
  if (value === "Active") {
    return (
      <span className="inline-flex rounded-full bg-[#e8eeff] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#1132ee]">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-[#f1f1f1] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#454545]">
      Inactive
    </span>
  );
}

function SeverityBadge({ value }: { value: AllergyRow["severity"] }) {
  if (value === "Severe") {
    return (
      <span className="inline-flex rounded-full bg-[#fde8e8] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#c62828]">
        Severe
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-[#fff4d6] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#b45309]">
      {value}
    </span>
  );
}

export default function AllergiesPage() {
  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      <div className="flex w-full flex-col gap-8 px-6 py-5">
        <section className="overflow-hidden rounded-lg border border-[#e6e6e6]">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">All Allergens</h1>
            <button
              type="button"
              className="flex h-8 items-center gap-1 rounded-full bg-[#1132ee] pl-3 pr-3.5 hover:bg-[#0e28be]"
            >
              <Icon name="add" size={16} className="text-white" />
              <span className="font-body text-[13px] font-medium leading-[18px] text-white">Add Allergen</span>
            </button>
          </div>

          <div className="scrollbar-thin w-full overflow-x-auto border-t border-[#e6e6e6]">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-[#f7f7f7] text-left">
                  {["Allergen", "Reactions", "Onset Date", "Clinical Status", "Severity", "Type", "Reason"].map(
                    (label) => (
                      <th
                        key={label}
                        className="px-4 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]"
                      >
                        {label}
                      </th>
                    ),
                  )}
                  <th className="w-[72px] px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.name} className="border-t border-[#e6e6e6]">
                    <td className="px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">{row.name}</td>
                    <td className="px-4 py-3">
                      {row.reaction ? (
                        <span className="inline-flex max-w-[160px] truncate rounded-full bg-[#f1f1f1] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#454545]">
                          {row.reaction}
                        </span>
                      ) : (
                        <span className="font-body text-[13px] text-[#1a1a1a]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">{row.onsetDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge value={row.severity} />
                    </td>
                    <td className="px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">{row.type || "-"}</td>
                    <td className="px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.reason || "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2 text-[#1a1a1a]">
                        <button type="button" aria-label={`Edit ${row.name}`} className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="edit" size={16} />
                        </button>
                        <button type="button" aria-label={`Confirm ${row.name}`} className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="check_circle" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex h-10 items-center justify-end gap-5 border-t border-[#e6e6e6] px-4">
            <div className="flex items-center gap-2 font-body text-[11px] text-[#555]">
              <span>Rows per page:</span>
              <button type="button" className="flex h-7 items-center gap-1 rounded border border-[#dedede] px-2">
                10
                <Icon name="arrow_drop_down" size={15} />
              </button>
            </div>
            <span className="font-body text-[11px] text-[#555]">1–{ROWS.length} of {ROWS.length}</span>
            <div className="flex gap-3 text-[#c4c4c4]">
              <Icon name="chevron_left" size={17} />
              <Icon name="chevron_right" size={17} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-1.5">
            <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Allergy Notes</h2>
            <button type="button" aria-label="Edit allergy notes" className="rounded p-0.5 hover:bg-black/5">
              <Icon name="edit" size={16} className="text-[#1a1a1a]" />
            </button>
          </div>
          <p className="mt-2 font-body text-[13px] leading-[20px] text-[#404040]">No allergy notes.</p>
        </section>
      </div>
    </div>
  );
}
