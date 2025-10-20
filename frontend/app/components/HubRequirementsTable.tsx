import type { SVGProps } from "react";
import type { ChipProps } from "@heroui/react";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Progress,
} from "@heroui/react";
import ViewRequirementsModal from "./ViewRequirementsModal";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const columns = [
  { name: "NAME", uid: "name" },
  { name: "PROGRESS", uid: "progress" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

export const EyeIcon = (props: IconSvgProps) => {
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
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

const statusColorMap: Record<string, ChipProps["color"]> = {
  fulfilled: "success",
  unfulfilled: "danger",
  "in-progress": "warning",
};

type HubRequirement = {
  name: string;
  required: number;
  current: number;
  courses?: Array<{
    courseId: string;
    course: string;
    credits: number;
  }>;
};

interface HubRequirementsTableProps {
  hubRequirements: HubRequirement[];
}

export default function HubRequirementsTable({
  hubRequirements,
}: HubRequirementsTableProps) {
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    React.useState<HubRequirement | null>(null);

  const handleViewCourses = (requirement: HubRequirement) => {
    console.log("View clicked for:", requirement.name);
    setSelectedRequirement(requirement);
    setViewModalOpen(true);
  };

  const renderCell = React.useCallback(
    (requirement: HubRequirement, columnKey: React.Key) => {
      const status =
        requirement.current >= requirement.required
          ? "fulfilled"
          : requirement.current > 0
            ? "in-progress"
            : "unfulfilled";

      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{requirement.name}</p>
              <p className="text-bold text-xs text-default-500">
                {requirement.required} unit{requirement.required > 1 ? "s" : ""}
              </p>
            </div>
          );
        case "progress":
          const progressPercentage = Math.min(
            (requirement.current / requirement.required) * 100,
            100
          );
          return (
            <div className="flex flex-col gap-2 w-32">
              <div className="flex justify-between">
                <p className="text-sm font-medium">
                  {requirement.current} / {requirement.required}
                </p>
                <p className="text-xs text-default-500">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
              <Progress
                value={progressPercentage}
                size="sm"
                color={
                  progressPercentage === 100
                    ? "success"
                    : progressPercentage > 0
                      ? "warning"
                      : "danger"
                }
                className="w-full"
              />
              <p className="text-xs text-default-400">
                {requirement.current >= requirement.required
                  ? "Complete"
                  : `${requirement.required - requirement.current} remaining`}
              </p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[status]}
              size="sm"
              variant="flat"
            >
              {status === "in-progress" ? "In Progress" : status}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="View courses fulfilling this requirement">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => handleViewCourses(requirement)}
                >
                  <EyeIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return null;
      }
    },
    []
  );

  return (
    <>
      <div className="h-[510px] overflow-auto">
        <Table aria-label="Hub requirements table" className="h-full">
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
          <TableBody items={hubRequirements}>
            {(item) => (
              <TableRow key={item.name}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ViewRequirementsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        requirement={selectedRequirement}
      />
    </>
  );
}
