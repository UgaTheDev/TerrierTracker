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
import CourseMapper from "./childr_pages/CourseMapper";
import AddCustomCourseModal, {
  type CustomCourseArray,
} from "./components/AddCustomCourseModal";
import { NavBar } from "./components/NavBar";

export type EditedCourseArray = [string, string, string, number];

const API_BASE_URL = "https://terriertracker-production.up.railway.app/api";

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

type UserData = {
  id: number;
  email: string;
  name?: string;
  major?: string;
  minor?: string;
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<
    BookmarkedCourse[]
  >([]);
  const [customCourses, setCustomCourses] = useState<CustomCourseArray[]>([]);
  const [editedCourses, setEditedCourses] = useState<EditedCourseArray[]>([]);
  const [isCustomCourseModalOpen, setIsCustomCourseModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          setIsAuthenticated(true);
          loadUserData(userData.id);
        }
      } catch (error) {
        console.error("Error loading saved auth state:", error);
        localStorage.removeItem("user");
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const loadUserData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/courses`);
      const data = await response.json();
      const bookmarkedCourseCodes = data.bookmarked_courses || [];
      if (bookmarkedCourseCodes.length > 0) {
        const bookmarkedCoursesData = await Promise.all(
          bookmarkedCourseCodes.map(async (code: string) => {
            try {
              const courseResponse = await fetch(
                `${API_BASE_URL}/search-course`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ course_identifier: code }),
                }
              );
              const courseData = await courseResponse.json();

              return {
                id: code,
                code: code,
                name: code,
                credits: 4,
                hubRequirements: courseData.hub_requirements || [],
                school: code.split(" ")[0] || "Unknown",
              };
            } catch (error) {
              console.error(`Failed to load details for ${code}:`, error);
              return {
                id: code,
                code: code,
                name: code,
                credits: 4,
                hubRequirements: [],
                school: code.split(" ")[0] || "Unknown",
              };
            }
          })
        );
        setBookmarkedCourses(bookmarkedCoursesData);
      } else {
        setBookmarkedCourses([]);
      }

      const enrolledCourseCodes = data.enrolled_courses || [];
      if (enrolledCourseCodes.length > 0) {
        const enrolledCoursesData = await Promise.all(
          enrolledCourseCodes.map(async (code: string, index: number) => {
            try {
              const courseResponse = await fetch(
                `${API_BASE_URL}/search-course`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ course_identifier: code }),
                }
              );
              const courseData = await courseResponse.json();

              return {
                id: index + 1,
                courseId: code,
                course: code,
                credits: 4,
                requirements: courseData.hub_requirements?.join(", ") || "",
                hubRequirements: courseData.hub_requirements || [],
              };
            } catch (error) {
              console.error(`Failed to load details for ${code}:`, error);
              return {
                id: index + 1,
                courseId: code,
                course: code,
                credits: 4,
                requirements: "",
                hubRequirements: [],
              };
            }
          })
        );
        setEnrolledCourses(enrolledCoursesData);
      }

      try {
        const customResponse = await fetch(
          `${API_BASE_URL}/user/${userId}/courses/custom`
        );
        const customData = await customResponse.json();
        setCustomCourses(customData.custom_courses || []);
      } catch (error) {
        console.error("Failed to load custom courses:", error);
      }

      try {
        const editedResponse = await fetch(
          `${API_BASE_URL}/user/${userId}/courses/edited`
        );
        const editedData = await editedResponse.json();
        setEditedCourses(editedData.edited_courses || []);
      } catch (error) {
        console.error("Failed to load edited courses:", error);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

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

    customCourses.forEach((course) => {
      const hubsString = course[2];
      if (hubsString && hubsString.trim()) {
        const hubs = hubsString
          .split(" | ")
          .map((h) => h.trim())
          .filter((h) => h);
        hubs.forEach((hub) => {
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

  const handleLoginSuccess = async (userData: UserData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    await loadUserData(userData.id);
    setCurrentPage("dashboard");
  };

  const handleRegistrationSuccess = async (userData: UserData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthPage("login");
    setCurrentPage("dashboard");
    setEnrolledCourses([]);
    setBookmarkedCourses([]);
    setCustomCourses([]);
    setEditedCourses([]);

    localStorage.removeItem("user");
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

    try {
      const formData = new FormData();
      formData.append("pdf_file", file);

      const response = await fetch(`${API_BASE_URL}/process-pdf`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Response JSON:", result);

      if (result.debug_log) {
        console.log("=== PDF PROCESSING DEBUG LOG ===");
        console.log(result.debug_log);
      }

      if (response.ok && result.success) {
        console.log("PDF processing successful!");

        const startingId = Math.max(...enrolledCourses.map((c) => c.id), 0) + 1;

        const newCourses: Course[] = result.courses.map(
          (apiCourse: any, index: number) => ({
            id: startingId + index,
            courseId: apiCourse.course_code,
            course: apiCourse.course_code,
            credits: parseInt(apiCourse.credits) || 4,
            requirements: apiCourse.hub_requirements.join(", "),
            hubRequirements: apiCourse.hub_requirements,
            semester: apiCourse.semester || "Current",
          })
        );

        if (currentUser) {
          for (const course of newCourses) {
            try {
              await fetch(
                `${API_BASE_URL}/user/${currentUser.id}/courses/enrolled`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ course_code: course.courseId }),
                }
              );
            } catch (error) {
              console.error(`Failed to add course ${course.courseId}:`, error);
            }
          }
          setEnrolledCourses((prev) => [...prev, ...newCourses]);
        }
      } else {
        console.error("PDF processing failed:", result.error);
        setPdfError(result.error || "Failed to process PDF");
      }
    } catch (error) {
      console.error("Network error during PDF upload:", error);
      setPdfError("Network error while processing PDF");
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleAddCourse = async (course: Course) => {
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/user/${currentUser.id}/courses/enrolled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_code: course.courseId }),
      });

      const newId = Math.max(...enrolledCourses.map((c) => c.id), 0) + 1;
      const courseToAdd = { ...course, id: newId };
      setEnrolledCourses((prev) => [...prev, courseToAdd]);
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };

  const handleAddCustomCourse = async (
    course: CustomCourseArray
  ): Promise<void> => {
    if (!currentUser) return;

    try {
      await fetch(`${API_BASE_URL}/user/${currentUser.id}/courses/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course[0],
          courseName: course[1],
          hubRequirements: course[2]
            .split(" | ")
            .filter((h: string) => h.trim()),
          credits: course[3],
        }),
      });

      setCustomCourses((prev: CustomCourseArray[]) => [...prev, course]);
    } catch (error) {
      console.error("Failed to add custom course:", error);
    }
  };

  const handleDeleteCustomCourse = async (courseId: string) => {
    if (!currentUser) return;

    try {
      await fetch(
        `${API_BASE_URL}/user/${currentUser.id}/courses/custom/${courseId}`,
        {
          method: "DELETE",
        }
      );

      setCustomCourses((prev) => prev.filter((c) => c[0] !== courseId));
    } catch (error) {
      console.error("Failed to delete custom course:", error);
    }
  };

  const handleSaveEditedCourse = async (
    course: EditedCourseArray
  ): Promise<void> => {
    if (!currentUser) return;

    try {
      await fetch(`${API_BASE_URL}/user/${currentUser.id}/courses/edited`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course[0],
          courseName: course[1],
          hubRequirements: course[2]
            .split(" | ")
            .filter((h: string) => h.trim()),
          credits: course[3],
        }),
      });

      setEditedCourses((prev: EditedCourseArray[]) => {
        const filtered = prev.filter(
          (c: EditedCourseArray) => c[0] !== course[0]
        );
        return [...filtered, course];
      });
    } catch (error) {
      console.error("Failed to save edited course:", error);
    }
  };

  const handleRevertEditedCourse = async (courseId: string) => {
    if (!currentUser) return;

    try {
      await fetch(
        `${API_BASE_URL}/user/${currentUser.id}/courses/edited/${courseId}`,
        {
          method: "DELETE",
        }
      );

      setEditedCourses((prev) => prev.filter((c) => c[0] !== courseId));
    } catch (error) {
      console.error("Failed to revert edited course:", error);
    }
  };

  const handleRemoveCourse = async (courseId: number) => {
    const course = enrolledCourses.find((c) => c.id === courseId);
    if (!course || !currentUser) return;

    try {
      await fetch(`${API_BASE_URL}/user/${currentUser.id}/courses/enrolled`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_code: course.courseId }),
      });

      setEnrolledCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error) {
      console.error("Failed to remove course:", error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!currentUser) return;

    try {
      await fetch(`${API_BASE_URL}/user/${currentUser.id}/courses/enrolled`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_code: courseId }),
      });

      setEnrolledCourses((prev) =>
        prev.filter((course) => course.courseId !== courseId)
      );
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    if (!currentUser) return;

    const editedCourse: EditedCourseArray = [
      updatedCourse.courseId,
      updatedCourse.course,
      updatedCourse.hubRequirements?.join(" | ") || "",
      updatedCourse.credits,
    ];

    await handleSaveEditedCourse(editedCourse);

    setEnrolledCourses((prev) =>
      prev.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  const isBookmarked = (courseId: string): boolean => {
    return bookmarkedCourses.some((course) => course.id === courseId);
  };

  const handleBookmark = async (bookmarkedCourse: BookmarkedCourse) => {
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const isCurrentlyBookmarked = bookmarkedCourses.some(
      (course) => course.id === bookmarkedCourse.id
    );

    try {
      if (isCurrentlyBookmarked) {
        await fetch(
          `${API_BASE_URL}/user/${currentUser.id}/courses/bookmarked`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ course_code: bookmarkedCourse.code }),
          }
        );

        setBookmarkedCourses((prev) =>
          prev.filter((course) => course.id !== bookmarkedCourse.id)
        );
      } else {
        await fetch(
          `${API_BASE_URL}/user/${currentUser.id}/courses/bookmarked`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ course_code: bookmarkedCourse.code }),
          }
        );

        setBookmarkedCourses((prev) => [...prev, bookmarkedCourse]);
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    }
  };

  const handleBookmarkCourse = async (course: Course) => {
    const bookmarkedCourse: BookmarkedCourse = {
      id: course.courseId,
      code: course.courseId,
      name: course.course,
      credits: course.credits || 4,
      hubRequirements: course.hubRequirements || [],
      school: course.courseId?.split(" ")[0] || "CAS",
    };

    await handleBookmark(bookmarkedCourse);
  };

  const handleHubHelperBookmark = async (courseId: string, courseData: any) => {
    const bookmarkedCourse: BookmarkedCourse = {
      id: courseId,
      code: courseData.courseId || courseId,
      name: courseData.course || courseData.courseName || courseData.name,
      credits: courseData.credits || 4,
      hubRequirements: courseData.hubRequirements || [],
      school: (courseData.courseId || courseId).split(" ")[0] || "CAS",
    };

    await handleBookmark(bookmarkedCourse);
  };

  const handleRemoveBookmark = async (courseId: string) => {
    if (!currentUser) return;

    try {
      await fetch(`${API_BASE_URL}/user/${currentUser.id}/courses/bookmarked`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_code: courseId }),
      });

      setBookmarkedCourses((prev) =>
        prev.filter((course) => course.id !== courseId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        console.log("Hub Requirements Data:", hubRequirements);
        console.log("Total Progress:", {
          total_required: hubRequirements.reduce(
            (sum, req) => sum + req.required,
            0
          ),
          total_current: hubRequirements.reduce(
            (sum, req) => sum + req.current,
            0
          ),
          percentage: (
            (hubRequirements.reduce((sum, req) => sum + req.current, 0) /
              hubRequirements.reduce((sum, req) => sum + req.required, 0)) *
            100
          ).toFixed(0),
        });
        return (
          <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4 md:px-6">
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
            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-6 w-full max-w-7xl">
              <div className="w-full lg:w-[30%]">
                <CategoryProgress hubRequirements={hubRequirements} />
              </div>
              <div className="w-full lg:w-[70%]">
                <ReqTable hubRequirements={hubRequirements} />
              </div>
            </div>
          </section>
        );
      case "your-courses":
        return (
          <YourCourses
            enrolledCourses={enrolledCourses}
            customCourses={customCourses}
            editedCourses={editedCourses}
            onAddCourse={handleAddCourse}
            onNavigate={handleNavigate}
            onDeleteCourse={handleDeleteCourse}
            onDeleteCustomCourse={handleDeleteCustomCourse}
            onUpdateCourse={handleUpdateCourse}
            onRevertEdit={handleRevertEditedCourse}
            onOpenCustomCourseModal={() => setIsCustomCourseModalOpen(true)}
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
      case "course-mapper":
        return (
          <CourseMapper
            enrolledCourses={enrolledCourses}
            customCourses={customCourses}
            onNavigate={handleNavigate}
            userId={currentUser?.id}
            userInfo={{
              name: currentUser?.name || currentUser?.email,
              major: currentUser?.major,
              minor: currentUser?.minor,
            }}
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
    <>
      <NavBar onNavigate={handleNavigate} userId={currentUser?.id || null} />
      <div className="flex flex-col lg:flex-row h-screen">
        <Sidebar
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          {renderContent()}
        </main>

        <AddCustomCourseModal
          isOpen={isCustomCourseModalOpen}
          onClose={() => setIsCustomCourseModalOpen(false)}
          onAdd={handleAddCustomCourse}
        />
      </div>
    </>
  );
}
