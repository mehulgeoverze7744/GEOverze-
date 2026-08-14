export type LibraryStatus = "draft" | "pending" | "published" | "archived";
export type LibraryDifficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface LibrarySeo {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
}

export interface LibraryAttachment {
  id: string;
  name: string;
  kind: "PDF" | "Image" | "Dataset" | "Map";
  size: string;
}

export interface LibraryVersion {
  id: string;
  version: string;
  author: string;
  summary: string;
  at: string;
}

export interface LibraryActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  slug: string;
  category: string;
  country: string;
  region: string;
  difficulty: LibraryDifficulty;
  tags: string[];
  language: string;
  author: string;
  status: LibraryStatus;
  featured: boolean;
  views: number;
  bookmarks: number;
  readTime: number;
  description: string;
  body: string;
  coverLabel: string;
  gallery: string[];
  attachments: LibraryAttachment[];
  seo: LibrarySeo;
  createdAt: string;
  updatedAt: string;
  viewsSeries: number[];
  versions: LibraryVersion[];
  activity: LibraryActivity[];
}

export interface LibraryFilterState {
  status: string;
  category: string;
  region: string;
  difficulty: string;
  language: string;
  featured: string;
}

export const emptyLibraryFilters: LibraryFilterState = {
  status: "all",
  category: "all",
  region: "all",
  difficulty: "all",
  language: "all",
  featured: "all",
};

export const libraryDifficulties: LibraryDifficulty[] = ["Easy", "Medium", "Hard", "Expert"];
export const libraryStatuses: LibraryStatus[] = ["draft", "pending", "published", "archived"];
