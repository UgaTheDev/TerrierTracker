import { Progress } from "@heroui/react";
import { hubRequirements } from "./HubRequirementsTable";

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
  // Calculate percentages from hub requirements data
  const calculateCategoryPercentages = (): CategoryData[] => {
    const categoryMap = new Map();

    // Group requirements by category and calculate percentages
    hubRequirements.forEach((req) => {
      const category = req.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { fulfilled: 0, total: 0 });
      }

      const data = categoryMap.get(category);
      data.total += 1;
      if (req.status === "fulfilled") {
        data.fulfilled += 1;
      }
    });

    // Convert to CategoryData format with colors
    const colorMap: Record<
      string,
      { color: CategoryData["color"]; customColor?: string }
    > = {
      "Philosophical, Aesthetic, and Historical Interpretation": {
        color: "danger",
      },
      "Scientific and Social Inquiry": {
        color: "default",
        customColor: "#8B4513",
      },
      "Quantitative Reasoning": { color: "success" },
      "Diversity, Civic Engagement, and Global Citizenship": {
        color: "primary",
        customColor: "#20B2AA",
      },
      Communication: { color: "warning" },
      "Intellectual Toolkit": { color: "primary", customColor: "#007BA7" },
    };

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const percentage = Math.round((data.fulfilled / data.total) * 100);
      const colorInfo = colorMap[category] || { color: "default" as const };

      return {
        label: category,
        percentage,
        color: colorInfo.color,
        customColor: colorInfo.customColor,
      };
    });
  };

  const categoryData = categories || calculateCategoryPercentages();

  return (
    <div className="w-full max-w-2xl p-6 space-y-6 h-96">
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
