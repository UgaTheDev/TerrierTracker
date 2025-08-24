"use client";
import { useState } from "react";
import { title, subtitle } from "./components/Primitives";
import ReqTable from "./components/HubRequirementsTable";
import Sidebar from "./components/Sidebar";
import Chart from "./components/Chart";
import CategoryProgress from "./components/CategoryProgress";
import YourCourses from "./childr_pages/YourCourses";
import AddCourses from "./childr_pages/AddCourses";
import HubTracker from "./childr_pages/HubTracker";
import YourBookmarks from "./childr_pages/YourBookmarks";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-6">
            <div className="inline-block max-w-xl text-center justify-center">
              <span className={title({ color: "violet" })}>Terrier&nbsp;</span>
              <br />
              <span className={title()}>Tracker.</span>
              <div className={subtitle({ class: "mt-4" })}>
                Track all courses and hub requirements with a single click.
              </div>
            </div>
            <div className="w-full max-w-7xl">
              <div className="flex justify-center">
                <Chart percentage={78} />
              </div>
            </div>
            <div className="flex gap-6 w-full max-w-7xl">
              <div className="w-[30%] flex-shrink-0">
                <CategoryProgress />
              </div>
              <div className="w-[70%]">
                <ReqTable />
              </div>
            </div>
          </section>
        );
      case "your-courses":
        return <YourCourses />;
      case "add-courses":
        return <AddCourses />;
      case "hub-tracker":
        return <HubTracker />;
      case "bookmarks":
        return <YourBookmarks />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
