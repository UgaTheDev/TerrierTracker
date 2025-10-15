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
  isTransfer?: boolean;
  transferSource?: string;
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
  name: string;
};

export type RoadmapConfig = {
  totalYears: number;
  includesSummer: boolean;
  startYear: number;
  startSemester: "fall" | "spring";
  showYears: boolean;
};

export type Roadmap = {
  userId?: number;
  config: RoadmapConfig;
  semesters: Semester[];
  transferCredits: PlannedCourse[];
  lastModified: Date;
};
