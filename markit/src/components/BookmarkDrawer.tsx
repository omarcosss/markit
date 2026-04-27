import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, EditPencil, Globe, Trash, Xmark } from "iconoir-react";
import { toast } from "sonner";
import type { Bookmark, Collection } from "../types";
import Button from "./Button";
import Input from "./Input";
import TextArea from "./TextArea";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { emitBookmarkUpdated } from "../lib/events";

const CLOSE_DURATION_MS = 180;

type BookmarkDrawerProps = {
  bookmark: Bookmark;
  onClose: () => void;
};

type EditableFields = {
  title: string;
  description: string;
  url: string;
  collectionId: number | null;
};

function toEditable(b: Bookmark): EditableFields {
  return {
    title: b.title ?? "",
    description: b.description ?? "",
    url: b.url,
    collectionId: b.collection_id,
  };
}

function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookmarkDrawer({ bookmark, onClose }: BookmarkDrawerProps) {
  const titleId = useId();
  const collectionFieldId = useId();

  const [currentBookmark, setCurrentBookmark] = useState(bookmark);
  const [fields, setFields] = useState<EditableFields>(() => toEditable(bookmark));
  const [collections, setCollections] = useState<Collection[]>([]);

  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isDirty = useMemo(() => {
    const original = toEditable(currentBookmark);
    return (
      fields.title !== original.title ||
      fields.description !== original.description ||
      fields.url !== original.url ||
      fields.collectionId !== original.collectionId
    );
  }, [fields, currentBookmark]);

  useEffect(() => {
    collectionsService.list().then(setCollections).catch(() => {});
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(onClose, CLOSE_DURATION_MS);
  }, [isClosing, onClose]);

  const handleCancelEdit = useCallback(() => {
    setFields(toEditable(currentBookmark));
    setIsEditing(false);
  }, [currentBookmark]);

  const handleSave = useCallback(async () => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await bookmarksService.update(currentBookmark.id, {
        title: fields.title,
        description: fields.description,
        url: fields.url,
        collection_id: fields.collectionId,
      });
      setCurrentBookmark(updated);
      setFields(toEditable(updated));
      emitBookmarkUpdated(updated);
      toast.success("Bookmark updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update bookmark");
    } finally {
      setSaving(false);
    }
  }, [currentBookmark.id, fields, isDirty]);

  const handleDelete = useCallback(async () => {
    try {
      await bookmarksService.remove(currentBookmark.id);
      toast.success("Bookmark deleted");
      handleClose();
    } catch {
      toast.error("Failed to delete bookmark");
    }
  }, [currentBookmark.id, handleClose]);

  const handleBackdropClick = useCallback(() => {
    if (isEditing) handleCancelEdit();
    else handleClose();
  }, [isEditing, handleCancelEdit, handleClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) handleCancelEdit();
        else handleClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isEditing) {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isEditing, handleCancelEdit, handleClose, handleSave]);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(currentBookmark.url);
    toast.success("Link copied");
  }, [currentBookmark.url]);

  const currentCollectionName =
    collections.find((c) => c.id === fields.collectionId)?.name ?? "None";

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/10 backdrop-blur-xs ${
        isClosing ? "modal-backdrop-out" : "modal-backdrop-in"
      }`}
    >
      <button
        type="button"
        aria-label="Close drawer"
        onClick={handleBackdropClick}
        className="absolute inset-0"
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`fixed overflow-x-hidden overflow-y-auto rounded-l-4xl h-dvh w-[40%] min-w-2xl right-0 top-0 shadow-lg bg-white z-60 focus:outline-none ${
          isClosing ? "drawer-out" : "drawer-in"
        }`}
      >
        <DrawerMedia bookmark={currentBookmark} />

        <article className="flex flex-col p-8 gap-8">
          {isEditing ? (
            <EditFields
              fields={fields}
              onChange={setFields}
              onSubmit={handleSave}
            />
          ) : (
            <ReadView
              titleId={titleId}
              bookmark={currentBookmark}
              onCopyUrl={copyUrl}
            />
          )}

          <div className="flex flex-col gap-4">
            <label htmlFor={collectionFieldId} className="text-stone-600 text-sm">
              Collection
            </label>
            {isEditing ? (
              <select
                id={collectionFieldId}
                value={fields.collectionId ?? ""}
                onChange={(e) =>
                  setFields((f) => ({
                    ...f,
                    collectionId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="text-lg border border-stone-200 rounded-full px-4 py-3 bg-white"
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                id={collectionFieldId}
                className="text rounded-full px-4 py-3 bg-stone-100 -mx-3"
              >
                {currentCollectionName}
              </span>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-3">
              <Button asChild className="flex-1 justify-center">
                <a
                  href={currentBookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowUpRight aria-hidden="true" />
                  Open link
                </a>
              </Button>
              {confirmDelete ? (
                <div className="flex gap-3" role="group" aria-label="Confirm delete">
                  <Button
                    variant="secondary"
                    className="flex-1 justify-center"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 justify-center text-red-600!"
                    onClick={handleDelete}
                  >
                    <Trash aria-hidden="true" />
                    Confirm
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="justify-center"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete bookmark"
                >
                  <Trash aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </article>

        <Button
          onClick={handleClose}
          variant="secondary"
          className="absolute top-3 left-3 shadow-lg"
          aria-label="Close drawer"
        >
          <Xmark width={18} height={18} strokeWidth={2} aria-hidden="true" />
        </Button>

        <div className="absolute top-3 right-3 flex gap-2">
          {isEditing && (
            <Button
              size="sm"
              className="shadow-lg"
              variant="secondary"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            variant={isEditing ? "primary" : "secondary"}
            loading={saving}
            disabled={isEditing && !isDirty}
            title={isEditing ? "Save (⌘Enter)" : "Edit bookmark"}
            aria-label={isEditing ? "Save changes" : "Edit bookmark"}
            className="shadow-lg"
          >
            {isEditing ? (
              <Check width={18} height={18} strokeWidth={2} aria-hidden="true" />
            ) : (
              <EditPencil aria-hidden="true" />
            )}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function DrawerMedia({ bookmark }: { bookmark: Bookmark }) {
  if (bookmark.thumbnail) {
    return (
      <img
        src={bookmark.thumbnail}
        alt=""
        role="presentation"
        className="w-full h-64 object-cover"
      />
    );
  }
  return (
    <div
      role="presentation"
      className="w-full h-32 bg-stone-100 flex items-center justify-center"
    >
      {bookmark.favicon ? (
        <img src={bookmark.favicon} alt="" className="w-8 h-8" />
      ) : (
        <Globe width={28} height={28} className="text-stone-300" aria-hidden="true" />
      )}
    </div>
  );
}

function ReadView({
  titleId,
  bookmark,
  onCopyUrl,
}: {
  titleId: string;
  bookmark: Bookmark;
  onCopyUrl: () => void;
}) {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h2 id={titleId} className="text-3xl font-bold">
          {bookmark.title}
        </h2>
        <p className="text-sm text-stone-600">
          Saved at{" "}
          <time dateTime={bookmark.created_at}>
            {formatSavedDate(bookmark.created_at)}
          </time>
        </p>
      </header>

      <div className="flex gap-5">
        <a
          className="hover:underline! bg-teal-50 text-teal-800! flex px-4 py-3 rounded-full w-full -mx-3"
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {bookmark.url}
        </a>
        <Button variant="ghost" onClick={onCopyUrl} aria-label="Copy link">
          <Copy aria-hidden="true" />
        </Button>
      </div>

      <section className="flex flex-col gap-4" aria-label="Description">
        <h3 className="text-stone-600 text-sm">Description</h3>
        {bookmark.description ? (
          <p>{bookmark.description}</p>
        ) : (
          <p className="text-stone-400 italic">
            Insert a description for the bookmark.
          </p>
        )}
      </section>
    </>
  );
}

function EditFields({
  fields,
  onChange,
  onSubmit,
}: {
  fields: EditableFields;
  onChange: (updater: (f: EditableFields) => EditableFields) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="Title"
        value={fields.title}
        onChange={(e) => onChange((f) => ({ ...f, title: e.target.value }))}
        autoFocus
      />
      <Input
        label="URL"
        type="url"
        value={fields.url}
        onChange={(e) => onChange((f) => ({ ...f, url: e.target.value }))}
      />
      <TextArea
        label="Description"
        value={fields.description}
        onChange={(e) =>
          onChange((f) => ({ ...f, description: e.target.value }))
        }
        rows={4}
      />
      <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
    </form>
  );
}
