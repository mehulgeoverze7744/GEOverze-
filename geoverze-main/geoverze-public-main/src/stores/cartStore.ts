/**
 * GEOstore cart.
 *
 * Lines carry both a money price and a credit price so a basket can be settled
 * with cash, with credits, or with a mix. Totals are always derived, never
 * stored. Persisted so a basket survives a reload before any backend exists.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  /** Line key: product id plus the chosen option signature. */
  id: string;
  productId: string;
  slug: string;
  name: string;
  /** Unit price in minor units, or `null` for credits-only items. */
  unitAmount: number | null;
  /** Unit credit cost, or `null` when credits are not accepted. */
  unitCredits: number | null;
  quantity: number;
  /** Selected variant options, e.g. `{ Size: "L" }`. */
  options: Record<string, string>;
  category: string;
};

type CartState = {
  lines: CartLine[];
  saved: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSaved: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      saved: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === line.id);
          if (!existing) return { lines: [...state.lines, line] };
          return {
            lines: state.lines.map((l) =>
              l.id === line.id ? { ...l, quantity: l.quantity + line.quantity } : l,
            ),
          };
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
        })),
      remove: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      saveForLater: (id) =>
        set((state) => {
          const line = state.lines.find((l) => l.id === id);
          if (!line) return state;
          return {
            lines: state.lines.filter((l) => l.id !== id),
            saved: [line, ...state.saved.filter((l) => l.id !== id)],
          };
        }),
      moveToCart: (id) =>
        set((state) => {
          const line = state.saved.find((l) => l.id === id);
          if (!line) return state;
          const existing = state.lines.find((l) => l.id === id);
          return {
            saved: state.saved.filter((l) => l.id !== id),
            lines: existing
              ? state.lines.map((l) =>
                  l.id === id ? { ...l, quantity: l.quantity + line.quantity } : l,
                )
              : [...state.lines, line],
          };
        }),
      removeSaved: (id) => set((state) => ({ saved: state.saved.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "geoverze.cart", version: 2 },
  ),
);

export const selectCartLines = (s: CartState) => s.lines;
export const selectSavedLines = (s: CartState) => s.saved;
export const selectCartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const selectCartSubtotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + (l.unitAmount ?? 0) * l.quantity, 0);
/** Credits required for the credits-only portion of the basket. */
export const selectCartCreditsDue = (s: CartState) =>
  s.lines.reduce((n, l) => n + (l.unitAmount === null ? (l.unitCredits ?? 0) * l.quantity : 0), 0);
/** Credits that could be used instead of cash, if the buyer chooses to. */
export const selectCartCreditsEligible = (s: CartState) =>
  s.lines.reduce((n, l) => n + (l.unitAmount !== null ? (l.unitCredits ?? 0) * l.quantity : 0), 0);
