import { useState, type FormEvent } from "react";
import { collectionsService } from "../services/collections";
import { emitCollectionUpdated } from "../lib/events";
import { toast } from "sonner";
import Button from "./Button";
import { TextField } from "./TextField";
import Modal from "./Modal";
import Divisor from "./Divisor";
import type { Collection } from "../types";

export default function EditCollectionModal({
  collection,
  onClose,
}: {
  collection: Collection;
  onClose: () => void;
}) {
  const [name, setName] = useState(collection.name);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name");
      return;
    }
    if (trimmed === collection.name) {
      onClose();
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await collectionsService.update(collection.id, trimmed);
      emitCollectionUpdated(updated);
      toast.success("Collection renamed");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename collection");
      setSaving(false);
    }
  }

  return (
    <Modal title="Rename collection" onClose={onClose}>
      {saving ? (
        <div className="flex flex-col justify-center gap-4">
          <div className="loader self-center"></div>
          <span className="text-center text-stone-600 text-sm">Saving…</span>
        </div>
      ) : (
        <form onSubmit={handleSave} id="editCollectionForm" className="flex flex-col gap-6">
          <Divisor />
          <TextField
            value={name}
            onChange={(v) => { setName(v); setError(""); }}
            label="Collection name"
            maxLength={100}
            autoFocus
            errorMessage={error}
          />
          <Divisor />
          <Button className="self-end" type="submit" form="editCollectionForm" loading={saving}>
            Save
          </Button>
        </form>
      )}
    </Modal>
  );
}
