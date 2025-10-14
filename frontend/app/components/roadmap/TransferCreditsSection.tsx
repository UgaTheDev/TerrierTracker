"use client";
import React, { useState } from "react";
import { Card, Button, Chip } from "@heroui/react";
import { ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { PlannedCourse } from "../../../types/roadmap";
import CourseCard from "./CourseCard";
import { useDroppable } from "@dnd-kit/core";
interface TransferCreditsSectionProps {
  transferCredits: PlannedCourse[];
  onRemoveTransferCredit: (courseId: string) => void;
}

export default function TransferCreditsSection({
  transferCredits = [], // Set a default value to prevent undefined errors
  onRemoveTransferCredit,
}: TransferCreditsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { setNodeRef, isOver } = useDroppable({
    id: "transfer-credits",
  });

  const totalTransferCredits = transferCredits.reduce(
    (sum, credit) => sum + (credit.credits || 0),
    0
  );

  return (
    <Card
      className={`p-4 mb-6 border-2 border-dashed border-indigo-500/50 transition-colors ${
        isOver ? "ring-2 ring-indigo-500 bg-indigo-500/5" : ""
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <GraduationCap size={24} className="text-indigo-500" />
          <div className="text-left">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Transfer Credits (AP/IB/Other)
              <Chip size="sm" color="secondary" variant="flat">
                {transferCredits.length} courses
              </Chip>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalTransferCredits} credits total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div
          ref={setNodeRef}
          className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 min-h-[150px] transition-colors ${
            isOver ? "bg-indigo-500/5 rounded-lg" : ""
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Drag courses here that you received credit for through AP, IB, etc.
          </p>

          {transferCredits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <GraduationCap
                size={48}
                className="text-gray-300 dark:text-gray-500 mb-3"
              />
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
                No transfer credits added yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Drag courses from your enrolled courses or sidebar
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {transferCredits.map((credit) => (
                <div key={credit.courseId} className="relative">
                  <CourseCard
                    course={credit}
                    onRemove={() => onRemoveTransferCredit(credit.courseId)}
                    showDragHandle={true}
                  />
                  {credit.transferSource && (
                    <div className="mt-1">
                      <Chip
                        size="sm"
                        color="secondary"
                        variant="dot"
                        className="text-[10px]"
                      >
                        {credit.transferSource}
                      </Chip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {transferCredits.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                💡 <strong>Tip:</strong> Transfer credits count toward your
                total credits and hub requirements but won't appear in your
                semester plan.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
