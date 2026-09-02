import Icon from "./Icon";
import { ENCOUNTERS, PATIENT, type Encounter } from "../data/chart";

type VisitsNotesPageProps = {
  onOpenCurrentVisit: () => void;
  onOpenPastVisit: (noteId: string) => void;
};

type VisitRow = {
  id: string;
  date: string;
  time: string;
  status: "Checked In" | "Completed" | "Scheduled";
  caseName: string;
  provider: string;
  clinicalNoteType: string;
  appointmentType: string;
  insurance: string;
  facility: string;
  caseId: string;
  current?: boolean;
};

function formatTime(time: string) {
  return time.replace(/\s*(am|pm)$/i, " $1").toUpperCase();
}

function visitRow(encounter: Encounter, index: number): VisitRow {
  return {
    id: encounter.id,
    date: encounter.date,
    time: formatTime(encounter.time),
    status: index === 0 ? "Checked In" : "Completed",
    caseName: encounter.caseName,
    provider: encounter.provider,
    clinicalNoteType: encounter.visitType === "Surgery" ? "Operative Note" : "Progress Note",
    appointmentType: encounter.title,
    insurance: PATIENT.insurance,
    facility: encounter.visitType === "Surgery" ? "Riverside Surgical Center" : "MAIN OFFICE",
    caseId: index < 5 ? "4051798" : "3883389",
    current: index === 0,
  };
}

// Office-note encounters can be opened from this table. The surgical encounter
// has an operative report rather than a visit note, so it is not listed here.
const VISITS = ENCOUNTERS.filter((encounter) => encounter.visitType !== "Surgery").map(visitRow);

// Actions stay reachable while the rest of the wide table scrolls sideways.
const stickyActions = "sticky right-0";

// Chrome ignores box-shadow on cells of a border-collapse table, so the edge
// shadow is drawn as a gradient sitting just outside the pinned column.
function StickyEdgeShadow() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 -left-2 w-2 bg-gradient-to-l from-black/15 to-transparent"
    />
  );
}

