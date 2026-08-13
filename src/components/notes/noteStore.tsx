import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CURRENT_VISIT, PREVIOUS_VISIT } from "../../data/chart";

// The carry-forward action chosen in the import modal. "blend" is treated like
// an overwrite here since there is no real AI merge in the prototype.
export type ImportAction = "overwrite" | "append" | "prepend" | "blend";

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

function mergeMulti(existing: string[], incoming: string[], action: ImportAction) {
  if (action === "append") return [...existing, ...incoming.filter((value) => !existing.includes(value))];
  if (action === "prepend") return [...incoming, ...existing.filter((value) => !incoming.includes(value))];
  return [...incoming];
}

// Maps each SubHeading title to the fields it owns, so a carry-forward only
// moves the content that lives under that heading.
function applyImport(note: EditableNote, title: string, action: ImportAction): EditableNote {
  const source = PREVIOUS_VISIT;

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

    case "Pain Assessment":
      return {
        ...note,
        objective: {
          ...note.objective,
          currentPain: mergeSingle(note.objective.currentPain, source.objective.currentPain, action),
          worstPain: mergeSingle(note.objective.worstPain, source.objective.worstPain, action),
          bestPain: mergeSingle(note.objective.bestPain, source.objective.bestPain, action),
          painDescription: mergeText(note.objective.painDescription, source.objective.painDescription, action),
        },
      };

    case "Muscle Strength":
      return {
        ...note,
        objective: {
          ...note.objective,
          hipLeft: [...source.objective.hip.left],
          hipRight: [...source.objective.hip.right],
          kneeLeft: [...source.objective.knee.left],
          kneeRight: [...source.objective.knee.right],
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
      return {
        ...note,
        assessment: {
          ...note.assessment,
          goalProgress: source.assessment.goals.map((goal) => goal.initialProgress),
        },
      };

    case "Visit Plan":
      return {
        ...note,
        plan: {
          patientGoal: mergeText(note.plan.patientGoal, source.plan.patientGoal, action),
          educationTopics: mergeMulti(note.plan.educationTopics, source.plan.educationTopics, action),
          goals: mergeMulti(note.plan.goals, source.plan.goals, action),
          treatments: mergeMulti(note.plan.treatments, source.plan.treatments, action),
          planForward: mergeMulti(note.plan.planForward, source.plan.planForward, action),
          careAgreement: mergeSingle(note.plan.careAgreement, source.plan.careAgreement, action),
        },
      };

    default:
      return note;
  }
}

function blankCells(count: number) {
  return Array.from({ length: count }, () => "");
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

    case "Pain Assessment":
      return {
        ...note,
        objective: {
          ...note.objective,
          currentPain: "",
          worstPain: "",
          bestPain: "",
          painDescription: "",
        },
      };

    case "Muscle Strength":
      return {
        ...note,
        objective: {
          ...note.objective,
          hipLeft: blankCells(note.objective.hipLeft.length),
          hipRight: blankCells(note.objective.hipRight.length),
          kneeLeft: blankCells(note.objective.kneeLeft.length),
          kneeRight: blankCells(note.objective.kneeRight.length),
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
          patientGoal: "",
          educationTopics: [],
          goals: [],
          treatments: [],
          planForward: [],
          careAgreement: "",
        },
      };

    default:
      return note;
  }
}

type NoteStore = {
  note: EditableNote;
  patchSubjective: (patch: Partial<EditableNote["subjective"]>) => void;
  patchObjective: (patch: Partial<EditableNote["objective"]>) => void;
  patchAssessment: (patch: Partial<EditableNote["assessment"]>) => void;
  patchPlan: (patch: Partial<EditableNote["plan"]>) => void;
  importSection: (title: string, action: ImportAction) => void;
  clearSection: (title: string) => void;
};

const NoteStoreContext = createContext<NoteStore | null>(null);

export function useNoteStore() {
  const store = useContext(NoteStoreContext);
  if (!store) throw new Error("useNoteStore must be used within a NoteStoreProvider");
  return store;
}

export function NoteStoreProvider({ children }: { children: ReactNode }) {
  const [note, setNote] = useState<EditableNote>(initialNote);

  const patchSubjective = useCallback(
    (patch: Partial<EditableNote["subjective"]>) =>
      setNote((current) => ({ ...current, subjective: { ...current.subjective, ...patch } })),
    [],
  );
  const patchObjective = useCallback(
    (patch: Partial<EditableNote["objective"]>) =>
      setNote((current) => ({ ...current, objective: { ...current.objective, ...patch } })),
    [],
  );
  const patchAssessment = useCallback(
    (patch: Partial<EditableNote["assessment"]>) =>
      setNote((current) => ({ ...current, assessment: { ...current.assessment, ...patch } })),
    [],
  );
  const patchPlan = useCallback(
    (patch: Partial<EditableNote["plan"]>) =>
      setNote((current) => ({ ...current, plan: { ...current.plan, ...patch } })),
    [],
  );
  const importSection = useCallback(
    (title: string, action: ImportAction) => setNote((current) => applyImport(current, title, action)),
    [],
  );
  const clearSection = useCallback(
    (title: string) => setNote((current) => applyClear(current, title)),
    [],
  );

  const value = useMemo(
    () => ({ note, patchSubjective, patchObjective, patchAssessment, patchPlan, importSection, clearSection }),
    [note, patchSubjective, patchObjective, patchAssessment, patchPlan, importSection, clearSection],
  );

  return <NoteStoreContext.Provider value={value}>{children}</NoteStoreContext.Provider>;
}

// Lets the read-only past-note headings know which visit is currently selected
// so the import modal can preselect it.
const PastNoteSourceContext = createContext<string | null>(null);

export function usePastNoteSource() {
  return useContext(PastNoteSourceContext);
}

export function PastNoteSourceProvider({ noteId, children }: { noteId: string; children: ReactNode }) {
  return <PastNoteSourceContext.Provider value={noteId}>{children}</PastNoteSourceContext.Provider>;
}
