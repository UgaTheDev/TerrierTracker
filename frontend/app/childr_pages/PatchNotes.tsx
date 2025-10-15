import React from "react";
import { Card, Button } from "@heroui/react";
import {
  ArrowLeft,
  CheckCircle,
  Rocket,
  Map,
  Settings,
  Calendar,
  Upload,
  Heart,
} from "lucide-react";
import "..../styles/PatchNotes.css";
interface TimelineItem {
  id: number;
  version: string;
  date: string;
  features: {
    text: string;
    icon: React.FC<any>;
    color:
      | "text-primary"
      | "text-success"
      | "text-warning"
      | "text-danger"
      | "text-default";
  }[];
}

const patchNotesData: TimelineItem[] = [
  {
    id: 3,
    version: "v1.2.0: The Agility Update 🐾",
    date: "October 15, 2025",
    features: [
      {
        text: "**Performance Boost**: Up to 30% faster load times.",
        icon: Rocket,
        color: "text-primary",
      },
      {
        text: "**New Theme**: Added a new dark mode option in user settings.",
        icon: Settings,
        color: "text-default",
      },
      {
        text: '**API Integration**: Integrated with the "BarkBox" service for park capacity.',
        icon: Map,
        color: "text-warning",
      },
      {
        text: "**Bug Fixes**: Squashed several minor bugs.",
        icon: CheckCircle,
        color: "text-success",
      },
    ],
  },
  {
    id: 2,
    version: "v1.1.0: The Tracking Update 🗺️",
    date: "September 20, 2025",
    features: [
      {
        text: "**Real-Time GPS**: Added real-time tracking visualization.",
        icon: Map,
        color: "text-primary",
      },
      {
        text: "**Custom Alerts**: Users can now set proximity alerts.",
        icon: Heart,
        color: "text-danger",
      },
      {
        text: "**Settings Page**: Introduced a dedicated user settings page.",
        icon: Settings,
        color: "text-default",
      },
    ],
  },
  {
    id: 1,
    version: "v1.0.0: Initial Release 🎉",
    date: "August 1, 2025",
    features: [
      {
        text: "**Core Functionality**: User authentication, profiles, and basic route logging.",
        icon: CheckCircle,
        color: "text-success",
      },
      {
        text: "**Image Upload**: Users can upload profile pictures.",
        icon: Upload,
        color: "text-default",
      },
    ],
  },
];

const TimelineCard: React.FC<{ item: TimelineItem }> = ({ item }) => {
  const alignmentClass =
    item.id % 2 === 0 ? "timeline-item--right" : "timeline-item--left";

  return (
    <div className={`timeline-item ${alignmentClass}`}>
      <div className="timeline-content">
        <Card className="p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <h3 className="text-xl font-bold text-foreground">
              {item.version}
            </h3>
            <div className="flex items-center text-sm text-default-500">
              <Calendar size={16} className="mr-1 text-default-400" />
              {item.date}
            </div>
          </div>
          <ul className="space-y-3">
            {item.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li key={index} className="flex items-start">
                  <Icon
                    size={18}
                    className={`flex-shrink-0 mt-0.5 mr-2 ${feature.color}`}
                  />
                  <p
                    className="text-default-700 leading-snug"
                    dangerouslySetInnerHTML={{ __html: feature.text }}
                  />
                </li>
              );
            })}
          </ul>
        </Card>
        <span className="dot"></span>
      </div>
    </div>
  );
};

interface PatchNotesProps {
  onNavigate: (page: string) => void;
}

const PatchNotes: React.FC<PatchNotesProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 ml-[5%] mr-[5%] py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="light"
            startContent={<ArrowLeft size={16} />}
            onClick={() => onNavigate("dashboard")}
            className="h-8 px-3 text-sm"
          >
            Go Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              TerrierTracker Patch Notes 📢
            </h1>
            <p className="text-default-500 mt-1">
              Check out the latest features, fixes, and improvements in our
              development roadmap.
            </p>
          </div>
        </div>
      </div>

      <div className="timeline">
        {patchNotesData.map((item) => (
          <TimelineCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default PatchNotes;
