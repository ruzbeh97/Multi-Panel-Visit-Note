import Icon from "./Icon";
import { CASE, DIAGNOSIS_CODES } from "../data/chart";

const COLUMNS = [
  "Name",
  "ICD-10 Code",
  "Type",
  "Onset Date",
  "Recorded",
  "Resolution Date",
  "Verification Status",
  "Clinical Status",
];

const PROBLEMS = [
  {
    code: "S83.511D",
    name: DIAGNOSIS_CODES["S83.511D"].description,
    type: "Problem List",
    onsetDate: CASE.dateOfInjury,
    recorded: CASE.initialEval,
    resolutionDate: "-",
    verification: "Confirmed",
    clinicalStatus: "Active",
  },
];

export default function ProblemListPage() {
  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      <div className="flex w-full flex-col px-6 py-5">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">Problem List</h1>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-full bg-[#1132ee] pl-3 pr-3.5 hover:bg-[#0e28be]"
          >
            <Icon name="add" size={16} className="text-white" />
            <span className="font-body text-[13px] font-medium leading-[18px] text-white">Add Problem</span>
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-[#e6e6e6]">
          <div className="scrollbar-thin w-full overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse">
              <thead>
                <tr className="bg-[#f7f7f7] text-left">
                  {COLUMNS.map((label) => (
                    <th
                      key={label}
                      className="whitespace-nowrap px-4 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="w-[72px] px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {PROBLEMS.map((row) => (
                  <tr key={row.code} className="border-t border-[#e6e6e6]">
                    <td className="px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">{row.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8eeff] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#1132ee]">
                        <Icon name="description" size={14} className="text-[#1132ee]" />
                        {row.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.onsetDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.recorded}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.resolutionDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.verification}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.clinicalStatus}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2 text-[#1a1a1a]">
                        <button type="button" aria-label="Edit problem" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="edit" size={16} />
                        </button>
                        <button type="button" aria-label="Delete problem" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="delete" size={16} />
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
              <button type="button" className="flex h-7 items-center gap-1 rounded border border-[#dedede] bg-white px-2">
                5
                <Icon name="arrow_drop_down" size={15} />
              </button>
            </div>
            <span className="font-body text-[11px] text-[#555]">1–1 of 1</span>
            <div className="flex gap-3 text-[#c4c4c4]">
              <Icon name="chevron_left" size={17} />
              <Icon name="chevron_right" size={17} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
