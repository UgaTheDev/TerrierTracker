import React from "react";
import {
  Card,
  Button,
  Autocomplete,
  AutocompleteItem,
  Input,
} from "@heroui/react";
import { Plus } from "lucide-react";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  description?: string;
};

interface ManualCourseSearchProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  filteredCourses: Course[];
  selectedCourse: Course | null;
  handleSearchSelect: (courseId: string | null) => void;
  handleAddCourse: (course: Course) => void;
  isEnrolled: (courseId: string) => boolean;
  manualCourse: {
    courseId: string;
    course: string;
    credits: number;
    requirements: string;
    description: string;
  };
  setManualCourse: (course: any) => void;
  handleManualAdd: () => void;
}

export default function ManualCourseSearch({
  searchValue,
  setSearchValue,
  filteredCourses,
  selectedCourse,
  handleSearchSelect,
  handleAddCourse,
  isEnrolled,
  manualCourse,
  setManualCourse,
  handleManualAdd,
}: ManualCourseSearchProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Existing Courses</h3>
          <Autocomplete
            label="Search by course code or name"
            placeholder="e.g., CS 131 or Combinatoric Structures"
            value={searchValue}
            onInputChange={setSearchValue}
            onSelectionChange={handleSearchSelect}
          >
            {filteredCourses.map((course) => (
              <AutocompleteItem key={course.courseId} value={course.courseId}>
                {course.courseId} - {course.course}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          {selectedCourse && (
            <Card className="p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {selectedCourse.courseId} - {selectedCourse.course}
                </h4>
                <p className="text-sm text-default-600">
                  {selectedCourse.description}
                </p>
                <p className="text-sm">
                  <strong>Credits:</strong> {selectedCourse.credits}
                </p>
                <Button
                  color="success"
                  size="sm"
                  startContent={<Plus size={14} />}
                  onClick={() => handleAddCourse(selectedCourse)}
                  disabled={isEnrolled(selectedCourse.courseId)}
                >
                  {isEnrolled(selectedCourse.courseId)
                    ? "Already Enrolled"
                    : "Add Course"}
                </Button>
              </div>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Create Custom Course</h3>
          <Input
            label="Course ID"
            placeholder="e.g., CAS CS 131"
            value={manualCourse.courseId}
            onChange={(e) =>
              setManualCourse({
                ...manualCourse,
                courseId: e.target.value,
              })
            }
          />
          <Input
            label="Course Name"
            placeholder="e.g., Combinatoric Structures"
            value={manualCourse.course}
            onChange={(e) =>
              setManualCourse({
                ...manualCourse,
                course: e.target.value,
              })
            }
          />
          <Input
            label="Credits"
            type="number"
            placeholder="4"
            value={manualCourse.credits.toString()}
            onChange={(e) =>
              setManualCourse({
                ...manualCourse,
                credits: parseInt(e.target.value) || 4,
              })
            }
          />
          <Input
            label="Description"
            placeholder="Course description"
            value={manualCourse.description}
            onChange={(e) =>
              setManualCourse({
                ...manualCourse,
                description: e.target.value,
              })
            }
          />
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onClick={handleManualAdd}
            disabled={!manualCourse.courseId || !manualCourse.course}
          >
            Add Custom Course
          </Button>
        </div>
      </div>
    </div>
  );
}
