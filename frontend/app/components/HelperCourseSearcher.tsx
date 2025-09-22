"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Select,
  SelectItem,
  Checkbox,
  Divider,
  Chip,
  Skeleton,
} from "@heroui/react";
import {
  Search,
  AlertCircle,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

type BookmarkedCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  hubRequirements: string[];
  school: string;
};

interface CourseData {
  courseId: string;
  courseName: string;
  hubRequirements: string[];
  requirementsText: string;
}

interface HelperCourseSearcherProps {
  onBookmark: (courseId: string, courseData: any) => void;
  bookmarkedCourses: BookmarkedCourse[];
  isBookmarked: (courseId: string) => boolean;
}

const API_BASE_URL = "http://localhost:5000/api";

// API caching system
const apiCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

const fetchMultipleHubRequirements = async (
  courseCodes: string[]
): Promise<Map<string, string[]>> => {
  const results = new Map<string, string[]>();
  const batchSize = 50;
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

    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};

export default function HelperCourseSearcher({
  onBookmark,
  bookmarkedCourses,
  isBookmarked,
}: HelperCourseSearcherProps) {
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedHubRequirements, setSelectedHubRequirements] = useState<
    Set<string>
  >(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState<Set<string>>(
    new Set()
  );
  const [batchLoading, setBatchLoading] = useState(false);

  // Local bookmark states for optimistic UI updates
  const [localBookmarkStates, setLocalBookmarkStates] = useState<
    Map<string, boolean>
  >(new Map());

  // Memoized computed values
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    allCourses.forEach((course) => {
      const parts = course.courseId.split(" ");
      if (parts.length >= 2) {
        deptSet.add(parts[1]);
      }
    });
    return Array.from(deptSet).sort();
  }, [allCourses]);

  const allHubRequirements = useMemo(() => {
    const hubSet = new Set<string>();
    allCourses.forEach((course) => {
      course.hubRequirements.forEach((req) => {
        if (req && req.trim()) {
          hubSet.add(req.trim());
        }
      });
    });
    return Array.from(hubSet).sort();
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    // Apply search filter
    if (searchValue.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.courseId.toLowerCase().includes(searchValue.toLowerCase()) ||
          course.courseName.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((course) => {
        const parts = course.courseId.split(" ");
        return parts.length >= 2 && parts[1] === selectedDepartment;
      });
    }

    // Apply hub requirements filter
    if (selectedHubRequirements.size > 0) {
      filtered = filtered.filter((course) => {
        const courseHubsSet = new Set(course.hubRequirements);
        return Array.from(selectedHubRequirements).every((selectedHub) =>
          courseHubsSet.has(selectedHub)
        );
      });
    }

    // Limit results for performance
    return filtered.slice(0, searchValue.trim() ? 100 : 50);
  }, [allCourses, searchValue, selectedDepartment, selectedHubRequirements]);

  // Filter management functions
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
    setSelectedDepartment("all");
    setSelectedHubRequirements(new Set());
    setSearchValue("");
  };

  // API health check and course loading
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
        setAllCourses(coursesData);
      } catch (error: any) {
        console.error("Failed to initialize course data:", error);
        setError(error.message);
        setApiHealthy(false);
      } finally {
        console.log("Finished loading");
        setIsLoadingCourses(false);
      }
    };

    initializeData();
  }, []);

  // Load hub requirements for individual course
  const loadHubRequirements = async (courseId: string) => {
    if (loadingRequirements.has(courseId) || batchLoading) return;

    setLoadingRequirements((prev) => new Set(prev).add(courseId));

    try {
      const hubRequirements = await fetchHubRequirements(courseId);
      const requirementsText =
        hubRequirements.length > 0
          ? hubRequirements.join(", ")
          : "No hub requirements";

      setAllCourses((prev) =>
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

  // Load all hub requirements in batch
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

      setAllCourses((prev) =>
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

  // Handle bookmarking
  const handleBookmarkClick = async (courseData: CourseData) => {
    const currentlyBookmarked =
      localBookmarkStates.get(courseData.courseId) ??
      isBookmarked(courseData.courseId);

    console.log(
      "Bookmark button clicked for:",
      courseData.courseId,
      "Currently bookmarked:",
      currentlyBookmarked
    );

    const newBookmarkState = !currentlyBookmarked;
    setLocalBookmarkStates((prev) =>
      new Map(prev).set(courseData.courseId, newBookmarkState)
    );

    // If bookmarking and hub requirements aren't loaded, load them first
    if (!currentlyBookmarked && courseData.hubRequirements.length === 0) {
      console.log("Loading hub requirements before bookmarking...");
      await loadHubRequirements(courseData.courseId);

      const updatedCourse = allCourses.find(
        (c) => c.courseId === courseData.courseId
      );
      if (updatedCourse) {
        console.log("Bookmarking with updated data:", updatedCourse);
        onBookmark(courseData.courseId, {
          courseId: updatedCourse.courseId,
          courseName: updatedCourse.courseName,
          hubRequirements: updatedCourse.hubRequirements,
          credits: 4,
        });
      } else {
        console.log("Bookmarking with original data:", courseData);
        onBookmark(courseData.courseId, {
          courseId: courseData.courseId,
          courseName: courseData.courseName,
          hubRequirements: courseData.hubRequirements,
          credits: 4,
        });
      }
    } else {
      console.log("Bookmarking:", courseData);
      onBookmark(courseData.courseId, {
        courseId: courseData.courseId,
        courseName: courseData.courseName,
        hubRequirements: courseData.hubRequirements,
        credits: 4,
      });
    }
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
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
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
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by course code (e.g., CAS CS 131) or course name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-lg border border-default-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-foreground placeholder-default-400 transition-colors"
        />
        <div className="absolute right-3 top-3 text-default-400">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="space-y-3">
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
              Showing {filteredCourses.length} courses
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
          <div className="space-y-4 p-4 bg-default-50 dark:bg-default-100/20 rounded-lg border border-default-200">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
                  size="sm"
                >
                  <SelectItem key="all" value="all">
                    All Departments ({allCourses.length})
                  </SelectItem>
                  {departments.map((dept) => {
                    const count = allCourses.filter((course) => {
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

              <div>
                <label className="block text-sm font-medium text-default-700 mb-2">
                  Hub Requirements
                  {selectedHubRequirements.size > 0 && (
                    <span className="ml-2 text-xs text-primary">
                      ({selectedHubRequirements.size} selected)
                    </span>
                  )}
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 border border-default-200 rounded-lg bg-background">
                  {allHubRequirements.length === 0 ? (
                    <p className="text-xs text-default-400 italic">
                      Load hub requirements to see available filters
                    </p>
                  ) : (
                    allHubRequirements.map((hubReq) => {
                      const coursesWithHub = allCourses.filter((course) =>
                        course.hubRequirements.includes(hubReq)
                      ).length;

                      return (
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
                                ({coursesWithHub})
                              </span>
                            </div>
                          </Checkbox>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Hub Requirements Display */}
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
              {selectedDepartment !== "all" &&
                `Department: ${selectedDepartment}`}
              {selectedDepartment !== "all" &&
                selectedHubRequirements.size > 0 &&
                ", "}
              {selectedHubRequirements.size > 0 &&
                `Hub Requirements: ${Array.from(selectedHubRequirements).join(", ")}`}
              {selectedDepartment === "all" &&
                selectedHubRequirements.size === 0 &&
                searchValue === "" &&
                "None"}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCourses.map((course) => {
          const currentlyBookmarked =
            localBookmarkStates.get(course.courseId) ??
            isBookmarked(course.courseId);

          return (
            <div
              key={course.courseId}
              className="bg-content1 border border-default-200 dark:border-default-700 rounded-lg p-4 hover:border-default-300 dark:hover:border-default-600 hover:shadow-small transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {course.courseId}
                  </h4>
                  <p className="text-default-700 mt-1">{course.courseName}</p>

                  {/* Hub Requirements Display */}
                  <div className="mt-2">
                    {course.hubRequirements.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {course.hubRequirements.map((req, index) => (
                          <Chip
                            key={index}
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="text-xs"
                          >
                            {req}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <button
                        className="text-xs text-primary hover:text-primary-600 underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadHubRequirements(course.courseId);
                        }}
                        disabled={
                          loadingRequirements.has(course.courseId) ||
                          batchLoading
                        }
                      >
                        {loadingRequirements.has(course.courseId)
                          ? "Loading..."
                          : course.requirementsText}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleBookmarkClick(course)}
                  className={`ml-4 p-2 rounded-full transition-colors ${
                    currentlyBookmarked
                      ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                      : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                  }`}
                  title={
                    currentlyBookmarked ? "Remove bookmark" : "Bookmark course"
                  }
                >
                  {currentlyBookmarked ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 &&
        (searchValue ||
          selectedDepartment !== "all" ||
          selectedHubRequirements.size > 0) && (
          <div className="text-center py-8 text-default-500">
            <p>No courses found matching the current filters</p>
            <Button
              variant="light"
              size="sm"
              onPress={clearAllFilters}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        )}
    </div>
  );
}
