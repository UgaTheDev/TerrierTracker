"use client";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  Button,
  Checkbox,
  Chip,
  Progress,
  Divider,
} from "@heroui/react";
import { BookmarkCheck, Eye, EyeOff } from "lucide-react";

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

interface YourBookmarksProps {
  bookmarkedCourses: BookmarkedCourse[];
  hubRequirements: HubRequirement[];
  onRemoveBookmark: (courseId: string) => void;
}

const columns = [
  { name: "SELECT", uid: "select" },
  { name: "COURSE", uid: "course" },
  { name: "CREDITS", uid: "credits" },
  { name: "HUB REQUIREMENTS", uid: "hubRequirements" },
  { name: "ACTIONS", uid: "actions" },
];

export default function YourBookmarks({
  bookmarkedCourses = [],
  hubRequirements = [],
  onRemoveBookmark = () => {},
}: YourBookmarksProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showVisualization, setShowVisualization] = useState(false);

  const updatedHubRequirements = useMemo(() => {
    const phantomCounts: { [key: string]: number } = {};

    selectedCourses.forEach((courseId) => {
      const course = bookmarkedCourses.find((c) => c.id === courseId);
      if (course) {
        course.hubRequirements.forEach((req) => {
          phantomCounts[req] = (phantomCounts[req] || 0) + 1;
        });
      }
    });

    return hubRequirements.map((req) => ({
      ...req,
      phantom: phantomCounts[req.name] || 0,
    }));
  }, [selectedCourses, bookmarkedCourses, hubRequirements]);

  const handleUnbookmark = (courseId: string) => {
    onRemoveBookmark(courseId);
    setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
  };

  const handleCourseSelect = (courseId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCourses((prev) => [...prev, courseId]);
    } else {
      setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === bookmarkedCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(bookmarkedCourses.map((course) => course.id));
    }
  };

  const isAllSelected =
    selectedCourses.length === bookmarkedCourses.length &&
    bookmarkedCourses.length > 0;
  const isIndeterminate =
    selectedCourses.length > 0 &&
    selectedCourses.length < bookmarkedCourses.length;

  const renderCell = (course: BookmarkedCourse, columnKey: React.Key) => {
    switch (columnKey) {
      case "select":
        return (
          <Checkbox
            isSelected={selectedCourses.includes(course.id)}
            onChange={(isSelected) => handleCourseSelect(course.id, isSelected)}
            color="primary"
          />
        );
      case "course":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm font-mono">{course.code}</p>
            <p className="text-bold text-sm">{course.name}</p>
          </div>
        );
      case "credits":
        return (
          <div className="flex items-center">
            <p className="text-sm font-semibold">{course.credits}</p>
          </div>
        );
      case "hubRequirements":
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
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
        );
      case "actions":
        return (
          <div className="flex items-center">
            <button
              onClick={() => handleUnbookmark(course.id)}
              className="p-2 rounded-full text-yellow-600 hover:bg-yellow-50 transition-colors"
              title="Remove bookmark"
            >
              <BookmarkCheck className="w-5 h-5" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getProgressColor = (
    current: number,
    phantom: number,
    required: number
  ) => {
    const total = current + phantom;
    if (total >= required) return "success";
    if (phantom > 0) return "warning";
    return "danger";
  };

  const getProgressValue = (
    current: number,
    phantom: number,
    required: number
  ) => {
    return Math.min(((current + phantom) / required) * 100, 100);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Bookmarks</h1>
          <p className="text-default-500">
            Manage your bookmarked courses and see how they affect your hub
            requirements.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={showVisualization ? "solid" : "flat"}
            color="primary"
            startContent={
              showVisualization ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )
            }
            onClick={() => setShowVisualization(!showVisualization)}
            size="sm"
          >
            {showVisualization ? "Hide" : "Show"} Hub Impact
          </Button>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {bookmarkedCourses.length}
              </p>
              <p className="text-sm text-default-500">Bookmarked</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bookmarked Courses</h2>
              {bookmarkedCourses.length > 0 && (
                <div className="flex items-center gap-4">
                  <Checkbox
                    isSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    color="primary"
                  >
                    Select All ({selectedCourses.length}/
                    {bookmarkedCourses.length})
                  </Checkbox>
                </div>
              )}
            </div>

            {bookmarkedCourses.length === 0 ? (
              <div className="text-center py-12 text-default-500">
                <BookmarkCheck className="w-16 h-16 mx-auto mb-4 text-default-300" />
                <p className="text-lg font-medium">No bookmarked courses yet</p>
                <p className="text-sm">
                  Visit the Hub Helper to bookmark courses that interest you.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <Table aria-label="Bookmarked courses table">
                  <TableHeader columns={columns}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={
                          column.uid === "actions" || column.uid === "select"
                            ? "center"
                            : "start"
                        }
                        allowsSorting={false}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={bookmarkedCourses}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
        {showVisualization && (
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Hub Impact Preview</h2>
                <Chip
                  size="sm"
                  variant="flat"
                  color={selectedCourses.length > 0 ? "success" : "default"}
                >
                  {selectedCourses.length} selected
                </Chip>
              </div>

              <p className="text-sm text-default-500 mb-4">
                Select courses above to see how they would impact your hub
                requirements.
              </p>

              <div className="space-y-4 max-h-80 overflow-auto">
                {updatedHubRequirements.map((req, index) => {
                  const progressValue = getProgressValue(
                    req.current,
                    req.phantom,
                    req.required
                  );
                  const progressColor = getProgressColor(
                    req.current,
                    req.phantom,
                    req.required
                  );
                  const total = req.current + req.phantom;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium leading-tight">
                          {req.name}
                        </p>
                        <div className="text-right text-xs text-default-500">
                          <span
                            className={
                              total >= req.required ? "text-success" : ""
                            }
                          >
                            {total}/{req.required}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={progressValue}
                        color={progressColor}
                        size="sm"
                        className="w-full"
                      />
                      {req.phantom > 0 && (
                        <p className="text-xs text-warning">
                          +{req.phantom} from selected bookmarks
                        </p>
                      )}
                      {index < updatedHubRequirements.length - 1 && (
                        <Divider className="my-2" />
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedCourses.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm font-medium text-success">
                      {
                        updatedHubRequirements.filter(
                          (req) => req.current + req.phantom >= req.required
                        ).length
                      }{" "}
                      / {updatedHubRequirements.length}
                    </p>
                    <p className="text-xs text-default-500">
                      requirements would be completed
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
