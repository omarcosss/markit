import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";
import { getToken } from "../lib/api";

type ModalView = "login" | "signup" | null;

export default function HomePage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalView>(null);

  // Already logged in — go straight to dashboard
  useEffect(() => {
    if (getToken()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="font-brand text-5xl font-bold tracking-tight m-0">
          Markit
        </h1>
        <p className="text-stone-600 text-lg m-0">
          Save and organise the web.
        </p>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => setModal("login")}>Login</Button>
          <Button variant="secondary" onClick={() => setModal("signup")}>
            Sign up
          </Button>
        </div>
      </main>

      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal("signup")}
        />
      )}

      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </>
  );
}
