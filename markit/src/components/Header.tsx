import { LogOut } from "iconoir-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { usersService } from "../services/users";
import Input from "./Input";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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
      <div className="flex w-62 h-full items-center px-6 gap-3">
        <h1 className="font-brand text-teal-700 font-bold text-2xl">Markit</h1>
      </div>
      <div className="flex flex-1 h-full items-center justify-center px-6 gap-3">
        <Input label="Search" />
      </div>
      <div className="flex w-62 h-full items-center justify-end px-6 gap-3">
        {user && (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}
