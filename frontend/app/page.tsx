"use client";
import { useState, useEffect } from "react";
import { title, subtitle } from "./components/Primitives";
import ReqTable from "./components/HubRequirementsTable";
import Sidebar from "./components/Sidebar";
import Chart from "./components/Chart";
import CategoryProgress from "./components/CategoryProgress";
import YourCourses from "./childr_pages/YourCourses";
import AddCourses from "./childr_pages/AddCourses";
import HubHelper from "./childr_pages/HubHelper";
import YourBookmarks from "./childr_pages/YourBookmarks";
import Login from "./childr_pages/Login";
import Registration from "./childr_pages/Registration";
import CourseRecommender from "./childr_pages/Recommender";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  semester?: string;
  professor?: string;
  description?: string;
  hubRequirements?: string[];
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<
    BookmarkedCourse[]
  >([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedAuthState = localStorage.getItem(
          "terrierTracker_isAuthenticated"
        );
        const savedEnrolledCourses = localStorage.getItem(
          "terrierTracker_enrolledCourses"
        );
        const savedBookmarkedCourses = localStorage.getItem(
          "terrierTracker_bookmarkedCourses"
        );
        const savedCurrentPage = localStorage.getItem(
          "terrierTracker_currentPage"
        );

        if (savedAuthState === "true") {
          setIsAuthenticated(true);

          if (savedEnrolledCourses) {
            setEnrolledCourses(JSON.parse(savedEnrolledCourses));
          }
          if (savedBookmarkedCourses) {
            setBookmarkedCourses(JSON.parse(savedBookmarkedCourses));
          }
          if (savedCurrentPage) {
            setCurrentPage(savedCurrentPage);
          }
        }
      } catch (error) {
        console.error("Error loading saved auth state:", error);
        localStorage.removeItem("terrierTracker_isAuthenticated");
        localStorage.removeItem("terrierTracker_enrolledCourses");
        localStorage.removeItem("terrierTracker_bookmarkedCourses");
        localStorage.removeItem("terrierTracker_currentPage");
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("terrierTracker_isAuthenticated", "true");
      localStorage.setItem(
        "terrierTracker_enrolledCourses",
        JSON.stringify(enrolledCourses)
      );
      localStorage.setItem(
        "terrierTracker_bookmarkedCourses",
        JSON.stringify(bookmarkedCourses)
      );
      localStorage.setItem("terrierTracker_currentPage", currentPage);
    }
  }, [isAuthenticated, enrolledCourses, bookmarkedCourses, currentPage]);

  const hubRequirementDefinitions = {
    "Philosophical Inquiry and Life's Meanings": 1,
    "Aesthetic Exploration": 1,
    "Historical Consciousness": 1,

    "Scientific Inquiry I": 1,
    "Social Inquiry I": 1,
    "Scientific Inquiry II or Social Inquiry II": 1,

    "Quantitative Reasoning I": 1,
    "Quantitative Reasoning II": 1,

    "The Individual in Community": 1,
    "Global Citizenship and Intercultural Literacy": 2,
    "Ethical Reasoning": 1,

    "First-Year Writing Seminar": 1,
    "Writing, Research, and Inquiry": 1,
    "Writing-Intensive Course": 2,
    "Oral and/or Signed Communication": 1,
    "Digital/Multimedia Expression": 1,

    "Critical Thinking": 2,
    "Research and Information Literacy": 2,
    "Teamwork/Collaboration": 2,
    "Creativity/Innovation": 2,
  };

  const calculateHubRequirements = (): HubRequirement[] => {
    const hubCounts: { [key: string]: number } = {};

    enrolledCourses.forEach((course) => {
      if (course.hubRequirements && Array.isArray(course.hubRequirements)) {
        course.hubRequirements.forEach((hub) => {
          hubCounts[hub] = (hubCounts[hub] || 0) + 1;
          if (hub === "Scientific Inquiry II" || hub === "Social Inquiry II") {
            const orRequirement = "Scientific Inquiry II or Social Inquiry II";
            hubCounts[orRequirement] = (hubCounts[orRequirement] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(hubRequirementDefinitions).map(
      ([name, required]) => ({
        name,
        required,
        current: hubCounts[name] || 0,
      })
    );
  };

  const hubRequirements = calculateHubRequirements();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleRegistrationSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthPage("login");
    setCurrentPage("dashboard");
    setEnrolledCourses([]);
    setBookmarkedCourses([]);

    localStorage.removeItem("terrierTracker_isAuthenticated");
    localStorage.removeItem("terrierTracker_enrolledCourses");
    localStorage.removeItem("terrierTracker_bookmarkedCourses");
    localStorage.removeItem("terrierTracker_currentPage");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("=== FRONTEND PDF UPLOAD STARTED ===");

    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("Selected file:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    setPdfFile(file);
    setPdfProcessing(true);
    setPdfError(null);

    console.log("State updated: pdfProcessing = true");

    try {
      const formData = new FormData();
      formData.append("pdf_file", file);

      console.log("FormData created, making API call to Flask...");

      const response = await fetch(
        "https://terriertracker-production.up.railway.app/api/process-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const result = await response.json();
      console.log("Response JSON:", result);

      if (response.ok && result.success) {
        console.log("PDF processing successful!");
        console.log("Raw API courses:", result.courses);

        const newCourses: Course[] = result.courses.map(
          (apiCourse: any, index: number) => {
            const convertedCourse = {
              id: Math.max(...enrolledCourses.map((c) => c.id), 0) + index + 1,
              courseId: apiCourse.course_code,
              course: apiCourse.course_code,
              credits: parseInt(apiCourse.credits) || 4,
              requirements: apiCourse.hub_requirements.join(", "),
              hubRequirements: apiCourse.hub_requirements,
              semester: apiCourse.semester || "Current",
            };
            console.log(`Converted course ${index + 1}:`, convertedCourse);
            return convertedCourse;
          }
        );

        console.log("All converted courses:", newCourses);
        console.log("Current enrolled courses before adding:", enrolledCourses);

        setEnrolledCourses((prev) => {
          const updated = [...prev, ...newCourses];
          console.log("Updated enrolled courses:", updated);
          return updated;
        });

        console.log("PDF processed successfully. Added courses:", newCourses);
      } else {
        console.error("PDF processing failed:", result.error);
        setPdfError(result.error || "Failed to process PDF");
      }
    } catch (error) {
      console.error("Network error during PDF upload:", error);
      setPdfError("Network error while processing PDF");
    } finally {
      setPdfProcessing(false);
      console.log("State updated: pdfProcessing = false");
      console.log("=== FRONTEND PDF UPLOAD COMPLETED ===");
    }
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

  const handleDeleteCourse = (courseId: string) => {
    setEnrolledCourses((prev) =>
      prev.filter((course) => course.courseId !== courseId)
    );
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setEnrolledCourses((prev) =>
      prev.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  const isBookmarked = (courseId: string): boolean => {
    const result = bookmarkedCourses.some((course) => course.id === courseId);
    console.log(`Checking if ${courseId} is bookmarked:`, result);
    return result;
  };

  const handleBookmark = (bookmarkedCourse: BookmarkedCourse) => {
    console.log("Handling bookmark for:", bookmarkedCourse);

    setBookmarkedCourses((prev) => {
      const isCurrentlyBookmarked = prev.some(
        (course) => course.id === bookmarkedCourse.id
      );

      if (isCurrentlyBookmarked) {
        console.log("Removing bookmark for:", bookmarkedCourse.id);
        return prev.filter((course) => course.id !== bookmarkedCourse.id);
      } else {
        console.log("Adding bookmark:", bookmarkedCourse);
        return [...prev, bookmarkedCourse];
      }
    });
  };

  const handleBookmarkCourse = (course: Course) => {
    const courseId = course.courseId;
    console.log("Legacy bookmark handler called for:", courseId);

    if (isBookmarked(courseId)) {
      handleRemoveBookmark(courseId);
    } else {
      const bookmarkedCourse: BookmarkedCourse = {
        id: courseId,
        code: course.courseId,
        name: course.course,
        credits: course.credits || 4,
        hubRequirements: course.hubRequirements || [],
        school: course.courseId?.split(" ")[0] || "CAS",
      };
      setBookmarkedCourses((prev) => [...prev, bookmarkedCourse]);
    }
  };

  const handleHubHelperBookmark = (courseId: string, courseData: any) => {
    console.log("Hub Helper bookmark for:", courseId, courseData);

    if (isBookmarked(courseId)) {
      handleRemoveBookmark(courseId);
    } else {
      const bookmarkedCourse: BookmarkedCourse = {
        id: courseId,
        code: courseData.courseId || courseId,
        name: courseData.course || courseData.courseName || courseData.name,
        credits: courseData.credits || 4,
        hubRequirements: courseData.hubRequirements || [],
        school: (courseData.courseId || courseId).split(" ")[0] || "CAS",
      };
      console.log("Adding bookmark from Hub Helper:", bookmarkedCourse);
      setBookmarkedCourses((prev) => [...prev, bookmarkedCourse]);
    }
  };

  const handleRemoveBookmark = (courseId: string) => {
    console.log("Removing bookmark:", courseId);
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
            onDeleteCourse={handleDeleteCourse}
            onUpdateCourse={handleUpdateCourse}
          />
        );
      case "add-courses":
        return (
          <AddCourses
            enrolledCourses={enrolledCourses}
            bookmarkedCourses={bookmarkedCourses}
            onAddCourse={handleAddCourse}
            onBookmarkCourse={handleBookmarkCourse}
            onNavigate={handleNavigate}
            isBookmarked={isBookmarked}
            handleBookmark={handleBookmark}
            pdfFile={pdfFile}
            pdfProcessing={pdfProcessing}
            handlePdfUpload={handlePdfUpload}
            pdfError={pdfError}
          />
        );
      case "hub-helper":
        return (
          <HubHelper
            onBookmark={handleHubHelperBookmark}
            bookmarkedCourses={bookmarkedCourses}
            isBookmarked={isBookmarked}
          />
        );
      case "recommender":
        return (
          <CourseRecommender
            hubRequirements={hubRequirements}
            onBookmark={handleHubHelperBookmark}
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
            onNavigate={handleNavigate}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authPage === "register") {
      return (
        <Registration
          onRegistrationSuccess={handleRegistrationSuccess}
          onBackToLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthPage("register")}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
