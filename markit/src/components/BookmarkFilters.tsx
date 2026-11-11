import Button from "./Button";
import "./BookmarkFilters.css";
import {
  DEFAULT_FILTERS,
  isFilterActive,
  type BookmarkFilterState,
  type SavedWithin,
  type SortOption,
} from "../lib/bookmarkFilters";

const selectClass =
  "rounded-2xl bg-white px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-stone-200";

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
    <div id="bookmark-filters" className="flex flex-wrap w-full gap-8 mb-4 overflow-visible p-2 " role="group" aria-label="Filter bookmarks">
      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="filter-sort" className="text-sm px-1 text-stone-500">Sort by</label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
          className={selectClass}
        >
          <option value="default">Default</option>
          <option value="newest">Newest saved</option>
          <option value="oldest">Oldest saved</option>
          <option value="title">Title (A–Z)</option>
          <option value="domain">Domain (A–Z)</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="filter-domain" className="text-sm px-1 text-stone-500">Domain</label>
        <select
          id="filter-domain"
          value={filters.domain}
          onChange={(e) => onChange({ ...filters, domain: e.target.value })}
          className={selectClass}
        >
          <option value="">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="filter-saved" className="text-sm px-1 text-stone-500">Saved</label>
        <select
          id="filter-saved"
          value={filters.savedWithin}
          onChange={(e) => onChange({ ...filters, savedWithin: e.target.value as SavedWithin })}
          className={selectClass}
        >
          <option value="any">Any time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {active && (
        <Button variant="secondary" size="sm" className="my-auto" onClick={() => onChange(DEFAULT_FILTERS)}>
          Clear filters
        </Button>
      )}

      {active && (
        <span className="text-sm text-stone-400 my-auto" aria-live="polite">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>
      )}
    </div>
    </div>
    </div>
  );
}
