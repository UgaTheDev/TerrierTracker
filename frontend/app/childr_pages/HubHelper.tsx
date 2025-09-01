import React, { useState } from "react";
import { Search, Bookmark, BookmarkCheck, GraduationCap } from "lucide-react";
import CourseSearch from "../components/CourseSearch";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  description?: string;
  hubRequirements?: string[];
};

export default function HubHelper() {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const handleAddCourse = (course: Course) => {
    setEnrolledCourses((prev) => [...prev, course]);
    setBookmarkedCourses((prev) => [...prev, course.courseId]);
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some((course) => course.courseId === courseId);
  };

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const isBookmarked = (courseId: string) =>
    bookmarkedCourses.includes(courseId);

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-gray border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {course.courseId}
          </h3>
          <p className="text-gray-700 font-medium">{course.course}</p>
        </div>
        <button
          onClick={() => toggleBookmark(course.courseId)}
          className={`p-2 rounded-full transition-colors ${
            isBookmarked(course.courseId)
              ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
              : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
          }`}
        >
          {isBookmarked(course.courseId) ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">{course.description}</p>

      {course.hubRequirements && course.hubRequirements.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Hub Requirements:
          </p>
          <div className="flex flex-wrap gap-2">
            {course.hubRequirements.map((req, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{course.credits} credits</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Hub Helper</h1>
      <p className="text-gray-600 mb-8">
        Find courses that fulfill your hub requirements and bookmark them for
        easy reference.
      </p>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Course Search</h2>
        </div>

        <CourseSearch
          handleAddCourse={handleAddCourse}
          isEnrolled={isEnrolled}
        />
      </div>

      {enrolledCourses.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-green-800">
              Added Courses
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {bookmarkedCourses.length > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkCheck className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">
              Bookmarked Courses ({bookmarkedCourses.length})
            </h3>
          </div>
          <p className="text-yellow-700 text-sm">
            You have bookmarked {bookmarkedCourses.length} course
            {bookmarkedCourses.length !== 1 ? "s" : ""}. These will be saved for
            easy reference when planning your schedule.
          </p>
        </div>
      )}
    </div>
  );
}
