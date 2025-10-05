import React, { useState } from "react";
import { Button } from "@heroui/react";
import CourseTable from "../components/CourseTable";
import { Trash2, Plus } from "lucide-react";
import type { CustomCourseArray } from "../components/AddCustomCourseModal";

export type EditedCourseArray = [string, string, string, number];

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  semester?: string;
  professor?: string;
  description?: string;
  hubRequirements?: string[];
};

interface YourCoursesProps {
  enrolledCourses: Course[];
  customCourses: CustomCourseArray[];
  editedCourses: EditedCourseArray[];
  onAddCourse: (course: Course) => void;
  onNavigate: (page: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onDeleteCustomCourse: (courseId: string) => void;
  onUpdateCourse: (course: Course) => void;
  onRevertEdit: (courseId: string) => void;
  onOpenCustomCourseModal: () => void;
}

export default function YourCourses({
  enrolledCourses,
  customCourses,
  editedCourses,
  onAddCourse,
  onNavigate,
  onDeleteCourse,
  onDeleteCustomCourse,
  onUpdateCourse,
  onRevertEdit,
  onOpenCustomCourseModal,
}: YourCoursesProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteAll = () => {
    enrolledCourses.forEach((course) => {
      onDeleteCourse(course.courseId);
    });
    customCourses.forEach((course) => {
      onDeleteCustomCourse(course[0]);
    });
    setShowConfirmDialog(false);
  };

  const totalCourses = enrolledCourses.length + customCourses.length;

  return (
    <>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-10 lg:ml-[5%]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Your Courses</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              color="primary"
              startContent={<Plus size={18} />}
              onPress={onOpenCustomCourseModal}
              className="w-full sm:w-auto"
            >
              Add Custom Course
            </Button>
            {totalCourses > 0 && (
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="w-full sm:w-auto px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors inline-flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 size={18} />
                Delete All Courses
              </button>
            )}
          </div>
        </div>

        {totalCourses === 0 ? (
          <div className="text-center py-16">
            <p className="text-default-500 mb-4">
              You haven't added any courses yet.
            </p>
            <div className="flex gap-3 justify-center">
              <Button color="primary" onPress={() => onNavigate("add-courses")}>
                Browse Courses
              </Button>
              <Button
                color="secondary"
                variant="flat"
                startContent={<Plus size={18} />}
                onPress={onOpenCustomCourseModal}
              >
                Add Custom Course
              </Button>
            </div>
          </div>
        ) : (
          <CourseTable
            enrolledCourses={enrolledCourses}
            customCourses={customCourses}
            editedCourses={editedCourses}
            onAddCourse={onAddCourse}
            onNavigate={onNavigate}
            onDeleteCourse={onDeleteCourse}
            onDeleteCustomCourse={onDeleteCustomCourse}
            onUpdateCourse={onUpdateCourse}
            onRevertEdit={onRevertEdit}
          />
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Delete All Courses?
            </h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to delete all {totalCourses} courses (
              {enrolledCourses.length} enrolled, {customCourses.length} custom)?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-default-100 dark:bg-default-200/20 text-default-700 rounded-lg hover:bg-default-200 dark:hover:bg-default-200/30 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
