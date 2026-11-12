import Button from "./Button";
import { Select, SelectItem } from "./Select";
import "./BookmarkFilters.css";
import {
  DEFAULT_FILTERS,
  isFilterActive,
  type BookmarkFilterState,
  type SavedWithin,
  type SortOption,
} from "../lib/bookmarkFilters";

// "All domains" is a real option in the list, so it needs a non-empty key.
const ALL_DOMAINS = "__all__";

export default function BookmarkFilters({
  filters,
  onChange,
  domains,
  resultCount,
  open,
}: {
  filters: BookmarkFilterState;
  open: boolean;
  onChange: (next: BookmarkFilterState) => void;
  domains: string[];
  resultCount: number;
}) {
  const active = isFilterActive(filters);

  return (
    <div className="filters-collapse" data-open={open}>
      <div className="filters-collapse__inner" inert={!open}>
        <div
          id="bookmark-filters"
          className="flex flex-wrap w-full gap-8 mb-4 overflow-visible p-2 items-end"
          role="group"
          aria-label="Filter bookmarks"
        >
          <Select
            label="Sort by"
            className="flex-1"
            value={filters.sort}
            onChange={(key) =>
              onChange({ ...filters, sort: String(key) as SortOption })
            }
          >
            <SelectItem id="default">Default</SelectItem>
            <SelectItem id="newest">Newest saved</SelectItem>
            <SelectItem id="oldest">Oldest saved</SelectItem>
            <SelectItem id="title">Title (A–Z)</SelectItem>
            <SelectItem id="domain">Domain (A–Z)</SelectItem>
          </Select>

          <Select
            label="Domain"
            className="flex-1"
            value={filters.domain || ALL_DOMAINS}
            onChange={(key) =>
              onChange({
                ...filters,
                domain: String(key) === ALL_DOMAINS ? "" : String(key),
              })
            }
          >
            <SelectItem id={ALL_DOMAINS}>All domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d} id={d}>
                {d}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Saved"
            className="flex-1"
            value={filters.savedWithin}
            onChange={(key) =>
              onChange({
                ...filters,
                savedWithin: String(key) as SavedWithin,
              })
            }
          >
            <SelectItem id="any">Any time</SelectItem>
            <SelectItem id="7">Last 7 days</SelectItem>
            <SelectItem id="30">Last 30 days</SelectItem>
            <SelectItem id="365">Last year</SelectItem>
          </Select>

          {active && (
            <span className="text-sm text-stone-400  py-3" aria-live="polite">
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </span>
          )}

          {active && (
            <Button
              variant="secondary"
              size="sm"
              className=""
              onClick={() => onChange(DEFAULT_FILTERS)}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
