import { CircularProgress } from "@heroui/react";

type HubRequirement = {
  name: string;
  required: number;
  current: number;
};

interface ChartProps {
  percentage?: number;
  hubRequirements: HubRequirement[];
}

export default function Chart({ percentage, hubRequirements }: ChartProps) {
  const calculateOverallPercentage = () => {
    const fulfilledCount = hubRequirements.filter(
      (req) => req.current >= req.required
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
