import { useState } from "react";
import Icon from "./Icon";
import AssistantEmblem from "./AssistantEmblem";
import { PROVIDER } from "../data/chart";

const SHORTCUTS = ["Summarize chart", "Draft note", "Check auth status"];

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function AssistantColumn() {
  const [draft, setDraft] = useState("");
  const firstName = PROVIDER.name.split(" ")[0];

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col items-center">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-16">
        <AssistantEmblem size={120} />

        <div className="flex w-full flex-col items-center gap-1.5 text-center">
          <p className="whitespace-nowrap font-ui text-[22px] font-semibold leading-none text-[#1f1f1f]">
            {greeting()} {firstName}
          </p>
          <p className="w-full font-ui text-[13px] leading-[1.6] text-[#454545]">How can I help you today?</p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          {SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut}
              type="button"
              className="flex h-7 items-center justify-center gap-1 rounded-lg bg-[rgba(17,50,238,0.05)] px-2 font-ui text-[13px] font-medium leading-[1.6] text-[#1132ee] hover:bg-[rgba(17,50,238,0.1)]"
            >
              <Icon name="circle" size={18} className="text-[#1132ee]" />
              {shortcut}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-3">
        <button type="button" className="font-ui text-[13px] leading-[1.6] text-[#1132ee] hover:underline">
          Teach me about this page
        </button>

        <div className="flex w-full flex-col gap-1 rounded-xl bg-black/5">
          <div className="flex min-h-[40px] w-full items-start pl-3 pr-2 pt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={1}
              placeholder="Ask anything..."
              aria-label="Ask Athelas"
              className="min-h-[28px] w-full resize-none bg-transparent font-body text-[14px] leading-[22px] text-[#1f1f1f] outline-none placeholder:text-[#737373]"
            />
          </div>

          <div className="flex w-full items-center gap-1.5 p-1.5">
            <div className="flex flex-1 items-center">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Attach a file"
              >
                <Icon name="attach_file" size={18} className="text-[#454545]" />
              </button>
            </div>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full hover:bg-[rgba(17,50,238,0.08)]"
              aria-label="Dictate"
            >
              <Icon name="mic" size={18} className="text-[#1132ee]" />
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full bg-[#1132ee] hover:bg-[#0f2dd7]"
              aria-label="Send"
            >
              <Icon name="arrow_upward" size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
