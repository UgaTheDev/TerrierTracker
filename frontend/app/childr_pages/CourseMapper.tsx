"use client";
import React, { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import type { CustomCourseArray } from "../components/AddCustomCourseModal";
import type { Course } from "../../types/roadmap";
import TransferCreditsSection from "../components/roadmap/TransferCreditsSection";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { ArrowLeft, Settings, Download, Plus } from "lucide-react";
import {
  Roadmap,
  PlannedCourse,
  Semester,
  RoadmapConfig,
} from "../../types/roadmap";
import {
  generateDefaultRoadmap,
  calculateSemesterCredits,
} from "../utils/roadmapUtils";
import SemesterColumn from "../components/roadmap/SemesterColumn";
import CourseCard from "../components/roadmap/CourseCard";
import RoadmapSidebar from "../components/roadmap/RoadmapSidebar";

interface CourseMapperProps {
  enrolledCourses: Course[];
  customCourses: CustomCourseArray[];
  onNavigate: (page: string) => void;
  userId?: number;
  userInfo?: {
    name?: string;
    major?: string;
    minor?: string;
  };
}

export default function CourseMapper({
  enrolledCourses,
  onNavigate,
  userInfo = {},
}: CourseMapperProps) {
  const [roadmap, setRoadmap] = useState<Roadmap>(() => {
    const saved = localStorage.getItem("terriertracker-roadmap");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        transferCredits: parsed.transferCredits || [],
      };
    }

    return generateDefaultRoadmap({
      totalYears: 4,
      includesSummer: false,
      startYear: new Date().getFullYear(),
      startSemester: "fall",
    });
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const availableCourses: PlannedCourse[] = useMemo(() => {
    return enrolledCourses.map((course) => ({
      ...course,
      status: "planned" as const,
      semesterId: "",
    }));
  }, [enrolledCourses]);

  const activeCourse = useMemo(() => {
    if (!activeId) return null;

    const fromAvailable = availableCourses.find((c) => c.courseId === activeId);
    if (fromAvailable) return fromAvailable;

    for (const semester of roadmap.semesters) {
      const course = semester.courses.find((c) => c.courseId === activeId);
      if (course) return course;
    }

    const fromTransfer = roadmap.transferCredits.find(
      (c) => c.courseId === activeId
    );
    if (fromTransfer) return fromTransfer;

    return null;
  }, [activeId, availableCourses, roadmap.semesters, roadmap.transferCredits]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const courseId = active.id as string;
    const targetId = over.id as string;
    let course: PlannedCourse | null = null;
    let sourceSemesterId: string | null = null;
    course = availableCourses.find((c) => c.courseId === courseId) || null;

    if (!course) {
      for (const semester of roadmap.semesters) {
        const found = semester.courses.find((c) => c.courseId === courseId);
        if (found) {
          course = found;
          sourceSemesterId = semester.id;
          break;
        }
      }
    }

    if (!course) {
      const found = roadmap.transferCredits.find(
        (c) => c.courseId === courseId
      );
      if (found) {
        course = found;
        sourceSemesterId = "transfer-credits";
      }
    }

    if (!course) {
      setActiveId(null);
      return;
    }

    if (targetId === "transfer-credits") {
      setRoadmap((prev) => {
        let newSemesters = prev.semesters;
        let newTransferCredits = prev.transferCredits;

        if (sourceSemesterId && sourceSemesterId !== "transfer-credits") {
          newSemesters = prev.semesters.map((semester) => {
            if (semester.id === sourceSemesterId) {
              return {
                ...semester,
                courses: semester.courses.filter(
                  (c) => c.courseId !== courseId
                ),
                totalCredits: calculateSemesterCredits(
                  semester.courses.filter((c) => c.courseId !== courseId)
                ),
              };
            }
            return semester;
          });
        }

        if (sourceSemesterId !== "transfer-credits") {
          if (!newTransferCredits.some((c) => c.courseId === courseId)) {
            newTransferCredits = [
              ...prev.transferCredits,
              {
                ...course!,
                semesterId: "transfer-credits",
                isTransfer: true,
                status: "completed" as const,
              },
            ];
          }
        }

        const updated = {
          ...prev,
          semesters: newSemesters,
          transferCredits: newTransferCredits,
          lastModified: new Date(),
        };

        localStorage.setItem("terriertracker-roadmap", JSON.stringify(updated));
        return updated;
      });

      setActiveId(null);
      return;
    }

    setRoadmap((prev) => {
      let newSemesters = prev.semesters.map((semester) => {
        if (semester.id === sourceSemesterId) {
          return {
            ...semester,
            courses: semester.courses.filter((c) => c.courseId !== courseId),
            totalCredits: calculateSemesterCredits(
              semester.courses.filter((c) => c.courseId !== courseId)
            ),
          };
        }
        return semester;
      });

      let newTransferCredits = prev.transferCredits;
      if (sourceSemesterId === "transfer-credits") {
        newTransferCredits = prev.transferCredits.filter(
          (c) => c.courseId !== courseId
        );
      }

      newSemesters = newSemesters.map((semester) => {
        if (semester.id === targetId) {
          if (!semester.courses.some((c) => c.courseId === courseId)) {
            const courseToAdd = {
              ...course!,
              semesterId: targetId,
              isTransfer: false,
            };
            const newCourses = [...semester.courses, courseToAdd];
            return {
              ...semester,
              courses: newCourses,
              totalCredits: calculateSemesterCredits(newCourses),
            };
          }
        }
        return semester;
      });

      const updated = {
        ...prev,
        semesters: newSemesters,
        transferCredits: newTransferCredits,
        lastModified: new Date(),
      };

      localStorage.setItem("terriertracker-roadmap", JSON.stringify(updated));
      return updated;
    });

    setActiveId(null);
  };

  const handleRemoveTransferCredit = (courseId: string) => {
    setRoadmap((prev) => {
      const updated = {
        ...prev,
        transferCredits: prev.transferCredits.filter(
          (c) => c.courseId !== courseId
        ),
        lastModified: new Date(),
      };
      localStorage.setItem("terriertracker-roadmap", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    setRoadmap((prev) => {
      const newSemesters = prev.semesters.map((semester) => {
        if (semester.id === semesterId) {
          const newCourses = semester.courses.filter(
            (c) => c.courseId !== courseId
          );
          return {
            ...semester,
            courses: newCourses,
            totalCredits: calculateSemesterCredits(newCourses),
          };
        }
        return semester;
      });

      const updated = {
        ...prev,
        semesters: newSemesters,
        lastModified: new Date(),
      };

      localStorage.setItem("terriertracker-roadmap", JSON.stringify(updated));

      return updated;
    });
  };

  const handleAddSemester = () => {
    setRoadmap((prev) => {
      const lastSemester = prev.semesters[prev.semesters.length - 1];
      let nextTerm: "fall" | "spring" | "summer";
      let nextYear = lastSemester.year;

      if (prev.config.includesSummer) {
        if (lastSemester.term === "fall") nextTerm = "spring";
        else if (lastSemester.term === "spring") nextTerm = "summer";
        else {
          nextTerm = "fall";
          nextYear++;
        }
      } else {
        if (lastSemester.term === "fall") {
          nextTerm = "spring";
        } else {
          nextTerm = "fall";
          nextYear++;
        }
      }

      const newSemester: Semester = {
        id: `${nextYear}-${nextTerm}`,
        term: nextTerm,
        year: nextYear,
        courses: [],
        totalCredits: 0,
      };

      return {
        ...prev,
        semesters: [...prev.semesters, newSemester],
      };
    });
  };

  const semestersByYear = useMemo(() => {
    const grouped: { [year: number]: Semester[] } = {};
    roadmap.semesters.forEach((semester) => {
      if (!grouped[semester.year]) {
        grouped[semester.year] = [];
      }
      grouped[semester.year].push(semester);
    });
    return grouped;
  }, [roadmap.semesters]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-content1 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="light"
                startContent={<ArrowLeft size={16} />}
                onClick={() => onNavigate("your-courses")}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">My Roadmap</h1>
                <p className="text-sm text-default-500">
                  Plan your courses across {roadmap.config.totalYears} years
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                startContent={<Download size={16} />}
              >
                Export
              </Button>
              <Button
                size="sm"
                variant="flat"
                startContent={<Settings size={16} />}
                onClick={() => setShowSettings(true)}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <RoadmapSidebar
                roadmap={roadmap}
                availableCourses={availableCourses}
                userInfo={userInfo}
              />
            </div>
            <div className="col-span-12 lg:col-span-9">
              <TransferCreditsSection
                transferCredits={roadmap.transferCredits}
                onRemoveTransferCredit={handleRemoveTransferCredit}
              />
              <div className="space-y-8">
                {Object.entries(semestersByYear).map(([year, semesters]) => (
                  <Card key={year} className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                      Year {parseInt(year) - roadmap.config.startYear + 1} (
                      {year})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {semesters.map((semester) => (
                        <SemesterColumn
                          key={semester.id}
                          semester={semester}
                          onRemoveCourse={handleRemoveCourse}
                        />
                      ))}
                    </div>
                  </Card>
                ))}

                <Button
                  variant="bordered"
                  startContent={<Plus size={16} />}
                  onClick={handleAddSemester}
                  className="w-full"
                >
                  Add Another Semester
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeCourse ? (
            <div className="opacity-50">
              <CourseCard course={activeCourse} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
