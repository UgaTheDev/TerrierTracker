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
};

interface YourCoursesProps {
  enrolledCourses: Course[];
  onAddCourse: (course: Course) => void;
  onNavigate: (page: string) => void;
}

export default function YourCourses({
  enrolledCourses,
  onAddCourse,
  onNavigate,
}: YourCoursesProps) {
  return (
    <>
      <div className="flex flex-col gap-6 p-6 md:p-10 ml-[5%]">
        <CourseTable
          enrolledCourses={enrolledCourses}
          onAddCourse={onAddCourse}
          onNavigate={onNavigate}
        />
      </div>
    </>
  );
}
