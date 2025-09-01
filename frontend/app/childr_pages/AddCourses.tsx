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

export const availableCourses = [
  {
    id: 11,
    courseId: "CAS CS 210",
    course: "Computer Systems",
    credits: 4,
    requirements: "CS 112",
    description: "Introduction to computer systems programming",
  },
  {
    id: 12,
    courseId: "CAS MA 225",
    course: "Multivariate Calculus",
    credits: 4,
    requirements: "MA 124",
    description: "Vector calculus and multivariable functions",
  },
  {
    id: 13,
    courseId: "CAS PH 212",
    course: "General Physics II",
    credits: 4,
    requirements: "PH 211, MA 124",
    description: "Electricity, magnetism, and modern physics",
  },
  {
    id: 14,
    courseId: "CAS CS 330",
    course: "Introduction to Analysis of Algorithms",
    credits: 4,
    requirements: "CS 112, MA 123",
    description: "Algorithm design and complexity analysis",
  },
  {
    id: 15,
    courseId: "CAS WR 150",
    course: "Reasoning and Argument",
    credits: 4,
    requirements: "WR 100",
    description: "Advanced writing and argumentation skills",
  },
  {
    id: 16,
    courseId: "CAS BI 108",
    course: "Introduction to Biology",
    credits: 4,
    requirements: "",
    description: "Fundamentals of biological sciences",
  },
  {
    id: 17,
    courseId: "CAS CH 101",
    course: "General Chemistry I",
    credits: 4,
    requirements: "",
    description: "Principles of general chemistry",
  },
  {
    id: 18,
    courseId: "CAS EC 101",
    course: "Introduction to Microeconomics",
    credits: 4,
    requirements: "",
    description: "Basic principles of microeconomic theory",
  },
  {
    id: 19,
    courseId: "CAS LX 250",
    course: "Introduction to Linguistics",
    credits: 4,
    requirements: "",
    description: "Scientific study of human language",
  },
  {
    id: 20,
    courseId: "CAS CS 320",
    course: "Concepts of Programming Languages",
    credits: 4,
    requirements: "CS 112",
    description: "Programming language design and implementation",
  },
  {
    id: 21,
    courseId: "CAS CS 131",
    course: "Combinatoric Structures",
    credits: 4,
    requirements: "MA 123",
    description: "Mathematical structures and discrete mathematics",
  },
  {
    id: 22,
    courseId: "CAS CS 132",
    course: "Geometric Algorithms",
    credits: 4,
    requirements: "CS 112, MA 225",
    description: "Computational geometry and spatial algorithms",
  },
];

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
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
    null
  );
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

  const filteredCourses = React.useMemo(() => {
    if (!searchValue) return availableCourses;
    return availableCourses.filter(
      (course) =>
        course.courseId.toLowerCase().includes(searchValue.toLowerCase()) ||
        course.course.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const handleAddCourse = (course: Course) => {
    setCourseToAdd(course);
    setConfirmModalOpen(true);
  };

  const confirmAdd = () => {
    if (courseToAdd && onAddCourse) {
      onAddCourse(courseToAdd);
      setConfirmModalOpen(false);
      setCourseToAdd(null);
      setSearchValue("");
      setSelectedCourse(null);
      setManualCourse({
        courseId: "",
        course: "",
        credits: 4,
        requirements: "",
        description: "",
      });
      // Navigate to your courses after adding
      onNavigate("your-courses");
    }
  };

  const handleSearchSelect = (courseId: string | null) => {
    if (courseId) {
      const course = availableCourses.find((c) => c.courseId === courseId);
      setSelectedCourse(course || null);
    }
  };

  const handleManualAdd = () => {
    if (manualCourse.courseId && manualCourse.course) {
      const newCourse: Course = {
        id: Math.max(...availableCourses.map((c) => c.id)) + 1,
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

  const availableCount = availableCourses.filter(
    (course) => !isEnrolled(course.courseId)
  ).length;
  const enrolledFromAvailable = availableCourses.filter((course) =>
    isEnrolled(course.courseId)
  ).length;

  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold text-success">
                {availableCount}
              </p>
              <p className="text-sm text-default-500">Available</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {enrolledFromAvailable}
              </p>
              <p className="text-sm text-default-500">Enrolled</p>
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
                <span>Manual Input</span>
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
                <span>Browse Courses</span>
              </div>
            }
          >
            <CourseBrowseTable
              availableCourses={availableCourses}
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
