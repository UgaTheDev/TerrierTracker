import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  Skeleton,
  Select,
  SelectItem,
  Button,
} from "@heroui/react";
import { Check, AlertCircle, Filter } from "lucide-react";
import { AddIcon } from "../childr_pages/AddCourses";

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

const columns = [
  { name: "ID", uid: "id" },
  { name: "COURSE", uid: "course" },
  { name: "CREDITS", uid: "credits" },
  { name: "HUB REQUIREMENTS", uid: "hubRequirements" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

interface CourseBrowseTableProps {
  isEnrolled: (courseId: string) => boolean;
  handleAddCourse: (course: Course) => void;
}

const API_BASE_URL = "http://localhost:5000/api";

// Cache for API responses
const apiCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);

  // Return cached result if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

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

    // Cache the result
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

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
        requirementsText: "Click to load requirements",
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

    return data.hub_requirements || [];
  } catch (error) {
    console.error(`Error fetching hub requirements for ${courseCode}:`, error);
    return [];
  }
};

// Batch load hub requirements for multiple courses
const fetchMultipleHubRequirements = async (
  courseCodes: string[]
): Promise<Map<string, string[]>> => {
  const results = new Map<string, string[]>();

  // Process in batches of 5 to avoid overwhelming the API
  const batchSize = 5;
  const batches: string[][] = [];

  for (let i = 0; i < courseCodes.length; i += batchSize) {
    batches.push(courseCodes.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (courseCode) => {
      try {
        const requirements = await fetchHubRequirements(courseCode);
        return { courseCode, requirements };
      } catch (error) {
        console.error(`Failed to load requirements for ${courseCode}:`, error);
        return { courseCode, requirements: [] };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ courseCode, requirements }) => {
      results.set(courseCode, requirements);
    });

    // Small delay between batches to be nice to the API
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};

export default function CourseBrowseTable({
  isEnrolled,
  handleAddCourse,
}: CourseBrowseTableProps) {
  const [apiCourses, setApiCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState<Set<string>>(
    new Set()
  );
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    apiCourses.forEach((course) => {
      const parts = course.courseId.split(" ");
      if (parts.length >= 2) {
        deptSet.add(parts[1]);
      }
    });
    return Array.from(deptSet).sort();
  }, [apiCourses]);

  const filteredCourses = useMemo(() => {
    if (selectedDepartment === "all") {
      return apiCourses;
    }
    return apiCourses.filter((course) => {
      const parts = course.courseId.split(" ");
      return parts.length >= 2 && parts[1] === selectedDepartment;
    });
  }, [apiCourses, selectedDepartment]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("Starting API health check...");
        await apiRequest("/health", { method: "GET" });
        console.log("API health check passed");
        setApiHealthy(true);

        console.log("Loading courses...");
        const coursesData = await fetchAllCourses();
        console.log(`Loaded ${coursesData.length} courses`);
        setApiCourses(coursesData);
      } catch (error: any) {
        console.error("Failed to initialize course data:", error);
        setError(error.message);
        setApiHealthy(false);
      } finally {
        console.log("Finished loading");
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const loadHubRequirements = async (courseId: string) => {
    if (loadingRequirements.has(courseId) || batchLoading) return;

    setLoadingRequirements((prev) => new Set(prev).add(courseId));

    try {
      const hubRequirements = await fetchHubRequirements(courseId);
      const requirementsText =
        hubRequirements.length > 0
          ? hubRequirements.join(", ")
          : "No hub requirements";

      setApiCourses((prev) =>
        prev.map((course) =>
          course.courseId === courseId
            ? { ...course, hubRequirements, requirementsText }
            : course
        )
      );
    } catch (error) {
      console.error(`Failed to load requirements for ${courseId}:`, error);
    } finally {
      setLoadingRequirements((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const loadAllHubRequirements = async () => {
    if (batchLoading) return;

    const coursesNeedingRequirements = filteredCourses
      .filter((course) => course.hubRequirements.length === 0)
      .map((course) => course.courseId);

    if (coursesNeedingRequirements.length === 0) return;

    console.log(
      `Batch loading requirements for ${coursesNeedingRequirements.length} courses`
    );
    setBatchLoading(true);

    try {
      const requirementsMap = await fetchMultipleHubRequirements(
        coursesNeedingRequirements
      );

      setApiCourses((prev) =>
        prev.map((course) => {
          const hubRequirements = requirementsMap.get(course.courseId);
          if (hubRequirements !== undefined) {
            const requirementsText =
              hubRequirements.length > 0
                ? hubRequirements.join(", ")
                : "No hub requirements";
            return { ...course, hubRequirements, requirementsText };
          }
          return course;
        })
      );
      console.log("Batch loading complete");
    } catch (error) {
      console.error("Failed to batch load requirements:", error);
    } finally {
      setBatchLoading(false);
    }
  };

  const convertToCourse = (courseData: CourseData): Course => ({
    id: Date.now() + Math.random(),
    courseId: courseData.courseId,
    course: courseData.courseName,
    credits: 4,
    requirements: courseData.requirementsText,
    description: `Hub Requirements: ${courseData.requirementsText}`,
    hubRequirements: courseData.hubRequirements,
  });
  const renderCell = React.useCallback(
    (courseData: CourseData, columnKey: React.Key) => {
      switch (columnKey) {
        case "id":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm font-mono">
                {courseData.courseId}
              </p>
            </div>
          );
        case "course":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{courseData.courseName}</p>
            </div>
          );
        case "credits":
          return (
            <div className="flex items-center">
              <p className="text-sm font-semibold">4</p>
            </div>
          );
        case "hubRequirements":
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {courseData.hubRequirements.length > 0 ? (
                courseData.hubRequirements.map((req, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="text-xs"
                  >
                    {req}
                  </Chip>
                ))
              ) : (
                <button
                  className="text-xs text-primary hover:text-primary-600 underline"
                  onClick={() => loadHubRequirements(courseData.courseId)}
                  disabled={
                    loadingRequirements.has(courseData.courseId) || batchLoading
                  }
                >
                  {loadingRequirements.has(courseData.courseId)
                    ? "Loading..."
                    : courseData.requirementsText}
                </button>
              )}
            </div>
          );
        case "status":
          return (
            <div className="flex items-center">
              {isEnrolled(courseData.courseId) ? (
                <div className="flex items-center gap-1 text-success">
                  <Check size={14} />
                  <span className="text-xs font-medium">Enrolled</span>
                </div>
              ) : (
                <span className="text-xs text-default-400">Available</span>
              )}
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              {!isEnrolled(courseData.courseId) ? (
                <Tooltip content="Add Course">
                  <span
                    className="text-lg text-success cursor-pointer active:opacity-50"
                    onClick={() => handleAddCourse(convertToCourse(courseData))}
                  >
                    <AddIcon />
                  </span>
                </Tooltip>
              ) : (
                <Tooltip content="Already Enrolled">
                  <span className="text-lg text-default-300">
                    <Check size={18} />
                  </span>
                </Tooltip>
              )}
            </div>
          );
        default:
          return courseData[columnKey as keyof CourseData];
      }
    },
    [isEnrolled, handleAddCourse, loadingRequirements, batchLoading]
  );

  // Memoize the table body items for performance
  const tableItems = useMemo(() => filteredCourses, [filteredCourses]);

  if (isLoading) {
    return (
      <div className="pt-4">
        <div className="h-96 overflow-auto space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!apiHealthy && error) {
    return (
      <div className="pt-4">
        <div className="flex items-center justify-center gap-2 text-danger bg-danger-50 p-6 rounded-lg">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">API Connection Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">
              Make sure your Flask server is running: python app.py
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {/* Filters and batch load section */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="flat"
            size="sm"
            startContent={<Filter size={16} />}
            onPress={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">
              Showing {filteredCourses.length} of {apiCourses.length} courses
            </span>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={loadAllHubRequirements}
              isDisabled={batchLoading}
              isLoading={batchLoading}
            >
              {batchLoading
                ? "Loading requirements..."
                : "Load all hub requirements"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 bg-default-50 rounded-lg">
            <Select
              label="Department"
              placeholder="Filter by department"
              selectedKeys={
                selectedDepartment === "all" ? [] : [selectedDepartment]
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedDepartment(selected || "all");
              }}
              className="max-w-xs"
              size="sm"
            >
              <SelectItem key="all" value="all">
                All Departments ({apiCourses.length})
              </SelectItem>
              {departments.map((dept) => {
                const count = apiCourses.filter((course) => {
                  const parts = course.courseId.split(" ");
                  return parts.length >= 2 && parts[1] === dept;
                }).length;
                return (
                  <SelectItem key={dept} value={dept}>
                    {dept} ({count})
                  </SelectItem>
                );
              })}
            </Select>
          </div>
        )}
      </div>

      <div className="h-96 overflow-auto">
        <Table aria-label="Available courses table" className="h-full">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={false}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={tableItems}
            emptyContent="No courses found for the selected filters."
          >
            {(item) => (
              <TableRow key={item.courseId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
