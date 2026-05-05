import Modal from "./Modal";
import { useState, useEffect } from "react";
import Button from "./Button";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { emitBookmarkAdded } from "../lib/events";
import { toast } from "sonner";
import Input from "./Input";
import TextArea from "./TextArea";
import { OrbitalLoader } from "./OrbitalLoader";
import Divisor from "./Divisor";
import type { Collection, ScrapeResult } from "../types";

export default function NewBookmarkModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"url" | "details">("url");
  const [url, setUrl] = useState("");
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collectionId, setCollectionId] = useState<number | "">("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    collectionsService.list().then(setCollections).catch(() => {});
  }, []);

  async function handleScrape(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }
    setScraping(true);
    setError("");
    try {
      const result = await bookmarksService.scrape(trimmed);
      setScrapeResult(result);
      setTitle(result.title ?? "New bookmark");
      setDescription(result.description ?? "");
      setStep("details");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch URL");
    } finally {
      setScraping(false);
    }
  }

  async function handleSave() {
    if (!scrapeResult) return;
    setSaving(true);
    try {
      const bookmark = await bookmarksService.create({
        ...scrapeResult,
        title: title || null,
        description: description || null,
        collection_id: collectionId === "" ? null : collectionId,
      });
      emitBookmarkAdded(bookmark);
      toast.success("Bookmark saved");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save bookmark");
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title="Add new bookmark">
      {step === "url" ? (
        scraping ? (
          <div className="flex flex-col justify-center gap-4">
            <OrbitalLoader label="Fetching..." />
          </div>
        ) : (
          <form onSubmit={handleScrape} className="flex flex-col gap-6 px-2 pb-2" id="addBookmarkForm">
            <Divisor />
            <Input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              autoFocus
              label="Paste or type the link you want to bookmark"
              error={error}
            />
            <Divisor />
            <div className="flex justify-end gap-3">
              <Button form="addBookmarkForm" type="submit" loading={scraping} className="flex-1 justify-center">
                Next
              </Button>
            </div>
          </form>
        )
      ) : (
        saving ? (
          <div className="flex flex-col justify-center gap-4">
            <OrbitalLoader label="Saving..." />
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-2 pb-2">
            <Divisor />
            {scrapeResult?.title && (
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}
            <TextArea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              helperText="Optional"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-stone-600" htmlFor="collection-select">Collection</label>
              <select
                id="collection-select"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Divisor />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => setStep("url")}
                disabled={saving}
              >
                Back
              </Button>
              <Button className="flex-1 justify-center" onClick={handleSave} loading={saving}>
                Save
              </Button>
            </div>
          </div>
        )
      )}
    </Modal>
  );
}
