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
    const totalRequired = hubRequirements.reduce(
      (sum, req) => sum + req.required,
      0
    );
    const totalCurrent = hubRequirements.reduce(
      (sum, req) => sum + Math.min(req.current, req.required),
      0
    );

    if (totalRequired === 0) return 0;

    return Math.round((totalCurrent / totalRequired) * 100);
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
