import { FilterList } from "iconoir-react";
import "./FilterToggle.css";

type FilterToggleProps = {
  id?: string;
  open: boolean;
  onToggle: (open: boolean) => void;
  /** Shows a small accent dot when the bar is hidden but filters are applied. */
  showDot?: boolean;
  controls?: string;
};

export default function FilterToggle({ id, open, onToggle, showDot = false, controls }: FilterToggleProps) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={open}
      aria-controls={controls}
      onClick={() => onToggle(!open)}
      className="filter-toggle"
    >
      <FilterList width={18} height={18} strokeWidth={1.8} aria-hidden="true" />
      <span>Filters</span>
      {showDot && !open && (
        <>
          <span className="filter-toggle__dot" aria-hidden="true" />
          <span className="sr-only">(filters applied)</span>
        </>
      )}
    </button>
  );
}
