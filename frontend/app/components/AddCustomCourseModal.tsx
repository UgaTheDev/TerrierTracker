"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
} from "@heroui/react";

interface AddCustomCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (course: CustomCourseArray) => void;
}

export type CustomCourseArray = [string, string, string, number];

const HUB_REQUIREMENTS = [
  "Philosophical Inquiry and Life's Meanings",
  "Aesthetic Exploration",
  "Historical Consciousness",
  "Scientific Inquiry I",
  "Social Inquiry I",
  "Scientific Inquiry II",
  "Social Inquiry II",
  "Quantitative Reasoning I",
  "Quantitative Reasoning II",
  "The Individual in Community",
  "Global Citizenship and Intercultural Literacy",
  "Ethical Reasoning",
  "First-Year Writing Seminar",
  "Writing, Research, and Inquiry",
  "Writing-Intensive Course",
  "Oral and/or Signed Communication",
  "Digital/Multimedia Expression",
  "Critical Thinking",
  "Research and Information Literacy",
  "Teamwork/Collaboration",
  "Creativity/Innovation",
];

export default function AddCustomCourseModal({
  isOpen,
  onClose,
  onAdd,
}: AddCustomCourseModalProps) {
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("4");
  const [selectedHubs, setSelectedHubs] = useState<Set<string>>(new Set());

  const handleSubmit = () => {
    if (!courseId || !courseName) {
      alert("Please fill in Course ID and Course Name");
      return;
    }

    const hubsString = Array.from(selectedHubs).join(" | ");
    const customCourse: CustomCourseArray = [
      courseId,
      courseName,
      hubsString,
      parseInt(credits) || 4,
    ];

    onAdd(customCourse);
    handleClose();
  };

  const handleClose = () => {
    setCourseId("");
    setCourseName("");
    setCredits("4");
    setSelectedHubs(new Set());
    onClose();
  };

  const toggleHub = (hub: string) => {
    const newSet = new Set(selectedHubs);
    if (newSet.has(hub)) {
      newSet.delete(hub);
    } else {
      newSet.add(hub);
    }
    setSelectedHubs(newSet);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      className="mx-4"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Add Custom Course</h3>
          <p className="text-sm text-default-500 font-normal">
            Add a course that's not in our database (e.g., discontinued courses,
            transfer credits)
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Course Code"
              placeholder="e.g., CAS CS 999"
              value={courseId}
              onValueChange={setCourseId}
              isRequired
              description="Enter the official course code"
            />
            <Input
              label="Course Name"
              placeholder="e.g., Advanced Topics in Computer Science"
              value={courseName}
              onValueChange={setCourseName}
              isRequired
              description="Enter the full course title"
            />
            <Input
              label="Credits"
              type="number"
              value={credits}
              onValueChange={setCredits}
              description="Number of credits (default: 4)"
            />

            <div>
              <p className="text-sm font-medium mb-3">
                Hub Requirements{" "}
                {selectedHubs.size > 0 && (
                  <span className="text-primary">
                    ({selectedHubs.size} selected)
                  </span>
                )}
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-default-200 rounded-lg p-4 bg-default-50">
                {HUB_REQUIREMENTS.map((hub) => (
                  <Checkbox
                    key={hub}
                    isSelected={selectedHubs.has(hub)}
                    onValueChange={() => toggleHub(hub)}
                    size="sm"
                  >
                    <span className="text-sm">{hub}</span>
                  </Checkbox>
                ))}
              </div>
              {selectedHubs.size > 0 && (
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <p className="text-xs text-default-600 font-medium mb-1">
                    Selected requirements:
                  </p>
                  <p className="text-xs text-default-700">
                    {Array.from(selectedHubs).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Add Custom Course
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
