export type SortOption = "default" | "newest" | "oldest" | "title" | "domain";
export type SavedWithin = "any" | "7" | "30" | "365";

export interface BookmarkFilterState {
  sort: SortOption;
  domain: string; // "" = all domains
  savedWithin: SavedWithin;
}

export const DEFAULT_FILTERS: BookmarkFilterState = {
  sort: "default",
  domain: "",
  savedWithin: "any",
};

export function isFilterActive(f: BookmarkFilterState): boolean {
  return f.sort !== "default" || f.domain !== "" || f.savedWithin !== "any";
}
