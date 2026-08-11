import { useState } from "react";
import Icon from "../../Icon";
import { useNoteReadOnly } from "../readOnly";

const PROGRESS_OPTIONS = ["0%", "15%", "25%", "50%", "75%", "90%", "100%", "Complete"];

type GoalCardProps = {
  title: string;
  description: string;
  initialValue: string;
  previousVisit: string;
  initialProgress: string;
  goalTarget: string;
};

export default function GoalCard({ title, description, initialValue, previousVisit, initialProgress, goalTarget }: GoalCardProps) {
  const readOnly = useNoteReadOnly();
  const [progress, setProgress] = useState(initialProgress);

  return (
    <div className="flex min-h-[132px] w-full items-start gap-4 rounded-lg">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start">
          <p
            className={`w-full font-body text-[16px] font-medium leading-[24px] ${
              readOnly ? "text-[#808080]" : "text-[#0a1e8f]"
            }`}
          >
            {title}
          </p>
          <div className="flex items-start gap-4 font-body text-[14px] leading-[20px] text-[#666]">
            <span className="w-20 shrink-0">Description:</span>
            <span className="min-w-0">{description}</span>
          </div>
          <div className="flex items-start gap-4 font-body text-[14px] leading-[20px] text-[#666]">
            <span className="w-20 shrink-0">Initial Value:</span>
            <span className="min-w-0">{initialValue}</span>
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <p className="whitespace-nowrap font-body text-[14px] leading-[20px] text-[#666]">Previous visit: {previousVisit}</p>
          <div className="flex w-full max-w-[407px] flex-wrap items-center gap-1.5">
            {PROGRESS_OPTIONS.map((option) => {
              const selected = option === progress;
              const tone = readOnly
                ? selected
                  ? "bg-[#e6e6e6] text-black"
                  : "bg-[#f7f7f7] text-[#666]"
                : selected
                  ? "bg-[rgba(17,50,238,0.08)] text-[#1132ee]"
                  : "bg-[#f7f7f7] text-[#666] hover:bg-black/5";
              return (
                <button
                  key={option}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setProgress(option)}
                  className={`flex min-w-[28px] items-center justify-center rounded px-1.5 py-0.5 font-body text-[14px] leading-[24px] ${tone}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-4 self-stretch">
        <div className="flex items-center gap-1.5 whitespace-nowrap font-body text-[14px] leading-[22px]">
          <span className="font-bold text-[#1a1a1a]">Goal Target:</span>
          <span className="text-[#666]">{goalTarget}</span>
        </div>
        <div className="flex items-end gap-10">
          <div className="flex items-center gap-2">
            <button className="flex items-start rounded-full p-1 hover:bg-black/5" aria-label="Add comment">
              <Icon name="add_comment" size={20} className="text-[#1a1a1a]" />
            </button>
            <button className="flex items-start justify-center rounded-lg bg-[rgba(15,45,215,0.08)] p-1" aria-label="View chart">
              <Icon name="show_chart" size={20} className="text-[#1132ee]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
