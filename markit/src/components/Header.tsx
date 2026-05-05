import { Menu, Plus, Search, Xmark } from "iconoir-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { usersService } from "../services/users";
import { emitSearch } from "../lib/events";
import Button from "./Button";
import NewBookmarkModal from "./NewBookmarkModal";
import UserInfoModal from "./UserInfoModal";
import { getAvatarUrl } from "../lib/avatar";

type ModalView = "newBookmark" | "userInfo" | null;

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalView>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    usersService
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  function handleLogout() {
    usersService.logout();
    navigate("/");
  }

  const avatarUrl = user ? getAvatarUrl(user.email) : "";

  const searchInput = (
    <>
      <div className="flex items-center w-full max-w-lg h-12 gap-2 px-4 bg-white/50 border border-white rounded-2xl focus-within:ring-2 focus-within:ring-teal-500 transition">
        <span className="text-stone-600">
          <Search width={18} height={18} />
        </span>
        <input
          type="search"
          placeholder="Search bookmarks…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            emitSearch(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Escape" && (setQuery(""), emitSearch(""))}
          className=" flex-1   outline-none "
        />
      </div>
      {query !== "" && (
        <Button
          onClick={() => (setQuery(""), emitSearch(""))}
          size="sm"
          variant="ghost"
          aria-label="Clear search"
        >
          <Xmark width={15} height={15} strokeWidth={2} />
        </Button>
      )}
    </>
  );

  return (
    <header className="w-full shrink-0">
      {/* Desktop: single-row layout */}
      <div className="hidden md:flex w-full h-20">
        <div className="flex w-full h-full items-center px-6 gap-3">
          <img src="/logo.svg" className="h-8" alt="Markit" />
        </div>
        <div className="flex min-w-80 flex-1 h-full items-center justify-center px-6 gap-3">
          {searchInput}
        </div>
        <div className="flex w-full h-full items-center justify-end px-6 gap-6">
          <Button
            size="md"
            className="nowrap"
            onClick={() => setModal("newBookmark")}
          >
            <Plus />
            New Bookmark
          </Button>
          {user && (
            <button
              type="button"
              onClick={() => setModal("userInfo")}
              aria-label="Account"
              className="w-12 h-12 shrink-0 rounded-full overflow-hidden bg-teal-100 hover:ring-2 hover:ring-teal-300 transition"
            >
              <img src={avatarUrl} alt="" className="w-full h-full" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: two rows */}
      <div className="md:hidden flex flex-col gap-3 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3 h-12">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu width={18} height={18} />
            </Button>
            <img src="/logo.svg" className="h-7" alt="Markit" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setModal("newBookmark")}
              aria-label="New bookmark"
            >
              <Plus width={18} height={18} />
            </Button>
            {user && (
              <button
                type="button"
                onClick={() => setModal("userInfo")}
                aria-label="Account"
                className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-teal-100 cursor-pointer hover:ring-2 hover:ring-teal-300 transition"
              >
                <img src={avatarUrl} alt="" className="w-full h-full" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">{searchInput}</div>
      </div>

      {modal === "newBookmark" && (
        <NewBookmarkModal onClose={() => setModal(null)} />
      )}
      {modal === "userInfo" && user && (
        <UserInfoModal
          user={user}
          onClose={() => setModal(null)}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}
