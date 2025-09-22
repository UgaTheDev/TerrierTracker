"use client";
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
    <div className="bg-content1 rounded-lg p-4 shadow-medium hover:shadow-large transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {course.courseId}
          </h3>
          <p className="text-default-700 font-medium">{course.course}</p>
        </div>
        <button
          onClick={() => toggleBookmark(course.courseId)}
          className={`p-2 rounded-full transition-colors ${
            isBookmarked(course.courseId)
              ? "text-warning bg-warning-50 dark:bg-warning/20 hover:bg-warning-100 dark:hover:bg-warning/30"
              : "text-default-400 hover:text-warning hover:bg-warning-50 dark:hover:bg-warning/20"
          }`}
        >
          {isBookmarked(course.courseId) ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-sm text-default-600 mb-3">{course.description}</p>

      {course.hubRequirements && course.hubRequirements.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-default-700 mb-2">
            Hub Requirements:
          </p>
          <div className="flex flex-wrap gap-2">
            {course.hubRequirements.map((req, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 dark:bg-primary/20 text-primary text-xs rounded-full"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-default-500">
        <span>{course.credits} credits</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-foreground">Hub Helper</h1>
      <p className="text-default-600 mb-8">
        Find courses that fulfill your hub requirements and bookmark them for
        easy reference.
      </p>

      <div className="bg-default-50 dark:bg-default-100/20 rounded-xl p-6 mb-8 shadow-large">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Course Search
          </h2>
        </div>

        <CourseSearch
          handleAddCourse={handleAddCourse}
          isEnrolled={isEnrolled}
        />
      </div>

      {enrolledCourses.length > 0 && (
        <div className="bg-success-50 dark:bg-success/10 rounded-xl p-6 mb-8 shadow-small">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-success" />
            <h2 className="text-xl font-semibold text-success-700 dark:text-success-300">
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
        <div className="mt-8 bg-warning-50 dark:bg-warning/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkCheck className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            <h3 className="text-lg font-semibold text-warning-700 dark:text-warning-300">
              Bookmarked Courses ({bookmarkedCourses.length})
            </h3>
          </div>
          <p className="text-warning-700 dark:text-warning-400 text-sm">
            You have bookmarked {bookmarkedCourses.length} course
            {bookmarkedCourses.length !== 1 ? "s" : ""}. These will be saved for
            easy reference when planning your schedule.
          </p>
        </div>
      )}
    </div>
  );
}
