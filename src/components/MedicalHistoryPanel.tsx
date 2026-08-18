import { useState, type ReactNode } from "react";
import Badge, { type Tone } from "./Badge";
import Icon from "./Icon";
import MedicationDetails from "./MedicationDetails";
import {
  ALLERGIES,
  CASE,
  DIAGNOSIS_ENCOUNTERS,
  DIAGNOSIS_CODES,
  DIAGNOSIS_HISTORY,
  LATEST_DIAGNOSIS_VISIT_COUNT,
  LATEST_DIAGNOSIS_VISITS,
  MEDICATIONS,
  type DiagnosisRecord,
  type DiagnosisRelevance,
} from "../data/chart";

const SEVERITY_TONES: Record<string, Tone> = { Severe: "red", Moderate: "yellow", Mild: "grey" };

const DIAGNOSIS_TABS = ["By Diagnosis", "By Visit"];

const latestVisitHint = (() => {
  const newest = LATEST_DIAGNOSIS_VISITS[0]?.date;
  const oldest = LATEST_DIAGNOSIS_VISITS[LATEST_DIAGNOSIS_VISITS.length - 1]?.date;
  if (!newest || !oldest) return `Coded in the last ${LATEST_DIAGNOSIS_VISIT_COUNT} visits`;
  if (newest === oldest) return `Last coded on ${newest}`;
  return `Last coded ${oldest} – ${newest}`;
})();

// The left rail is the at-a-glance signal for how recently a code was used.
const RELEVANCE_GROUPS: {
  key: DiagnosisRelevance;
  label: string;
  hint: string;
  rail: string;
  labelColor: string;
  collapsible: boolean;
}[] = [
  {
    key: "latest",
    label: "Used In Latest Notes",
    hint: latestVisitHint,
    rail: "bg-[#1132ee]",
    labelColor: "text-[#1132ee]",
    collapsible: false,
  },
  {
    key: "older",
    label: "Older Diagnosis",
    hint: `Not coded in the last ${LATEST_DIAGNOSIS_VISIT_COUNT} visits`,
    rail: "bg-[#9aa4b2]",
    labelColor: "text-[#1a1a1a]",
    collapsible: true,
  },
];

const MEDICATION_TABS = ["Prescribed", "Medication History", "Pending Approvals"];

type Medication = (typeof MEDICATIONS)[number];
type MedicationStatus = Medication["status"];

// Newest first within a status so the most recent prescription reads first.
const MEDICATION_STATUS_GROUPS: MedicationStatus[] = ["Active", "Expired", "Discontinued"];

function medicationsForTab(tab: string) {
  // "Medication History" is the record of what the patient is no longer taking.
  if (tab === "Medication History") return MEDICATIONS.filter((med) => med.status !== "Active");
  if (tab === "Pending Approvals") return MEDICATIONS.filter((med) => med.pendingApproval);
  return MEDICATIONS;
}

// The pharmacy's response to the prescription, shown beside the written date.
const FILL_STATUS_TONES: Record<string, { tone: Tone; icon: string }> = {
  Received: { tone: "green", icon: "check" },
  Denied: { tone: "red", icon: "cancel" },
};

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex items-center gap-1 py-2">
      <span className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">{title}</span>
      <Icon name={open ? "expand_less" : "expand_more"} size={24} className="text-[#1a1a1a]" />
    </button>
  );
}

function ShowMore() {
  return (
    <div className="flex w-full items-center justify-end py-2">
      <button
        type="button"
        className="flex h-7 items-center rounded-md px-2 font-body text-[14px] font-medium leading-[22px] text-[#1132ee] hover:bg-[rgba(17,50,238,0.08)]"
      >
        Show More
      </button>
    </div>
  );
}

