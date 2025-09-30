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

type CourseData = {
  courseId: string;
  courseName: string;
  hubRequirements: string[];
  requirementsText: string;
};

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
    const data = await apiRequest("/all-courses", { method: "GET" });

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
    const data = await apiRequest("/search-course", {
      method: "POST",
      body: JSON.stringify({
        course_identifier: courseCode,
      }),
    });

    return data.hub_requirements;
  } catch (error) {
    console.error(`Error fetching requirements for ${courseCode}:`, error);
    return [];
  }
};

export default function CourseSearch({
  handleAddCourse,
  isEnrolled,
}: CourseSearchProps) {
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);

  useEffect(() => {
    async function checkApiHealth() {
      try {
        await apiRequest("/health", { method: "GET" });
        setApiHealthy(true);
      } catch {
        setApiHealthy(false);
        setError("Unable to connect to the API endpoint.");
      }
    }
    checkApiHealth();
  }, []);

  useEffect(() => {
    if (!apiHealthy) return;

    async function loadCourses() {
      setIsLoading(true);
      setError(null);
      try {
        const courses = await fetchAllCourses();
        setAllCourses(courses);
        setFilteredCourses(courses.slice(0, 50));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [apiHealthy]);

  useEffect(() => {
    if (searchValue.trim() === "") {
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

    if (
      course.hubRequirements.length === 0 &&
      course.requirementsText === "Loading requirements..."
    ) {
      try {
        const requirements = await fetchHubRequirements(course.courseId);
        const requirementsText =
          requirements.length > 0
            ? requirements.join(", ")
            : "No hub requirements";

        const updatedCourse = {
          ...course,
          hubRequirements: requirements,
          requirementsText,
        };

        setAllCourses((prev) =>
          prev.map((c) =>
            c.courseId === updatedCourse.courseId ? updatedCourse : c
          )
        );
        setFilteredCourses((prev) =>
          prev.map((c) =>
            c.courseId === updatedCourse.courseId ? updatedCourse : c
          )
        );
        setSelectedCourse(updatedCourse);
      } catch (error) {
        setError("Failed to load requirements.");
      }
    }
  };

  const handleAddSelected = (course: CourseData) => {
    const courseToAdd: Course = {
      id: Date.now(),
      courseId: course.courseId,
      course: course.courseName,
      credits: 4,
      requirements: course.requirementsText,
      description: `Hub Requirements: ${course.requirementsText}`,
      hubRequirements: course.hubRequirements,
    };
    console.log("Add course clicked:", course.courseId);
    handleAddCourse(courseToAdd);
  };

  if (!apiHealthy) {
    return (
      <div className="alert alert-error" role="alert">
        <AlertCircle /> {error || "API is unavailable"}
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="course-search">
      <input
        type="text"
        placeholder="Search courses"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="search-input"
      />
      <p>{`Showing ${filteredCourses.length} courses`}</p>
      <ul className="course-list">
        {filteredCourses.map((course) => (
          <li
            key={course.courseId}
            onClick={() => handleCourseSelect(course)}
            className={`course-item ${
              selectedCourse?.courseId === course.courseId ? "selected" : ""
            }`}
          >
            <div>
              <b>{course.courseId}</b> - {course.courseName}
              <div>{course.requirementsText}</div>
            </div>

            {selectedCourse?.courseId === course.courseId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSelected(course);
                }}
                disabled={isEnrolled(course.courseId)}
                className={`add-button ${
                  isEnrolled(course.courseId) ? "disabled" : ""
                }`}
              >
                {isEnrolled(course.courseId) ? "Enrolled" : "Add"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
