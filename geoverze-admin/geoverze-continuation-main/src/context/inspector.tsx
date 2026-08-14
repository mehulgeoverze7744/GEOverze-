import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface InspectorContent {
  title: string;
  description?: string | undefined;
  body: ReactNode;
  footer?: ReactNode | undefined;
  width?: string | undefined;
}

interface InspectorContextValue {
  content: InspectorContent | null;
  open: boolean;
  /** Push content into the shell-level right inspector panel. */
  openInspector: (content: InspectorContent) => void;
  closeInspector: () => void;
  setOpen: (open: boolean) => void;
}

const InspectorContext = createContext<InspectorContextValue | null>(null);

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<InspectorContent | null>(null);
  const [open, setOpen] = useState(false);

  const openInspector = useCallback((next: InspectorContent) => {
    setContent(next);
    setOpen(true);
  }, []);

  const closeInspector = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ content, open, openInspector, closeInspector, setOpen }),
    [content, open, openInspector, closeInspector],
  );

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>;
}

export function useInspector(): InspectorContextValue {
  const context = useContext(InspectorContext);
  if (!context) {
    throw new Error("useInspector must be used within an InspectorProvider");
  }
  return context;
}
