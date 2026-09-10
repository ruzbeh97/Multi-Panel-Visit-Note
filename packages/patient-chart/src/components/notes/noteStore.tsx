import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CURRENT_VISIT, PREVIOUS_VISIT, pastVisitNote, type PastVisitNoteContent } from "../../data/chart";

// "blend" is treated like an overwrite here since there is no real AI merge in the prototype.
export type ImportAction = "overwrite" | "append" | "prepend" | "blend";

export const CARRY_FORWARD_ACTIONS = [
  { id: "overwrite" as const, label: "Overwrite", icon: "edit" },
  { id: "append" as const, label: "Append", icon: "keyboard_tab" },
  { id: "prepend" as const, label: "Prepend", icon: "keyboard_tab_rtl" },
  { id: "blend" as const, label: "Blend", icon: "auto_awesome" },
];

export type EditableNote = {
  subjective: {
    chiefComplaint: string;
    dateOfOnset: string;
    stateOfCondition: string;
    sideOfIssue: string;
    previousSurgery: string;
    surgeryName: string;
    surgeryDate: string;
    historyOfCondition: string;
  };
  objective: {
    currentPain: string;
    worstPain: string;
    bestPain: string;
    painDescription: string;
    hipLeft: string[];
    hipRight: string[];
    kneeLeft: string[];
    kneeRight: string[];
  };
  assessment: {
    primaryDiagnosis: string;
    dateOfOnset: string;
    rehabPotential: string;
    keyFindings: string;
    goalProgress: string[];
  };
  plan: {
    patientGoal: string;
    educationTopics: string[];
    goals: string[];
    treatments: string[];
    planForward: string[];
    careAgreement: string;
  };
};

export const DEFAULT_NOTE_VISIT_ID = "acl-followup-14wk";

function emptyNote(): EditableNote {
  return {
    subjective: {
      chiefComplaint: "",
      dateOfOnset: "",
      stateOfCondition: "",
      sideOfIssue: "",
      previousSurgery: "",
      surgeryName: "",
      surgeryDate: "",
      historyOfCondition: "",
    },
    objective: {
      currentPain: "",
      worstPain: "",
      bestPain: "",
      painDescription: "",
      hipLeft: [],
      hipRight: [],
      kneeLeft: [],
      kneeRight: [],
    },
    assessment: {
      primaryDiagnosis: "",
      dateOfOnset: "",
      rehabPotential: "",
      keyFindings: "",
      goalProgress: [],
    },
    plan: {
      patientGoal: "",
      educationTopics: [],
      goals: [],
      treatments: [],
      planForward: [],
      careAgreement: "",
    },
  };
}

function initialNote(): EditableNote {
  return {
    subjective: { ...CURRENT_VISIT.subjective },
    objective: {
      currentPain: CURRENT_VISIT.objective.currentPain,
      worstPain: CURRENT_VISIT.objective.worstPain,
      bestPain: CURRENT_VISIT.objective.bestPain,
      painDescription: CURRENT_VISIT.objective.painDescription,
      hipLeft: [...CURRENT_VISIT.objective.hip.left],
      hipRight: [...CURRENT_VISIT.objective.hip.right],
      kneeLeft: [...CURRENT_VISIT.objective.knee.left],
      kneeRight: [...CURRENT_VISIT.objective.knee.right],
    },
    assessment: {
      primaryDiagnosis: CURRENT_VISIT.assessment.primaryDiagnosis,
      dateOfOnset: CURRENT_VISIT.assessment.dateOfOnset,
      rehabPotential: CURRENT_VISIT.assessment.rehabPotential,
      keyFindings: CURRENT_VISIT.assessment.keyFindings,
      goalProgress: CURRENT_VISIT.assessment.goals.map((goal) => goal.initialProgress),
    },
    plan: {
      patientGoal: CURRENT_VISIT.plan.patientGoal,
      educationTopics: [...CURRENT_VISIT.plan.educationTopics],
      goals: [...CURRENT_VISIT.plan.goals],
      treatments: [...CURRENT_VISIT.plan.treatments],
      planForward: [...CURRENT_VISIT.plan.planForward],
      careAgreement: CURRENT_VISIT.plan.careAgreement,
    },
  };
}

