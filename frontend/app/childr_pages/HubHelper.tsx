import React, { useState, useEffect } from "react";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  Filter,
  Plus,
  Upload,
  AlertCircle,
} from "lucide-react";
import {
  checkHealth,
  searchCourse,
  getAllCourses,
  getMultipleCourseHubs,
} from "../../api.js";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  description?: string;
  hubRequirements?: string[];
};

interface CourseData {
  courseId: string;
  courseName: string;
  hubRequirements: string[];
  requirementsText: string;
}

interface CourseSearcherProps {
  handleAddCourse: (course: Course) => void;
  isEnrolled: (courseId: string) => boolean;
}

// API base URL - should match your Flask server
const API_BASE_URL = "http://localhost:5000/api";

// API helper functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

const fetchAllCourses = async (): Promise<CourseData[]> => {
  try {
    const data = await apiRequest("/all-courses", { method: "GET" });

    // Convert the courses object to array format
    const coursesArray = Object.entries(data.courses || {}).map(
      ([code, name]) => ({
        courseId: code,
        courseName: name as string,
        hubRequirements: [], // Will be fetched when needed
        requirementsText: "Loading requirements...",
      })
    );

    return coursesArray;
  } catch (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

const fetchHubRequirements = async (courseCode: string): Promise<string[]> => {
  try {
    const data = await apiRequest("/search-course", {
      method: "POST",
      body: JSON.stringify({
        course_identifier: courseCode,
      }),
    });

    return data.hub_requirements || [];
  } catch (error) {
    console.error(`Error fetching hub requirements for ${courseCode}:`, error);
    return [];
  }
};

function CourseSearcher({ handleAddCourse, isEnrolled }: CourseSearcherProps) {
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await apiRequest("/health", { method: "GET" });
        setApiHealthy(true);
      } catch (error) {
        console.error("API health check failed:", error);
        setError(
          "Cannot connect to the API server. Please ensure the Flask server is running on http://localhost:5000"
        );
        setApiHealthy(false);
      }
    };

    checkApiHealth();
  }, []);

  // Load courses when API is healthy
  useEffect(() => {
    if (!apiHealthy) return;

    const loadCourses = async () => {
      setIsLoadingCourses(true);
      setError(null);

      try {
        const coursesData = await fetchAllCourses();
        setAllCourses(coursesData);
        setFilteredCourses(coursesData.slice(0, 50));
      } catch (error: any) {
        console.error("Error loading course data:", error);
        setError(error.message);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [apiHealthy]);

  // Filter courses when search value changes
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredCourses(allCourses.slice(0, 50));
    } else {
      const filtered = allCourses.filter(
        (course) =>
          course.courseId.toLowerCase().includes(searchValue.toLowerCase()) ||
          course.courseName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCourses(filtered.slice(0, 100));
    }
  }, [searchValue, allCourses]);

  const handleCourseSelect = async (course: CourseData) => {
    setSelectedCourse(course);

    // Fetch hub requirements if not already loaded
    if (
      course.hubRequirements.length === 0 &&
      course.requirementsText === "Loading requirements..."
    ) {
      try {
        const hubRequirements = await fetchHubRequirements(course.courseId);
        const requirementsText =
          hubRequirements.length > 0
            ? hubRequirements.join(", ")
            : "No hub requirements";

        const updatedCourse = {
          ...course,
          hubRequirements,
          requirementsText,
        };

        // Update the course in both arrays
        const updateCourse = (courses: CourseData[]) =>
          courses.map((c) =>
            c.courseId === course.courseId ? updatedCourse : c
          );

        setAllCourses(updateCourse);
        setFilteredCourses(updateCourse);
        setSelectedCourse(updatedCourse);
      } catch (error) {
        console.error("Error fetching hub requirements:", error);
        setError("Failed to fetch hub requirements for this course");
      }
    }
  };

  const handleAddSelectedCourse = (courseData: CourseData) => {
    const courseToAdd: Course = {
      id: Date.now(),
      courseId: courseData.courseId,
      course: courseData.courseName,
      credits: 4, // Default credits, you might want to get this from your data
      requirements: courseData.requirementsText,
      description: `Hub Requirements: ${courseData.requirementsText}`,
      hubRequirements: courseData.hubRequirements,
    };

    handleAddCourse(courseToAdd);
    setSelectedCourse(null); // Clear selection after adding
  };

  if (!apiHealthy && error) {
    return (
      <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
        <AlertCircle size={20} />
        <div>
          <p className="font-medium">API Connection Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">
            Make sure your Flask server is running: python app.py
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span>Loading courses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
        <AlertCircle size={20} />
        <span>Error loading courses: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by course code (e.g., CAS CS 131) or course name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-3 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        Showing {filteredCourses.length} courses
        {filteredCourses.length === 100 ? " (results limited to 100)" : ""}
      </p>

      {/* Course Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCourses.map((course) => (
          <div
            key={course.courseId}
            className={`bg-gray border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCourse?.courseId === course.courseId
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => handleCourseSelect(course)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {course.courseId}
                </h4>
                <p className="text-gray-700 mt-1">{course.courseName}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {course.hubRequirements.length > 0
                    ? course.hubRequirements.join(" • ")
                    : course.requirementsText === "Loading requirements..."
                      ? "Click to load hub requirements"
                      : "No hub requirements"}
                </div>
              </div>

              {selectedCourse?.courseId === course.courseId && (
                <button
                  className={`ml-4 px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center gap-2 ${
                    isEnrolled(course.courseId)
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSelectedCourse(course);
                  }}
                  disabled={isEnrolled(course.courseId)}
                >
                  <Plus size={14} />
                  {isEnrolled(course.courseId)
                    ? "Already Enrolled"
                    : "Add Course"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && searchValue && (
        <div className="text-center py-8 text-gray-500">
          <p>No courses found matching "{searchValue}"</p>
        </div>
      )}
    </div>
  );
}

export default function HubHelper() {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const handleAddCourse = (course: Course) => {
    setEnrolledCourses((prev) => [...prev, course]);
    setBookmarkedCourses((prev) => [...prev, course.courseId]);
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some((course) => course.courseId === courseId);
  };

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const isBookmarked = (courseId: string) =>
    bookmarkedCourses.includes(courseId);

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-gray border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {course.courseId}
          </h3>
          <p className="text-gray-700 font-medium">{course.course}</p>
        </div>
        <button
          onClick={() => toggleBookmark(course.courseId)}
          className={`p-2 rounded-full transition-colors ${
            isBookmarked(course.courseId)
              ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
              : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
          }`}
        >
          {isBookmarked(course.courseId) ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">{course.description}</p>

      {course.hubRequirements && course.hubRequirements.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Hub Requirements:
          </p>
          <div className="flex flex-wrap gap-2">
            {course.hubRequirements.map((req, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{course.credits} credits</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Hub Helper</h1>
      <p className="text-gray-600 mb-8">
        Find courses that fulfill your hub requirements and bookmark them for
        easy reference.
      </p>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Course Search</h2>
        </div>

        <CourseSearcher
          handleAddCourse={handleAddCourse}
          isEnrolled={isEnrolled}
        />
      </div>

      {enrolledCourses.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-green-800">
              Added Courses
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {bookmarkedCourses.length > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkCheck className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">
              Bookmarked Courses ({bookmarkedCourses.length})
            </h3>
          </div>
          <p className="text-yellow-700 text-sm">
            You have bookmarked {bookmarkedCourses.length} course
            {bookmarkedCourses.length !== 1 ? "s" : ""}. These will be saved for
            easy reference when planning your schedule.
          </p>
        </div>
      )}
    </div>
  );
}
