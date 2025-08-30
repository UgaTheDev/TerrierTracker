import { CircularProgress } from "@heroui/react";
import { hubRequirements } from "./HubRequirementsTable";

interface ChartProps {
  percentage?: number;
}

export default function Chart({ percentage }: ChartProps) {
  const calculateOverallPercentage = () => {
    const fulfilledCount = hubRequirements.filter(
      (req) => req.status === "fulfilled"
    ).length;
    const totalCount = hubRequirements.length;
    return Math.round((fulfilledCount / totalCount) * 100);
  };

  const displayPercentage =
    percentage !== undefined ? percentage : calculateOverallPercentage();

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="relative">
        <CircularProgress
          size="lg"
          value={displayPercentage}
          color="success"
          strokeWidth={4}
          showValueLabel={true}
          classNames={{
            svg: "w-36 h-36",
            value: "text-2xl font-semibold text-success",
          }}
        />
      </div>
      <p className="text-sm text-default-500 font-medium">
        Requirements Fulfilled
      </p>
    </div>
  );
}
