import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "@heroui/react";
import { Check } from "lucide-react";
import { AddIcon } from "../childr_pages/AddCourses";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  description?: string;
};

const columns = [
  { name: "ID", uid: "id" },
  { name: "COURSE", uid: "course" },
  { name: "CREDITS", uid: "credits" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

interface CourseBrowseTableProps {
  availableCourses: Course[];
  isEnrolled: (courseId: string) => boolean;
  handleAddCourse: (course: Course) => void;
}

export default function CourseBrowseTable({
  availableCourses,
  isEnrolled,
  handleAddCourse,
}: CourseBrowseTableProps) {
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
    [isEnrolled, handleAddCourse]
  );

  return (
    <div className="pt-4">
      <div className="h-96 overflow-auto">
        <Table aria-label="Available courses table" className="h-full">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={false}
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
  );
}
