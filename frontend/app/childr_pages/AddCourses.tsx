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
};

interface AddCoursesProps {
  enrolledCourses?: Course[];
  onAddCourse?: (course: Course) => void;
  onNavigate: (page: string) => void;
}

export default function AddCourses({
  enrolledCourses = [],
  onAddCourse = () => {},
  onNavigate,
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
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = React.useState(false);

  const isEnrolled = (courseId: string) => {
    if (!enrolledCourses || !Array.isArray(enrolledCourses)) {
      return false;
    }
    return enrolledCourses.some(
      (course) => course && course.courseId === courseId
    );
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
      onNavigate("your-courses");
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

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfProcessing(true);
      setTimeout(() => {
        setPdfProcessing(false);
        alert(
          "PDF processing complete! In a real implementation, this would parse the PDF and extract course data."
        );
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 ml-[5%]">
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
              pdfFile={pdfFile}
              pdfProcessing={pdfProcessing}
              handlePdfUpload={handlePdfUpload}
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
