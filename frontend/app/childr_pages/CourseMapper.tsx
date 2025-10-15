"use client";
import React, { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import type { CustomCourseArray } from "../components/AddCustomCourseModal";
import type { Course } from "../../types/roadmap";
import TransferCreditsSection from "../components/roadmap/TransferCreditsSection";
import RoadmapSettingsModal from "../components/roadmap/RoadmapSettingsModal";
import RoadmapExportView from "../components/roadmap/RoadmapExportView";
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
  groupSemestersByAcademicYear,
  getAcademicYearLabel,
  getSemesterLabel,
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
    try {
      const saved = localStorage.getItem("terriertracker-roadmap");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          transferCredits: parsed.transferCredits || [],
          config: {
            ...parsed.config,
            showYears: parsed.config.showYears ?? false,
          },
        };
      }
    } catch (error) {
      console.error("Error parsing saved roadmap from localStorage:", error);

      localStorage.removeItem("terriertracker-roadmap");
    }

    return generateDefaultRoadmap({
      totalYears: 4,
      includesSummer: false,
      startYear: new Date().getFullYear(),
      startSemester: "fall",
      showYears: false,
    });
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportView, setShowExportView] = useState(false);

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

  const handleSaveSettings = (newConfig: RoadmapConfig) => {
    setRoadmap((prev) => {
      const newRoadmap = generateDefaultRoadmap(newConfig);

      const updated = {
        ...newRoadmap,
        transferCredits: prev.transferCredits,
        lastModified: new Date(),
      };

      localStorage.setItem("terriertracker-roadmap", JSON.stringify(updated));
      return updated;
    });
  };
  const handleExport = () => {
    setShowExportView(true);

    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleCloseExport = () => {
    setShowExportView(false);
  };

  const generateRoadmapText = (roadmap: Roadmap): string => {
    let text = "MY ACADEMIC ROADMAP\n";
    text += "=" + "=".repeat(50) + "\n\n";

    if (roadmap.transferCredits.length > 0) {
      text += "TRANSFER CREDITS (AP/IB/Other)\n";
      text += "-".repeat(50) + "\n";
      roadmap.transferCredits.forEach((course) => {
        text += `${course.courseId} - ${course.course} (${course.credits} cr)`;
        if (course.transferSource) {
          text += ` [${course.transferSource}]`;
        }
        text += "\n";
      });
      text += `Total Transfer Credits: ${roadmap.transferCredits.reduce((sum, c) => sum + c.credits, 0)}\n\n`;
    }

    const grouped = groupSemestersByAcademicYear(
      roadmap.semesters,
      roadmap.config.startSemester
    );

    Object.entries(grouped).forEach(([yearNum, semesters]) => {
      const academicYearLabel = getAcademicYearLabel(
        semesters,
        roadmap.config.showYears
      );

      text += `YEAR ${yearNum}`;
      if (academicYearLabel) {
        text += ` (${academicYearLabel})`;
      }
      text += "\n" + "=".repeat(50) + "\n\n";

      semesters.forEach((semester) => {
        text += `${getSemesterLabel(semester, roadmap.config.showYears)}\n`;
        text += "-".repeat(30) + "\n";

        if (semester.courses.length === 0) {
          text += "  No courses planned\n";
        } else {
          semester.courses.forEach((course) => {
            text += `  ${course.courseId} - ${course.course} (${course.credits} cr)\n`;
          });
          text += `  Semester Total: ${semester.totalCredits} credits\n`;
        }
        text += "\n";
      });
    });

    const totalPlannedCredits = roadmap.semesters.reduce(
      (sum, sem) => sum + sem.totalCredits,
      0
    );
    const totalCredits =
      totalPlannedCredits +
      roadmap.transferCredits.reduce((sum, c) => sum + c.credits, 0);

    text += "SUMMARY\n";
    text += "=".repeat(50) + "\n";
    text += `Transfer Credits: ${roadmap.transferCredits.reduce((sum, c) => sum + c.credits, 0)}\n`;
    text += `Planned Credits: ${totalPlannedCredits}\n`;
    text += `Total Credits: ${totalCredits}\n`;

    return text;
  };

  const semestersByAcademicYear = useMemo(() => {
    return groupSemestersByAcademicYear(
      roadmap.semesters,
      roadmap.config.startSemester
    );
  }, [roadmap.semesters, roadmap.config.startSemester]);

  // In your CourseMapper return statement:
  return (
    <div className="min-h-screen bg-background">
      {/* Main UI - hidden when printing in export mode */}
      <div className={showExportView ? "hidden print:hidden" : "block"}>
        {/* Header */}
        <div className="border-b bg-content1 sticky top-0 z-10">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="light"
                  startContent={<ArrowLeft size={16} />}
                  onClick={() => onNavigate("your-courses")}
                  className="min-w-fit"
                >
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold">My Roadmap</h1>
                  <p className="text-xs md:text-sm text-default-500">
                    Plan your courses across {roadmap.config.totalYears} years
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Download size={16} />}
                  onClick={handleExport}
                  className="flex-1 sm:flex-none"
                >
                  <span className="sm:inline">Export</span>
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Settings size={16} />}
                  onClick={() => setShowSettings(true)}
                  className="flex-1 sm:flex-none"
                >
                  <span className="sm:inline">Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* Sidebar - Collapsible on mobile */}
              <div className="lg:col-span-3">
                <RoadmapSidebar
                  roadmap={roadmap}
                  availableCourses={availableCourses}
                  userInfo={userInfo}
                />
              </div>

              {/* Main content */}
              <div className="lg:col-span-9">
                <TransferCreditsSection
                  transferCredits={roadmap.transferCredits}
                  onRemoveTransferCredit={handleRemoveTransferCredit}
                />
                <div className="space-y-4 md:space-y-8">
                  {Object.entries(semestersByAcademicYear).map(
                    ([yearNum, semesters]) => {
                      const academicYearLabel = getAcademicYearLabel(
                        semesters,
                        roadmap.config.showYears
                      );

                      return (
                        <Card key={yearNum} className="p-4 md:p-6">
                          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                            Year {yearNum}
                            {academicYearLabel && (
                              <span className="text-sm md:text-base font-normal text-default-500 ml-2">
                                ({academicYearLabel})
                              </span>
                            )}
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {semesters.map((semester) => (
                              <SemesterColumn
                                key={semester.id}
                                semester={semester}
                                onRemoveCourse={handleRemoveCourse}
                                showYear={roadmap.config.showYears}
                              />
                            ))}
                          </div>
                        </Card>
                      );
                    }
                  )}

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

      {/* Settings Modal */}
      <RoadmapSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={roadmap.config}
        onSave={handleSaveSettings}
      />

      {/* Export View - Always in DOM but conditionally shown */}
      <div className={showExportView ? "block" : "hidden"}>
        <RoadmapExportView roadmap={roadmap} userInfo={userInfo} />
      </div>
    </div>
  );
}
