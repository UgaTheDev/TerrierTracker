import React, { useState, useEffect } from "react";
import { Plus, Upload, AlertCircle } from "lucide-react";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  description?: string;
  hubRequirements?: string[];
};

interface CourseSearcherProps {
  handleAddCourse: (course: Course) => void;
  isEnrolled: (courseId: string) => boolean;
}

export default function ManualCourseAdd({
  handleAddCourse,
  isEnrolled,
}: CourseSearcherProps) {
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSVAndGetRequirements = async (csvText: string) => {
    try {
      const lines = csvText.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());

      if (headers.length < 2) {
        throw new Error(
          "CSV must have at least course_code and course_name columns"
        );
      }

      const hubColumns = headers.slice(2);
      const coursesWithHubs = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((cell) => cell.trim());

        if (row.length < 2) continue;

        const courseCode = row[0];
        const courseName = row[1];

        const hubRequirements = [];
        for (let j = 0; j < hubColumns.length; j++) {
          if (row[j + 2] === "1") {
            hubRequirements.push(hubColumns[j]);
          }
        }

        coursesWithHubs.push({
          courseId: courseCode,
          courseName: courseName,
          hubRequirements: hubRequirements,
          requirementsText:
            hubRequirements.length > 0
              ? hubRequirements.join(", ")
              : "No hub requirements",
        });
      }

      return coursesWithHubs;
    } catch (error) {
      throw new Error(`Error parsing CSV: ${error.message}`);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setIsLoadingCourses(true);
    setError(null);

    try {
      const csvText = await file.text();
      const coursesWithRequirements = await parseCSVAndGetRequirements(csvText);

      setAllCourses(coursesWithRequirements);
      setFilteredCourses(coursesWithRequirements.slice(0, 50));
      setCsvUploaded(true);
    } catch (error) {
      console.error("Error processing CSV:", error);
      setError(error.message);
    } finally {
      setIsLoadingCourses(false);
    }
  };

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

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
  };

  const handleAddSelectedCourse = (courseData: any) => {
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

  if (!csvUploaded) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray rounded-lg shadow-lg p-8 text-center">
          <Upload size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upload Course Data</h3>
          <p className="text-gray-600 mb-6">
            Upload your BU Hub courses CSV file to search and add courses with
            their hub requirements
          </p>

          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                disabled={isLoadingCourses}
              >
                <Upload size={16} />
                {isLoadingCourses ? "Processing..." : "Choose CSV File"}
              </button>
            </label>

            {isLoadingCourses && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm">Processing CSV file...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">BU Course Search</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {allCourses.length} courses loaded
          </span>
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => {
              setCsvUploaded(false);
              setAllCourses([]);
              setFilteredCourses([]);
              setSearchValue("");
              setSelectedCourse(null);
            }}
          >
            Change File
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by course code (e.g., CAS CS 131) or course name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-3 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredCourses.length} courses
        {filteredCourses.length === 100 ? " (results limited to 100)" : ""}
      </p>

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
