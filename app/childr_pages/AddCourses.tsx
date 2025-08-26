import type { SVGProps } from "react";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Card,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Tabs,
  Tab,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { ArrowLeft, Plus, Check, Search, Upload, FileText } from "lucide-react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const columns = [
  { name: "ID", uid: "id" },
  { name: "COURSE", uid: "course" },
  { name: "CREDITS", uid: "credits" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

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
  onGoBack?: () => void;
}

export default function AddCourses(props: AddCoursesProps) {
  const {
    enrolledCourses = [],
    onAddCourse = () => {},
    onGoBack = () => {},
  } = props;

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
    }
  };

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

  const handleSearchSelect = (courseId: string | null) => {
    if (courseId) {
      const course = availableCourses.find((c) => c.courseId === courseId);
      setSelectedCourse(course || null);
    }
  };

  const renderCell = React.useCallback(
    (course: Course, columnKey: React.Key) => {
      switch (columnKey) {
        case "id":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm font-mono">{course.courseId}</p>
            </div>
          );
        case "course":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{course.course}</p>
              <p className="text-bold text-xs text-default-400">
                {course.description}
              </p>
            </div>
          );
        case "credits":
          return (
            <div className="flex items-center">
              <p className="text-sm font-semibold">{course.credits}</p>
            </div>
          );
        case "status":
          return (
            <div className="flex items-center">
              {isEnrolled(course.courseId) ? (
                <div className="flex items-center gap-1 text-success">
                  <Check size={14} />
                  <span className="text-xs font-medium">Enrolled</span>
                </div>
              ) : (
                <span className="text-xs text-default-400">Available</span>
              )}
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              {!isEnrolled(course.courseId) ? (
                <Tooltip content="Add Course">
                  <span
                    className="text-lg text-success cursor-pointer active:opacity-50"
                    onClick={() => handleAddCourse(course)}
                  >
                    <AddIcon />
                  </span>
                </Tooltip>
              ) : (
                <Tooltip content="Already Enrolled">
                  <span className="text-lg text-default-300">
                    <Check size={18} />
                  </span>
                </Tooltip>
              )}
            </div>
          );
        default:
          return course[columnKey as keyof Course];
      }
    },
    [enrolledCourses]
  );

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
            onClick={onGoBack}
            className="h-8 px-3 text-sm"
          >
            Back to Your Courses
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
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Search Existing Courses
                  </h3>
                  <Autocomplete
                    label="Search by course code or name"
                    placeholder="e.g., CS 131 or Combinatoric Structures"
                    value={searchValue}
                    onInputChange={setSearchValue}
                    onSelectionChange={handleSearchSelect}
                  >
                    {filteredCourses.map((course) => (
                      <AutocompleteItem
                        key={course.courseId}
                        value={course.courseId}
                      >
                        {course.courseId} - {course.course}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {selectedCourse && (
                    <Card className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          {selectedCourse.courseId} - {selectedCourse.course}
                        </h4>
                        <p className="text-sm text-default-600">
                          {selectedCourse.description}
                        </p>
                        <p className="text-sm">
                          <strong>Credits:</strong> {selectedCourse.credits}
                        </p>
                        {selectedCourse.requirements && (
                          <p className="text-sm">
                            <strong>Prerequisites:</strong>{" "}
                            {selectedCourse.requirements}
                          </p>
                        )}
                        <Button
                          color="success"
                          size="sm"
                          startContent={<Plus size={14} />}
                          onClick={() => handleAddCourse(selectedCourse)}
                          disabled={isEnrolled(selectedCourse.courseId)}
                        >
                          {isEnrolled(selectedCourse.courseId)
                            ? "Already Enrolled"
                            : "Add Course"}
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Create Custom Course
                  </h3>
                  <Input
                    label="Course ID"
                    placeholder="e.g., CAS CS 131"
                    value={manualCourse.courseId}
                    onChange={(e) =>
                      setManualCourse({
                        ...manualCourse,
                        courseId: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Course Name"
                    placeholder="e.g., Combinatoric Structures"
                    value={manualCourse.course}
                    onChange={(e) =>
                      setManualCourse({
                        ...manualCourse,
                        course: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Credits"
                    type="number"
                    placeholder="4"
                    value={manualCourse.credits.toString()}
                    onChange={(e) =>
                      setManualCourse({
                        ...manualCourse,
                        credits: parseInt(e.target.value) || 4,
                      })
                    }
                  />
                  <Input
                    label="Prerequisites"
                    placeholder="e.g., MA 123"
                    value={manualCourse.requirements}
                    onChange={(e) =>
                      setManualCourse({
                        ...manualCourse,
                        requirements: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Description"
                    placeholder="Course description"
                    value={manualCourse.description}
                    onChange={(e) =>
                      setManualCourse({
                        ...manualCourse,
                        description: e.target.value,
                      })
                    }
                  />
                  <Button
                    color="primary"
                    startContent={<Plus size={16} />}
                    onClick={handleManualAdd}
                    disabled={!manualCourse.courseId || !manualCourse.course}
                  >
                    Add Custom Course
                  </Button>
                </div>
              </div>
            </div>
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
            <div className="pt-4">
              <div className="h-96 overflow-auto">
                <Table aria-label="Available courses table" className="h-full">
                  <TableHeader columns={columns}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={availableCourses}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
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
            <div className="pt-4 space-y-4">
              <div className="text-center p-8 border-2 border-dashed border-default-300 rounded-lg">
                <Upload size={48} className="mx-auto mb-4 text-default-400" />
                <h3 className="text-lg font-semibold mb-2">
                  Upload Course List PDF
                </h3>
                <p className="text-default-500 mb-4">
                  Upload a PDF containing your course list. The system will
                  automatically parse and extract course information.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <Button
                  as="label"
                  htmlFor="pdf-upload"
                  color="primary"
                  startContent={<Upload size={16} />}
                  disabled={pdfProcessing}
                >
                  {pdfProcessing ? "Processing..." : "Choose PDF File"}
                </Button>
              </div>

              {pdfFile && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText size={20} />
                    <div>
                      <p className="font-medium">{pdfFile.name}</p>
                      <p className="text-sm text-default-500">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {pdfProcessing && (
                    <div className="mt-3">
                      <div className="w-full bg-default-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full animate-pulse"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <p className="text-sm text-default-500 mt-1">
                        Processing PDF...
                      </p>
                    </div>
                  )}
                </Card>
              )}

              <div className="bg-default-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">PDF Format Guidelines:</h4>
                <ul className="text-sm text-default-600 space-y-1">
                  <li>• Course codes should be in format: CAS CS 131</li>
                  <li>• Include course names and credit information</li>
                  <li>• Prerequisites should be clearly listed</li>
                  <li>
                    • Supported formats: Academic transcripts, course catalogs
                  </li>
                </ul>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Card>

      <Modal isOpen={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <ModalContent>
          <ModalHeader>Add Course</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to add{" "}
              <strong>{courseToAdd?.courseId}</strong> -{" "}
              <strong>{courseToAdd?.course}</strong>?
            </p>
            {courseToAdd?.requirements && (
              <div className="mt-2">
                <p className="text-sm text-default-600">
                  <strong>Prerequisites:</strong> {courseToAdd.requirements}
                </p>
              </div>
            )}
            <div className="mt-2">
              <p className="text-sm text-default-600">
                <strong>Credits:</strong> {courseToAdd?.credits}
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button color="success" onClick={confirmAdd}>
              Add Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
