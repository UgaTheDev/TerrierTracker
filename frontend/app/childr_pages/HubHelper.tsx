"use client";
import React from "react";
import { Search, BookmarkCheck, Bookmark } from "lucide-react";
import HelperCourseSearcher from "../components/HelperCourseSearcher";

type BookmarkedCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  hubRequirements: string[];
  school: string;
};

interface HubHelperProps {
  onBookmark: (courseId: string, courseData: any) => void;
  bookmarkedCourses: BookmarkedCourse[];
  isBookmarked: (courseId: string) => boolean;
}

export default function HubHelper({
  onBookmark,
  bookmarkedCourses,
  isBookmarked,
}: HubHelperProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Hub Helper</h1>
        <p className="text-default-600">
          Search and filter courses by department and hub requirements. Bookmark
          courses that interest you for easy reference when planning your
          schedule.
        </p>
      </div>

      <div className="bg-default-50 dark:bg-default-100/20 rounded-xl p-6 mb-8 shadow-large">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Course Search & Filter
          </h2>
        </div>

        <HelperCourseSearcher
          onBookmark={onBookmark}
          bookmarkedCourses={bookmarkedCourses}
          isBookmarked={isBookmarked}
        />
      </div>

      {bookmarkedCourses.length > 0 && (
        <div className="bg-warning-50 dark:bg-warning/10 rounded-xl p-6 shadow-small">
          <div className="flex items-center gap-2 mb-4">
            <BookmarkCheck className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            <h3 className="text-lg font-semibold text-warning-700 dark:text-warning-300">
              Bookmarked Courses ({bookmarkedCourses.length})
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-warning-700 dark:text-warning-400 text-sm">
              You have bookmarked {bookmarkedCourses.length} course
              {bookmarkedCourses.length !== 1 ? "s" : ""}. Visit the Bookmarks
              page to see how they would impact your hub requirements.
            </p>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {bookmarkedCourses.slice(0, 6).map((course) => (
                <div
                  key={course.id}
                  className="bg-warning-100 dark:bg-warning/20 rounded-lg p-3 text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-warning-800 dark:text-warning-200 truncate">
                        {course.code}
                      </p>
                      <p className="text-warning-700 dark:text-warning-300 text-xs mt-1 line-clamp-2">
                        {course.name}
                      </p>
                    </div>
                    <button
                      onClick={() => onBookmark(course.id, course)}
                      className="ml-2 p-1 rounded text-warning-600 dark:text-warning-400 hover:bg-warning-200 dark:hover:bg-warning/30 transition-colors"
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {course.hubRequirements.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {course.hubRequirements
                          .slice(0, 2)
                          .map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-warning-200 dark:bg-warning/30 text-warning-800 dark:text-warning-200 text-xs rounded"
                            >
                              {req.length > 20
                                ? `${req.substring(0, 20)}...`
                                : req}
                            </span>
                          ))}
                        {course.hubRequirements.length > 2 && (
                          <span className="px-2 py-1 bg-warning-200 dark:bg-warning/30 text-warning-800 dark:text-warning-200 text-xs rounded">
                            +{course.hubRequirements.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {bookmarkedCourses.length > 6 && (
              <p className="text-warning-600 dark:text-warning-400 text-xs">
                ...and {bookmarkedCourses.length - 6} more courses. View all in
                the Bookmarks page.
              </p>
            )}
          </div>
        </div>
      )}

      {bookmarkedCourses.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-default-100 dark:bg-default-200/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-default-400" />
          </div>
          <h3 className="text-lg font-medium text-default-700 mb-2">
            No bookmarked courses yet
          </h3>
          <p className="text-default-500 text-sm max-w-md mx-auto">
            Use the search and filtering tools above to find courses that match
            your interests, then bookmark them to see how they would impact your
            hub requirements.
          </p>
        </div>
      )}
    </div>
  );
}