function TabGroup({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect: (tab: string) => void }) {
  return (
    <div className="flex items-center gap-[2px] rounded-lg bg-[#f2f2f2] p-[2px]">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={`flex h-7 items-center justify-center rounded-md px-[10px] font-body text-[14px] font-medium leading-[24px] ${
            active === tab
              ? "bg-white text-[#1132ee] shadow-[0px_0px_2px_rgba(0,0,0,0.03),0px_1px_0.5px_rgba(0,0,0,0.08)]"
              : "text-[#666666]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

const diagnosisRowId = (code: string) => `diagnosis-${code.replace(".", "-")}`;

function DiagnosisRow({
  record,
  open,
  onToggle,
}: {
  record: DiagnosisRecord;
  open: boolean;
  onToggle: () => void;
}) {
  const visitCount = record.encounters.length;
  const rail = RELEVANCE_GROUPS.find((group) => group.key === record.relevance)?.rail ?? "bg-transparent";
  const muted = record.relevance === "older";

  return (
    <div id={diagnosisRowId(record.code)} className="flex w-full items-stretch gap-3 border-b border-[#e6e6e6]">
      <span aria-hidden className={`w-[2px] shrink-0 rounded-full ${rail}`} />

      <div className="flex min-w-0 flex-1 flex-col py-3">
        <div className="flex w-full items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={`font-body text-[14px] font-medium leading-[22px] ${muted ? "text-[#454545]" : "text-[#1a1a1a]"}`}
              >
                {record.code}
              </span>
              <span className="shrink-0 font-body text-[13px] leading-[18px] text-[#666666]">
                {record.recencyLabel}
              </span>
            </div>
            <p className={`font-body text-[14px] leading-[22px] ${muted ? "text-[#454545]" : "text-[#1a1a1a]"}`}>
              {record.description}
            </p>
            <span className="font-body text-[13px] leading-[18px] text-[#666666]">
              First noted {record.firstNoted} · Last coded {record.lastAddressed}
              {record.caseName !== CASE.name && ` · ${record.caseName}`}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} the ${visitCount} visit${
              visitCount === 1 ? "" : "s"
            } that addressed ${record.code}`}
            className={`flex shrink-0 items-center gap-0.5 rounded-md py-0.5 pl-2 pr-1 font-body text-[13px] font-medium leading-[18px] hover:bg-[rgba(17,50,238,0.08)] ${
              open ? "bg-[rgba(17,50,238,0.08)] text-[#1132ee]" : "text-[#666666]"
            }`}
          >
            {visitCount} {visitCount === 1 ? "visit" : "visits"}
            <Icon name={open ? "expand_less" : "expand_more"} size={18} />
          </button>
        </div>

        {open && (
          <div className="mt-2 flex w-full flex-col gap-1 border-l-2 border-[#e6e6e6] pl-3">
            {record.encounters.map((visit) => (
              <div key={`${visit.date}-${visit.type}`} className="flex w-full items-baseline gap-2">
                <span className="w-[86px] shrink-0 font-body text-[13px] leading-[20px] text-[#666666]">
                  {visit.date}
                </span>
                <span className="min-w-0 flex-1 font-body text-[13px] leading-[20px] text-[#1a1a1a]">
                  {visit.type} · {visit.provider}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RelevanceHeader({
  label,
  hint,
  count,
  rail,
  labelColor,
  open,
  onToggle,
}: {
  label: string;
  hint: string;
  count: number;
  rail: string;
  labelColor: string;
  open?: boolean;
  onToggle?: () => void;
}) {
  const content = (
    <>
      <span aria-hidden className={`h-[14px] w-[2px] shrink-0 rounded-full ${rail}`} />
      <span className={`font-body text-[13px] font-medium leading-[18px] ${labelColor}`}>
        {label} ({count})
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-body text-[13px] leading-[18px] text-[#666666]">
        {hint}
      </span>
      {onToggle && <Icon name={open ? "expand_less" : "expand_more"} size={18} className="text-[#666666]" />}
    </>
  );

  if (!onToggle) {
    return <div className="flex w-full items-center gap-2 pb-1 pt-4">{content}</div>;
  }

  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-2 pb-1 pt-4">
      {content}
    </button>
  );
}

type DiagnosisVisit = (typeof DIAGNOSIS_ENCOUNTERS)[number];

// Visits are grouped under the case they belong to, newest case first, so a
// long chart reads as a handful of episodes rather than one flat list.
function groupVisitsByCase(visits: DiagnosisVisit[]) {
  const groups: { caseName: string; visits: DiagnosisVisit[] }[] = [];
  for (const visit of visits) {
    const group = groups.find((entry) => entry.caseName === visit.caseName);
    if (group) group.visits.push(visit);
    else groups.push({ caseName: visit.caseName, visits: [visit] });
  }
  return groups;
}

function codeLine(code: string) {
  const description = DIAGNOSIS_CODES[code]?.description ?? code;
  return `${description} (${code})`;
}

function VisitCard({ visit, onSelectCode }: { visit: DiagnosisVisit; onSelectCode: (code: string) => void }) {
  return (
    <RailRow accent>
      <>
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name="calendar_today" size={20} className="text-[#1a1a1a]" />
          </span>
          <span className="min-w-0 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {visit.type}
          </span>
          <span className="shrink-0 font-body text-[14px] leading-[22px] text-[#666666]">{visit.date}</span>
        </div>

        <div className="flex w-full flex-col gap-2 pt-2">
          <span className="font-body text-[12px] leading-[18px] text-[#666666]">{visit.provider}</span>

          <ul className="flex w-full flex-col gap-2">
            {visit.codes.map((code) => (
              <li key={code} className="flex w-full items-start gap-2">
                <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-[#1a1a1a]" />
                <button
                  type="button"
                  onClick={() => onSelectCode(code)}
                  aria-label={`View ${code} history`}
                  className="min-w-0 flex-1 rounded text-left font-body text-[14px] leading-[22px] text-[#1a1a1a] hover:text-[#1132ee]"
                >
                  {codeLine(code)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </>
    </RailRow>
  );
}

// Collapsible group with the connector rail down its left edge, shared by the
// diagnosis case list and the medication status list.
function RailGroup({
  label,
  count,
  open,
  accent = false,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  accent?: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const tint = accent ? "text-[#1132ee]" : "text-[#666666]";

  return (
    <div className="flex w-full flex-col items-start">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-1 py-2">
        <span className="flex items-center gap-[10px]">
          <span aria-hidden className={`h-[22px] w-[2px] shrink-0 ${accent ? "bg-[#1132ee]" : "bg-[#cccccc]"}`} />
          <span className={`font-body text-[14px] font-medium leading-[22px] ${tint}`}>
            {label} ({count})
          </span>
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} size={16} className={tint} />
      </button>

      {open && children}
    </div>
  );
}

// Every row inside a rail group hangs off the same 2px connector.
function RailRow({ accent = false, children }: { accent?: boolean; children: ReactNode }) {
  return (
    <div className="flex w-full items-stretch gap-[10px]">
      <span aria-hidden className={`w-[2px] shrink-0 ${accent ? "bg-[#1132ee]" : "bg-[#cccccc]"}`} />
      <div className="flex min-w-0 flex-1 flex-col border-b border-[#e6e6e6] py-4">{children}</div>
    </div>
  );
}

function DiagnosisByVisit({
  visits,
  openCases,
  onToggleCase,
  onSelectCode,
}: {
  visits: DiagnosisVisit[];
  openCases: string[];
  onToggleCase: (caseName: string) => void;
  onSelectCode: (code: string) => void;
}) {
  const groups = groupVisitsByCase(visits);

  if (groups.length === 0) {
    return (
      <p className="w-full py-6 text-center font-body text-[14px] leading-[22px] text-[#666666]">
        No visits match this search.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-start">
      {groups.map((group) => {
        const open = openCases.includes(group.caseName);
        return (
          <RailGroup
            key={group.caseName}
            label={group.caseName}
            count={group.visits.length}
            open={open}
            accent={open}
            onToggle={() => onToggleCase(group.caseName)}
          >
            {group.visits.map((visit) => (
              <VisitCard key={`${visit.date}-${visit.type}`} visit={visit} onSelectCode={onSelectCode} />
            ))}
          </RailGroup>
        );
      })}
    </div>
  );
}

const DEFAULT_OPEN_CASE = DIAGNOSIS_ENCOUNTERS[0]?.caseName;

function visitMatches(visit: DiagnosisVisit, search: string) {
  if (!search) return true;
  return [visit.type, visit.provider, visit.date, ...visit.codes.map(codeLine)].some((field) =>
    field.toLowerCase().includes(search),
  );
}

function PastDiagnosisSection() {
  const [tab, setTab] = useState(DIAGNOSIS_TABS[0]);
  const [showOlder, setShowOlder] = useState(false);
  const [openCodes, setOpenCodes] = useState<string[]>([]);
  const [openCases, setOpenCases] = useState<string[]>(DEFAULT_OPEN_CASE ? [DEFAULT_OPEN_CASE] : []);
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();

  const visits = DIAGNOSIS_ENCOUNTERS.filter((visit) => visitMatches(visit, search));
  const records = DIAGNOSIS_HISTORY.filter((record) =>
    search ? `${record.code} ${record.description}`.toLowerCase().includes(search) : true,
  );
  const latestCount = records.filter((record) => record.relevance === "latest").length;

  // A search should reveal what it found rather than hide it behind a collapsed case.
  const matchedCases = search ? [...new Set(visits.map((visit) => visit.caseName))] : openCases;

  function toggleCode(code: string) {
    setOpenCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function toggleCase(caseName: string) {
    setOpenCases((prev) =>
      prev.includes(caseName) ? prev.filter((name) => name !== caseName) : [...prev, caseName],
    );
  }

  // Code lines in the visit view are shortcuts into that code's full history.
  function focusCode(code: string) {
    setTab(DIAGNOSIS_TABS[0]);
    setShowOlder(true);
    setQuery("");
    setOpenCodes([code]);
    requestAnimationFrame(() => {
      document.getElementById(diagnosisRowId(code))?.scrollIntoView({ block: "nearest" });
    });
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <label className="flex h-9 w-full items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
        <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search past diagnosis"
          className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
            aria-label="Clear diagnosis search"
          >
            <Icon name="close" size={16} className="text-[#666666]" />
          </button>
        )}
      </label>

      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <TabGroup tabs={DIAGNOSIS_TABS} active={tab} onSelect={setTab} />
      </div>

      <span className="w-full font-body text-[14px] leading-[22px] text-[#666666]">
        {records.length} Diagnosis | {latestCount} in latest notes
      </span>

      {tab === "By Diagnosis" ? (
        <div className="flex w-full flex-col items-start">
          {RELEVANCE_GROUPS.map((group) => {
            const groupRecords = records.filter((record) => record.relevance === group.key);
            if (groupRecords.length === 0) return null;
            const collapsed = group.collapsible && !showOlder;

            return (
              <div key={group.key} className="flex w-full flex-col">
                <RelevanceHeader
                  label={group.label}
                  hint={group.hint}
                  count={groupRecords.length}
                  rail={group.rail}
                  labelColor={group.labelColor}
                  open={group.collapsible ? !collapsed : undefined}
                  onToggle={group.collapsible ? () => setShowOlder((current) => !current) : undefined}
                />
                {!collapsed &&
                  groupRecords.map((record) => (
                    <DiagnosisRow
                      key={record.code}
                      record={record}
                      open={openCodes.includes(record.code)}
                      onToggle={() => toggleCode(record.code)}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      ) : (
        <DiagnosisByVisit
          visits={visits}
          openCases={matchedCases}
          onToggleCase={toggleCase}
          onSelectCode={focusCode}
        />
      )}
    </div>
  );
}

function MedicationRow({
  medication,
  accent,
  open,
  onToggle,
}: {
  medication: Medication;
  accent: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const fill = FILL_STATUS_TONES[medication.fillStatus] ?? { tone: "grey" as Tone, icon: "" };

  return (
    <RailRow accent={accent}>
      <>
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name="pill" size={20} className="text-[#2fd0c0]" />
          </span>
          <span className="min-w-0 flex-1 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {medication.name}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "View"} ${medication.name} details`}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
              open ? "bg-[rgba(17,50,238,0.08)]" : "hover:bg-black/5"
            }`}
          >
            <Icon name="visibility" size={20} className={open ? "text-[#1132ee]" : "text-[#1a1a1a]"} />
          </button>
        </div>

        <div className="flex w-full items-center gap-2 pt-1.5">
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{medication.date}</span>
          <Badge tone={fill.tone} label={medication.fillStatus} icon={fill.icon || undefined} />
        </div>

        {open && <MedicationDetails medication={medication} />}
      </>
    </RailRow>
  );
}

function MedicationsSection() {
  const [tab, setTab] = useState(MEDICATION_TABS[0]);
  const [openMedication, setOpenMedication] = useState<string | null>(null);
  const [closedStatuses, setClosedStatuses] = useState<MedicationStatus[]>([]);
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const medications = medicationsForTab(tab).filter((med) =>
    search ? [med.name, med.date, med.fillStatus].some((field) => field.toLowerCase().includes(search)) : true,
  );

  const groups = MEDICATION_STATUS_GROUPS.map((status) => ({
    status,
    medications: medications.filter((med) => med.status === status),
  })).filter((group) => group.medications.length > 0);

  function toggleStatus(status: MedicationStatus) {
    setClosedStatuses((prev) =>
      prev.includes(status) ? prev.filter((entry) => entry !== status) : [...prev, status],
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center gap-1.5">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
          <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search medications"
            className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
              aria-label="Clear medication search"
            >
              <Icon name="close" size={16} className="text-[#666666]" />
            </button>
          )}
        </label>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="Filter medications"
        >
          <Icon name="filter_alt" size={20} className="text-[#1a1a1a]" />
        </button>
      </div>

      <TabGroup tabs={MEDICATION_TABS} active={tab} onSelect={setTab} />

      <div className="flex w-full flex-wrap items-center gap-2">
        {MEDICATION_STATUS_GROUPS.map((status) => (
          <span key={status} className="font-body text-[14px] leading-[22px] text-[#666666]">
            {MEDICATIONS.filter((med) => med.status === status).length} {status}
          </span>
        ))}
      </div>

      <div className="flex w-full flex-col items-start">
        {groups.map((group) => (
          <RailGroup
            key={group.status}
            label={group.status}
            count={group.medications.length}
            open={!closedStatuses.includes(group.status)}
            accent={group.status === "Active"}
            onToggle={() => toggleStatus(group.status)}
          >
            {group.medications.map((med) => (
              <MedicationRow
                key={med.name}
                medication={med}
                accent={group.status === "Active"}
                open={openMedication === med.name}
                onToggle={() => setOpenMedication((current) => (current === med.name ? null : med.name))}
              />
            ))}
          </RailGroup>
        ))}

        {groups.length === 0 && (
          <p className="w-full py-4 font-body text-[14px] leading-[22px] text-[#666666]">No medications to show.</p>
        )}
      </div>

      <ShowMore />
    </div>
  );
}

function AllergyRow({
  allergy,
  accent,
}: {
  allergy: (typeof ALLERGIES)[number];
  accent: boolean;
}) {
  return (
    <RailRow accent={accent}>
      <>
        <div className="flex w-full items-center gap-1">
          <span className="flex size-7 shrink-0 items-center justify-center">
            <Icon name="sick" size={20} className="text-[#1a1a1a]" />
          </span>
          <span className="min-w-0 flex-1 truncate font-body text-[14px] font-medium leading-[22px] text-[#1a1a1a]">
            {allergy.name}
          </span>
        </div>
        <div className="flex w-full items-center gap-2 pt-1.5">
          <span className="font-body text-[14px] leading-[22px] text-[#1a1a1a]">{allergy.date}</span>
          <Badge tone={SEVERITY_TONES[allergy.severity] ?? "grey"} label={allergy.severity} />
        </div>
      </>
    </RailRow>
  );
}

function AllergiesSection() {
  const [query, setQuery] = useState("");
  const [closedStatuses, setClosedStatuses] = useState<string[]>([]);

  const search = query.trim().toLowerCase();
  const allergies = ALLERGIES.filter((allergy) =>
    search
      ? [allergy.name, allergy.date, allergy.severity, allergy.status].some((field) =>
          field.toLowerCase().includes(search),
        )
      : true,
  );

  const groups = (["Active", "Inactive"] as const)
    .map((status) => ({
      status,
      allergies: allergies.filter((allergy) => allergy.status === status),
    }))
    .filter((group) => group.allergies.length > 0);

  function toggleStatus(status: string) {
    setClosedStatuses((prev) =>
      prev.includes(status) ? prev.filter((entry) => entry !== status) : [...prev, status],
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center gap-1.5">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg bg-black/[0.04] pl-2 pr-1">
          <Icon name="search" size={18} className="shrink-0 text-[#1a1a1a] opacity-40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search allergies"
            className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[24px] text-[#1a1a1a] outline-none placeholder:text-[#666]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex shrink-0 items-center rounded-full p-0.5 hover:bg-black/5"
              aria-label="Clear allergy search"
            >
              <Icon name="close" size={16} className="text-[#666666]" />
            </button>
          )}
        </label>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="Filter allergies"
        >
          <Icon name="filter_alt" size={20} className="text-[#1a1a1a]" />
        </button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2">
        {(["Active", "Inactive"] as const).map((status) => (
          <span key={status} className="font-body text-[14px] leading-[22px] text-[#666666]">
            {ALLERGIES.filter((allergy) => allergy.status === status).length} {status}
          </span>
        ))}
      </div>

      <div className="flex w-full flex-col items-start">
        {groups.map((group) => (
          <RailGroup
            key={group.status}
            label={group.status}
            count={group.allergies.length}
            open={!closedStatuses.includes(group.status)}
            accent={group.status === "Active"}
            onToggle={() => toggleStatus(group.status)}
          >
            {group.allergies.map((allergy) => (
              <AllergyRow
                key={allergy.name}
                allergy={allergy}
                accent={group.status === "Active"}
              />
            ))}
          </RailGroup>
        ))}

        {groups.length === 0 && (
          <p className="w-full py-4 font-body text-[14px] leading-[22px] text-[#666666]">No allergies to show.</p>
        )}
      </div>
    </div>
  );
}

export default function MedicalHistoryPanel() {
  const [openSections, setOpenSections] = useState<string[]>(["Past Diagnosis", "Medications", "Allergies"]);

  function toggleSection(title: string) {
    setOpenSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  }

  const isOpen = (title: string) => openSections.includes(title);

  return (
    <aside className="scrollbar-thin sticky top-0 flex h-full w-full min-w-0 flex-col overflow-y-auto border-l border-[#e6e6e6] bg-white px-4 pt-5">
      <h2 className="font-body text-[16px] font-medium leading-[24px] text-[#1a1a1a]">Patient Medical History</h2>

      <div className="flex w-full flex-col items-start pt-4">
        <SectionHeader
          title="Past Diagnosis"
          open={isOpen("Past Diagnosis")}
          onToggle={() => toggleSection("Past Diagnosis")}
        />
        {isOpen("Past Diagnosis") && <PastDiagnosisSection />}
      </div>

      <div className="flex w-full flex-col items-start pt-2">
        <SectionHeader title="Medications" open={isOpen("Medications")} onToggle={() => toggleSection("Medications")} />
        {isOpen("Medications") && <MedicationsSection />}
      </div>

      <div className="flex w-full flex-col items-start pb-10 pt-2">
        <SectionHeader title="Allergies" open={isOpen("Allergies")} onToggle={() => toggleSection("Allergies")} />
        {isOpen("Allergies") && <AllergiesSection />}
      </div>
    </aside>
  );
}
