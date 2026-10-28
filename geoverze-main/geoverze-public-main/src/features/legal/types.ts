export type LegalBlock = { kind: "p"; text: string } | { kind: "list"; items: string[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};
