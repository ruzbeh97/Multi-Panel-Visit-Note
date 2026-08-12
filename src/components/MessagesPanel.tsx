import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { CARE_TEAM_THREAD, MESSAGE_AUTHOR } from "../data/chart";

const AVATAR_TONES = {
  pink: "bg-[rgba(232,22,92,0.12)]",
  blue: "bg-[rgba(27,131,228,0.16)]",
  orange: "bg-[#ffad33]",
};

type Message = {
  author: string;
  initials: string;
  tone: keyof typeof AVATAR_TONES;
  date: string;
  time: string;
  mention?: string;
  body: string;
  mine?: boolean;
};

function formatTime(date: Date) {
  return date
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(/^(\d):/, "0$1:");
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function splitMention(text: string) {
  const match = text.match(/^(@[\w'-]+(?: [\w'-]+)?)\s*([\s\S]*)$/);
  return match ? { mention: match[1], body: match[2] } : { mention: undefined, body: text };
}

function MessageGroup({ message }: { message: Message }) {
  const mine = message.mine ?? false;

  return (
    <div className={`flex w-full flex-col gap-1 ${mine ? "items-end" : ""}`}>
      <span className={`font-body text-[13px] leading-[20px] text-[#666666] ${mine ? "pr-14" : "pl-14"}`}>
        {message.author}
      </span>
      <div className={`flex items-center gap-2 ${mine ? "flex-row-reverse" : ""}`}>
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full font-body text-[17px] font-medium text-[#1a1a1a] ${
            AVATAR_TONES[message.tone]
          }`}
        >
          {message.initials}
        </span>
        <div className="max-w-[224px] rounded-xl bg-[#f2f2f2] px-4 py-2.5">
          {message.mention && (
            <p className="font-body text-[15px] font-medium leading-[26px] text-[#1a1a1a]">{message.mention}</p>
          )}
          <p className="font-body text-[15px] leading-[26px] text-[#1a1a1a]">{message.body}</p>
        </div>
      </div>
      <span className="font-body text-[13px] leading-[20px] text-[#666666]">{message.time}</span>
    </div>
  );
}

export default function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>(CARE_TEAM_THREAD);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    setMessages((current) => [
      ...current,
      { ...MESSAGE_AUTHOR, ...splitMention(text), date: formatDate(now), time: formatTime(now), mine: true },
    ]);
    setDraft("");
  }

  return (
    <aside className="sticky top-0 flex h-full w-full min-w-0 flex-col overflow-hidden border-l border-[#e6e6e6] bg-white px-6">
      <div
        ref={listRef}
        className="scrollbar-thin flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto px-4 pt-5"
      >
        {messages.map((message, i) => (
          <div key={i} className="flex w-full flex-col gap-3">
            {message.date !== messages[i - 1]?.date && (
              <span className="w-full text-center font-body text-[13px] leading-[20px] text-[#666666]">
                {message.date}
              </span>
            )}
            <MessageGroup message={message} />
          </div>
        ))}
      </div>

      <div className="mb-10 mt-4 flex w-full shrink-0 flex-col gap-4 rounded-xl border border-[#e6e6e6] px-4 pb-3 pt-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Send a message"
          aria-label="Send a message about this patient"
          className="min-h-[62px] w-full resize-none bg-transparent font-body text-[15px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666666]"
        />
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Attach a file"
            >
              <Icon name="upload" size={20} className="text-[#1a1a1a]" />
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Change who can see this message"
            >
              <Icon name="language" size={20} className="text-[#1a1a1a]" />
            </button>
          </div>
          <button
            type="button"
            onClick={send}
            className="flex h-[30px] items-center justify-center rounded-full bg-[#1132ee] px-5 font-body text-[14px] font-medium text-white hover:bg-[#0f2dd7]"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
