import { ArrowUpRight, BookStack, Copy, MoreHoriz, Trash } from "iconoir-react";
import type { Bookmark } from "../types";
import Button from "./Button";
import { useState } from "react";
import BookmarkDrawer from "./BookmarkDrawer";
import { toast } from "sonner";
import { safeHref } from "../lib/url";
import Modal from "./Modal";
import { Menu, MenuButton, MenuItem, MenuSeparator, MenuTrigger } from "./Menu";

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
  const [drawer, setDrawer] = useState<stateType>("closed");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="group relative flex flex-col border border-stone-200 rounded-3xl transition-shadow  group overflow-visible hover:shadow-lg shadow-stone-100"
    >
      {drawer === "open" && (
        <BookmarkDrawer bookmark={bookmark} onClose={() => setDrawer("closed")}/>
      )}
      {/* <a
        href={safeHref(bookmark.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0"
      ></a> */}
      <button
        onClick={(e) => {e.stopPropagation(); setDrawer("open")}}
        className="absolute inset-0 z-0 rounded-3xl outline-teal-500"
      ></button>

      <div className="p-4 flex-1 flex flex-col gap-3 justify-between">
        <div className="text-md font-medium text-stone-900 line-clamp-2 leading-snug flex flex-col gap-3 overflow-visible">
          <div className="flex justify-center items-center w-9 h-9 rounded-full overflow-hidden">
            {bookmark.favicon && (
              <img src={bookmark.favicon} alt="" className="inline" />
            )}
          </div>
          <div className="flex flex-col w-3/4 gap-3">
            <div>
              <h2 className="text-lg font-semibold truncate max-w-full" title={bookmark.title ?? bookmark.domain ?? bookmark.url} >
                {bookmark.title ?? bookmark.domain ?? bookmark.url}
              </h2>
              {bookmark.domain && (
                <p className=" text-stone-600 truncate text-sm">
                  {bookmark.domain}
                </p>
              )}
            </div>
            <p className="flex flex-1 text-xs text-stone-600 gap-1 -ml-1">
              <BookStack width={16} height={16} className="shrink-0" />
              {collectionName ?? <span className="text-stone-400">No collection</span>}
            </p>
          </div>
        </div>
      </div>

      <MenuTrigger>
        <MenuButton aria-label="Bookmark options" className="z-10 absolute top-2 right-2">
          <MoreHoriz width={24} height={24} />
        </MenuButton>
        <Menu aria-label="Bookmark options">
          <MenuItem id="open" textValue="Open" href={safeHref(bookmark.url)} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight width={18} height={18} strokeWidth={2} />
            Open
          </MenuItem>
          <MenuItem
            id="copy"
            textValue="Copy link"
            onAction={() => {
              navigator.clipboard.writeText(bookmark.url);
              toast.success("Link copied");
            }}
          >
            <Copy width={18} height={18} strokeWidth={2} />
            Copy link
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
          title="Delete bookmark?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 justify-center bg-red-600! hover:bg-red-700! text-white!"
                onClick={() => {
                  setConfirmDelete(false);
                  onDelete();
                }}
              >
                <Trash width={16} height={16} strokeWidth={2} />
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-stone-600">
            This removes “{bookmark.title ?? bookmark.domain ?? bookmark.url}” from your account. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}


export default BookmarkCard;
