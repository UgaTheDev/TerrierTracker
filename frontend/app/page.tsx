"use client";
import { useState } from "react";
import { title, subtitle } from "./components/Primitives";
import ReqTable from "./components/HubRequirementsTable";
import Sidebar from "./components/Sidebar";
import Chart from "./components/Chart";
import CategoryProgress from "./components/CategoryProgress";
import YourCourses from "./childr_pages/YourCourses";
import AddCourses from "./childr_pages/AddCourses";
import HubHelper from "./childr_pages/HubHelper";
import YourBookmarks from "./childr_pages/YourBookmarks";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  semester?: string;
  professor?: string;
  description?: string;
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleAddCourse = (course: Course) => {
    const newId = Math.max(...enrolledCourses.map((c) => c.id), 0) + 1;
    const courseToAdd = { ...course, id: newId };
    setEnrolledCourses((prev) => [...prev, courseToAdd]);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-6">
            <div className="inline-block max-w-xl text-center justify-center">
              <span className={title({ color: "red" })}>Terrier&nbsp;</span>
              <br />
              <span className={title()}>Tracker.</span>
              <div className={subtitle({ class: "mt-4" })}>
                Track all courses and hub requirements with a single click.
              </div>
            </div>
            <div className="w-full max-w-7xl">
              <div className="flex justify-center">
                <Chart />
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
        return (
          <YourCourses
            enrolledCourses={enrolledCourses}
            onAddCourse={handleAddCourse}
            onNavigate={handleNavigate}
          />
        );
      case "add-courses":
        return (
          <AddCourses
            enrolledCourses={enrolledCourses}
            onAddCourse={handleAddCourse}
            onNavigate={handleNavigate}
          />
        );
      case "hub-helper":
        return <HubHelper />;
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
