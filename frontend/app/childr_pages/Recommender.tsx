"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Select,
  SelectItem,
  Input,
  Chip,
  Progress,
  Skeleton,
  Divider,
} from "@heroui/react";
import {
  BookOpen,
  Lightbulb,
  Target,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Search,
} from "lucide-react";

type HubRequirement = {
  name: string;
  required: number;
  current: number;
};

type BookmarkedCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  hubRequirements: string[];
  school: string;
};

interface CourseRecommendation {
  courseId: string;
  courseName: string;
  hubRequirements: string[];
  unfulfilledCount: number;
  priority: "high" | "medium" | "low";
}

interface CourseRecommenderProps {
  hubRequirements: HubRequirement[];
  onBookmark: (courseId: string, courseData: any) => void;
  bookmarkedCourses: BookmarkedCourse[];
  isBookmarked: (courseId: string) => boolean;
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

export default function CourseRecommender({
  hubRequirements,
  onBookmark,
  bookmarkedCourses,
  isBookmarked,
}: CourseRecommenderProps) {
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<
    CourseRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const schools = useMemo(() => {
    const schoolSet = new Set<string>();
    allCourses.forEach((course) => {
      const school = course.courseId.substring(0, 3);
      if (school) schoolSet.add(school);
    });
    return Array.from(schoolSet).sort();
  }, [allCourses]);

  const departments = useMemo(() => {
    const deptMap = new Map<string, string>();
    allCourses.forEach((course) => {
      const parts = course.courseId.split(" ");
      if (parts.length >= 2) {
        const school = parts[0].substring(0, 3);
        const dept = parts[1];
        const key = `${school} ${dept}`;
        deptMap.set(key, key);
      }
    });
    return Array.from(deptMap.values()).sort();
  }, [allCourses]);

  const filteredDepartments = useMemo(() => {
    if (!selectedSchool) return departments;
    return departments.filter((dept) => dept.startsWith(selectedSchool));
  }, [departments, selectedSchool]);

  useEffect(() => {
    const loadAllCourses = async () => {
      try {
        const data = await apiRequest("/all-courses", { method: "GET" });
        const coursesArray = Object.entries(data.courses || {}).map(
          ([code, name]) => ({
            courseId: code,
            courseName: name as string,
            hubRequirements: [],
          })
        );
        setAllCourses(coursesArray);
      } catch (error: any) {
        console.error("Failed to load courses:", error);
        setError(error.message);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadAllCourses();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      setSelectedDepartment("");
      setRecommendations([]);
    }
  }, [selectedSchool]);

  const unfulfilledRequirements = useMemo(() => {
    return hubRequirements.filter((req) => req.current < req.required);
  }, [hubRequirements]);

  const fulfilledCount =
    hubRequirements.length - unfulfilledRequirements.length;
  const progressPercentage = (fulfilledCount / hubRequirements.length) * 100;

  const fetchDepartmentCourses = (deptCode: string) => {
    return allCourses.filter((course) => {
      const parts = course.courseId.split(" ");
      if (parts.length >= 2) {
        const school = parts[0].substring(0, 3);
        const dept = parts[1];
        return `${school} ${dept}` === deptCode;
      }
      return false;
    });
  };

  const fetchHubRequirements = async (
    courseCode: string
  ): Promise<string[]> => {
    try {
      const data = await apiRequest("/search-course", {
        method: "POST",
        body: JSON.stringify({
          course_identifier: courseCode,
        }),
      });
      return data.hub_requirements || [];
    } catch (error) {
      console.error(
        `Error fetching hub requirements for ${courseCode}:`,
        error
      );
      return [];
    }
  };

  const analyzeAndRecommend = async (courses: any[]) => {
    const unfulfilledSet = new Set(
      unfulfilledRequirements.map((req) => req.name)
    );
    const courseAnalysis: CourseRecommendation[] = [];

    const batchSize = 10;
    for (let i = 0; i < Math.min(courses.length, 50); i += batchSize) {
      const batch = courses.slice(i, i + batchSize);

      const batchPromises = batch.map(async (course) => {
        try {
          const hubReqs = await fetchHubRequirements(course.courseId);

          const unfulfilledCount = hubReqs.filter((req) =>
            unfulfilledSet.has(req)
          ).length;

          if (unfulfilledCount > 0) {
            let priority: "high" | "medium" | "low" = "low";
            if (unfulfilledCount >= 3) priority = "high";
            else if (unfulfilledCount === 2) priority = "medium";

            return {
              courseId: course.courseId,
              courseName: course.courseName,
              hubRequirements: hubReqs,
              unfulfilledCount,
              priority,
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to analyze ${course.courseId}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      courseAnalysis.push(
        ...(batchResults.filter(
          (result) => result !== null
        ) as CourseRecommendation[])
      );

      if (i + batchSize < courses.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return courseAnalysis.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.unfulfilledCount - a.unfulfilledCount;
    });
  };

  const handleSchoolSelect = async (schoolCode: string) => {
    if (!schoolCode || isLoadingCourses) return;

    setSelectedSchool(schoolCode);
    setSelectedDepartment(""); // Reset department
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      console.log(`Filtering courses for school: ${schoolCode}`);
      const courses = allCourses.filter((course) => {
        const school = course.courseId.substring(0, 3);
        return school === schoolCode;
      });

      console.log(`Analyzing ${courses.length} courses for recommendations...`);
      const recs = await analyzeAndRecommend(courses);
      setRecommendations(recs);
      console.log(`Found ${recs.length} recommendations`);
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentSelect = async (deptCode: string) => {
    if (!deptCode || isLoadingCourses) return;

    setSelectedDepartment(deptCode);
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      console.log(`Filtering courses for department: ${deptCode}`);
      const courses = fetchDepartmentCourses(deptCode);

      console.log(`Analyzing ${courses.length} courses for recommendations...`);
      const recs = await analyzeAndRecommend(courses);
      setRecommendations(recs);
      console.log(`Found ${recs.length} recommendations`);
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkClick = async (course: CourseRecommendation) => {
    onBookmark(course.courseId, {
      courseId: course.courseId,
      courseName: course.courseName,
      hubRequirements: course.hubRequirements,
      credits: 4,
    });
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "success";
      case "medium":
        return "warning";
      case "low":
        return "default";
    }
  };

  const filteredRecommendations = useMemo(() => {
    if (!searchValue.trim()) return recommendations;

    const searchLower = searchValue.toLowerCase();
    return recommendations.filter(
      (course) =>
        course.courseId.toLowerCase().includes(searchLower) ||
        course.courseName.toLowerCase().includes(searchLower)
    );
  }, [recommendations, searchValue]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Course Recommender
        </h1>
        <p className="text-default-600">
          Get personalized course recommendations based on your unfulfilled hub
          requirements. Select a school and department to see courses that will
          help you complete your degree.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Hub Requirements Progress</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{fulfilledCount}</p>
            <p className="text-sm text-default-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {unfulfilledRequirements.length}
            </p>
            <p className="text-sm text-default-500">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {hubRequirements.length}
            </p>
            <p className="text-sm text-default-500">Total</p>
          </div>
        </div>

        <Progress
          value={progressPercentage}
          color="primary"
          className="mb-4"
          label="Overall Progress"
          showValueLabel={true}
        />

        {unfulfilledRequirements.length > 0 && (
          <div>
            <p className="text-sm font-medium text-default-700 mb-2">
              Unfulfilled Requirements ({unfulfilledRequirements.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {unfulfilledRequirements.slice(0, 8).map((req, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="warning"
                  className="text-xs"
                >
                  {req.name} ({req.current}/{req.required})
                </Chip>
              ))}
              {unfulfilledRequirements.length > 8 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="default"
                  className="text-xs"
                >
                  +{unfulfilledRequirements.length - 8} more
                </Chip>
              )}
            </div>
          </div>
        )}
      </Card>

      {isLoadingCourses ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-48 rounded" />
          </div>
          <Skeleton className="h-12 rounded" />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Select School & Department
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="School"
              placeholder="Choose a school"
              selectedKeys={
                selectedSchool ? new Set([selectedSchool]) : new Set()
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedSchool(selected || "");
                setSelectedDepartment(""); // Reset department when school changes
              }}
              isDisabled={isLoadingCourses}
            >
              {schools.map((school) => {
                const count = allCourses.filter(
                  (c) => c.courseId.substring(0, 3) === school
                ).length;
                return (
                  <SelectItem key={school}>
                    {school} ({count})
                  </SelectItem>
                );
              })}
            </Select>

            <Select
              label="Department (Optional)"
              placeholder="All departments"
              selectedKeys={
                selectedDepartment ? new Set([selectedDepartment]) : new Set()
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedDepartment(selected || "");
              }}
              isDisabled={isLoadingCourses || !selectedSchool}
            >
              {filteredDepartments.map((dept) => {
                const count = allCourses.filter((course) => {
                  const parts = course.courseId.split(" ");
                  if (parts.length >= 2) {
                    const school = parts[0].substring(0, 3);
                    const courseDept = parts[1];
                    return `${school} ${courseDept}` === dept;
                  }
                  return false;
                }).length;
                return (
                  <SelectItem key={dept}>
                    {dept} ({count})
                  </SelectItem>
                );
              })}
            </Select>

            <div className="flex items-end">
              <Button
                color="primary"
                onPress={() => {
                  if (selectedDepartment) {
                    handleDepartmentSelect(selectedDepartment);
                  } else if (selectedSchool) {
                    handleSchoolSelect(selectedSchool);
                  }
                }}
                isDisabled={!selectedSchool || isLoading}
                isLoading={isLoading}
                className="w-full"
              >
                Get Recommendations
              </Button>
            </div>

            {recommendations.length > 0 && (
              <Input
                placeholder="Search recommendations..."
                value={searchValue}
                onValueChange={setSearchValue}
                startContent={<Search className="w-4 h-4 text-default-400" />}
              />
            )}
          </div>
        </Card>
      )}

      {isLoading && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-6 w-48 rounded" />
            </div>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">Error loading recommendations</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && !error && recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Recommendations</h2>
            </div>
            <Chip size="sm" color="primary" variant="flat">
              {filteredRecommendations.length} courses found
            </Chip>
          </div>

          <div className="grid gap-4">
            {filteredRecommendations.map((course) => {
              const currentlyBookmarked = isBookmarked(course.courseId);

              return (
                <div
                  key={course.courseId}
                  className="border border-default-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground font-mono">
                          {course.courseId}
                        </h3>
                        <Chip
                          size="sm"
                          color={getPriorityColor(course.priority)}
                          variant="flat"
                        >
                          {course.priority} priority
                        </Chip>
                      </div>

                      <p className="text-default-700 mb-3">
                        {course.courseName}
                      </p>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-success mb-1">
                          Fulfills {course.unfulfilledCount} unfulfilled
                          requirement{course.unfulfilledCount !== 1 ? "s" : ""}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {course.hubRequirements
                            .filter((req) =>
                              unfulfilledRequirements.some(
                                (unfulfilled) => unfulfilled.name === req
                              )
                            )
                            .map((req, index) => (
                              <Chip
                                key={index}
                                size="sm"
                                variant="flat"
                                color="success"
                                className="text-xs"
                              >
                                {req}
                              </Chip>
                            ))}
                        </div>
                      </div>

                      {course.hubRequirements.length >
                        course.unfulfilledCount && (
                        <div>
                          <p className="text-sm font-medium text-default-500 mb-1">
                            Additional requirements:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {course.hubRequirements
                              .filter(
                                (req) =>
                                  !unfulfilledRequirements.some(
                                    (unfulfilled) => unfulfilled.name === req
                                  )
                              )
                              .map((req, index) => (
                                <Chip
                                  key={index}
                                  size="sm"
                                  variant="flat"
                                  color="default"
                                  className="text-xs"
                                >
                                  {req}
                                </Chip>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookmarkClick(course)}
                      className={`ml-4 p-2 rounded-full transition-colors ${
                        currentlyBookmarked
                          ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                          : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                      }`}
                      title={
                        currentlyBookmarked
                          ? "Remove bookmark"
                          : "Bookmark course"
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
        </Card>
      )}

      {!isLoading &&
        !error &&
        selectedDepartment &&
        recommendations.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-default-400 mb-4">
              <Lightbulb className="w-12 h-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-default-700 mb-2">
              No recommendations found
            </h3>
            <p className="text-default-500 text-sm">
              No courses in {selectedDepartment} were found that fulfill your
              remaining hub requirements. Try selecting a different department
              or check if you have unfulfilled requirements.
            </p>
          </Card>
        )}

      {!selectedSchool && !isLoading && (
        <Card className="p-8 text-center">
          <div className="text-default-400 mb-4">
            <Target className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-default-700 mb-2">
            Ready to find your next courses?
          </h3>
          <p className="text-default-500 text-sm">
            Select a school above to get personalized course recommendations.
            You can optionally narrow down by department, or leave it blank to
            see all courses in the school.
          </p>
        </Card>
      )}
    </div>
  );
}
