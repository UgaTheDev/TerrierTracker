"use client";
import { title, subtitle } from "@/components/primitives";
import ReqTable from "./components/HubRequirementsTable";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-6">
          <div className="inline-block max-w-xl text-center justify-center">
            <span className={title({ color: "violet" })}>Terrier&nbsp;</span>
            <br />
            <span className={title()}>Tracker.</span>
            <div className={subtitle({ class: "mt-4" })}>
              Track all courses and hub requirements with a single click.
            </div>
          </div>
          <div className="w-full max-w-6xl">
            <ReqTable />
          </div>
        </section>
      </main>
    </div>
  );
}
