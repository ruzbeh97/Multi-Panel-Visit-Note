export type SnippetNoteSection = "Subjective" | "Objective" | "Assessment" | "Plan";

export type SnippetOrder = {
  name: string;
  type: "injection" | "med" | "brace";
};

export type SnippetServiceRow = {
  id: string;
  cpt: string;
  mods: string[];
  description: string;
  icds: string[];
};

export type SnippetServiceGroup = {
  category: string;
  rows: SnippetServiceRow[];
};

export type ProcedureCodeConfig = {
  cptCode: string;
  description?: string;
  modifiers: string[];
  units: string;
  icds?: string[];
};

export type OrderDiagnosisMap = Record<string, string[]>;

/** Shape stored under Preferences `charge-capture-text-snippets`. */
export type TextSnippetRow = {
  id: string;
  phrase: string;
  procedureDoc: string;
  users: string;
  section: string;
  groupName: string;
  appointmentType: string;
  useForEHRScribe: boolean;
  diagnosisCodes?: string[];
  manualDiagnosisCodes?: string[];
  orderDiagnosisCodes?: OrderDiagnosisMap;
  orderSelections?: string[];
  snippetOrders?: SnippetOrder[];
  /** Config sections the snippet editor saved. Absent on the seeded snippets. */
  configItemTypes?: string[];
  procedureCodeConfig?: ProcedureCodeConfig[];
  snippetServiceGroups?: SnippetServiceGroup[];
  textSnippetData?: {
    html: string;
    alternateWordDropdowns: Array<{
      id: string;
      words: Array<{ id: string; word: string; isDefault: boolean }>;
      position?: { top: number; left: number } | null;
    }>;
  };
};

export const SNIPPETS_STORAGE_KEY = "charge-capture-text-snippets";

export function loadTextSnippets(): TextSnippetRow[] {
  try {
    const saved = localStorage.getItem(SNIPPETS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as TextSnippetRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function snippetMatchesSection(snippet: TextSnippetRow, noteSection: string): boolean {
  if (!snippet.section?.trim()) return true;
  return snippet.section
    .split(",")
    .map((part) => part.trim())
    .some((part) => part.toLowerCase() === noteSection.toLowerCase());
}

export function snippetToText(snippet: TextSnippetRow): string {
  if (snippet.procedureDoc) return snippet.procedureDoc;
  if (snippet.textSnippetData?.html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = snippet.textSnippetData.html;
    return tmp.innerText || "";
  }
  return "";
}
