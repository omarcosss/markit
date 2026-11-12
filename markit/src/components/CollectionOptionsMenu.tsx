import { EditPencil, MoreHoriz, Trash } from "iconoir-react";
import { useState } from "react";
import { toast } from "sonner";
import Button from "./Button";
import Modal from "./Modal";
import { Menu, MenuButton, MenuItem, MenuSeparator, MenuTrigger } from "./Menu";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await collectionsService.remove(collection.id);
      emitCollectionRemoved(collection.id);
      // The collection was the open view: fall back to All Bookmarks.
      emitNavigate({ type: "all" });
      toast.success(`"${collection.name}" deleted`);
      setConfirmDelete(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete collection");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <MenuTrigger>
        <MenuButton aria-label="Collection options">
          <MoreHoriz width={20} height={20} />
        </MenuButton>
        <Menu aria-label="Collection options">
          <MenuItem id="rename" textValue="Rename" onAction={onRename}>
            <EditPencil width={18} height={18} strokeWidth={2} />
            Rename
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="delete" textValue="Delete" variant="danger" onAction={() => setConfirmDelete(true)}>
            <Trash width={18} height={18} strokeWidth={2} />
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>

      {confirmDelete && (
        <Modal
          size="sm"
          title="Delete collection?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 justify-center bg-red-600! hover:bg-red-700! text-white!"
                loading={deleting}
                onClick={handleDelete}
              >
                <Trash width={16} height={16} strokeWidth={2} />
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-stone-600">
            “{collection.name}” will be deleted. Its bookmarks will be kept.
          </p>
        </Modal>
      )}
    </div>
  );
}
