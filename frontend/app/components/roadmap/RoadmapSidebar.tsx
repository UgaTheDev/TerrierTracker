"use client";
import React, { useState } from "react";
import { Card, Divider, Button, Chip } from "@heroui/react";
import { Roadmap, PlannedCourse } from "../../../types/roadmap";
import CourseCard from "./CourseCard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RoadmapSidebarProps {
  roadmap: Roadmap;
  availableCourses: PlannedCourse[];
  userInfo?: {
    name?: string;
    major?: string;
    minor?: string;
  };
}

export default function RoadmapSidebar({
  roadmap,
  availableCourses,
  userInfo = {},
}: RoadmapSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const placedCourseIds = new Set(
    roadmap.semesters.flatMap((s) => s.courses.map((c) => c.courseId))
  );
  const transferCourseIds = new Set(
    roadmap.transferCredits.map((c) => c.courseId)
  );
  const unplacedCourses = availableCourses.filter(
    (c) =>
      !placedCourseIds.has(c.courseId) && !transferCourseIds.has(c.courseId)
  );

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Button
        className="w-full lg:hidden"
        variant="flat"
        endContent={
          isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        }
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Available Courses ({unplacedCourses.length})
      </Button>

      <div className={`space-y-4 ${isExpanded ? "block" : "hidden lg:block"}`}>
        {(userInfo.name || userInfo.major || userInfo.minor) && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm md:text-base">Profile</h3>
            <div className="space-y-2 text-xs md:text-sm">
              {userInfo.name && (
                <p>
                  <span className="text-default-500">Name:</span>{" "}
                  {userInfo.name}
                </p>
              )}
              {userInfo.major && (
                <p>
                  <span className="text-default-500">Major:</span>{" "}
                  {userInfo.major}
                </p>
              )}
              {userInfo.minor && (
                <p>
                  <span className="text-default-500">Minor:</span>{" "}
                  {userInfo.minor}
                </p>
              )}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm md:text-base">
              Available Courses
            </h3>
            <Chip size="sm" variant="flat">
              {unplacedCourses.length}
            </Chip>
          </div>
          <p className="text-xs text-default-500 mb-3">
            Drag courses to add them to your roadmap
          </p>
          <Divider className="mb-3" />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unplacedCourses.length === 0 ? (
              <p className="text-xs md:text-sm text-default-400 text-center py-4">
                All courses have been placed
              </p>
            ) : (
              unplacedCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  showDragHandle
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
