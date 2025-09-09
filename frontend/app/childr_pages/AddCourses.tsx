import type { SVGProps } from "react";
import React from "react";
import { Card, Button, Tabs, Tab } from "@heroui/react";
import { ArrowLeft, Search, Upload, FileText } from "lucide-react";
import CourseSearch from "../components/CourseSearch";
import CourseBrowseTable from "../components/CourseBrowseTable";
import PdfUploadTab from "../components/ImportPDF";
import AddCourseModal from "../components/AddCourseModal";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const AddIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M10 4.16667V15.8333M4.16667 10H15.8333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
};

type Course = {
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

type BookmarkedCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  hubRequirements: string[];
  school: string;
};

interface AddCoursesProps {
  enrolledCourses?: Course[];
  bookmarkedCourses?: BookmarkedCourse[];
  onAddCourse?: (course: Course) => void;
  onBookmarkCourse?: (course: Course) => void;
  onNavigate: (page: string) => void;
  isBookmarked?: (courseId: string) => boolean;
  handleBookmark?: (bookmarkedCourse: BookmarkedCourse) => void;
  pdfFile?: File | null;
  pdfProcessing?: boolean;
  handlePdfUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pdfError?: string | null;
}

export default function AddCourses({
  enrolledCourses = [],
  bookmarkedCourses = [],
  onAddCourse = () => {},
  onBookmarkCourse = () => {},
  onNavigate,
  isBookmarked = () => false,
  handleBookmark = () => {},
  pdfFile,
  pdfProcessing,
  handlePdfUpload,
  pdfError,
}: AddCoursesProps) {
  const [activeTab, setActiveTab] = React.useState("manual");
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const [courseToAdd, setCourseToAdd] = React.useState<Course | null>(null);
  const [manualCourse, setManualCourse] = React.useState({
    courseId: "",
    course: "",
    credits: 4,
    requirements: "",
    description: "",
  });

  const isEnrolled = (courseId: string) => {
    if (!enrolledCourses || !Array.isArray(enrolledCourses)) {
      return false;
    }
    return enrolledCourses.some(
      (course) => course && course.courseId === courseId
    );
  };

  const isBookmarkedLegacy = (courseId: string) => {
    if (!bookmarkedCourses || !Array.isArray(bookmarkedCourses)) {
      return false;
    }
    return bookmarkedCourses.some(
      (course) => course && course.code === courseId
    );
  };

  const handleBookmarkLegacy = (course: Course) => {
    if (onBookmarkCourse) {
      onBookmarkCourse(course);
    }
  };

  const handleAddCourse = (course: Course) => {
    setCourseToAdd(course);
    setConfirmModalOpen(true);
  };

  const confirmAdd = () => {
    if (courseToAdd && onAddCourse) {
      onAddCourse(courseToAdd);
      setConfirmModalOpen(false);
      setCourseToAdd(null);
      setManualCourse({
        courseId: "",
        course: "",
        credits: 4,
        requirements: "",
        description: "",
      });
    }
  };

  const handleManualAdd = () => {
    if (manualCourse.courseId && manualCourse.course) {
      const newCourse: Course = {
        id: Date.now(),
        courseId: manualCourse.courseId,
        course: manualCourse.course,
        credits: manualCourse.credits,
        requirements: manualCourse.requirements,
        description: manualCourse.description,
      };
      handleAddCourse(newCourse);
    }
  };

  return (
    <div className="space-y-6 ml-[5%] mr-[5%]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="light"
            startContent={<ArrowLeft size={16} />}
            onClick={() => onNavigate("your-courses")}
            className="h-8 px-3 text-sm"
          >
            Go to Your Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Courses</h1>
            <p className="text-default-500 mt-1">
              Choose your preferred method to add courses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="flat"
            onClick={() => onNavigate("bookmarks")}
            className="h-8 px-3 text-sm"
          >
            View Bookmarks ({bookmarkedCourses.length})
          </Button>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {enrolledCourses.length}
              </p>
              <p className="text-sm text-default-500">Total Enrolled</p>
            </div>
          </Card>
        </div>
      </div>
      <Card className="p-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab
            key="manual"
            title={
              <div className="flex items-center space-x-2">
                <Search size={16} />
                <span>Search Courses</span>
              </div>
            }
          >
            <CourseSearch
              handleAddCourse={handleAddCourse}
              isEnrolled={isEnrolled}
            />
          </Tab>

          <Tab
            key="browse"
            title={
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Browse All Courses</span>
              </div>
            }
          >
            <CourseBrowseTable
              isEnrolled={isEnrolled}
              handleAddCourse={handleAddCourse}
              isBookmarked={isBookmarked}
              handleBookmark={handleBookmark}
            />
          </Tab>

          <Tab
            key="pdf"
            title={
              <div className="flex items-center space-x-2">
                <Upload size={16} />
                <span>Import PDF</span>
              </div>
            }
          >
            <PdfUploadTab
              pdfFile={pdfFile || null}
              pdfProcessing={pdfProcessing || false}
              handlePdfUpload={handlePdfUpload || (() => {})}
              pdfError={pdfError}
              enrolledCourses={enrolledCourses}
              onNavigate={onNavigate}
            />
          </Tab>
        </Tabs>
      </Card>
      <AddCourseModal
        isOpen={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        courseToAdd={courseToAdd}
        onConfirm={confirmAdd}
      />
    </div>
  );
}
