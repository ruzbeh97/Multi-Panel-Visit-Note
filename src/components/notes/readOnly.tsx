import { createContext, useContext, type ReactNode } from "react";

const NoteReadOnlyContext = createContext(false);

export function useNoteReadOnly() {
  return useContext(NoteReadOnlyContext);
}

export function NoteReadOnlyProvider({ children }: { children: ReactNode }) {
  return <NoteReadOnlyContext.Provider value={true}>{children}</NoteReadOnlyContext.Provider>;
}
