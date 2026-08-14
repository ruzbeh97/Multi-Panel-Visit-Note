import { useState } from "react";
import Icon from "../Icon";
import { PREVIOUS_VISIT_SUMMARY } from "../../data/chart";

export default function AiSummaryCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex w-full flex-col items-start rounded-xl border border-[#a0adf8] bg-white">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" size={20} filled className="text-[#1132ee]" />
          <span className="font-body text-[16px] font-medium leading-[24px] text-[#1132ee]">AI Summary</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex items-center gap-1 rounded-lg px-1 py-0.5 hover:bg-black/5"
        >
          <span className="font-body text-[14px] leading-[20px] text-[#6b6b6b]">{open ? "Hide" : "Show"}</span>
          <Icon
            name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            size={18}
            className="text-[#6b6b6b]"
          />
        </button>
      </div>

      {open && (
        <div className="flex w-full flex-col items-start border-t border-[#e6e6e6] px-4 pb-4 pt-3">
          <h3 className="font-body text-[16px] font-bold leading-[24px] text-black">
            {PREVIOUS_VISIT_SUMMARY.heading}
          </h3>
          <dl className="flex w-full flex-col items-start">
            {PREVIOUS_VISIT_SUMMARY.rows.map((row, index) => (
              <div
                key={row.label}
                className={`flex w-full items-start gap-6 py-3 ${
                  index === 0 ? "" : "border-t border-[#f0f0f0]"
                }`}
              >
                <dt className="w-[140px] shrink-0 font-body text-[14px] font-semibold leading-[20px] text-black">
                  {row.label}
                </dt>
                <dd className="min-w-0 flex-1 font-body text-[14px] leading-[20px] text-[#1a1a1a]">{row.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
