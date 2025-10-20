"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@heroui/react";

type HubRequirement = {
  name: string;
  required: number;
  current: number;
  courses?: Array<{
    courseId: string;
    course: string;
    credits: number;
  }>;
};

interface ViewRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: HubRequirement | null;
}

export default function ViewRequirementsModal({
  isOpen,
  onClose,
  requirement,
}: ViewRequirementsModalProps) {
  if (!requirement) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{requirement.name}</h3>
          <p className="text-sm font-normal text-default-500">
            {requirement.current} / {requirement.required} units completed
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3">
                Courses Fulfilling This Requirement
              </h4>
              {requirement.courses && requirement.courses.length > 0 ? (
                <div className="space-y-2">
                  {requirement.courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
                    >
                      <div>
                        <p className="font-mono text-sm font-semibold">
                          {course.courseId}
                        </p>
                        <p className="text-xs text-default-600">
                          {course.course}
                        </p>
                      </div>
                      <Chip size="sm" variant="flat">
                        {course.credits} cr
                      </Chip>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-default-400">
                  No courses currently fulfill this requirement.
                </p>
              )}
            </div>

            {requirement.current < requirement.required && (
              <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <p className="text-sm text-warning-800 dark:text-warning-200">
                  <strong>
                    {requirement.required - requirement.current} unit
                    {requirement.required - requirement.current > 1
                      ? "s"
                      : ""}{" "}
                    remaining
                  </strong>{" "}
                  to fulfill this requirement.
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
