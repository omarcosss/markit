import { EditPencil, MoreHoriz, Trash } from "iconoir-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Button from "./Button";
import { collectionsService } from "../services/collections";
import { emitCollectionRemoved, emitNavigate } from "../lib/events";
import type { Collection } from "../types";

export default function CollectionOptionsMenu({
  collection,
  onRename,
}: {
  collection: Collection;
  onRename: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    setConfirmDelete(false);
  }

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await collectionsService.remove(collection.id);
      emitCollectionRemoved(collection.id);
      // The collection was the open view: fall back to All Bookmarks.
      emitNavigate({ type: "all" });
      toast.success(`"${collection.name}" deleted`);
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete collection");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <Button
        size="sm"
        variant="ghost"
        aria-label="Collection options"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <MoreHoriz width={20} height={20} />
      </Button>

      {open && (
        <div className="flex flex-col p-2 z-20 absolute left-0 top-full mt-2 min-w-48 bg-white border border-stone-200 rounded-3xl shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            className="justify-start w-full"
            onClick={() => {
              close();
              onRename();
            }}
          >
            <EditPencil width={18} height={18} strokeWidth={2} className="mr-2" />
            Rename
          </Button>

          {confirmDelete ? (
            <div className="flex flex-col gap-1 pt-1 border-t border-stone-100 mt-1">
              <p className="text-xs text-stone-500 px-3 py-1">
                Delete this collection? Its bookmarks will be kept.
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="flex-1 justify-center" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 justify-center text-red-600! hover:bg-red-50!"
                  loading={deleting}
                  onClick={handleDelete}
                >
                  <Trash width={15} height={15} strokeWidth={2} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="justify-start w-full text-red-600! hover:bg-red-50!"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash width={18} height={18} strokeWidth={2} className="mr-2" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
