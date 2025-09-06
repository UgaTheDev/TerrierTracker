import { Progress } from "@heroui/react";

interface CategoryData {
  label: string;
  percentage: number;
  color: "danger" | "warning" | "success" | "primary" | "secondary" | "default";
  customColor?: string;
}

type HubRequirement = {
  name: string;
  required: number;
  current: number;
};

interface CategoryProgressProps {
  categories?: CategoryData[];
  hubRequirements: HubRequirement[];
}

const hubRequirementCategories: Record<string, string> = {
  "Philosophical Inquiry and Life's Meanings":
    "Philosophical, Aesthetic, and Historical Interpretation",
  "Aesthetic Exploration":
    "Philosophical, Aesthetic, and Historical Interpretation",
  "Historical Consciousness":
    "Philosophical, Aesthetic, and Historical Interpretation",
  "Scientific Inquiry I": "Scientific and Social Inquiry",
  "Social Inquiry I": "Scientific and Social Inquiry",
  "Scientific Inquiry II or Social Inquiry II": "Scientific and Social Inquiry",
  "Quantitative Reasoning I": "Quantitative Reasoning",
  "Quantitative Reasoning II": "Quantitative Reasoning",
  "The Individual in Community":
    "Diversity, Civic Engagement, and Global Citizenship",
  "Global Citizenship and Intercultural Literacy":
    "Diversity, Civic Engagement, and Global Citizenship",
  "Ethical Reasoning": "Diversity, Civic Engagement, and Global Citizenship",
  "First-Year Writing Seminar": "Communication",
  "Writing, Research, and Inquiry": "Communication",
  "Writing-Intensive Course": "Communication",
  "Oral and/or Signed Communication": "Communication",
  "Digital/Multimedia Expression": "Communication",
  "Critical Thinking": "Intellectual Toolkit",
  "Research and Information Literacy": "Intellectual Toolkit",
  "Teamwork/Collaboration": "Intellectual Toolkit",
  "Creativity/Innovation": "Intellectual Toolkit",
};

export default function CategoryProgress({
  categories,
  hubRequirements,
}: CategoryProgressProps) {
  const calculateCategoryPercentages = (): CategoryData[] => {
    const categoryMap = new Map();

    hubRequirements.forEach((req) => {
      const category = hubRequirementCategories[req.name];
      if (!category) return;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          fulfilled: 0,
          total: 0,
          totalRequired: 0,
          totalCurrent: 0,
        });
      }
      const data = categoryMap.get(category);
      data.total += 1;
      data.totalRequired += req.required;
      data.totalCurrent += req.current;

      if (req.current >= req.required) {
        data.fulfilled += 1;
      }
    });

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
      const percentage = Math.round(
        (data.totalCurrent / data.totalRequired) * 100
      );
      const colorInfo = colorMap[category] || { color: "default" as const };
      return {
        label: category,
        percentage: Math.min(percentage, 100),
        color: colorInfo.color,
        customColor: colorInfo.customColor,
      };
    });
  };

  const categoryData = categories || calculateCategoryPercentages();

  return (
    <div className="w-full max-w-2xl p-6 space-y-6 h-96">
      <h2 className="text-xl font-semibold text-center mb-6">
        Categorical Tracker
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
