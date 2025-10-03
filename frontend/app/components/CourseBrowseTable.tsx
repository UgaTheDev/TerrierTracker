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
  Checkbox,
  Divider,
} from "@heroui/react";
import {
  Check,
  AlertCircle,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
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

type BookmarkedCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  hubRequirements: string[];
  school: string;
};

const columns = [
  { name: "ID", uid: "id" },
  { name: "COURSE", uid: "course" },
  { name: "CREDITS", uid: "credits" },
  { name: "HUB REQUIREMENTS", uid: "hubRequirements" },
  { name: "STATUS", uid: "status" },
  { name: "BOOKMARK", uid: "bookmark" },
  { name: "ACTIONS", uid: "actions" },
];

interface CourseBrowseTableProps {
  isEnrolled: (courseId: string) => boolean;
  handleAddCourse: (course: Course) => void;
  isBookmarked: (courseId: string) => boolean;
  handleBookmark: (bookmarkedCourse: BookmarkedCourse) => void;
}

const API_BASE_URL = "https://terriertracker-production.up.railway.app/api";

const apiCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000;

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);

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

const fetchMultipleHubRequirements = async (
  courseCodes: string[]
): Promise<Map<string, string[]>> => {
  const results = new Map<string, string[]>();
  const chunkSize = 500;
  const chunks: string[][] = [];

  for (let i = 0; i < courseCodes.length; i += chunkSize) {
    chunks.push(courseCodes.slice(i, i + chunkSize));
  }

  console.log(
    `Processing ${courseCodes.length} courses in ${chunks.length} parallel chunks`
  );

  const allChunkPromises = chunks.map(async (chunk) => {
    try {
      const data = await apiRequest("/bulk-hub-requirements", {
        method: "POST",
        body: JSON.stringify({ course_codes: chunk }),
      });

      return data.results || {};
    } catch (error) {
      console.error(`Failed to load chunk:`, error);
      return {};
    }
  });

  const allResults = await Promise.all(allChunkPromises);
  allResults.forEach((chunkResults) => {
    Object.entries(chunkResults).forEach(([courseCode, requirements]) => {
      results.set(courseCode, requirements as string[]);
    });
  });

  console.log(`Loaded ${results.size} course requirements`);
  return results;
};

