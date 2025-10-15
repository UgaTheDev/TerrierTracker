import React, { useState, useEffect } from "react";
import { Card, Button } from "@heroui/react";
import { LayoutList, Zap, ArrowRight } from "lucide-react";

interface RoadmapAnnouncementProps {
  onNavigate: (page: string) => void;
}

const STORAGE_KEY = "terriertracker-roadmap-beta-shown";

export default function RoadmapAnnouncement({
  onNavigate,
}: RoadmapAnnouncementProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsOpen(false);
  };

  const handleGoToMapper = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsOpen(false);
    onNavigate("course-mapper");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <Card className="max-w-md w-full p-6 md:p-8 space-y-5 transform transition-all duration-300 scale-100 bg-white dark:bg-gray-900 border-t-4 border-indigo-600 shadow-2xl">
        <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
          <Zap className="w-7 h-7 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
            Course Roadmap: Now in Beta!
          </h2>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We've launched the Course Roadmap, a visual tool to plan your academic
          future semester by semester.
        </p>

        <p className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
          <LayoutList className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <span>Find it in the sidebar under "Courses"!</span>
        </p>
        <div className="bg-indigo-50 dark:bg-gray-800 p-4 rounded-lg border border-indigo-200 dark:border-gray-700">
          <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
            Optimizations Coming Soon!
          </p>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
            We're actively developing enhancements, including export
            functionality.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row-reverse justify-start gap-3 pt-2">
          <Button
            color="primary"
            onClick={handleGoToMapper}
            className="w-full sm:w-auto text-sm"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Go to Course Mapper
          </Button>

          <Button
            variant="flat"
            color="default"
            onClick={handleClose}
            className="w-full sm:w-auto text-sm"
          >
            Got It!
          </Button>
        </div>
      </Card>
    </div>
  );
}
