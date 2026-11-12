import { Plus, Search, Xmark } from "iconoir-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { usersService } from "../services/users";
import { emitSearch } from "../lib/events";
import Button from "./Button";
import NewBookmarkModal from "./NewBookmarkModal";
import AccountModal from "./AccountModal";
import { getAvatarUrl } from "../lib/avatar";

type ModalView = "newBookmark" | "userInfo" | null;

/** Desktop only. On mobile the bottom nav (MobileNav) replaces it. */
export default function Header() {
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

  async function handleLogout() {
    try {
      await usersService.logout();
    } finally {
      navigate("/");
    }
  }

  const avatarUrl = user ? getAvatarUrl(user.email) : "";

  const searchInput = (
    <>
      <label htmlFor="searchInput" className="flex items-center w-full max-w-lg h-12 gap-2 px-4 bg-white/50 border border-stone-200 rounded-2xl focus-within:ring-2 focus-within:ring-teal-500 transition">
        <span className="text-stone-600">
          <Search width={18} height={18} />
        </span>
        <input
          id="searchInput"
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
      </label>
      {query !== "" && (
        <Button
          onClick={() => (setQuery(""), emitSearch(""))}
          size="md"
          variant="ghost"
          aria-label="Clear search"
        >
          <Xmark width={15} height={15} strokeWidth={2} />
        </Button>
      )}
    </>
  );

  return (
    <header className="hidden md:block w-full shrink-0">
      <div className="flex w-full h-20">
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

      {modal === "newBookmark" && (
        <NewBookmarkModal onClose={() => setModal(null)} />
      )}
      {modal === "userInfo" && user && (
        <AccountModal
          user={user}
          onClose={() => setModal(null)}
          onLogout={handleLogout}
          onUserUpdated={setUser}
          onDeleted={() => {
            setModal(null);
            navigate("/");
          }}
        />
      )}
    </header>
  );
}
