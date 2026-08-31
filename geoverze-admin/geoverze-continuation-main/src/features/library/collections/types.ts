import type { LibraryStatus } from "@/features/library/types";

export type LibraryCollection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  artKey: string;
  subjectCategory: string;
  continent: string;
  curatorHandle: string;
  featured: boolean;
  status: LibraryStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  memberResourceIds: string[];
};

export type CollectionMember = {
  resourceId: string;
  title: string;
  slug: string;
  status: LibraryStatus;
  subjectCategory: string;
  continent: string;
};

export type CollectionFilterState = {
  status: string;
  category: string;
  continent: string;
  featured: string;
};

export const emptyCollectionFilters: CollectionFilterState = {
  status: "all",
  category: "all",
  continent: "all",
  featured: "all",
};
