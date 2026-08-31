import { useState } from "react";
import Icon from "./Icon";
import { CloseRightPanelButton } from "./chartPanelUi";
import { ACTIVITY_EVENTS, AUDIT_LOG } from "../data/chart";

const TABS = ["Activity Tracker", "Audit Log"] as const;
const PER_PAGE_OPTIONS = [10, 25, 50];

type Event = (typeof ACTIVITY_EVENTS)[number];

function ActivityRow({ event }: { event: Event }) {
  return (
    <div className="flex w-full items-start gap-3 py-3">
      <div className="flex w-[76px] shrink-0 flex-col items-end pt-0.5">
        <span className="text-right font-body text-[14px] leading-[22px] text-[#666666]">{event.date}</span>
        <span className="text-right font-body text-[14px] leading-[22px] text-[#666666]">{event.time}</span>
      </div>

      <span className="mt-2 block size-2.5 shrink-0 rounded-full bg-[#1a1a1a]" />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="font-body text-[16px] font-bold leading-[24px] text-[#1a1a1a]">{event.title}</p>
        <p className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">
          Performed by <span className="font-bold">{event.performedBy}</span>
        </p>
        <div className="flex flex-col">
          <span className="font-body text-[14px] font-bold leading-[22px] text-[#1a1a1a]">Description</span>
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{event.description}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
          aria-label={`Edit ${event.title}`}
        >
          <Icon name="edit" size={20} className="text-[#1a1a1a]" />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
          aria-label={`Archive ${event.title}`}
        >
          <Icon name="archive" size={20} className="text-[#1a1a1a]" />
        </button>
      </div>
    </div>
  );
}

function PageButton({ icon, label, disabled }: { icon: string; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      className={`flex size-7 items-center justify-center rounded-full ${
        disabled ? "cursor-default" : "hover:bg-black/5"
      }`}
    >
      <Icon name={icon} size={20} className={disabled ? "text-[#c7c7c7]" : "text-[#1a1a1a]"} />
    </button>
  );
}

function ActivityTracker() {
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0]);
  const shown = ACTIVITY_EVENTS.slice(0, perPage);
  const onlyPage = shown.length === ACTIVITY_EVENTS.length;

  return (
    <div className="flex w-full flex-col pb-10">
      <div className="flex w-full flex-col pt-2">
        {shown.map((event) => (
          <ActivityRow key={`${event.date}-${event.title}`} event={event} />
        ))}
      </div>

      <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 pl-4 pt-6">
        <div className="flex items-center gap-2">
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">Events per page:</span>
          <div className="relative flex h-9 w-[74px] items-center rounded-md border border-[#e6e6e6] bg-white pl-3 pr-1">
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              aria-label="Events per page"
              className="w-full appearance-none bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Icon name="arrow_drop_down" size={20} className="pointer-events-none text-[#1a1a1a]" />
          </div>
        </div>

        <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">
          1-{shown.length} of {ACTIVITY_EVENTS.length}
        </span>

        <div className="flex items-center gap-1">
          <PageButton icon="first_page" label="First page" disabled />
          <PageButton icon="chevron_left" label="Previous page" disabled />
          <PageButton icon="chevron_right" label="Next page" disabled={onlyPage} />
          <PageButton icon="last_page" label="Last page" disabled={onlyPage} />
        </div>
      </div>
    </div>
  );
}

function AuditLog() {
  return (
    <div className="flex w-full flex-col pb-10 pt-4">
      <h3 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">
        Logs of users viewing patient&apos;s information
      </h3>

      {AUDIT_LOG.map((group) => (
        <div key={group.label} className="flex w-full flex-col pt-4">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="font-body text-[14px] leading-[22px] text-[#666666]">{group.label}</span>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
              aria-label={`Filter ${group.label} by time`}
            >
              <Icon name="schedule" size={20} className="text-[#1132ee]" />
            </button>
          </div>

          <div className="flex w-full flex-col pt-2">
            {group.entries.map((entry, index) => (
              <div key={`${group.label}-${index}`} className="flex w-full items-start gap-2">
                <div className="flex w-5 shrink-0 flex-col items-center">
                  <Icon name="visibility" size={18} className="text-[#1a1a1a]" />
                  <span className="h-3 w-px bg-[#e6e6e6]" />
                </div>
                <p className="min-w-0 flex-1 font-body text-[14px] leading-[22px] text-[#1a1a1a]">
                  <span className="font-bold">{entry.user}</span> viewed{" "}
                  <span className="font-bold">{entry.resource}</span>{" "}
                  <span className="text-[#666666]">• {entry.when}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PatientActivityPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white">
      <div className="flex w-full shrink-0 items-center justify-between gap-3 border-b border-[#e6e6e6] px-4 pb-4 pt-5">
        <h2 className="min-w-0 font-body text-[22px] font-medium leading-[30px] text-[#1a1a1a]">Patient Activity</h2>

        <div className="flex shrink-0 items-center gap-2">
        {tab === "Activity Tracker" && (
          <>
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#1132ee] pl-3 pr-4 font-body text-[14px] font-medium leading-[22px] text-white hover:bg-[#0f2dd7]"
            >
              <Icon name="add" size={18} className="text-white" />
              Manual Entry
            </button>
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-full border border-[#1132ee] px-4 font-body text-[14px] font-medium leading-[22px] text-[#1132ee] hover:bg-[rgba(17,50,238,0.06)]"
            >
              <Icon name="tune" size={18} className="text-[#1132ee]" />
              Filters
            </button>
          </>
        )}
          <CloseRightPanelButton onClose={onClose} />
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center gap-6 border-b border-[#e6e6e6] px-4">
        {TABS.map((label) => {
          const active = label === tab;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              aria-current={active}
              className={`flex items-center border-b-2 py-3 font-body text-[15px] font-medium leading-[22px] ${
                active ? "border-[#1132ee] text-[#1132ee]" : "border-transparent text-[#666666] hover:text-[#1a1a1a]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="w-full px-4">{tab === "Activity Tracker" ? <ActivityTracker /> : <AuditLog />}</div>
    </aside>
  );
}
