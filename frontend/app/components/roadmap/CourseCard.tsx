"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, Chip } from "@heroui/react";
import { GripVertical, X } from "lucide-react";
import { PlannedCourse } from "../../../types/roadmap";

interface CourseCardProps {
  course: PlannedCourse;
  isDragging?: boolean;
  onRemove?: () => void;
  showDragHandle?: boolean;
}

export default function CourseCard({
  course,
  isDragging = false,
  onRemove,
  showDragHandle = true,
}: CourseCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: course.courseId,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        {showDragHandle && (
          <GripVertical
            size={16}
            className="text-default-400 mt-0.5 flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] md:text-xs font-semibold truncate">
                {course.courseId}
              </p>
              <p className="text-[10px] md:text-xs text-default-600 line-clamp-2 mt-0.5">
                {course.course}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Chip size="sm" variant="flat" className="text-[10px] md:text-xs">
                {course.credits}cr
              </Chip>
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="text-danger hover:bg-danger/10 rounded p-1"
                >
                  <X size={12} className="md:w-3.5 md:h-3.5" />
                </button>
              )}
            </div>
          </div>
          {course.hubRequirements && course.hubRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {course.hubRequirements.slice(0, 2).map((hub, idx) => (
                <Chip
                  key={idx}
                  size="sm"
                  color="primary"
                  variant="dot"
                  className="text-[10px]"
                >
                  {hub}
                </Chip>
              ))}
              {course.hubRequirements.length > 2 && (
                <Chip size="sm" variant="flat" className="text-[10px]">
                  +{course.hubRequirements.length - 2}
                </Chip>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
