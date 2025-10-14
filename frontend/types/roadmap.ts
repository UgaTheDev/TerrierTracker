"use client";
export type Course = {
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

export type PlannedCourse = Course & {
  status: "completed" | "in-progress" | "planned";
  grade?: string;
  semesterId: string;
  warnings?: ValidationWarning[];
};

export type ValidationWarning = {
  type: "error" | "warning" | "info";
  message: string;
  details?: string;
};

export type Semester = {
  id: string;
  term: "fall" | "spring" | "summer";
  year: number;
  courses: PlannedCourse[];
  totalCredits: number;
};

export type RoadmapConfig = {
  totalYears: number;
  includesSummer: boolean;
  startYear: number;
  startSemester: "fall" | "spring";
};

export type Roadmap = {
  userId?: string;
  config: RoadmapConfig;
  semesters: Semester[];
  lastModified: Date;
};
