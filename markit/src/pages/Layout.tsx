import { type ReactNode } from "react";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-stone-50">
      <Header />
      <section className="flex flex-1 overflow-hidden">
        <Sidebar />
        <article className="flex-1 flex flex-col overflow-hidden bg-white rounded-tl-4xl border-l border-t border-stone-200 shadow-xs">
          {children}
        </article>
      </section>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
