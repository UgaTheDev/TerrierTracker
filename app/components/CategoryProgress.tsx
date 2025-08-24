import { Progress } from "@heroui/react";

interface CategoryData {
  label: string;
  percentage: number;
  color: "danger" | "warning" | "success" | "primary" | "secondary" | "default";
  customColor?: string;
}

interface CategoryProgressProps {
  categories?: CategoryData[];
}

export default function CategoryProgress({
  categories,
}: CategoryProgressProps) {
  const defaultCategories: CategoryData[] = [
    {
      label: "Philosophical, Aesthetic and Historical Interpretation",
      percentage: 85,
      color: "danger",
    },
    {
      label: "Scientific and Social Inquiry",
      percentage: 70,
      color: "default",
      customColor: "#8B4513",
    },
    {
      label: "Quantitative Reasoning",
      percentage: 90,
      color: "success",
    },
    {
      label: "Diversity, Civic Engagement and Global Citizenship",
      percentage: 60,
      color: "primary",
      customColor: "#20B2AA",
    },
    {
      label: "Communication",
      percentage: 95,
      color: "warning",
    },
    {
      label: "Intellectual Toolkit",
      percentage: 75,
      color: "primary",
      customColor: "#007BA7",
    },
  ];

  const categoryData = categories || defaultCategories;

  return (
    <div className="w-full max-w-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-center mb-6">
        Categorical Hub Requirement Tracker
      </h2>

      <div className="space-y-4">
        {categoryData.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-default-700 flex-1">
                {category.label}
              </h3>
              <span className="text-sm text-default-500 ml-4">
                {category.percentage}%
              </span>
            </div>
            <Progress
              value={category.percentage}
              color={category.color}
              size="md"
              className="w-full"
              classNames={{
                base: "max-w-none",
                track: "drop-shadow-md border border-default-200",
                indicator: category.customColor
                  ? `bg-[${category.customColor}]`
                  : "",
              }}
              style={
                category.customColor
                  ? ({
                      "--heroui-progress-indicator": category.customColor,
                    } as React.CSSProperties)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
