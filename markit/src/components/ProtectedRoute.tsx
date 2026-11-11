import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { usersService } from "../services/users";

type SessionState = "checking" | "signed-in" | "signed-out";

/**
 * Guards a route by asking the server whether the session cookie is valid.
 * A stale or forged cookie can't open the page: the server decides, not a
 * value stored in the browser.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>("checking");

  useEffect(() => {
    let cancelled = false;
    usersService
      .me()
      .then(() => !cancelled && setState("signed-in"))
      .catch((err) => {
        if (cancelled) return;
        // Only "not signed in" blocks the page. Other failures render the page,
        // which shows its own error state with a retry.
        const signedOut = err instanceof ApiError && err.status === 401;
        setState(signedOut ? "signed-out" : "signed-in");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") return null;
  if (state === "signed-out") return <Navigate to="/" replace />;
  return <>{children}</>;
}
