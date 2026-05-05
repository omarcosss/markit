import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-stone-100">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <section className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile sidebar (drawer) */}
        {sidebarOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-stone-50 shadow-xl flex flex-col overflow-y-auto"
            >
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <article className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-10 flex flex-col overflow-hidden bg-white md:rounded-tl-4xl  md:shadow-brand">
          {children}
        </article>
      </section>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
