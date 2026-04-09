import { useCallback, useEffect, useState } from "react";
import type { Bookmark, Collection } from "../types";
import Button from "./Button";
import { ArrowUpRight, EditPencil, Globe, Plus, Trash } from "iconoir-react";

const CLOSE_DURATION_MS = 180;

export default function BookmarkDrawer({bookmark, onClose}:{bookmark: Bookmark; onClose: () => void;}) {
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
  return(
    <div className={` fixed inset-0 z-50 bg-black/10 backdrop-blur-xs ${
        isClosing ? "modal-backdrop-out" : "modal-backdrop-in"
      }`} >
      <button onClick={handleClose} className="absolute inset-0" ></button>
      <aside className={`fixed overflow-x-hidden overflow-y-auto rounded-l-4xl h-dvh w-[40%] min-w-2xl right-0 top-0 shadow-lg bg-white z-60 ${
        isClosing ? "drawer-out" : "drawer-in"
      }`}>
        {bookmark.thumbnail ? (
        <img
          src={bookmark.thumbnail}
          alt=""
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-stone-100 flex items-center justify-center">
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="w-8 h-8" />
          ) : (
            <Globe width={28} height={28} className="text-stone-300" />
          )}
        </div>
      )}
      <article className="flex flex-col p-6 gap-6">
        <a className="hover:underline" href={bookmark.url} target="_blank" rel="noopener noreferrer">
          {bookmark.url}
        </a>
        <h2 className="text-2xl font-bold">{bookmark.title}</h2>
        {bookmark.description ? (
          <p className="">
            {bookmark.description}
          </p>        
        ) : (
          <p className="text-stone-600">Insert a description for the bookmark.</p>
        )}

        <div className="flex flex-col py-3 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <h3 className="text-stone-600">Collections</h3>
            <Button variant="secondary" size="sm"><Plus /></Button>
          </div>
          aqui ficam as tags de collections
        </div>
        <div className="flex flex-col py-3 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <h3 className="text-stone-600">Tags</h3>
            <Button variant="secondary" size="sm"><Plus /></Button>
          </div>
          aqui ficam as tags de tags
        </div>
        <div className="flex flex-col gap-3">
          <Button>
            <ArrowUpRight />
            Open link
          </Button>
          <Button variant="secondary">
            <Trash />
            Delete bookmark
          </Button>
        </div>
      </article>
        <Button onClick={handleClose} variant="secondary" className="absolute top-3 left-3 shadow-lg">X</Button>
        <Button onClick={handleClose} variant="secondary" className="absolute top-3 right-3 shadow-lg"><EditPencil /></Button>
      </aside>
    </div>
  )
}