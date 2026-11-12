import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { AccountPanel } from "../components/AccountModal";
import { ApiError } from "../lib/api";
import { usersService } from "../services/users";
import type { User } from "../types";
import Layout from "./Layout";

/** Mobile home for the account. Desktop keeps the same content in a modal from the header avatar. */
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    usersService
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/", { replace: true });
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Couldn't load your profile.");
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, reloadKey]);

  async function handleLogout() {
    try {
      await usersService.logout();
    } finally {
      navigate("/");
    }
  }

  return (
    <Layout>
      {/* pb-28 on mobile keeps the content clear of the bottom nav */}
      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-28 sm:px-6 sm:pt-6 md:px-10 md:pt-10 md:pb-10">
        <h2 className="mb-4 p-2 text-2xl font-brand font-bold text-stone-900">Profile</h2>

        {loadError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-stone-500">
            <p className="text-sm text-center px-4">{loadError}</p>
            <Button variant="secondary" onClick={() => { setLoadError(""); setReloadKey((k) => k + 1); }}>
              Try again
            </Button>
          </div>
        ) : user ? (
          <div className="rounded-3xl border border-stone-200 overflow-hidden">
            <AccountPanel
              user={user}
              onLogout={handleLogout}
              onUserUpdated={setUser}
              onDeleted={() => navigate("/")}
              variant="page"
            />
          </div>
        ) : null}
      </main>
    </Layout>
  );
}
