import React from "react";
import CourseTable from "../components/CourseTable";

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
  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-10 ml-[5%]">
        <CourseTable
          enrolledCourses={enrolledCourses}
          onAddCourse={onAddCourse}
          onNavigate={onNavigate}
          onDeleteCourse={onDeleteCourse}
          onUpdateCourse={onUpdateCourse}
        />
      </div>
    </>
  );
}