function StatusChip({ status }: { status: VisitRow["status"] }) {
  const tone =
    status === "Completed"
      ? "bg-[#edf5e8] text-[#527041]"
      : status === "Scheduled"
        ? "bg-[#eef3f8] text-[#536779]"
        : "bg-[#eaf2f8] text-[#4d6577]";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 font-body text-[11px] font-medium ${tone}`}>
      {status}
    </span>
  );
}

function SmallChip({ children, green = false }: { children: string; green?: boolean }) {
  return (
    <span
      className={`inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 font-body text-[10px] font-medium ${
        green ? "bg-[#dff5ec] text-[#28735b]" : "bg-[#dceef8] text-[#265c78]"
      }`}
    >
      {children}
    </span>
  );
}

export default function VisitsNotesPage({ onOpenCurrentVisit, onOpenPastVisit }: VisitsNotesPageProps) {
  function openVisit(visit: VisitRow) {
    if (visit.current) onOpenCurrentVisit();
    else onOpenPastVisit(visit.id);
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 self-stretch flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <h1 className="font-body text-[18px] font-medium leading-7 text-[#1a1a1a]">All Visits &amp; Notes</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Print visits"
            className="flex size-8 items-center justify-center rounded-full hover:bg-black/5"
          >
            <Icon name="print" size={18} className="text-[#303030]" />
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-full border border-[#e6e6e6] bg-white px-3"
          >
            <Icon name="filter_list" size={16} className="text-[#303030]" />
            <span className="font-body text-[12px] font-medium text-[#303030]">Filters</span>
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-full border border-[#e6e6e6] bg-white px-3"
          >
            <Icon name="add" size={15} className="text-[#303030]" />
            <span className="font-body text-[12px] font-medium text-[#303030]">Care Note</span>
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-full bg-[#1132ee] px-3.5 text-white"
          >
            <Icon name="add" size={15} />
            <span className="font-body text-[12px] font-medium">Book Visit</span>
          </button>
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 min-w-0 flex-1 overflow-auto px-3">
        <table className="w-full min-w-[1480px] border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="h-9 border-y border-[#e6e6e6] bg-[#f1f2f2] text-left">
              <th className="w-10 px-3">
                <input type="checkbox" aria-label="Select all visits" className="size-3.5 accent-[#1132ee]" />
              </th>
              <th className="min-w-[150px] px-2 font-body text-[11px] font-medium text-[#303030]">
                <span className="flex items-center justify-between gap-2">
                  Date/Time
                  <Icon name="arrow_downward" size={14} />
                </span>
              </th>
              <th className="min-w-[105px] px-2 font-body text-[11px] font-medium text-[#303030]">Status</th>
              <th className="min-w-[120px] px-2 font-body text-[11px] font-medium text-[#303030]">Case</th>
              <th className="min-w-[145px] px-2 font-body text-[11px] font-medium text-[#303030]">Provider</th>
              <th className="min-w-[145px] px-2 font-body text-[11px] font-medium text-[#303030]">Clinical Note Type</th>
              <th className="min-w-[190px] px-2 font-body text-[11px] font-medium text-[#303030]">Appointment Type</th>
              <th className="min-w-[150px] px-2 font-body text-[11px] font-medium text-[#303030]">Insurance</th>
              <th className="min-w-[115px] px-2 font-body text-[11px] font-medium text-[#303030]">Facility</th>
              <th className="min-w-[90px] px-2 font-body text-[11px] font-medium text-[#303030]">Case ID</th>
              <th className="min-w-[90px] px-2 font-body text-[11px] font-medium text-[#303030]">Case</th>
              <th className="min-w-[130px] px-2 font-body text-[11px] font-medium text-[#303030]">Appointment Type</th>
              <th
                className={`min-w-[145px] px-2 font-body text-[11px] font-medium text-[#303030] ${stickyActions} z-30 bg-[#f1f2f2]`}
              >
                <StickyEdgeShadow />
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {VISITS.map((visit, index) => (
              <tr
                key={visit.id}
                className={`group h-11 border-b border-[#e6e6e6] hover:bg-[#f7f9ff] ${
                  index === 0 ? "bg-[#fafcff]" : "bg-white"
                }`}
              >
                <td className="px-3">
                  <input type="checkbox" aria-label={`Select ${visit.date}`} className="size-3.5 accent-[#1132ee]" />
                </td>
                <td className="whitespace-nowrap px-2 font-body text-[11px] text-[#303030]">
                  <span className="flex items-center gap-1.5">
                    {visit.date} {visit.time}
                    <Icon name="calendar_today" size={13} className="text-[#303030]" />
                  </span>
                </td>
                <td className="px-2"><StatusChip status={visit.status} /></td>
                <td className="max-w-[120px] truncate px-2 font-body text-[11px] text-[#303030]">{visit.caseName}</td>
                <td className="whitespace-nowrap px-2 font-body text-[11px] text-[#303030]">{visit.provider}</td>
                <td className="whitespace-nowrap px-2 font-body text-[11px] text-[#303030]">{visit.clinicalNoteType}</td>
                <td className="max-w-[190px] truncate px-2 font-body text-[11px] text-[#303030]">{visit.appointmentType}</td>
                <td className="max-w-[150px] truncate px-2 font-body text-[11px] text-[#303030]">{visit.insurance}</td>
                <td className="whitespace-nowrap px-2 font-body text-[11px] text-[#303030]">{visit.facility}</td>
                <td className="px-2 font-body text-[11px] text-[#303030]">{visit.caseId}</td>
                <td className="px-2"><SmallChip>{visit.caseName}</SmallChip></td>
                <td className="px-2"><SmallChip green={index === VISITS.length - 1}>Ortho</SmallChip></td>
                <td
                  className={`border-b border-[#e6e6e6] px-2 ${stickyActions} z-10 group-hover:bg-[#f7f9ff] ${
                    index === 0 ? "bg-[#fafcff]" : "bg-white"
                  }`}
                >
                  <StickyEdgeShadow />
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Edit visit" className="flex size-6 items-center justify-center">
                      <Icon name="edit" size={15} className="text-[#303030]" />
                    </button>
                    <button type="button" aria-label="Download note" className="flex size-6 items-center justify-center">
                      <Icon name="download" size={15} className="text-[#a0a0a0]" />
                    </button>
                    <button type="button" aria-label="More actions" className="flex size-6 items-center justify-center">
                      <Icon name="more_vert" size={16} className="text-[#303030]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openVisit(visit)}
                      className="font-body text-[11px] font-medium text-[#1132ee] hover:underline"
                    >
                      Open
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex h-10 shrink-0 items-center justify-end gap-4 border-t border-[#e6e6e6] px-4">
        <span className="font-body text-[11px] text-[#666]">Rows per page:</span>
        <button type="button" className="flex h-7 items-center gap-1 rounded border border-[#e6e6e6] px-2">
          <span className="font-body text-[11px] text-[#303030]">25</span>
          <Icon name="arrow_drop_down" size={15} className="text-[#666]" />
        </button>
        <span className="font-body text-[11px] text-[#666]">1–{VISITS.length} of {VISITS.length}</span>
        <Icon name="chevron_left" size={16} className="text-[#b8b8b8]" />
        <Icon name="chevron_right" size={16} className="text-[#b8b8b8]" />
      </div>
    </div>
  );
}