function mergeText(existing: string, incoming: string, action: ImportAction) {
  if (!incoming) return existing;
  if (action === "append") return existing ? `${existing}\n${incoming}` : incoming;
  if (action === "prepend") return existing ? `${incoming}\n${existing}` : incoming;
  return incoming;
}

// Single-select fields (radios, dates) cannot be concatenated, so append keeps
// whatever is already there and every other action takes the incoming value.
function mergeSingle(existing: string, incoming: string, action: ImportAction) {
  if (!incoming) return existing;
  if (action === "append") return existing || incoming;
  return incoming;
}

// Maps each SubHeading title to the fields it owns, so a carry-forward only
// moves the content that lives under that heading.
function applyImport(
  note: EditableNote,
  title: string,
  action: ImportAction,
  source: PastVisitNoteContent = PREVIOUS_VISIT,
): EditableNote {

  switch (title) {
    case "Chief Complaint & History":
      return {
        ...note,
        subjective: {
          chiefComplaint: mergeText(note.subjective.chiefComplaint, source.subjective.chiefComplaint, action),
          historyOfCondition: mergeText(note.subjective.historyOfCondition, source.subjective.historyOfCondition, action),
          surgeryName: mergeText(note.subjective.surgeryName, source.subjective.surgeryName, action),
          dateOfOnset: mergeSingle(note.subjective.dateOfOnset, source.subjective.dateOfOnset, action),
          surgeryDate: mergeSingle(note.subjective.surgeryDate, source.subjective.surgeryDate, action),
          stateOfCondition: mergeSingle(note.subjective.stateOfCondition, source.subjective.stateOfCondition, action),
          sideOfIssue: mergeSingle(note.subjective.sideOfIssue, source.subjective.sideOfIssue, action),
          previousSurgery: mergeSingle(note.subjective.previousSurgery, source.subjective.previousSurgery, action),
        },
      };

    case "Objective":
    case "Pain Assessment":
    case "Muscle Strength":
      return {
        ...note,
        objective: {
          ...note.objective,
          painDescription: mergeText(note.objective.painDescription, source.objective.painDescription, action),
        },
      };

    case "Diagnosis & Findings":
      return {
        ...note,
        assessment: {
          ...note.assessment,
          primaryDiagnosis: mergeText(note.assessment.primaryDiagnosis, source.assessment.primaryDiagnosis, action),
          rehabPotential: mergeText(note.assessment.rehabPotential, source.assessment.rehabPotential, action),
          keyFindings: mergeText(note.assessment.keyFindings, source.assessment.keyFindings, action),
          dateOfOnset: mergeSingle(note.assessment.dateOfOnset, source.assessment.dateOfOnset, action),
        },
      };

    case "Goals & Progress":
      // Plan-of-care goals are tracked on the case rather than per note, so they
      // always carry over from the last signed visit.
      return {
        ...note,
        assessment: {
          ...note.assessment,
          goalProgress: PREVIOUS_VISIT.assessment.goals.map((goal) => goal.initialProgress),
        },
      };

    case "Visit Plan":
      return {
        ...note,
        plan: {
          ...note.plan,
          patientGoal: mergeText(note.plan.patientGoal, source.plan.patientGoal, action),
        },
      };

    default:
      return note;
  }
}

// Empties only the fields under the given SubHeading, matching the same
// section boundaries used by carry-forward.
function applyClear(note: EditableNote, title: string): EditableNote {
  switch (title) {
    case "Chief Complaint & History":
      return {
        ...note,
        subjective: {
          chiefComplaint: "",
          dateOfOnset: "",
          stateOfCondition: "",
          sideOfIssue: "",
          previousSurgery: "",
          surgeryName: "",
          surgeryDate: "",
          historyOfCondition: "",
        },
      };

    case "Objective":
    case "Pain Assessment":
    case "Muscle Strength":
      return {
        ...note,
        objective: {
          ...note.objective,
          painDescription: "",
        },
      };

    case "Diagnosis & Findings":
      return {
        ...note,
        assessment: {
          ...note.assessment,
          primaryDiagnosis: "",
          rehabPotential: "",
          keyFindings: "",
          // Date of onset stays — the field is disabled chart context.
        },
      };

    case "Goals & Progress":
      return {
        ...note,
        assessment: {
          ...note.assessment,
          goalProgress: note.assessment.goalProgress.map(() => ""),
        },
      };

    case "Visit Plan":
      return {
        ...note,
        plan: {
          ...note.plan,
          patientGoal: "",
        },
      };

    default:
      return note;
  }
}

