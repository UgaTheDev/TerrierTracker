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

type BookmarkedCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  hubRequirements: string[];
  school: string;
};

type HubRequirement = {
  name: string;
  required: number;
  current: number;
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<
    BookmarkedCourse[]
  >([]);

  // Define the required counts for each hub requirement (this can be configurable)
  const hubRequirementDefinitions = {
    "Writing, Research, and Inquiry": 1,
    "Quantitative Reasoning I": 1,
    "Quantitative Reasoning II": 1,
    "Digital/Multimedia Expression": 1,
    "Scientific Inquiry I": 2,
    "Scientific Inquiry II": 1,
    "Social Inquiry I": 2,
    "Social Inquiry II": 1,
    "Mathematical Modeling": 1,
    "Ethical Reasoning": 1,
    // Add more hub requirements as needed
  };

  // Calculate hub requirements dynamically from enrolled courses
  const calculateHubRequirements = (): HubRequirement[] => {
    const hubCounts: { [key: string]: number } = {};

    // Count hub requirements from enrolled courses
    enrolledCourses.forEach((course) => {
      if (course.hubRequirements && Array.isArray(course.hubRequirements)) {
        course.hubRequirements.forEach((hub) => {
          hubCounts[hub] = (hubCounts[hub] || 0) + 1;
        });
      }
    });

    // Create hub requirements array with current progress
    return Object.entries(hubRequirementDefinitions).map(
      ([name, required]) => ({
        name,
        required,
        current: hubCounts[name] || 0,
      })
    );
  };

  // Get dynamic hub requirements
  const hubRequirements = calculateHubRequirements();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleAddCourse = (course: Course) => {
    const newId = Math.max(...enrolledCourses.map((c) => c.id), 0) + 1;
    const courseToAdd = { ...course, id: newId };
    setEnrolledCourses((prev) => [...prev, courseToAdd]);
  };

  const handleRemoveCourse = (courseId: number) => {
    setEnrolledCourses((prev) =>
      prev.filter((course) => course.id !== courseId)
    );
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setEnrolledCourses((prev) =>
      prev.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  // Bookmark functions
  const isBookmarked = (courseId: string) => {
    return bookmarkedCourses.some((course) => course.id === courseId);
  };

  const handleBookmark = (courseId: string, courseData: any) => {
    if (isBookmarked(courseId)) {
      // Remove bookmark
      handleRemoveBookmark(courseId);
    } else {
      // Add bookmark
      const bookmarkedCourse: BookmarkedCourse = {
        id: courseId,
        code: courseData.courseId,
        name: courseData.course || courseData.courseName,
        credits: courseData.credits || 4,
        hubRequirements: courseData.hubRequirements || [],
        school: courseData.courseId.split(" ")[0] || "CAS",
      };
      setBookmarkedCourses((prev) => [...prev, bookmarkedCourse]);
    }
  };

  const handleRemoveBookmark = (courseId: string) => {
    setBookmarkedCourses((prev) =>
      prev.filter((course) => course.id !== courseId)
    );
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
                <Chart hubRequirements={hubRequirements} />
              </div>
            </div>
            <div className="flex gap-6 w-full max-w-7xl">
              <div className="w-[30%] flex-shrink-0">
                <CategoryProgress hubRequirements={hubRequirements} />
              </div>
              <div className="w-[70%]">
                <ReqTable hubRequirements={hubRequirements} />
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
            onRemoveCourse={handleRemoveCourse}
            onUpdateCourse={handleUpdateCourse}
          />
        );
      case "add-courses":
        return (
          <AddCourses
            enrolledCourses={enrolledCourses}
            onAddCourse={handleAddCourse}
            onNavigate={handleNavigate}
            isBookmarked={isBookmarked}
            handleBookmark={handleBookmark}
          />
        );
      case "hub-helper":
        return (
          <HubHelper
            onBookmark={handleBookmark}
            bookmarkedCourses={bookmarkedCourses}
            isBookmarked={isBookmarked}
          />
        );
      case "bookmarks":
        return (
          <YourBookmarks
            bookmarkedCourses={bookmarkedCourses}
            hubRequirements={hubRequirements}
            onRemoveBookmark={handleRemoveBookmark}
          />
        );
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
