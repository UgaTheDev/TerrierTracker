"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, AlertCircle } from "lucide-react";

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

interface CourseSearchProps {
  handleAddCourse: (course: Course) => void;
  isEnrolled: (courseId: string) => boolean;
}

const API_BASE_URL = "https://terriertracker-production.up.railway.app";

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
    const data = await apiRequest("/api/all-courses", { method: "GET" });

    const coursesArray = Object.entries(data.courses || {}).map(
      ([code, name]) => ({
        courseId: code,
        courseName: name as string,
        hubRequirements: [],
        requirementsText: "Loading requirements...",
      })
    );

    return coursesArray;
  } catch (error: any) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

const fetchHubRequirements = async (courseCode: string): Promise<string[]> => {
  try {
    const data = await apiRequest("/api/search-course", {
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

const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/[\s-]/g, "");
};

export default function CourseSearch({
  handleAddCourse,
  isEnrolled,
}: CourseSearchProps) {
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");

  const schools = React.useMemo(() => {
    const schoolSet = new Set<string>();
    allCourses.forEach((course) => {
      const parts = course.courseId.split(" ");
      if (parts.length >= 1) {
        const school = parts[0].substring(0, 3);
        schoolSet.add(school);
      }
    });
    return Array.from(schoolSet).sort();
  }, [allCourses]);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await apiRequest("/api/health", { method: "GET" });
        setApiHealthy(true);
      } catch (error) {
        console.error("API health check failed:", error);
        setError(
          "Cannot connect to the API server. Please ensure the Flask server is running."
        );
        setApiHealthy(false);
      }
    };

    checkApiHealth();
  }, []);

  useEffect(() => {
    if (!apiHealthy) return;

    const loadCourses = async () => {
      setIsLoadingCourses(true);
      setError(null);

      try {
        const coursesData = await fetchAllCourses();
        setAllCourses(coursesData);
        setFilteredCourses(coursesData.slice(0, 50));

        const initialCodes = coursesData.slice(0, 100).map((c) => c.courseId);

        try {
          const bulkData = await apiRequest("/api/bulk-hub-requirements", {
            method: "POST",
            body: JSON.stringify({ course_codes: initialCodes }),
          });

          const updatedCourses = coursesData.map((course) => {
            const hubRequirements = bulkData.results[course.courseId];
            if (hubRequirements !== undefined) {
              return {
                ...course,
                hubRequirements,
                requirementsText:
                  hubRequirements.length > 0
                    ? hubRequirements.join(", ")
                    : "No hub requirements",
              };
            }
            return course;
          });

          setAllCourses(updatedCourses);
          setFilteredCourses(updatedCourses.slice(0, 50));
        } catch (bulkError) {
          console.error("Failed to preload hub requirements:", bulkError);
        }
      } catch (error: any) {
        console.error("Error loading course data:", error);
        setError(error.message);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [apiHealthy]);

  useEffect(() => {
    let filtered = allCourses;

    if (selectedSchool !== "all") {
      filtered = filtered.filter((course) => {
        const school = course.courseId.substring(0, 3);
        return school === selectedSchool;
      });
    }

    if (searchValue.trim()) {
      const normalizedSearch = normalizeString(searchValue);
      filtered = filtered.filter((course) => {
        const normalizedCourseId = normalizeString(course.courseId);
        const normalizedCourseName = normalizeString(course.courseName);

        return (
          normalizedCourseId.includes(normalizedSearch) ||
          normalizedCourseName.includes(normalizedSearch)
        );
      });
    }

    setFilteredCourses(filtered.slice(0, searchValue.trim() ? 100 : 50));
  }, [searchValue, allCourses, selectedSchool]);

  const handleCourseSelect = async (course: CourseData) => {
    setSelectedCourse(course);

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
      credits: 4,
      requirements: courseData.requirementsText,
      description: `Hub Requirements: ${courseData.requirementsText}`,
      hubRequirements: courseData.hubRequirements,
    };

    handleAddCourse(courseToAdd);
    setSelectedCourse(null);
  };

  if (!apiHealthy && error) {
    return (
      <div className="flex items-center justify-center gap-2 text-danger bg-danger-50 dark:bg-danger/10 p-4 rounded-lg">
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
        <div className="flex items-center gap-2 text-primary">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <span>Loading courses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 text-danger bg-danger-50 dark:bg-danger/10 p-4 rounded-lg">
        <AlertCircle size={20} />
        <span>Error loading courses: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="px-4 py-2 rounded-lg bg-background text-foreground border border-default-300 focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Schools ({allCourses.length})</option>
          {schools.map((school) => {
            const count = allCourses.filter(
              (c) => c.courseId.substring(0, 3) === school
            ).length;
            return (
              <option key={school} value={school}>
                {school} ({count})
              </option>
            );
          })}
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by course code (e.g., CAS CS 131 or CASCS131) or course name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 bg-background text-foreground placeholder-default-400"
          />
          <div className="absolute right-3 top-3 text-default-400">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      <p className="text-sm text-default-500">
        Showing {filteredCourses.length} courses
        {filteredCourses.length === 100 ? " (results limited to 100)" : ""}
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCourses.map((course) => (
          <div
            key={course.courseId}
            className={`bg-content1 rounded-lg p-4 cursor-pointer transition-all ${
              selectedCourse?.courseId === course.courseId
                ? "border-primary-500 bg-primary-50 dark:bg-primary-100/10"
                : "border-default-200 dark:border-default-700 hover:border-default-300 dark:hover:border-default-600 hover:shadow-small"
            }`}
            onClick={() => handleCourseSelect(course)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {course.courseId}
                </h4>
                <p className="text-default-700 mt-1">{course.courseName}</p>
                <div className="text-xs text-default-500 mt-2">
                  {course.hubRequirements.length > 0
                    ? course.hubRequirements.join(" • ")
                    : course.requirementsText === "Loading requirements..."
                      ? "Click to load hub requirements"
                      : "No hub requirements"}
                </div>
              </div>

              {selectedCourse?.courseId === course.courseId && (
                <button
                  className={`ml-4 px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center gap-2 transition-colors ${
                    isEnrolled(course.courseId)
                      ? "bg-default-100 dark:bg-default-200/20 text-default-500 cursor-not-allowed"
                      : "bg-success text-success-foreground hover:bg-success/90"
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
        <div className="text-center py-8 text-default-500">
          <p>No courses found matching "{searchValue}"</p>
        </div>
      )}
    </div>
  );
}
