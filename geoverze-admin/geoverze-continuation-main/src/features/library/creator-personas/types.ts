export type LibraryCreatorPersona = {
  handle: string;
  displayName: string;
  role: string;
  bio: string;
  artKey: string;
  verified: boolean;
  location: string;
  joinedAt: string;
  featuredCollectionSlug: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatorPersonaFilterState = {
  verified: string;
};

export const emptyCreatorPersonaFilters: CreatorPersonaFilterState = {
  verified: "all",
};
