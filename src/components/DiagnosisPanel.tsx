import { useState } from "react";
import Icon from "./Icon";
import { PanelShell, RailGroup, RailRow, TabGroup } from "./chartPanelUi";
import {
  CASE,
  DIAGNOSIS_ENCOUNTERS,
  DIAGNOSIS_CODES,
  DIAGNOSIS_HISTORY,
  LATEST_DIAGNOSIS_VISIT_COUNT,
  LATEST_DIAGNOSIS_VISITS,
  type DiagnosisRecord,
  type DiagnosisRelevance,
} from "../data/chart";

const DIAGNOSIS_TABS = ["By Diagnosis", "By Visit"];

const latestVisitHint = (() => {
  const newest = LATEST_DIAGNOSIS_VISITS[0]?.date;
  const oldest = LATEST_DIAGNOSIS_VISITS[LATEST_DIAGNOSIS_VISITS.length - 1]?.date;
  if (!newest || !oldest) return `Coded in the last ${LATEST_DIAGNOSIS_VISIT_COUNT} visits`;
  if (newest === oldest) return `Last coded on ${newest}`;
  return `Last coded ${oldest} – ${newest}`;
})();

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

export default function DiagnosisPanel({ onClose }: { onClose: () => void }) {
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
  const matchedCases = search ? [...new Set(visits.map((visit) => visit.caseName))] : openCases;

  function toggleCode(code: string) {
    setOpenCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function toggleCase(caseName: string) {
    setOpenCases((prev) =>
      prev.includes(caseName) ? prev.filter((name) => name !== caseName) : [...prev, caseName],
    );
  }

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
    <PanelShell
      title="Past Diagnosis"
      onClose={onClose}
      toolbar={
        <>
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
          <TabGroup tabs={DIAGNOSIS_TABS} active={tab} onSelect={setTab} />
        </>
      }
    >
      <div className="flex w-full flex-col items-start gap-2">
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
    </PanelShell>
  );
}
