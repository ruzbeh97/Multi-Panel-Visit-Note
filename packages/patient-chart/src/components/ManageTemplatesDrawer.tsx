import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

export type SavedTemplate = {
  id: string;
  name: string;
  content: string;
  archived: boolean;
  canArchive?: boolean;
};

type Tab = "active" | "archived";

const DEFAULT_TEMPLATE_NAMES = [
  "Test2",
  "Nuclear 2",
  "Nuclear",
  "test sg",
  "Test Rohit 2",
  "Test Order",
  "DFR - DOCTOR'S FIRST REPORT OF OCCUPATIONAL INJURY OR ILLNESS",
  "RFA",
  "Return to work test 2",
  "Return to work test",
  "NG Test 2",
  "NG Test Form",
  "V's Test Form",
  "Harrison's Custom Letter Template",
];

// Only the widgets are locked; headings and blank lines stay editable so the
// template author can keep typing around them.
export const SURGERY_ORDER_CONTENT = `
<h3 class="tpl-heading">Surgery Order Requests:</h3>
<div class="tpl-field" contenteditable="false"><textarea rows="7" placeholder="Enter text"></textarea></div>
<h3 class="tpl-heading">Surgery Facility Information:</h3>
<div class="tpl-vars">
<p><span class="tpl-chip" contenteditable="false">{{facility.name}}</span></p>
<p><span class="tpl-chip" contenteditable="false">{{facility.address}}</span></p>
<p><span class="tpl-chip" contenteditable="false">{{facility.phone}}</span></p>
<p><span class="tpl-chip" contenteditable="false">{{facility.fax}}</span></p>
</div>
<h3 class="tpl-heading">Codes:</h3>
<div class="tpl-field" contenteditable="false">
<div class="tpl-select">
<span class="tpl-select-label">ICD-10 Code</span>
<select data-field="icd10">
<option value=""></option>
<option value="M17.11">M17.11 — Unilateral primary osteoarthritis, right knee</option>
<option value="M25.561">M25.561 — Pain in right knee</option>
<option value="S83.511A">S83.511A — Sprain of ACL, right knee</option>
</select>
</div>
<div class="tpl-select">
<span class="tpl-select-label">CPT Code</span>
<select data-field="cpt">
<option value=""></option>
<option value="29881">29881 — Arthroscopy, knee, surgical; with meniscectomy</option>
<option value="27447">27447 — Arthroplasty, knee, condyle and plateau</option>
<option value="20610">20610 — Drain/inj joint/bursa w/o us</option>
</select>
</div>
</div>
<h3 class="tpl-heading">CPT / ICD Description:</h3>
<div class="tpl-field" contenteditable="false"><textarea rows="4" placeholder="Enter text"></textarea></div>
<div class="tpl-auth" contenteditable="false"><label><input type="checkbox" /><span>Requires Authorization</span></label></div>
<p><br></p>
`.trim();

export const INITIAL_TEMPLATES: SavedTemplate[] = [
  {
    id: "surgery-order",
    name: "Surgery Order",
    content: SURGERY_ORDER_CONTENT,
    archived: false,
  },
  ...DEFAULT_TEMPLATE_NAMES.map((name, index) => ({
    id: `seed-${index + 1}`,
    name,
    content: `<h1>${name}</h1><p>Custom order form template.</p><p>Patient Name: {{patient_name}}</p><p>Provider Name: {{provider_name}}</p><p>ICD-10: </p><p>CPT: </p><p>Signature: </p>`,
    archived: false,
    canArchive: name !== "RFA",
  })),
];

type ManageTemplatesDrawerProps = {
  templates: SavedTemplate[];
  onClose: () => void;
  onPreview: (template: SavedTemplate) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
};

export default function ManageTemplatesDrawer({
  templates,
  onClose,
  onPreview,
  onArchive,
  onRestore,
}: ManageTemplatesDrawerProps) {
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const archived = tab === "archived";
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      if (template.archived !== archived) return false;
      if (!needle) return true;
      return template.name.toLowerCase().includes(needle);
    });
  }, [archived, query, templates]);

  const sectionLabel = archived ? "Archived Templates" : "Active Templates";

  const drawer = (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button type="button" aria-label="Close manage templates" className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative flex h-full w-[min(560px,100vw)] flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e6e6e6] px-5">
          <h2 className="font-body text-[18px] font-semibold text-[#1a1a1a]">Manage Templates</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#d9d9d9] text-[#555] hover:bg-black/5"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="flex justify-center bg-[#f7f7f7] px-5 py-3">
          <div className="flex items-center gap-1">
            {(["active", "archived"] as const).map((entry) => {
              const selected = tab === entry;
              return (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setTab(entry)}
                  className={`rounded-lg px-3 py-1.5 font-body text-[13px] ${
                    selected ? "bg-[#e8eeff] font-medium text-[#1132ee]" : "text-[#555]"
                  }`}
                >
                  {entry === "active" ? "Active Templates" : "Archived Templates"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-white px-5 pt-3">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-[#d9d9d9] bg-white px-3">
            <Icon name="search" size={16} className="text-[#8a8a8a]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Templates"
              className="h-full min-w-0 flex-1 bg-transparent font-body text-[13px] text-[#1a1a1a] placeholder:text-[#9a9a9a] focus:outline-none"
            />
          </label>

          <p className="mt-4 font-body text-[11px] text-[#8a8a8a]">{sectionLabel}</p>

          <div className="scrollbar-thin mt-1 min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex h-full min-h-[240px] items-center justify-center">
                <p className="font-body text-[14px] text-[#9a9a9a]">No templates available</p>
              </div>
            ) : (
              <ul>
                {visible.map((template) => (
                  <li key={template.id} className="flex items-center gap-3 border-b border-[#ededed] py-3">
                    <span className="min-w-0 flex-1 truncate font-body text-[14px] text-[#1a1a1a]">{template.name}</span>
                    <div className="flex shrink-0 items-center gap-3 text-[#555]">
                      <button
                        type="button"
                        aria-label={`Preview ${template.name}`}
                        onClick={() => onPreview(template)}
                        className="flex size-7 items-center justify-center rounded hover:bg-black/5"
                      >
                        <Icon name="visibility" size={18} />
                      </button>
                      {archived ? (
                        <button
                          type="button"
                          aria-label={`Restore ${template.name}`}
                          onClick={() => onRestore(template.id)}
                          className="flex size-7 items-center justify-center rounded hover:bg-black/5"
                        >
                          <Icon name="unarchive" size={18} />
                        </button>
                      ) : template.canArchive !== false ? (
                        <button
                          type="button"
                          aria-label={`Archive ${template.name}`}
                          onClick={() => onArchive(template.id)}
                          className="flex size-7 items-center justify-center rounded hover:bg-black/5"
                        >
                          <Icon name="archive" size={18} />
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="flex h-16 shrink-0 items-center border-t border-[#e6e6e6] px-5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-full bg-[#1132ee] px-6 font-body text-[13px] font-medium text-white"
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
}
