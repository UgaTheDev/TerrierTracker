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
      name: getSemesterLabel(
        {
          id: `${currentYear}-${currentTerm}`,
          term: currentTerm,
          year: currentYear,
          name: "",
          courses: [],
          totalCredits: 0,
        },
        config.showYears
      ),
      courses: [],
      totalCredits: 0,
    });

    if (config.includesSummer) {
      if (currentTerm === "fall") {
        currentTerm = "spring";
      } else if (currentTerm === "spring") {
        currentTerm = "summer";
      } else {
        currentTerm = "fall";
        currentYear++;
      }
    } else {
      if (currentTerm === "fall") {
        currentTerm = "spring";
      } else {
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

export function getSemesterLabel(
  semester: Semester,
  showYear: boolean = true
): string {
  const term = semester.term.charAt(0).toUpperCase() + semester.term.slice(1);
  return showYear ? `${term} ${semester.year}` : term;
}

export function getAcademicYearLabel(
  semesters: Semester[],
  showYears: boolean
): string {
  if (!showYears || semesters.length === 0) return "";

  const years = Array.from(new Set(semesters.map((s) => s.year))).sort();
  if (years.length === 1) return years[0].toString();
  return `${years[0]}-${years[years.length - 1]}`;
}

export function groupSemestersByAcademicYear(
  semesters: Semester[],
  startSemester: "fall" | "spring"
): { [academicYear: number]: Semester[] } {
  const grouped: { [academicYear: number]: Semester[] } = {};
  let academicYearCounter = 1;

  semesters.forEach((semester, index) => {
    if (index > 0) {
      if (semester.term === startSemester) {
        academicYearCounter++;
      }
    }

    if (!grouped[academicYearCounter]) {
      grouped[academicYearCounter] = [];
    }
    grouped[academicYearCounter].push(semester);
  });

  return grouped;
}

export function getYearLabel(year: number, startYear: number): string {
  const yearNumber = year - startYear + 1;
  return `Year ${yearNumber}`;
}
