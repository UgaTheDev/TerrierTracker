"use client";
import React from "react";
import { Card, Divider } from "@heroui/react";
import { Roadmap, PlannedCourse } from "../../../types/roadmap";
import CourseCard from "./CourseCard";

interface RoadmapSidebarProps {
  roadmap: Roadmap;
  availableCourses: PlannedCourse[];
  userInfo?: {
    name?: string;
    buId?: string;
    major?: string;
    minor?: string;
  };
}

export default function RoadmapSidebar({
  roadmap,
  availableCourses,
  userInfo = {},
}: RoadmapSidebarProps) {
  const placedCourseIds = new Set(
    roadmap.semesters.flatMap((s) => s.courses.map((c) => c.courseId))
  );
  const unplacedCourses = availableCourses.filter(
    (c) => !placedCourseIds.has(c.courseId)
  );

  return (
    <div className="space-y-4 sticky top-24">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Profile</h3>
        <div className="space-y-2 text-sm">
          {userInfo.name && (
            <p>
              <span className="text-default-500">Email:</span> {userInfo.name}
            </p>
          )}
          {userInfo.major && (
            <p>
              <span className="text-default-500">Major:</span> {userInfo.major}
            </p>
          )}
          {userInfo.minor && (
            <p>
              <span className="text-default-500">Minor:</span> {userInfo.minor}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">
          Available Courses ({unplacedCourses.length})
        </h3>
        <p className="text-xs text-default-500 mb-3">
          Drag courses to add them to your roadmap
        </p>
        <Divider className="mb-3" />
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {unplacedCourses.length === 0 ? (
            <p className="text-sm text-default-400 text-center py-4">
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
  );
}
