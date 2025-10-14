"use client";
import {
  Semester,
  Roadmap,
  RoadmapConfig,
  PlannedCourse,
  ValidationWarning,
} from "../../types/roadmap";

export function generateDefaultRoadmap(config: RoadmapConfig): Roadmap {
  const semesters: Semester[] = [];
  let currentYear = config.startYear;
  let currentTerm: "fall" | "spring" | "summer" = config.startSemester;
  const semestersPerYear = config.includesSummer ? 3 : 2;
  const totalSemesters = config.totalYears * semestersPerYear;

  for (let i = 0; i < totalSemesters; i++) {
    semesters.push({
      id: `${currentYear}-${currentTerm}`,
      term: currentTerm,
      year: currentYear,
      courses: [],
      totalCredits: 0,
    });

    if (config.includesSummer) {
      if (currentTerm === "fall") currentTerm = "spring";
      else if (currentTerm === "spring") currentTerm = "summer";
      else {
        currentTerm = "fall";
        currentYear++;
      }
    } else {
      if (currentTerm === "fall") currentTerm = "spring";
      else {
        currentTerm = "fall";
        currentYear++;
      }
    }
  }

  return {
    config,
    semesters,
    transferCredits: [],
    lastModified: new Date(),
  };
}

export function calculateSemesterCredits(courses: PlannedCourse[]): number {
  return courses.reduce((sum, course) => sum + course.credits, 0);
}

export function validateCoursePlacement(
  course: PlannedCourse,
  targetSemester: Semester,
  allSemesters: Semester[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const newTotal = targetSemester.totalCredits + course.credits;
  if (newTotal > 20) {
    warnings.push({
      type: "warning",
      message: "Credit overload",
      details: `Total credits would be ${newTotal}.`,
    });
  }
  return warnings;
}

export function getSemesterLabel(semester: Semester): string {
  const term = semester.term.charAt(0).toUpperCase() + semester.term.slice(1);
  return `${term} ${semester.year}`;
}

export function getYearLabel(year: number, startYear: number): string {
  const yearNumber = year - startYear + 1;
  return `Year ${yearNumber}`;
}
