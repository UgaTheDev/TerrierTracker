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
} from "@heroui/react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const columns = [
  { name: "NAME", uid: "name" },
  { name: "COURSES", uid: "courses" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

export const hubRequirements = [
  // PHILOSOPHICAL, AESTHETIC, AND HISTORICAL INTERPRETATION
  {
    id: 1,
    name: "Philosophical Inquiry and Life's Meanings",
    courses: "",
    category: "Philosophical, Aesthetic, and Historical Interpretation",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 2,
    name: "Aesthetic Exploration",
    courses: "",
    category: "Philosophical, Aesthetic, and Historical Interpretation",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 3,
    name: "Historical Consciousness",
    courses: "",
    category: "Philosophical, Aesthetic, and Historical Interpretation",
    units: 1,
    status: "unfulfilled",
  },
  // SCIENTIFIC AND SOCIAL INQUIRY
  {
    id: 4,
    name: "Scientific Inquiry I",
    courses: "",
    category: "Scientific and Social Inquiry",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 5,
    name: "Social Inquiry I",
    courses: "",
    category: "Scientific and Social Inquiry",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 6,
    name: "Scientific Inquiry II or Social Inquiry II",
    courses: "",
    category: "Scientific and Social Inquiry",
    units: 1,
    status: "unfulfilled",
  },
  // QUANTITATIVE REASONING
  {
    id: 7,
    name: "Quantitative Reasoning I",
    courses: "",
    category: "Quantitative Reasoning",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 8,
    name: "Quantitative Reasoning II",
    courses: "",
    category: "Quantitative Reasoning",
    units: 1,
    status: "unfulfilled",
  },
  // DIVERSITY, CIVIC ENGAGEMENT, AND GLOBAL CITIZENSHIP
  {
    id: 9,
    name: "The Individual in Community",
    courses: "",
    category: "Diversity, Civic Engagement, and Global Citizenship",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 10,
    name: "Global Citizenship and Intercultural Literacy",
    courses: "",
    category: "Diversity, Civic Engagement, and Global Citizenship",
    units: 2,
    status: "unfulfilled",
  },
  {
    id: 11,
    name: "Ethical Reasoning",
    courses: "",
    category: "Diversity, Civic Engagement, and Global Citizenship",
    units: 1,
    status: "unfulfilled",
  },
  // COMMUNICATION
  {
    id: 12,
    name: "First-Year Writing Seminar",
    courses: "",
    category: "Communication",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 13,
    name: "Writing, Research, and Inquiry",
    courses: "",
    category: "Communication",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 14,
    name: "Writing-Intensive Course",
    courses: "",
    category: "Communication",
    units: 2,
    status: "unfulfilled",
  },
  {
    id: 15,
    name: "Oral and/or Signed Communication",
    courses: "",
    category: "Communication",
    units: 1,
    status: "unfulfilled",
  },
  {
    id: 16,
    name: "Digital/Multimedia Expression",
    courses: "",
    category: "Communication",
    units: 1,
    status: "unfulfilled",
  },
  // INTELLECTUAL TOOLKIT
  {
    id: 17,
    name: "Critical Thinking",
    courses: "",
    category: "Intellectual Toolkit",
    units: 2,
    status: "unfulfilled",
  },
  {
    id: 18,
    name: "Research and Information Literacy",
    courses: "",
    category: "Intellectual Toolkit",
    units: 2,
    status: "unfulfilled",
  },
  {
    id: 19,
    name: "Teamwork/Collaboration",
    courses: "",
    category: "Intellectual Toolkit",
    units: 2,
    status: "unfulfilled",
  },
  {
    id: 20,
    name: "Creativity/Innovation",
    courses: "",
    category: "Intellectual Toolkit",
    units: 2,
    status: "unfulfilled",
  },
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

const statusColorMap: Record<string, ChipProps["color"]> = {
  fulfilled: "success",
  unfulfilled: "danger",
};

type HubRequirement = (typeof hubRequirements)[0];

export default function HubRequirementTable() {
  const renderCell = React.useCallback(
    (requirement: HubRequirement, columnKey: React.Key) => {
      const cellValue = requirement[columnKey as keyof HubRequirement];

      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm">{requirement.name}</p>
              <p className="text-bold text-xs text-default-400">
                {requirement.category}
              </p>
              <p className="text-bold text-xs text-default-500">
                {requirement.units} unit{requirement.units > 1 ? "s" : ""}
              </p>
            </div>
          );
        case "courses":
          return (
            <div className="flex flex-col">
              <p className="text-sm">
                {requirement.courses || "No courses assigned"}
              </p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[requirement.status]}
              size="sm"
              variant="flat"
            >
              {requirement.status}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Details">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EyeIcon />
                </span>
              </Tooltip>
              <Tooltip content="Edit requirement">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete requirement">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  return (
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
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
