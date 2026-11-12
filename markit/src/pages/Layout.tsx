import type { ReactNode } from "react";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MobileNav from "../components/MobileNav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-stone-50">
      <Header />
      <section className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar. On mobile the bottom nav takes its place. */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <article className="flex-1 flex flex-col overflow-hidden bg-white md:rounded-tl-4xl md:shadow-brand md:border-l md:border-t md:border-stone-100">
          {children}
        </article>
      </section>
      <MobileNav />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
