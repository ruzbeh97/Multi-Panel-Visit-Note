import { useState } from "react";
import Icon from "./Icon";
import PdfViewer from "./pdf/PdfViewer";
import { timelineDocKey } from "./pdf/AttachmentDocument";
import { CHART_TIMELINE } from "../data/chart";

const ITEM_META = {
  order: { icon: "outgoing_mail", label: "Order", tone: "bg-[#fff4e5] text-[#b45f06]" },
  medication: { icon: "medication", label: "Medication", tone: "bg-[#fcebef] text-[#c3315d]" },
  attachment: { icon: "attach_file", label: "Attachment", tone: "bg-[#edf1ff] text-[#1132ee]" },
} as const;

type TimelineItem = (typeof CHART_TIMELINE)[number]["items"][number];

function documentFor(item: TimelineItem) {
  return item.type === "attachment" ? item.file : timelineDocKey(item);
}

function SubEvent({ item, last }: { item: TimelineItem; last: boolean }) {
  const meta = ITEM_META[item.type];
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="relative flex w-full items-start gap-3 pb-4 pl-10">
        {!last && !open && <span className="absolute left-[51px] top-8 h-[calc(100%-20px)] w-px bg-[#d9d9d9]" />}
        <span className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
          <Icon name={meta.icon} size={14} />
        </span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "View"} ${item.title} as a PDF`}
          className="min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left hover:bg-[#f4f6ff]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-body text-[14px] font-medium leading-[20px] text-[#1a1a1a]">{item.title}</p>
              <p className="truncate font-body text-[13px] leading-[19px] text-[#666666]">{item.detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="font-body text-[12px] leading-[18px] text-[#808080]">{item.date}</span>
              <Icon name={open ? "visibility_off" : "visibility"} size={18} className="text-[#1132ee]" />
            </div>
          </div>
          <span className="mt-1 inline-flex rounded-full bg-[#f5f5f5] px-2 py-0.5 font-body text-[11px] font-medium leading-[16px] text-[#666666]">
            {meta.label}
          </span>
        </button>
      </div>

      {open && (
        <div className="w-full pb-4">
          <PdfViewer fileName={documentFor(item)} />
        </div>
      )}
    </div>
  );
}

function Appointment({
  appointment,
  last,
}: {
  appointment: (typeof CHART_TIMELINE)[number];
  last: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative flex w-full flex-col">
      {!last && <span className="absolute left-[11px] top-7 h-full w-px bg-[#a0adf8]" />}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="group relative z-10 flex w-full items-start gap-3 rounded-lg py-2 text-left hover:bg-[#f8f8f8]"
      >
        <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1132ee] ring-4 ring-white">
          <Icon name="calendar_today" size={14} className="text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-body text-[15px] font-bold leading-[22px] text-[#1a1a1a]">{appointment.title}</h3>
              <p className="font-body text-[13px] leading-[19px] text-[#666666]">{appointment.provider}</p>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              <div className="flex flex-col items-end">
                <span className="font-body text-[13px] font-medium leading-[19px] text-[#1a1a1a]">{appointment.date}</span>
                <span className="font-body text-[12px] leading-[18px] text-[#808080]">{appointment.time}</span>
              </div>
              <Icon
                name={open ? "expand_less" : "expand_more"}
                size={20}
                className="mt-0.5 text-[#666666] group-hover:text-[#1a1a1a]"
              />
            </div>
          </div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[rgba(79,176,115,0.12)] px-2 py-0.5 font-body text-[11px] font-medium leading-[16px] text-[#27864b]">
            <span className="size-1.5 rounded-full bg-[#4fb073]" />
            {appointment.status}
          </span>
        </div>
      </button>

      {open && (
        <div className="pt-2">
          {appointment.items.map((item, index) => (
            <SubEvent key={`${item.type}-${item.title}`} item={item} last={index === appointment.items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChartTimelinePanel() {
  const [newestFirst, setNewestFirst] = useState(true);
  const appointments = newestFirst ? CHART_TIMELINE : [...CHART_TIMELINE].reverse();

  return (
    <aside className="scrollbar-thin sticky top-0 ml-4 flex h-full w-[484px] shrink-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white">
      <div className="sticky top-0 z-20 flex w-full shrink-0 flex-col bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#e6e6e6] px-5 py-4">
          <div>
            <h2 className="font-body text-[20px] font-medium leading-[28px] text-[#1a1a1a]">Patient Timeline</h2>
            <p className="font-body text-[13px] leading-[19px] text-[#666666]">Appointments and related chart activity</p>
          </div>
          <button
            type="button"
            onClick={() => setNewestFirst((current) => !current)}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#1132ee] px-3 font-body text-[13px] font-medium text-[#1132ee] hover:bg-[rgba(17,50,238,0.06)]"
            aria-label={`Sort ${newestFirst ? "oldest" : "newest"} first`}
          >
            <Icon name="swap_vert" size={18} />
            {newestFirst ? "Newest" : "Oldest"}
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-[#e6e6e6] px-5 py-3">
          <Icon name="filter_list" size={18} className="text-[#666666]" />
          <span className="font-body text-[13px] leading-[19px] text-[#666666]">All chart activity</span>
          <span className="ml-auto rounded-full bg-[#f1f3fe] px-2 py-0.5 font-body text-[12px] font-medium text-[#1132ee]">
            {CHART_TIMELINE.length} appointments
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col px-5 pb-10 pt-3">
        {appointments.map((appointment, index) => (
          <Appointment
            key={appointment.id}
            appointment={appointment}
            last={index === appointments.length - 1}
          />
        ))}
      </div>
    </aside>
  );
}
