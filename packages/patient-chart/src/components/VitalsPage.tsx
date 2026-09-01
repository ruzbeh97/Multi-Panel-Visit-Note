import Icon from "./Icon";

const COLUMNS = [
  "Recorded At",
  "Height",
  "Weight",
  "BMI",
  "Temperature (°F)",
  "Blood Pressure",
  "Heart Rate (bpm)",
  "Heart Rhythm",
  "Respiratory Rate (breaths/min)",
  "O2 Saturation (%)",
  "Inhaled O2 Concentration (%)",
  "Comments",
];

const VITALS = [
  {
    recordedAt: "08/10/2026 11:50 AM",
    height: "-",
    weight: "184 lbs",
    bmi: "-",
    temperature: "-",
    bloodPressure: "-",
    heartRate: "-",
    heartRhythm: "-",
    respiratoryRate: "-",
    o2Saturation: "-",
    inhaledO2: "-",
    comments: "-",
  },
];

const KEYS = [
  "recordedAt",
  "height",
  "weight",
  "bmi",
  "temperature",
  "bloodPressure",
  "heartRate",
  "heartRhythm",
  "respiratoryRate",
  "o2Saturation",
  "inhaledO2",
  "comments",
] as const;

export default function VitalsPage() {
  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      <div className="flex w-full flex-col px-6 py-5">
        <h1 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">Vitals History</h1>

        <div className="mt-4 overflow-hidden rounded-lg border border-[#e6e6e6]">
          <div className="scrollbar-thin w-full overflow-x-auto">
            <table className="w-full min-w-[1400px] border-collapse">
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
                </tr>
              </thead>
              <tbody>
                {VITALS.map((row) => (
                  <tr key={row.recordedAt} className="border-t border-[#e6e6e6]">
                    {KEYS.map((key) => (
                      <td
                        key={key}
                        className="whitespace-nowrap px-4 py-3 font-body text-[13px] leading-[18px] text-[#1a1a1a]"
                      >
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex h-10 items-center justify-end gap-5 border-t border-[#e6e6e6] px-4">
            <div className="flex items-center gap-2 font-body text-[11px] text-[#555]">
              <span>Rows per page:</span>
              <button type="button" className="flex h-7 items-center gap-1 rounded border border-[#dedede] bg-white px-2">
                10
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
