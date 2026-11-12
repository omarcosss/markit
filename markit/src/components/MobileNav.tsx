import { Folder, Home, Plus, Search, User } from "iconoir-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { emitNavigate, emitOpenSearch } from "../lib/events";
import NewBookmarkModal from "./NewBookmarkModal";

interface NavItem {
  label: string;
  icon: typeof Home;
  /** Pages the item stays highlighted on. Actions (add, search) never highlight. */
  activePath?: string;
  onSelect: () => void;
}

/**
 * Bottom navigation for phone widths. Replaces the top header and the sidebar
 * drawer. Desktop keeps the sidebar and header, so this is hidden from md up.
 */
export default function MobileNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [addingBookmark, setAddingBookmark] = useState(false);

  const items: NavItem[] = [
    {
      label: "Home",
      icon: Home,
      activePath: "/dashboard",
      onSelect: () => {
        // Home always shows all bookmarks, even if a collection was open.
        emitNavigate({ type: "all" });
        navigate("/dashboard");
      },
    },
    {
      label: "Collections",
      icon: Folder,
      activePath: "/collections",
      onSelect: () => navigate("/collections"),
    },
    {
      label: "New bookmark",
      icon: Plus,
      onSelect: () => setAddingBookmark(true),
    },
    {
      label: "Search",
      icon: Search,
      onSelect: () => {
        // On the dashboard the field is already mounted; elsewhere the dashboard opens it on mount.
        if (pathname === "/dashboard") emitOpenSearch();
        else navigate("/dashboard", { state: { openSearch: true } });
      },
    },
    {
      label: "Profile",
      icon: User,
      activePath: "/profile",
      onSelect: () => navigate("/profile"),
    },
  ];

  return (
    <>
        <div className="absolute md:hidden z-20 w-dvw h-24 bottom-0 left-0 bg-linear-to-b from-white/5 to-white pointer-events-none"></div>
      <nav
        aria-label="Main"
        className="md:hidden fixed inset-x-4 z-30 bottom-[max(1rem,env(safe-area-inset-bottom))] rounded-full border border-stone-200 bg-white/95 backdrop-blur shadow-lg"
      >
        <ul className="flex items-center justify-between gap-1 p-1.5">
          {items.map((item) => {
            const active = item.activePath !== undefined && pathname === item.activePath;
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex-1">
                <button
                  type="button"
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={item.onSelect}
                  className={`flex h-12 w-full items-center justify-center rounded-full outline-teal-500 transition-colors ${
                    active ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  <Icon width={22} height={22} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {addingBookmark && <NewBookmarkModal onClose={() => setAddingBookmark(false)} />}
    </>
  );
}
