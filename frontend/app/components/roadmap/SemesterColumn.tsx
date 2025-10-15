"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, Chip, Button } from "@heroui/react"; // 👈 Ensure Button is imported
import { Semester } from "../../../types/roadmap";
import { Trash2 } from "lucide-react"; // Using a better icon for clearing/deleting
import { getSemesterLabel } from "../../utils/roadmapUtils";
import CourseCard from "./CourseCard";

interface SemesterColumnProps {
  semester: Semester;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  showYear?: boolean;
  onClearSemester: (semesterId: string) => void;
}

export default function SemesterColumn({
  semester,
  onRemoveCourse,
  showYear = true,
  onClearSemester,
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
      className={`p-3 md:p-4 transition-colors ${
        isOver ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm md:text-base">
          {getSemesterLabel(semester, showYear)}
        </h3>

        {/* New Right-Side Container for Buttons/Chips */}
        <div className="flex items-center gap-2">
          {/* 1. CLEAR BUTTON (Visible only if courses exist) */}
          {semester.courses.length > 0 && (
            <Button
              size="sm"
              variant="light" // Using 'light' to keep it small and subtle, but red
              color="danger"
              startContent={<Trash2 size={12} />} // Using Trash2 for clarity
              onClick={() => onClearSemester(semester.id)}
              className="p-1 h-auto text-xs font-normal"
              title={`Clear all courses from this semester`}
            >
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          {/* 2. CREDITS CHIP (Always Visible) */}
          <Chip
            size="sm"
            color={getCreditColor(semester.totalCredits)}
            variant="flat"
            className="text-xs"
          >
            {semester.totalCredits} cr
          </Chip>
        </div>
      </div>

      <div className="space-y-2 min-h-[150px] md:min-h-[200px]">
        {semester.courses.length === 0 ? (
          <div className="flex items-center justify-center h-[150px] md:h-[200px] border-2 border-dashed border-default-200 rounded-lg">
            <p className="text-xs md:text-sm text-default-400 text-center px-2">
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
