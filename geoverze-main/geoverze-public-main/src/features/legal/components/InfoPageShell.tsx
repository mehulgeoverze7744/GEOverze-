import type { ReactNode } from "react";

import "../styles/info-pages-light.css";

/** Light chrome for COMPANY and LEGAL informational pages only. */
export function InfoPageShell({ children }: { children: ReactNode }) {
  return <div id="gvrze-info">{children}</div>;
}
