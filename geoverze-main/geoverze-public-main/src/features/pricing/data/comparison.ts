import type { TierId } from "./plans";

export type ComparisonValue = boolean | string;

export type ComparisonRow = {
  feature: string;
  detail: string;
  values: Record<TierId, ComparisonValue>;
};

export type ComparisonGroup = {
  title: string;
  rows: ComparisonRow[];
};
