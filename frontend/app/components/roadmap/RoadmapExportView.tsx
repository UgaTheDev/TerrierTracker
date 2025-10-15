"use client";
import React from "react";
import { Roadmap, PlannedCourse, Semester } from "../../../types/roadmap";
import {
  groupSemestersByAcademicYear,
  getAcademicYearLabel,
  getSemesterLabel,
} from "../../utils/roadmapUtils";
import { GraduationCap } from "lucide-react";

interface RoadmapExportViewProps {
  roadmap: Roadmap;
  userInfo?: {
    name?: string;
    major?: string;
    minor?: string;
  };
}

export default function RoadmapExportView({
  roadmap,
  userInfo = {},
}: RoadmapExportViewProps) {
  const semestersByAcademicYear = groupSemestersByAcademicYear(
    roadmap.semesters,
    roadmap.config.startSemester
  );

  const totalPlannedCredits = roadmap.semesters.reduce(
    (sum, sem) => sum + sem.totalCredits,
    0
  );
  const totalTransferCredits = roadmap.transferCredits.reduce(
    (sum, c) => sum + c.credits,
    0
  );
  const totalCredits = totalPlannedCredits + totalTransferCredits;

  const academicYears = Object.entries(semestersByAcademicYear);

  return (
    <div className="bg-white print:min-h-auto">
      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-blue-600 pb-6 print:break-after-avoid">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCwX8PlKDGl3Zz5YsKZ3TL6ROXuebh89ZLm-Qa9q1zEchvK9BY5T6ppKEZCKLqcJD7gno&usqp=CAU"
            alt="BU Logo"
            className="w-16 h-16"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              My Academic Roadmap
            </h1>
            <p className="text-lg text-gray-700 mt-1 print:text-gray-800">
              {roadmap.config.totalYears}-Year Plan
            </p>
          </div>
        </div>

        {/* Student Info */}
        {(userInfo.name || userInfo.major || userInfo.minor) && (
          <div className="flex justify-center gap-6 text-sm text-gray-700 print:text-gray-800">
            {userInfo.name && (
              <div>
                <span className="font-semibold">Student:</span> {userInfo.name}
              </div>
            )}
            {userInfo.major && (
              <div>
                <span className="font-semibold">Major:</span> {userInfo.major}
              </div>
            )}
            {userInfo.minor && (
              <div>
                <span className="font-semibold">Minor:</span> {userInfo.minor}
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700 print:text-blue-900">
              {totalCredits}
            </div>
            <div className="text-xs text-gray-700 print:text-gray-800">
              Total Credits
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700 print:text-green-900">
              {totalTransferCredits}
            </div>
            <div className="text-xs text-gray-700 print:text-gray-800">
              Transfer Credits
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700 print:text-purple-900">
              {totalPlannedCredits}
            </div>
            <div className="text-xs text-gray-700 print:text-gray-800">
              Planned Credits
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Credits Section */}
      {roadmap.transferCredits.length > 0 && (
        <div className="mb-8 print:break-inside-avoid">
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 print:bg-green-50 print:border-green-400">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap
                size={28}
                className="text-green-700 print:text-green-900"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Transfer Credits (AP/IB/Other)
                </h2>
                <p className="text-sm text-gray-700 print:text-gray-800">
                  {roadmap.transferCredits.length} courses •{" "}
                  {totalTransferCredits} credits
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {roadmap.transferCredits.map((credit) => (
                <div
                  key={credit.courseId}
                  className="bg-white border-2 border-green-200 rounded-lg p-3 print:border-green-300 print:break-inside-avoid"
                >
                  <div className="font-mono text-sm font-bold text-gray-900">
                    {credit.courseId}
                  </div>
                  <div className="text-xs text-gray-700 mt-1 line-clamp-2 print:text-gray-800">
                    {credit.course}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-semibold text-green-700 print:text-green-900">
                      {credit.credits} credits
                    </span>
                    {credit.transferSource && (
                      <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded print:bg-green-200 print:text-green-900">
                        {credit.transferSource}
                      </span>
                    )}
                  </div>
                  {credit.hubRequirements &&
                    credit.hubRequirements.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {credit.hubRequirements.slice(0, 2).map((hub, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded print:bg-blue-200 print:text-blue-900"
                          >
                            {hub}
                          </span>
                        ))}
                        {credit.hubRequirements.length > 2 && (
                          <span className="text-[9px] bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded print:bg-gray-300 print:text-gray-900">
                            +{credit.hubRequirements.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Academic Years */}
      <div className="space-y-8">
        {academicYears.map(([yearNum, semesters], index) => {
          const academicYearLabel = getAcademicYearLabel(
            semesters,
            roadmap.config.showYears
          );
          const yearCredits = semesters.reduce(
            (sum, sem) => sum + sem.totalCredits,
            0
          );

          return (
            <div
              key={yearNum}
              className={`academic-year border-2 border-gray-300 rounded-xl overflow-hidden print:border-gray-400 print:break-before-auto ${
                index > 0 ? "print:break-before-page" : ""
              }`}
            >
              {/* Year Header */}
              <div className="bg-blue-600 text-white p-4 print:bg-blue-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Year {yearNum}
                      {academicYearLabel && (
                        <span className="text-lg font-normal ml-2 opacity-95">
                          ({academicYearLabel})
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{yearCredits}</div>
                    <div className="text-sm opacity-95">credits</div>
                  </div>
                </div>
              </div>

              {/* Semesters Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 print:bg-gray-100">
                {semesters.map((semester) => (
                  <div key={semester.id} className="print:break-inside-avoid">
                    <SemesterCard
                      semester={semester}
                      showYear={roadmap.config.showYears}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-700 print:text-gray-800 print:break-before-avoid">
        <p>Generated by Terrier Tracker</p>
        <p className="text-xs mt-1">
          Printed on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// Semester Card Component
function SemesterCard({
  semester,
  showYear,
}: {
  semester: Semester;
  showYear: boolean;
}) {
  const getCreditColor = (credits: number) => {
    if (credits === 0)
      return "bg-gray-200 text-gray-800 print:bg-gray-300 print:text-gray-900";
    if (credits < 12)
      return "bg-yellow-200 text-yellow-800 print:bg-yellow-300 print:text-yellow-900";
    if (credits <= 18)
      return "bg-green-200 text-green-800 print:bg-green-300 print:text-green-900";
    return "bg-red-200 text-red-800 print:bg-red-300 print:text-red-900";
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 print:border-gray-400 h-full">
      {/* Semester Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300">
        <h3 className="font-bold text-gray-900">
          {getSemesterLabel(semester, showYear)}
        </h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${getCreditColor(semester.totalCredits)}`}
        >
          {semester.totalCredits} cr
        </span>
      </div>

      {/* Courses */}
      <div className="space-y-2">
        {semester.courses.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded print:text-gray-600 print:border-gray-400">
            No courses planned
          </div>
        ) : (
          semester.courses.map((course) => (
            <CourseCardExport key={course.courseId} course={course} />
          ))
        )}
      </div>
    </div>
  );
}

// Course Card for Export
function CourseCardExport({ course }: { course: PlannedCourse }) {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded p-2.5 print:bg-gray-100 print:border-gray-400">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs font-bold text-gray-900">
            {course.courseId}
          </div>
          <div className="text-[11px] text-gray-700 mt-0.5 line-clamp-2 print:text-gray-800">
            {course.course}
          </div>
          {course.hubRequirements && course.hubRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {course.hubRequirements.slice(0, 3).map((hub, idx) => (
                <span
                  key={idx}
                  className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded print:bg-blue-200 print:text-blue-900"
                >
                  {hub}
                </span>
              ))}
              {course.hubRequirements.length > 3 && (
                <span className="text-[9px] bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded print:bg-gray-300 print:text-gray-900">
                  +{course.hubRequirements.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-blue-700 flex-shrink-0 print:text-blue-900">
          {course.credits}cr
        </span>
      </div>
    </div>
  );
}
