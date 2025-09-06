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
} from "@heroui/react";
import { Plus } from "lucide-react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "COURSE", uid: "course", sortable: true },
  { name: "CREDITS", uid: "credits" },
  { name: "ACTIONS", uid: "actions" },
];

export const DeleteIcon = (props: IconSvgProps) => {
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
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const EditIcon = (props: IconSvgProps) => {
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
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
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

type SortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

interface CourseTableProps {
  enrolledCourses: Course[];
  onAddCourse: (course: Course) => void;
  onNavigate: (page: string) => void;
}

export default function CourseTable({
  enrolledCourses,
  onAddCourse,
  onNavigate,
}: CourseTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [courseToDelete, setCourseToDelete] = React.useState<Course | null>(
    null
  );
  const [courseToEdit, setCourseToEdit] = React.useState<Course | null>(null);
  const [editForm, setEditForm] = React.useState<Course>({
    id: 0,
    courseId: "",
    course: "",
    credits: 0,
    requirements: "",
  });
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "",
    direction: "descending",
  });

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      console.warn(
        "Delete functionality needs to be implemented in parent component"
      );
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleEdit = (course: Course) => {
    setCourseToEdit(course);
    setEditForm({ ...course });
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    if (courseToEdit) {
      console.warn(
        "Edit functionality needs to be implemented in parent component"
      );
      setEditModalOpen(false);
      setCourseToEdit(null);
    }
  };

  const handleSort = (column: string) => {
    if (sortDescriptor.column === column) {
      if (sortDescriptor.direction === "descending") {
        setSortDescriptor({
          column: sortDescriptor.column,
          direction: "ascending",
        });
      } else {
        setSortDescriptor({ column: "", direction: "descending" });
      }
    } else {
      setSortDescriptor({ column, direction: "descending" });
    }
  };

  const sortedCourses = React.useMemo(() => {
    if (!sortDescriptor.column) return enrolledCourses;

    return [...enrolledCourses].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortDescriptor.column === "id") {
        aValue = a.courseId;
        bValue = b.courseId;
      } else if (sortDescriptor.column === "course") {
        aValue = a.course;
        bValue = b.course;
      } else {
        return 0;
      }

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      }

      return sortDescriptor.direction === "descending"
        ? -comparison
        : comparison;
    });
  }, [enrolledCourses, sortDescriptor]);

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
                {course.requirements}
              </p>
            </div>
          );
        case "credits":
          return (
            <div className="flex items-center">
              <p className="text-sm font-semibold">{course.credits}</p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit Course">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => handleEdit(course)}
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Remove Course">
                <span
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={() => handleDelete(course)}
                >
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return course[columnKey as keyof Course];
      }
    },
    []
  );

  const totalCredits = enrolledCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Courses</h1>
          <p className="text-default-500 mt-1">Manage your enrolled courses</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Plus size={16} />}
            onClick={() => onNavigate("add-courses")}
            className="h-8 px-3 text-sm"
          >
            Add Courses
          </Button>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalCredits}</p>
              <p className="text-sm text-default-500">Total Credits</p>
            </div>
          </Card>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-lg text-default-500 mb-4">
              No courses enrolled yet
            </p>
            <Button
              color="primary"
              variant="flat"
              startContent={<Plus size={16} />}
              onClick={() => onNavigate("add-courses")}
            >
              Add Your First Course
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="h-96 overflow-auto">
            <Table aria-label="Your courses table" className="h-full">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "center" : "start"}
                    allowsSorting={false}
                  >
                    <div className="flex items-center gap-1">
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.uid)}
                          className="hover:text-primary cursor-pointer"
                        >
                          {column.name}
                        </button>
                      ) : (
                        column.name
                      )}
                    </div>
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={sortedCourses}>
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
        </Card>
      )}

      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{" "}
              <strong>{courseToDelete?.courseId}</strong> -{" "}
              <strong>{courseToDelete?.course}</strong>?
            </p>
            <p className="text-danger text-sm">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editModalOpen} onOpenChange={setEditModalOpen} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Course</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Course ID"
              value={editForm.courseId}
              onChange={(e) =>
                setEditForm({ ...editForm, courseId: e.target.value })
              }
              placeholder="e.g., CAS CS 101"
            />
            <Input
              label="Course Name"
              value={editForm.course}
              onChange={(e) =>
                setEditForm({ ...editForm, course: e.target.value })
              }
              placeholder="e.g., Introduction to Computer Science I"
            />
            <Input
              type="number"
              label="Credits"
              value={editForm.credits.toString()}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  credits: parseInt(e.target.value) || 0,
                })
              }
              placeholder="4"
            />
            <Input
              label="Requirements"
              value={editForm.requirements}
              onChange={(e) =>
                setEditForm({ ...editForm, requirements: e.target.value })
              }
              placeholder="Prerequisites or requirements"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={saveEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
