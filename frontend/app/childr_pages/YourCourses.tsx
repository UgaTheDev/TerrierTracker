import React, { useState } from "react";
import CourseTable from "../components/CourseTable";
import { Trash2 } from "lucide-react";

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
  onAddCourse: (course: Course) => void;
  onNavigate: (page: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onUpdateCourse: (course: Course) => void;
}

export default function YourCourses({
  enrolledCourses,
  onAddCourse,
  onNavigate,
  onDeleteCourse,
  onUpdateCourse,
}: YourCoursesProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteAll = () => {
    enrolledCourses.forEach((course) => {
      onDeleteCourse(course.courseId);
    });
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-10 ml-[5%]">
        {enrolledCourses.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors inline-flex items-center gap-2 font-medium"
            >
              <Trash2 size={18} />
              Delete All Courses
            </button>
          </div>
        )}

        <CourseTable
          enrolledCourses={enrolledCourses}
          onAddCourse={onAddCourse}
          onNavigate={onNavigate}
          onDeleteCourse={onDeleteCourse}
          onUpdateCourse={onUpdateCourse}
        />
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Delete All Courses?
            </h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to delete all {enrolledCourses.length}{" "}
              courses? This action cannot be undone.
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
