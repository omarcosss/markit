import Modal from "./Modal";
import { useState, type FormEvent } from "react";
import Button from "./Button";
import { bookmarksService } from "../services/bookmarks";
import { emitBookmarkAdded } from "../lib/events";
import { toast } from "sonner";
import Input from "./Input";
import { OrbitalLoader } from "./OrbitalLoader";
import Divisor from "./Divisor";

export default function NewBookmarkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAddBookmark(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }
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
    >
      {adding ? (
        <div className="flex flex-col justify-center gap-4">
          <OrbitalLoader label="Adding..." />
        </div>
      ) : (
        <form
        onSubmit={handleAddBookmark}
        className="flex flex-col gap-6 px-2 pb-2"
        id="addBookmarkForm"
        >
          <Divisor/>
          <Input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            autoFocus
            label="Link"
            error={error}
            />
          <Divisor/>
          <div className="flex justify-end gap-3">
            <Button className="flex-1 justify-center" variant="secondary">
              Add and edit
            </Button>
            <Button
              form="addBookmarkForm"
              type="submit"
              loading={adding}
              className="flex-1 justify-center"
              >
              Add
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
