"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, Chip } from "@heroui/react";
import { Semester, PlannedCourse } from "../../../types/roadmap";
import { getSemesterLabel } from "../../utils/roadmapUtils";
import CourseCard from "./CourseCard";
import { AlertTriangle } from "lucide-react";

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

  const getCreditStatus = (
    credits: number
  ): {
    color: "default" | "warning" | "success" | "danger";
    isOverloaded: boolean;
  } => {
    if (credits === 0) return { color: "default", isOverloaded: false };
    if (credits < 12) return { color: "warning", isOverloaded: false };
    if (credits <= 20) return { color: "success", isOverloaded: false };
    return { color: "danger", isOverloaded: true };
  };

  const creditStatus = getCreditStatus(semester.totalCredits);

  return (
    <Card
      ref={setNodeRef}
      className={`p-4 transition-all duration-300 ${
        isOver ? "ring-2 ring-indigo-500 bg-indigo-500/5" : ""
      } ${creditStatus.isOverloaded ? "border-red-500 dark:border-red-400" : "border-gray-200 dark:border-gray-700"}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-sm">
            {getSemesterLabel(semester)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Show an alert icon only when overloaded */}
          {creditStatus.isOverloaded && (
            <div
              title={`Credit load (${semester.totalCredits}) exceeds recommended maximum of 18.`}
            >
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          )}
          <Chip size="sm" color={creditStatus.color} variant="flat">
            {semester.totalCredits} cr
          </Chip>
        </div>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {semester.courses.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Drop courses here
            </p>
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
