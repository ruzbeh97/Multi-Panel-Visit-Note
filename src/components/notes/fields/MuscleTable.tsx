import { useState } from "react";
import { useNoteReadOnly } from "../readOnly";

type MuscleTableProps = {
  rows: string[];
  initialLeft: string[];
  initialRight: string[];
};

export default function MuscleTable({ rows, initialLeft, initialRight }: MuscleTableProps) {
  const readOnly = useNoteReadOnly();
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);

  function update(side: "left" | "right", index: number, value: string) {
    const setter = side === "left" ? setLeft : setRight;
    setter((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex w-full flex-1 items-center overflow-clip rounded-lg border border-[#e6e6e6]">
        <div className="flex w-[140px] shrink-0 flex-col items-start">
          <div className="h-8 w-full border-b border-[#e6e6e6] bg-[#f7f7f7]" />
          {rows.map((row) => (
            <div
              key={row}
              className="flex h-8 w-full shrink-0 items-center border-b border-r border-[#e6e6e6] bg-[#f7f7f7] px-[18px] py-0.5"
            >
              <span className="flex-1 truncate font-body text-[14px] font-medium leading-[18px] text-[#1a1a1a]">{row}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-center">
          {(["left", "right"] as const).map((side) => (
            <div key={side} className="flex flex-1 flex-col items-start">
              <div className="flex h-8 w-full shrink-0 items-center border-b border-[#e6e6e6] bg-[#f7f7f7] px-[18px] py-0.5">
                <span className="flex-1 font-body text-[14px] font-medium leading-[18px] text-[#1a1a1a]">
                  {side === "left" ? "Left" : "Right"}
                </span>
              </div>
              {rows.map((row, i) => (
                <div key={row} className="flex h-8 w-full shrink-0 items-center border-b border-[#e6e6e6] py-0.5 pl-3 pr-[18px]">
                  <input
                    value={side === "left" ? left[i] : right[i]}
                    onChange={(e) => update(side, i, e.target.value)}
                    placeholder="add"
                    readOnly={readOnly}
                    className={`h-7 w-full min-w-[40px] rounded-lg px-1.5 font-body text-[14px] leading-[24px] outline-none placeholder:text-[#808080] ${
                      readOnly
                        ? "bg-transparent text-[#666]"
                        : "bg-white/80 text-[#1a1a1a] focus:ring-2 focus:ring-[#1132ee]/30"
                    }`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
