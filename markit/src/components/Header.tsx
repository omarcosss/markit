import { LogOut, Plus, Xmark } from "iconoir-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { usersService } from "../services/users";
import { emitSearch } from "../lib/events";
import Button from "./Button";
import NewBookmarkModal from "./NewBookmarkModal";

type ModalView = "newBookmark" | "editBookmark" | "newCollection" | null;

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalView>(null);
  const [query, setQuery] = useState("");
  

  useEffect(() => {
    usersService.me().then(setUser).catch(() => {});
  }, []);

  function handleLogout() {
    usersService.logout();
    navigate("/");
  }

  const displayName = user?.name ?? user?.email ?? "";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <header className="flex w-full h-20 shrink-0">
      <div className="flex w-full h-full items-center px-6 gap-3">
        <img src="/logo.svg" className="h-8"/>
      </div>
      <div className="flex min-w-72 flex-1 h-full items-center justify-center px-6 gap-3">
        <input
          type="search"
          placeholder="Search bookmarks…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            emitSearch(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Escape" && (setQuery(""), emitSearch(""))}
          className="bg-white rounded-2xl h-12 px-4 border border-stone-200 w-full max-w-md outline-none focus:ring-2 focus:ring-teal-500 transition shadow-brand"
        />
        {query !== "" && (
          <><Button onClick={() => (setQuery(""), emitSearch(""))} size="sm" variant="secondary"><Xmark width={15} height={15} strokeWidth={2}/></Button></>
        ) }
      </div>
      <div className="flex w-full h-full items-center justify-end px-6 gap-6">
        <Button size="md" className="nowrap" onClick={() => setModal("newBookmark")}>
          <Plus />
          New Bookmark
        </Button>
        {user && (
          <div className="flex gap-3 rounded-2xl bg-white px-3 h-12 border border-stone-200 items-center justify-center shadow-brand">
            <div className="w-7 h-7 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
              {initial}
            </div>
            <p className="text-sm text-stone-800 truncate max-w-28">{displayName}</p>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <LogOut width={16} height={16} />
            </button>
          </div>
        )}
      </div>
      {modal === "newBookmark" && (
        <NewBookmarkModal onClose={() => setModal(null)} />
      )}
    </header>
  );
}
