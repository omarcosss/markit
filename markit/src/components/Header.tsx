import { CloudBookmark, LogOut, Plus } from "iconoir-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { usersService } from "../services/users";
import Input from "./Input";
import Button from "./Button";
import NewBookmarkModal from "./NewBookmarkModal";

type ModalView = "newBookmark" | "editBookmark" | "newCollection" | null;

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalView>(null);
  

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
        <CloudBookmark width={24} height={24} strokeWidth={2}/>
        <h1 className="font-bold font-brand text-3xl">Mark<span className="text-teal-600">it</span></h1>
      </div>
      <div className="flex flex-1 h-full items-center justify-center px-6 gap-3">
        <input type="search" placeholder="Search" className="bg-white rounded-full h-12 px-4 border border-stone-200" />
      </div>
      <div className="flex w-full h-full items-center justify-end px-6 gap-6">
        <Button size="md" className="nowrap" onClick={() => setModal("newBookmark")}>
          <Plus />
          New Bookmark
        </Button>
        {user && (
          <div className="flex gap-3 rounded-full bg-white px-3 h-12 border border-stone-200 items-center justify-center">
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