export default function CourseBrowseTable({
  isEnrolled,
  handleAddCourse,
  isBookmarked,
  handleBookmark,
}: CourseBrowseTableProps) {
  const [apiCourses, setApiCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState<Set<string>>(
    new Set()
  );
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedHubRequirements, setSelectedHubRequirements] = useState<
    Set<string>
  >(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatsLoading, setFilterStatsLoading] = useState(false);

  const [localBookmarkStates, setLocalBookmarkStates] = useState<
    Map<string, boolean>
  >(new Map());

  const schools = useMemo(() => {
    const schoolSet = new Set<string>();
    apiCourses.forEach((course) => {
      const school = course.courseId.substring(0, 3);
      if (school) schoolSet.add(school);
    });
    return Array.from(schoolSet).sort();
  }, [apiCourses]);

  const departments = useMemo(() => {
    const deptMap = new Map<string, string>();
    apiCourses.forEach((course) => {
      const parts = course.courseId.split(" ");
      if (parts.length >= 2) {
        const school = parts[0].substring(0, 3);
        const dept = parts[1];
        const key = `${school} ${dept}`;
        deptMap.set(key, key);
      }
    });
    return Array.from(deptMap.values()).sort();
  }, [apiCourses]);

  const filteredDepartments = useMemo(() => {
    if (selectedSchool === "all") return departments;
    return departments.filter((dept) => dept.startsWith(selectedSchool));
  }, [departments, selectedSchool]);

  const allHubRequirements = useMemo(() => {
    const hubSet = new Set<string>();
    apiCourses.forEach((course) => {
      course.hubRequirements.forEach((req) => {
        if (req && req.trim()) {
          hubSet.add(req.trim());
        }
      });
    });
    return Array.from(hubSet).sort();
  }, [apiCourses]);

  const filterStats = useMemo(() => {
    return {
      totalCourses: apiCourses.length,
      schoolCounts: schools.map((school) => ({
        school,
        count: apiCourses.filter((c) => c.courseId.substring(0, 3) === school)
          .length,
      })),
      departmentCounts: filteredDepartments.map((dept) => ({
        dept,
        count: apiCourses.filter((course) => {
          const parts = course.courseId.split(" ");
          if (parts.length >= 2) {
            const school = parts[0].substring(0, 3);
            const courseDept = parts[1];
            return `${school} ${courseDept}` === dept;
          }
          return false;
        }).length,
      })),
      hubCounts: allHubRequirements.map((hubReq) => ({
        hubReq,
        count: apiCourses.filter((course) =>
          course.hubRequirements.includes(hubReq)
        ).length,
      })),
    };
  }, [apiCourses, schools, filteredDepartments, allHubRequirements]);

  const filteredCourses = useMemo(() => {
    let filtered = apiCourses;

    if (selectedSchool !== "all") {
      filtered = filtered.filter((course) => {
        const school = course.courseId.substring(0, 3);
        return school === selectedSchool;
      });
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((course) => {
        const parts = course.courseId.split(" ");
        if (parts.length >= 2) {
          const school = parts[0].substring(0, 3);
          const dept = parts[1];
          return `${school} ${dept}` === selectedDepartment;
        }
        return false;
      });
    }

    if (selectedHubRequirements.size > 0) {
      filtered = filtered.filter((course) => {
        const courseHubsSet = new Set(course.hubRequirements);
        return Array.from(selectedHubRequirements).every((selectedHub) =>
          courseHubsSet.has(selectedHub)
        );
      });
    }

    return filtered;
  }, [apiCourses, selectedSchool, selectedDepartment, selectedHubRequirements]);

  const toggleHubRequirement = (hubReq: string) => {
    setSelectedHubRequirements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hubReq)) {
        newSet.delete(hubReq);
      } else {
        newSet.add(hubReq);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setSelectedSchool("all");
    setSelectedDepartment("all");
    setSelectedHubRequirements(new Set());
  };

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

        console.log("Preloading hub requirements for initial courses...");
        const initialCourseCodes = coursesData
          .slice(0, 500)
          .map((c) => c.courseId);
        const initialRequirements =
          await fetchMultipleHubRequirements(initialCourseCodes);

        setApiCourses((prev) =>
          prev.map((course) => {
            const hubRequirements = initialRequirements.get(course.courseId);
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
        console.log("Initial hub requirements loaded");
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

  useEffect(() => {
    if (selectedSchool !== "all") {
      setSelectedDepartment("all");
    }
  }, [selectedSchool]);

  const loadHubRequirements = async (courseId: string) => {
    if (loadingRequirements.has(courseId) || batchLoading) return;

    setLoadingRequirements((prev) => new Set(prev).add(courseId));

    try {
      const requirementsMap = await fetchMultipleHubRequirements([courseId]);
      const hubRequirements = requirementsMap.get(courseId) || [];
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

  const convertToBookmarkedCourse = (
    courseData: CourseData
  ): BookmarkedCourse => ({
    id: courseData.courseId,
    code: courseData.courseId,
    name: courseData.courseName,
    credits: 4,
    hubRequirements: courseData.hubRequirements || [],
    school: courseData.courseId.split(" ")[0] || "Unknown",
  });

  const handleBookmarkClick = async (courseData: CourseData) => {
    const currentlyBookmarked =
      localBookmarkStates.get(courseData.courseId) ??
      isBookmarked(courseData.courseId);

    const newBookmarkState = !currentlyBookmarked;
    setLocalBookmarkStates((prev) =>
      new Map(prev).set(courseData.courseId, newBookmarkState)
    );
    if (!currentlyBookmarked && courseData.hubRequirements.length === 0) {
      await loadHubRequirements(courseData.courseId);

      const updatedCourse = apiCourses.find(
        (c) => c.courseId === courseData.courseId
      );
      if (updatedCourse) {
        const bookmarkedCourse = convertToBookmarkedCourse(updatedCourse);
        handleBookmark(bookmarkedCourse);
      } else {
        const bookmarkedCourse = convertToBookmarkedCourse(courseData);
        handleBookmark(bookmarkedCourse);
      }
    } else {
      const bookmarkedCourse = convertToBookmarkedCourse(courseData);
      handleBookmark(bookmarkedCourse);
    }
  };

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
        case "bookmark":
          const currentlyBookmarked =
            localBookmarkStates.get(courseData.courseId) ??
            isBookmarked(courseData.courseId);

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleBookmarkClick(courseData)}
                className={`p-2 rounded-full transition-colors ${
                  currentlyBookmarked
                    ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                    : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                }`}
                title={
                  currentlyBookmarked ? "Remove bookmark" : "Bookmark course"
                }
              >
                {currentlyBookmarked ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
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
    [
      isEnrolled,
      handleAddCourse,
      isBookmarked,
      handleBookmark,
      loadingRequirements,
      batchLoading,
      localBookmarkStates,
      apiCourses,
    ]
  );

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
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="flat"
            size="sm"
            startContent={<Filter size={16} />}
            onPress={() => {
              setFilterStatsLoading(true);
              setTimeout(() => {
                setShowFilters(!showFilters);
                setFilterStatsLoading(false);
              }, 0);
            }}
            isLoading={filterStatsLoading}
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
          <div className="space-y-4 p-4 bg-default-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-default-700">
                Filters
              </h3>
              <Button
                size="sm"
                variant="light"
                startContent={<X size={14} />}
                onPress={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="School"
                  placeholder="Filter by school"
                  selectedKeys={
                    selectedSchool === "all"
                      ? new Set([])
                      : new Set([selectedSchool])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedSchool(selected || "all");
                  }}
                  size="sm"
                >
                  {[
                    {
                      key: "all",
                      label: `All Schools (${filterStats.totalCourses})`,
                    },
                    ...filterStats.schoolCounts.map(({ school, count }) => ({
                      key: school,
                      label: `${school} (${count})`,
                    })),
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label="Department"
                  placeholder="Filter by department"
                  selectedKeys={
                    selectedDepartment === "all"
                      ? new Set([])
                      : new Set([selectedDepartment])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedDepartment(selected || "all");
                  }}
                  size="sm"
                  isDisabled={filteredDepartments.length === 0}
                >
                  {[
                    { key: "all", label: "All Departments" },
                    ...filterStats.departmentCounts.map(({ dept, count }) => ({
                      key: dept,
                      label: `${dept} (${count})`,
                    })),
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-default-700 mb-2">
                  Hub Requirements
                  {selectedHubRequirements.size > 0 && (
                    <span className="ml-2 text-xs text-primary">
                      ({selectedHubRequirements.size} selected)
                    </span>
                  )}
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 border border-default-200 rounded-lg bg-gray">
                  {allHubRequirements.length === 0 ? (
                    <p className="text-xs text-default-400 italic">
                      Load hub requirements to see available filters
                    </p>
                  ) : (
                    filterStats.hubCounts.map(({ hubReq, count }) => (
                      <div key={hubReq} className="flex items-center">
                        <Checkbox
                          size="sm"
                          isSelected={selectedHubRequirements.has(hubReq)}
                          onValueChange={() => toggleHubRequirement(hubReq)}
                          className="flex-1"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs">{hubReq}</span>
                            <span className="text-xs text-default-400 ml-2">
                              ({count})
                            </span>
                          </div>
                        </Checkbox>
                      </div>
                    ))
                  )}
                </div>
                {selectedHubRequirements.size > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(selectedHubRequirements).map((hubReq) => (
                      <Chip
                        key={hubReq}
                        size="sm"
                        variant="flat"
                        color="primary"
                        onClose={() => toggleHubRequirement(hubReq)}
                        className="text-xs"
                      >
                        {hubReq}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Divider />
            <div className="text-xs text-default-500">
              <strong>Active Filters:</strong>{" "}
              {selectedSchool !== "all" && `School: ${selectedSchool}`}
              {selectedSchool !== "all" && selectedDepartment !== "all" && ", "}
              {selectedDepartment !== "all" &&
                `Department: ${selectedDepartment}`}
              {(selectedSchool !== "all" || selectedDepartment !== "all") &&
                selectedHubRequirements.size > 0 &&
                ", "}
              {selectedHubRequirements.size > 0 &&
                `Hub Requirements: ${Array.from(selectedHubRequirements).join(", ")}`}
              {selectedSchool === "all" &&
                selectedDepartment === "all" &&
                selectedHubRequirements.size === 0 &&
                "None"}
            </div>
          </div>
        )}
      </div>

      <div className="h-96 overflow-auto">
        <Table aria-label="Available courses table" className="h-full">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={
                  column.uid === "actions" || column.uid === "bookmark"
                    ? "center"
                    : "start"
                }
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
              <TableRow key={`course-browse-${item.courseId}`}>
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
