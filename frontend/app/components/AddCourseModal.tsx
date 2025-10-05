import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  description?: string;
};

interface AddCourseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseToAdd: Course | null;
  onConfirm: () => void;
}

export default function AddCourseModal({
  isOpen,
  onOpenChange,
  courseToAdd,
  onConfirm,
}: AddCourseModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Add Course</ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to add{" "}
            <strong>{courseToAdd?.courseId}</strong> -{" "}
            <strong>{courseToAdd?.course}</strong>?
          </p>
          {courseToAdd?.requirements && (
            <div className="mt-2">
              <p className="text-sm text-default-600">
                <strong>Fulfils Requirements:</strong>{" "}
                {courseToAdd.requirements}
              </p>
            </div>
          )}
          <div className="mt-2">
            <p className="text-sm text-default-600">
              <strong>Credits:</strong> {courseToAdd?.credits}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button color="success" onClick={onConfirm}>
            Add Course
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
