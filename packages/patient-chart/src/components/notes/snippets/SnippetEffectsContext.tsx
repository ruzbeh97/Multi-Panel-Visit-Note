import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PickedOrder } from "../OrderPickerModal";
import { ordersFromSnippet, servicesFromSnippet, type SnippetServiceLine } from "./adapters";
import { loadTextSnippets, type TextSnippetRow } from "./types";

type OrdersHandler = (orders: PickedOrder[]) => void;
type ServicesHandler = (services: SnippetServiceLine[]) => void;
type DiagnosesHandler = (codes: string[]) => void;

type SnippetEffectsContextValue = {
  snippets: TextSnippetRow[];
  refreshSnippets: () => void;
  applySnippetSideEffects: (snippet: TextSnippetRow) => void;
  registerOrdersHandler: (handler: OrdersHandler | null) => void;
  registerServicesHandler: (handler: ServicesHandler | null) => void;
  registerDiagnosesHandler: (handler: DiagnosesHandler | null) => void;
};

const SnippetEffectsContext = createContext<SnippetEffectsContextValue | null>(null);

export function SnippetEffectsProvider({ children }: { children: ReactNode }) {
  const [snippets, setSnippets] = useState<TextSnippetRow[]>(() => loadTextSnippets());
  const ordersHandler = useRef<OrdersHandler | null>(null);
  const servicesHandler = useRef<ServicesHandler | null>(null);
  const diagnosesHandler = useRef<DiagnosesHandler | null>(null);

  const refreshSnippets = useCallback(() => {
    setSnippets(loadTextSnippets());
  }, []);

  useEffect(() => {
    const onFocus = () => refreshSnippets();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "charge-capture-text-snippets") refreshSnippets();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshSnippets]);

  const applySnippetSideEffects = useCallback((snippet: TextSnippetRow) => {
    const orders = ordersFromSnippet(snippet);
    if (orders.length) ordersHandler.current?.(orders);

    const services = servicesFromSnippet(snippet);
    if (services.length) servicesHandler.current?.(services);

    if (snippet.diagnosisCodes?.length) {
      diagnosesHandler.current?.(snippet.diagnosisCodes);
    }
  }, []);

  const value = useMemo(
    () => ({
      snippets,
      refreshSnippets,
      applySnippetSideEffects,
      registerOrdersHandler: (handler: OrdersHandler | null) => {
        ordersHandler.current = handler;
      },
      registerServicesHandler: (handler: ServicesHandler | null) => {
        servicesHandler.current = handler;
      },
      registerDiagnosesHandler: (handler: DiagnosesHandler | null) => {
        diagnosesHandler.current = handler;
      },
    }),
    [snippets, refreshSnippets, applySnippetSideEffects],
  );

  return <SnippetEffectsContext.Provider value={value}>{children}</SnippetEffectsContext.Provider>;
}

export function useSnippetEffects() {
  const value = useContext(SnippetEffectsContext);
  if (!value) throw new Error("useSnippetEffects must be used within SnippetEffectsProvider");
  return value;
}

export function useOptionalSnippetEffects() {
  return useContext(SnippetEffectsContext);
}
