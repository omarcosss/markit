import Modal from "./Modal";
import { useState, type FormEvent } from "react";
import Button from "./Button";
import { bookmarksService } from "../services/bookmarks";
import { emitBookmarkAdded } from "../lib/events";
import { toast } from "sonner";
import Input from "./Input";

export default function NewBookmarkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAddBookmark(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setAdding(true);
    setError("");
    try {
      const metadata = await bookmarksService.scrape(trimmed);
      const bookmark = await bookmarksService.create({ ...metadata, collection_id: null });
      emitBookmarkAdded(bookmark);
      toast.success("Bookmark saved");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add bookmark");
      setAdding(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Add new bookmark"
      footer={
        <>
          <Button className="flex-1" variant="secondary">
            Add and edit
          </Button>
          <Button
            form="addBookmarkForm"
            type="submit"
            loading={adding}
            className="flex-1"
          >
            Add
          </Button>
        </>
      }
    >
      {adding ? (
        <div className="flex flex-col justify-center gap-4">
          <div className="loader self-center"></div>
          <span className="text-center text-stone-600 text-sm">Adding…</span>
        </div>
      ) : (
        <form
          onSubmit={handleAddBookmark}
          className="flex flex-col gap-2 px-2 pb-2"
          id="addBookmarkForm"
        >
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
            required
            label="Link"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      )}
    </Modal>
  );
}
