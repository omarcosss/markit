import { ArrowUpRight, BookStack, Copy, MoreHoriz, Trash } from "iconoir-react";
import type { Bookmark } from "../types";
import Button from "./Button";
import { useState, useEffect, useRef } from "react";
import BookmarkDrawer from "./BookmarkDrawer";
import { toast } from "sonner";

type stateType = "open" | "closed";

function BookmarkCard({
  bookmark,
  onDelete,
  collectionName,
}: {
  bookmark: Bookmark;
  onDelete: () => void;
  collectionName?: string;
}) {
  const [menu, setMenu] = useState<stateType>("closed");
  const [drawer, setDrawer] = useState<stateType>("closed");

  return (
    <div
      className="group relative flex flex-col bg-white rounded-3xl border border-stone-200  transition-shadow hover:bg-stone-50/50 group overflow-visible"
    >
      {drawer === "open" && (
        <BookmarkDrawer bookmark={bookmark} onClose={() => setDrawer("closed")}/>
      )}
      {/* <a 
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"  
        className="absolute inset-0 z-0"
      ></a> */}
      <button
        onClick={(e) => {e.stopPropagation(); setDrawer("open")}}
        className="absolute inset-0 z-0"
      ></button>
      
      <div className="p-3 flex-1 flex flex-col gap-3 justify-between">
        {bookmark.domain && (
          <a 
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"  
            className="z-1"
          >
            <p className="mt-1 text-sm text-stone-600 truncate flex items-center gap-1 hover:underline hover:text-teal-800 py-1 px-2 hover:bg-teal-100 rounded-full">
              {bookmark.domain}
              <ArrowUpRight width={15} height={15}/>
            </p>
          </a>
        )}
        <p className="text-md font-medium text-stone-900 line-clamp-2 leading-snug">
          {bookmark.favicon && (
            <img src={bookmark.favicon} alt="" className="w-4 h-4 inline mr-1" />
          )}
          {bookmark.title ?? bookmark.domain ?? bookmark.url}
        </p>
        <div className="flex gap-3">
          <p className="flex self-center flex-1 text-xs text-stone-600 gap-1">
            <BookStack width={16} height={16} className="shrink-0" />
            {collectionName ?? <span className="text-stone-400">No collection</span>}
          </p>
          <Button className="z-10" size="sm" variant="secondary" onClick={() => setMenu("open")}><MoreHoriz width={24}/></Button>
          {menu === "open" && (
            <BookmarkOptionsMenu url={bookmark.url} onDelete={onDelete} onClose={() => setMenu("closed")}/>
          )}
        </div>
      </div>
    </div>
  );
}


export default BookmarkCard;

function BookmarkOptionsMenu({
  url,
  onDelete,
  onClose
} : {
  url: string;
  onDelete: () => void;
  onClose: () => void;
}
) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return(
    <>
      <div ref={menuRef} className="flex flex-col p-2 z-20 absolute bg-white border border-stone-200 right-3 bottom-2 translate-y-full rounded-3xl shadow-md">
        <Button size="sm" variant="ghost" className="justify" onClick={() => {
          navigator.clipboard.writeText(url);
          toast.success("Link copied");
          onClose();
        }}>
          <Copy width={18} height={18} strokeWidth={2} className="mr-2"/>
          Copy link
        </Button>
        {confirmDelete ? (
          <div className="flex flex-col gap-1 pt-1 border-t border-stone-100 mt-1">
            <p className="text-xs text-stone-500 px-3 py-1">Delete this bookmark?</p>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="flex-1 justify-center" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="ghost" className="flex-1 justify-center text-red-600! hover:bg-red-50!" onClick={(e) => { e.preventDefault(); onDelete(); }}>
                <Trash width={15} height={15} strokeWidth={2} className="mr-1"/>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash width={18} height={18} strokeWidth={2} className="mr-2"/>
            Delete
          </Button>
        )}
      </div>
    </>
  )
}