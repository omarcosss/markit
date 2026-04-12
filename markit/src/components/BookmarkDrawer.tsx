import { useCallback, useEffect, useState } from "react";
import type { Bookmark, Collection } from "../types";
import Button from "./Button";
import { ArrowUpRight, Check, EditPencil, Globe, Plus, Trash, Xmark } from "iconoir-react";
import Input from "./Input";
import TextArea from "./TextArea";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { emitBookmarkUpdated } from "../lib/events";
import { toast } from "sonner";

const CLOSE_DURATION_MS = 180;

export default function BookmarkDrawer({bookmark, onClose}:{bookmark: Bookmark; onClose: () => void;}) {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState(bookmark.title ?? "");
  const [description, setDescription] = useState(bookmark.description ?? "");
  const [collectionId, setCollectionId] = useState<number | null>(bookmark.collection_id);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentBookmark, setCurrentBookmark] = useState(bookmark);

  const isDirty =
    title !== (currentBookmark.title ?? "") ||
    description !== (currentBookmark.description ?? "") ||
    collectionId !== currentBookmark.collection_id;

  useEffect(() => {
    collectionsService.list().then(setCollections).catch(() => {});
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), CLOSE_DURATION_MS);
  }, [isClosing, onClose]);

  const handleBackdropClick = useCallback(() => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      handleClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, handleClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          handleCancelEdit();
        } else {
          handleClose();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isEditing) {
        handleSave();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClose, isEditing, title, description, collectionId]);

  function handleCancelEdit() {
    setTitle(currentBookmark.title ?? "");
    setDescription(currentBookmark.description ?? "");
    setCollectionId(currentBookmark.collection_id);
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await bookmarksService.update(currentBookmark.id, { title, description, collection_id: collectionId });
      setCurrentBookmark(updated);
      setCollectionId(updated.collection_id);
      emitBookmarkUpdated(updated);
      toast.success("Bookmark updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update bookmark");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await bookmarksService.remove(currentBookmark.id);
      toast.success("Bookmark deleted");
      handleClose();
    } catch {
      toast.error("Failed to delete bookmark");
    }
  }

  return(
    <div className={`fixed inset-0 z-50 bg-black/10 backdrop-blur-xs ${
        isClosing ? "modal-backdrop-out" : "modal-backdrop-in"
      }`} >
      <button onClick={handleBackdropClick} className="absolute inset-0" />
      <aside className={`fixed overflow-x-hidden overflow-y-auto rounded-l-4xl h-dvh w-[40%] min-w-2xl right-0 top-0 shadow-lg bg-white z-60 ${
        isClosing ? "drawer-out" : "drawer-in"
      }`}>
        {currentBookmark.thumbnail ? (
          <img
            src={currentBookmark.thumbnail}
            alt=""
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-stone-100 flex items-center justify-center">
            {currentBookmark.favicon ? (
              <img src={currentBookmark.favicon} alt="" className="w-8 h-8" />
            ) : (
              <Globe width={28} height={28} className="text-stone-300" />
            )}
          </div>
        )}
        <article className="flex flex-col p-6 gap-6">
          <a className="hover:underline" href={currentBookmark.url} target="_blank" rel="noopener noreferrer">
            {currentBookmark.url}
          </a>

          {isEditing ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <TextArea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{currentBookmark.title}</h2>
              {currentBookmark.description ? (
                <p className="">{currentBookmark.description}</p>
              ) : (
                <p className="text-stone-600">Insert a description for the bookmark.</p>
              )}
            </>
          )}

          <div className="flex flex-col py-3 border-t border-stone-200">
            <div className="flex justify-between items-center">
              <h3 className="text-stone-600">Collection</h3>
              {isEditing ? (
                <select
                  value={collectionId ?? ""}
                  onChange={(e) => setCollectionId(e.target.value ? Number(e.target.value) : null)}
                  className="text-md border border-stone-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="">None</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-md font-bold">
                  {collections.find((c) => c.id === collectionId)?.name ?? "None"}
                </span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-3 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 justify-center"
                  onClick={handleSave}
                  loading={saving}
                  disabled={!isDirty}
                  title="Save (⌘Enter)"
                >
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col py-3 border-t border-stone-200">
            <div className="flex justify-between items-center">
              <h3 className="text-stone-600">Tags</h3>
              <Button variant="secondary" size="sm"><Plus /></Button>
            </div>
            aqui ficam as tags de tags
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-3">
              <a href={currentBookmark.url} target="_blank" rel="noopener noreferrer" className="contents">
                <Button className="w-full justify-center">
                  <ArrowUpRight />
                  Open link
                </Button>
              </a>
              {confirmDelete ? (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1 justify-center"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 justify-center text-red-600! border-red-200! hover:bg-red-50!"
                    onClick={handleDelete}
                  >
                    <Trash />
                    Confirm delete
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
                  <Trash />
                  Delete bookmark
                </Button>
              )}
            </div>
          )}
        </article>

        <Button onClick={handleClose} variant="secondary" className="absolute top-3 left-3 shadow-lg">
          <Xmark width={18} height={18} strokeWidth={2} />
        </Button>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "primary" : "secondary"}
          className={`absolute top-3 right-3 shadow-lg ${isDirty && isEditing ? "ring-2 ring-teal-400" : ""}`}
          loading={saving}
          title={isEditing ? "Save (⌘Enter)" : "Edit"}
        >
          {isEditing ? <Check width={18} height={18} strokeWidth={2} /> : <EditPencil />}
        </Button>
      </aside>
    </div>
  )
}