// Every SubHeading that carry-forward knows how to move, in note order.
const IMPORTABLE_SECTIONS = [
  "Chief Complaint & History",
  "Objective",
  "Diagnosis & Findings",
  "Visit Plan",
];

export const CARRY_FORWARD_SECTIONS = [
  { label: "Entire note", titles: IMPORTABLE_SECTIONS },
  { label: "Subjective", titles: ["Chief Complaint & History"] },
  { label: "Objective", titles: ["Objective"] },
  { label: "Assessment", titles: ["Diagnosis & Findings"] },
  { label: "Plan", titles: ["Visit Plan"] },
] as const;

type NoteStore = {
  note: EditableNote;
  visitId: string;
  blankVisit: boolean;
  activateVisit: (visitId: string, options?: { blank?: boolean }) => void;
  patchSubjective: (patch: Partial<EditableNote["subjective"]>) => void;
  patchObjective: (patch: Partial<EditableNote["objective"]>) => void;
  patchAssessment: (patch: Partial<EditableNote["assessment"]>) => void;
  patchPlan: (patch: Partial<EditableNote["plan"]>) => void;
  /** `sourceNoteId` selects which signed note the content comes from. */
  importSection: (title: string, action: ImportAction, sourceNoteId?: string | null) => void;
  clearSection: (title: string) => void;
  importSections: (titles: string[], sourceNoteId?: string | null) => void;
  importWholeNote: () => void;
  undoImportWholeNote: () => void;
  canUndoImportWholeNote: boolean;
  carryAction: ImportAction;
  setCarryAction: (action: ImportAction) => void;
};

const NoteStoreContext = createContext<NoteStore | null>(null);

export function useNoteStore() {
  const store = useContext(NoteStoreContext);
  if (!store) throw new Error("useNoteStore must be used within a NoteStoreProvider");
  return store;
}

