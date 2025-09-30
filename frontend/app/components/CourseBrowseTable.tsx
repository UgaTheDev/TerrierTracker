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

const API_BASE_URL = "https://terriertracker-production.up.railway.app";

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
      return parsed.data;
    }
  }
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    let msg = await res.text();
    throw new Error(msg || `HTTP error ${res.status}`);
  }
  const data = await res.json();
  localStorage.setItem(
    cacheKey,
    JSON.stringify({ data, timestamp: Date.now() })
  );
  return data;
};

const fetchAllCourses = async (): Promise<CourseData[]> => {
  const data = await apiRequest("/all-courses", { method: "GET" });
  return Object.entries(data.courses || {}).map(([code, name]) => ({
    courseId: code,
    courseName: name as string,
    hubRequirements: [],
    requirementsText: "Click to load requirements",
  }));
};

const fetchHubRequirements = async (courseCode: string): Promise<string[]> => {
  try {
    const data = await apiRequest("/search-course", {
      method: "POST",
      body: JSON.stringify({ course_identifier: courseCode }),
    });
    return data.hub_requirements || [];
  } catch {
    return [];
  }
};

export default function CourseBrowseTable({
  isEnrolled,
  handleAddCourse,
  isBookmarked,
  handleBookmark,
}: {
  isEnrolled: (code: string) => boolean;
  handleAddCourse: (c: Course) => void;
  isBookmarked: (code: string) => boolean;
  handleBookmark: (bookmark: BookmarkedCourse) => void;
}) {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CourseData | null>(null);
  const [loadingReqs, setLoadingReqs] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const loaded = await fetchAllCourses();
        setCourses(loaded.slice(0, 100)); // Limit to 100 to start
      } catch (e) {
        setError((e as Error).message || "Failed loading courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadRequirements = async (code: string) => {
    if (loadingReqs.has(code)) return;
    setLoadingReqs(new Set(loadingReqs).add(code));
    const reqs = await fetchHubRequirements(code);
    setCourses((cs) =>
      cs.map((course) =>
        course.courseId === code
          ? {
              ...course,
              hubRequirements: reqs,
              requirementsText: reqs.length
                ? reqs.join(", ")
                : "No requirements",
            }
          : course
      )
    );
    setLoadingReqs((s) => {
      const newSet = new Set(s);
      newSet.delete(code);
      return newSet;
    });
  };

  const convertToCourse = (data: CourseData): Course => ({
    id: Date.now() + Math.random(),
    courseId: data.courseId,
    course: data.courseName,
    credits: 4,
    requirements: data.requirementsText,
    description: `Requirements: ${data.requirementsText}`,
    hubRequirements: data.hubRequirements,
  });

  const convertToBookmark = (data: CourseData): BookmarkedCourse => ({
    id: data.courseId,
    code: data.courseId,
    name: data.courseName,
    credits: 4,
    hubRequirements: data.hubRequirements ?? [],
    school: data.courseId.split(" ")[0] ?? "Unknown",
  });

  // Custom cell renderer with added logging on add-click
  const renderCell = (course: CourseData, column: string) => {
    switch (column) {
      case "id":
        return <>{course.courseId}</>;
      case "course":
        return <>{course.courseName}</>;
      case "credits":
        return <>4</>;
      case "hubRequirements":
        if (course.hubRequirements.length > 0) {
          return (
            <>
              {course.hubRequirements.map((req, idx) => (
                <Chip
                  key={idx}
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="mr-1"
                >
                  {req}
                </Chip>
              ))}
            </>
          );
        } else {
          return (
            <button
              className="text-primary underline cursor-pointer"
              disabled={loadingReqs.has(course.courseId)}
              onClick={() => loadRequirements(course.courseId)}
            >
              {loadingReqs.has(course.courseId)
                ? "Loading..."
                : "Load requirements"}
            </button>
          );
        }
      case "status":
        return isEnrolled(course.courseId) ? (
          <span className="text-green-600">Enrolled</span>
        ) : (
          <span>Available</span>
        );
      case "bookmark":
        const bookmarked = isBookmarked(course.courseId);
        return (
          <button
            onClick={() => {
              console.log("Bookmark clicked for", course.courseId);
              const bookmark = convertToBookmark(course);
              handleBookmark(bookmark);
            }}
            title={bookmarked ? "Remove bookmark" : "Add bookmark"}
            aria-label="Bookmark toggle"
          >
            {bookmarked ? <BookmarkCheck /> : <Bookmark />}
          </button>
        );
      case "actions":
        const enrolled = isEnrolled(course.courseId);
        return enrolled ? (
          <span className="text-gray-400" title="Already enrolled">
            <Check />
          </span>
        ) : (
          <button
            onClick={() => {
              console.log("Add clicked for", course.courseId);
              const c = convertToCourse(course);
              handleAddCourse(c);
            }}
            aria-label="Add course"
          >
            <AddIcon />
          </button>
        );
      default:
        return course[column as keyof CourseData];
    }
  };

  if (loading) {
    return (
      <div>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <AlertCircle />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <Table
        aria-label="Browse Courses"
        selectionMode="none"
        sortDescriptor={null}
      >
        <TableHeader columns={columns}>
          {(col) => (
            <TableColumn
              key={col.uid}
              align={
                ["actions", "bookmark"].includes(col.uid) ? "center" : "start"
              }
            >
              {col.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={courses}>
          {(item) => (
            <TableRow key={item.courseId}>
              {(column) => <TableCell>{renderCell(item, column)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
