import Icon from "./Icon";

const COLUMNS = [
  "Vaccine Name",
  "Administration Date",
  "Status",
  "Route",
  "Dose",
  "Expiration Date",
  "Manufacturer",
  "Lot #",
  "Reason Not Done",
];

const IMMUNIZATIONS = [
  {
    name: "Influenza, seasonal, injectable",
    administered: "08/10/2026 11:50 AM",
    status: "Completed",
    route: "Intramuscular",
    dose: "0.5 mL",
    expiration: "06/30/2027 12:00 AM",
    manufacturer: "Sanofi Pasteur",
    lot: "FL-482193",
    reasonNotDone: "-",
  },
];

export default function ImmunizationsPage() {
  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      <div className="flex w-full flex-col px-6 py-5">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">Immunization History</h1>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-full bg-[#1132ee] pl-3 pr-3.5 hover:bg-[#0e28be]"
          >
            <Icon name="add" size={16} className="text-white" />
            <span className="font-body text-[13px] font-medium leading-[18px] text-white">Add Immunization</span>
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-[#e6e6e6]">
          <div className="scrollbar-thin w-full overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
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
                  <th className="w-[88px] px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {IMMUNIZATIONS.map((row) => (
                  <tr key={row.lot} className="border-t border-[#e6e6e6]">
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.administered}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#e6f4ea] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#137333]">
                        {row.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.route}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.dose}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.expiration}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.manufacturer}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.lot}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                      {row.reasonNotDone}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2 border-l border-[#e6e6e6] pl-3 text-[#1a1a1a]">
                        <button type="button" aria-label="Edit immunization" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="edit" size={16} />
                        </button>
                        <button type="button" aria-label="Delete immunization" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
