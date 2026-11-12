import { useEffect, useState, type KeyboardEvent } from "react";
import { FastArrowLeft, FastArrowRight, NavArrowLeft, NavArrowRight } from "iconoir-react";
import Button from "./Button";
import { Select, SelectItem } from "./Select";

interface PaginationProps {
  /** 1-based current page (already clamped by the caller). */
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Two chevrons drawn close together, since the icon set has no double-arrow glyph. */
function DoubleChevron({ direction }: { direction: "left" | "right" }) {
  const Icon = direction === "left" ? FastArrowLeft : FastArrowRight;
  return (
    <Icon width={18} height={18} />
  );
}

export default function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const [draft, setDraft] = useState(String(page));

  // Keep the input in step when the page changes from the buttons or a reset.
  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const atFirst = page <= 1;
  const atLast = page >= pageCount;

  function commitDraft() {
    const next = Number.parseInt(draft, 10);
    if (Number.isNaN(next)) {
      setDraft(String(page));
      return;
    }
    const clamped = Math.min(Math.max(next, 1), pageCount);
    setDraft(String(clamped));
    if (clamped !== page) onPageChange(clamped);
  }

  function handleDraftKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Escape") {
      setDraft(String(page));
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mx-2 mt-6 px-4 py-3"
    >
      <p className="text-sm text-stone-500 order-1">
        Showing {start}-{end} from {total}
      </p>

      <div className="flex items-center gap-1 order-3 w-full justify-center sm:order-2 sm:w-auto">
        <Button
          variant="ghost"
          size="sm"
          aria-label="First page"
          onClick={() => onPageChange(1)}
          disabled={atFirst}
        >
          <DoubleChevron direction="left" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
          disabled={atFirst}
        >
          <NavArrowLeft width={18} height={18} />
        </Button>

        <div className="flex items-center gap-2 px-1 text-sm text-stone-600">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Current page"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onBlur={commitDraft}
            onKeyDown={handleDraftKey}
            onFocus={(e) => e.currentTarget.select()}
            className="w-12 h-9 rounded-xl border border-stone-200 bg-white text-center text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span>of {pageCount}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={atLast}
        >
          <NavArrowRight width={18} height={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Last page"
          onClick={() => onPageChange(pageCount)}
          disabled={atLast}
        >
          <DoubleChevron direction="right" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-stone-500 order-2 sm:order-3">
        <span id="rows-per-page-label">Rows per page:</span>
        <Select
          aria-labelledby="rows-per-page-label"
          size="sm"
          className="w-20"
          value={String(pageSize)}
          onChange={(key) => onPageSizeChange(Number(key))}
        >
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} id={String(size)}>
              {String(size)}
            </SelectItem>
          ))}
        </Select>
      </div>
    </nav>
  );
}