export function NoteStoreProvider({
  children,
  activeVisit,
}: {
  children: ReactNode;
  activeVisit?: { id: string; blank?: boolean };
}) {
  const [visitId, setVisitId] = useState(activeVisit?.id ?? DEFAULT_NOTE_VISIT_ID);
  const [notesByVisit, setNotesByVisit] = useState<Record<string, EditableNote>>({
    [DEFAULT_NOTE_VISIT_ID]: initialNote(),
  });
  const [blankByVisit, setBlankByVisit] = useState<Record<string, boolean>>({
    [DEFAULT_NOTE_VISIT_ID]: false,
  });
  const [carryAction, setCarryAction] = useState<ImportAction>("overwrite");
  // Snapshot taken before a whole-note carry-forward so it can be undone.
  const [preImportNote, setPreImportNote] = useState<EditableNote | null>(null);

  const resolvedVisitId = activeVisit?.id ?? visitId;
  let resolvedNotes = notesByVisit;
  let resolvedBlank = blankByVisit;
  if (activeVisit && !notesByVisit[activeVisit.id]) {
    resolvedNotes = {
      ...notesByVisit,
      [activeVisit.id]: activeVisit.blank ? emptyNote() : initialNote(),
    };
  }
  if (activeVisit && !(activeVisit.id in blankByVisit)) {
    resolvedBlank = { ...blankByVisit, [activeVisit.id]: Boolean(activeVisit.blank) };
  }
  if (activeVisit && (visitId !== activeVisit.id || resolvedNotes !== notesByVisit || resolvedBlank !== blankByVisit)) {
    setVisitId(activeVisit.id);
    if (resolvedNotes !== notesByVisit) setNotesByVisit(resolvedNotes);
    if (resolvedBlank !== blankByVisit) setBlankByVisit(resolvedBlank);
  }

  const note = resolvedNotes[resolvedVisitId] ?? (activeVisit?.blank ? emptyNote() : initialNote());
  const blankVisit = Boolean(resolvedBlank[resolvedVisitId]);

  const activateVisit = useCallback((id: string, options?: { blank?: boolean }) => {
    setVisitId(id);
    setNotesByVisit((current) => {
      if (current[id]) return current;
      return { ...current, [id]: options?.blank ? emptyNote() : initialNote() };
    });
    setBlankByVisit((current) => {
      if (id in current) return current;
      return { ...current, [id]: Boolean(options?.blank) };
    });
  }, []);

  const patchSubjective = useCallback(
    (patch: Partial<EditableNote["subjective"]>) =>
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? initialNote();
        return { ...current, [resolvedVisitId]: { ...active, subjective: { ...active.subjective, ...patch } } };
      }),
    [resolvedVisitId],
  );
  const patchObjective = useCallback(
    (patch: Partial<EditableNote["objective"]>) =>
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? initialNote();
        return { ...current, [resolvedVisitId]: { ...active, objective: { ...active.objective, ...patch } } };
      }),
    [resolvedVisitId],
  );
  const patchAssessment = useCallback(
    (patch: Partial<EditableNote["assessment"]>) =>
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? initialNote();
        return { ...current, [resolvedVisitId]: { ...active, assessment: { ...active.assessment, ...patch } } };
      }),
    [resolvedVisitId],
  );
  const patchPlan = useCallback(
    (patch: Partial<EditableNote["plan"]>) =>
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? initialNote();
        return { ...current, [resolvedVisitId]: { ...active, plan: { ...active.plan, ...patch } } };
      }),
    [resolvedVisitId],
  );
  const importSection = useCallback(
    (title: string, action: ImportAction, sourceNoteId?: string | null) =>
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? initialNote();
        const source = pastVisitNote(sourceNoteId) ?? PREVIOUS_VISIT;
        return { ...current, [resolvedVisitId]: applyImport(active, title, action, source) };
      }),
    [resolvedVisitId],
  );
  const clearSection = useCallback(
    (title: string) =>
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? initialNote();
        return { ...current, [resolvedVisitId]: applyClear(active, title) };
      }),
    [resolvedVisitId],
  );
  const importSections = useCallback(
    (titles: string[], sourceNoteId?: string | null) => {
      if (titles.length === 0) return;
      setPreImportNote(note);
      setNotesByVisit((current) => {
        const active = current[resolvedVisitId] ?? note;
        const source = pastVisitNote(sourceNoteId) ?? PREVIOUS_VISIT;
        return {
          ...current,
          [resolvedVisitId]: titles.reduce(
            (draft, title) => applyImport(draft, title, carryAction, source),
            active,
          ),
        };
      });
    },
    [note, carryAction, resolvedVisitId],
  );
  const importWholeNote = useCallback(() => {
    importSections(IMPORTABLE_SECTIONS);
  }, [importSections]);
  const undoImportWholeNote = useCallback(() => {
    if (!preImportNote) return;
    setNotesByVisit((current) => ({ ...current, [resolvedVisitId]: preImportNote }));
    setPreImportNote(null);
  }, [preImportNote, resolvedVisitId]);

  const value = useMemo(
    () => ({
      note,
      visitId: resolvedVisitId,
      blankVisit,
      activateVisit,
      patchSubjective,
      patchObjective,
      patchAssessment,
      patchPlan,
      importSection,
      clearSection,
      importSections,
      importWholeNote,
      undoImportWholeNote,
      canUndoImportWholeNote: preImportNote !== null,
      carryAction,
      setCarryAction,
    }),
    [
      note,
      resolvedVisitId,
      blankVisit,
      activateVisit,
      patchSubjective,
      patchObjective,
      patchAssessment,
      patchPlan,
      importSection,
      clearSection,
      importSections,
      importWholeNote,
      undoImportWholeNote,
      preImportNote,
      carryAction,
    ],
  );

  return <NoteStoreContext.Provider value={value}>{children}</NoteStoreContext.Provider>;
}

// Lets the read-only past-note headings know which visit is currently selected.
const PastNoteSourceContext = createContext<string | null>(null);

export function usePastNoteSource() {
  return useContext(PastNoteSourceContext);
}

export function PastNoteSourceProvider({ noteId, children }: { noteId: string; children: ReactNode }) {
  return <PastNoteSourceContext.Provider value={noteId}>{children}</PastNoteSourceContext.Provider>;
}
