import { useState, type FormEvent } from "react";
import { collectionsService } from "../services/collections";
import { emitCollectionAdded } from "../lib/events";
import { toast } from "sonner";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import Divisor from "./Divisor";

export default function NewCollectionModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleNewCollection(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    setAdding(true);
    setError("");
    try {
      const col = await collectionsService.create(title.trim());
      emitCollectionAdded(col);
      toast.success(`"${col.name}" created`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create collection");
      setAdding(false);
    }
  }

  return (
    <Modal
      title="Create new collection"
      onClose={onClose}
    >
      {adding ? (
        <div className="flex flex-col justify-center gap-4">
          <div className="loader self-center"></div>
          <span className="text-center text-stone-600 text-sm">Creating new collection…</span>
        </div>
      ) : (
        <form onSubmit={handleNewCollection} id="newCollectionForm" className="flex flex-col gap-6">
          <Divisor />
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            label="Collection Title"
            autoFocus
            error={error}
          />
          <Divisor />
          <Button className="self-end" type="submit" form="newCollectionForm" loading={adding}>
            Add
          </Button>
        </form>
      )}
    </Modal>
  );
}
