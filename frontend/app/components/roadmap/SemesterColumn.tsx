"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, Chip } from "@heroui/react";
import { Semester, PlannedCourse } from "../../../types/roadmap";
import { getSemesterLabel } from "../../utils/roadmapUtils";
import CourseCard from "./CourseCard";

interface SemesterColumnProps {
  semester: Semester;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
}

export default function SemesterColumn({
  semester,
  onRemoveCourse,
}: SemesterColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: semester.id,
  });

  const getCreditColor = (credits: number) => {
    if (credits === 0) return "default";
    if (credits < 12) return "warning";
    if (credits <= 18) return "success";
    return "danger";
  };

  return (
    <Card
      ref={setNodeRef}
      className={`p-4 transition-colors ${
        isOver ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-sm">
            {getSemesterLabel(semester)}
          </h3>
        </div>
        <Chip
          size="sm"
          color={getCreditColor(semester.totalCredits)}
          variant="flat"
        >
          {semester.totalCredits} cr
        </Chip>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {semester.courses.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-default-200 rounded-lg">
            <p className="text-sm text-default-400">Drop courses here</p>
          </div>
        ) : (
          semester.courses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onRemove={() => onRemoveCourse(semester.id, course.courseId)}
            />
          ))
        )}
      </div>
    </Card>
  );
}
