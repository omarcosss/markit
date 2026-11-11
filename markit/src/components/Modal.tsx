import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Xmark } from "iconoir-react";
import Button from "./Button";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** No padding and no header: the content supplies its own layout and the close button floats. */
  flush?: boolean;
}

const MAX_WIDTHS = { sm: "360px", md: "560px", lg: "780px" } as const;

/** Duration must match the .modal-panel-out animation in index.css */
const CLOSE_DURATION_MS = 180;

export default function Modal({
  children,
  onClose,
  title,
  footer,
  size = "md",
  flush = false,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), CLOSE_DURATION_MS);
  }, [isClosing, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs ${
        isClosing ? "modal-backdrop-out" : "modal-backdrop-in"
      }`}
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex flex-col w-[90vw] h-fit max-h-[90vh] overflow-y-auto bg-stone-50 rounded-4xl shadow-xl ${
          flush ? "" : "gap-6 p-8"
        } ${isClosing ? "modal-panel-out" : "modal-panel-in"}`}
        style={{ maxWidth: MAX_WIDTHS[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {flush ? (
          <Button
            variant="ghost"
            onClick={handleClose}
            aria-label="Close"
            type="button"
            className="absolute top-4 right-4 z-10"
          >
            <Xmark width={18} height={18} className="text-stone-600" />
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-4">
            {title && (
              <h2 className="text-xl font-semibold m-0 font-brand">{title}</h2>
            )}
            <Button variant="ghost" onClick={handleClose} aria-label="Close" type="button">
              <Xmark width={18} height={18} className="text-stone-600" />
            </Button>
          </div>
        )}

        {/* Body */}
        {children}

        {/* Footer */}
        {footer && <div className="flex w-full gap-4">{footer}</div>}
      </div>
    </div>
  );
}
