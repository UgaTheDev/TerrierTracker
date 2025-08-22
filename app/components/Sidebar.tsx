import { useState } from "react";
import { Card, Button, Divider, Avatar } from "@heroui/react";
import {
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Target,
  Bookmark,
} from "lucide-react";

export default function Sidebar() {
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
    },
    {
      id: "courses",
      label: "Courses",
      icon: <BookOpen size={20} />,
      expandable: true,
      submenu: [
        { id: "your-courses", label: "Your Courses", href: "/courses" },
        { id: "add-course", label: "Add Course", href: "/courses/add" },
      ],
    },
    {
      id: "hub-tracker",
      label: "Hub Tracker",
      icon: <Target size={20} />,
      href: "/hub-tracker",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: <Bookmark size={20} />,
      href: "/bookmarks",
    },
  ];

  const handleItemClick = (itemId) => {
    if (itemId === "courses") {
      setCoursesExpanded(!coursesExpanded);
    } else {
      setActiveItem(itemId);
    }
  };

  return (
    <Card className="h-screen w-72 rounded-none border-r border-default-200 bg-background/60 backdrop-blur-lg p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <Avatar
          src="/logo.png"
          alt="Terrier Tracker"
          className="w-8 h-8"
          fallback={
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
          }
        />
        <div>
          <h1 className="text-lg font-bold text-foreground">Terrier Tracker</h1>
          <p className="text-xs text-default-500">Course Management</p>
        </div>
      </div>

      <Divider className="mb-6" />
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={activeItem === item.id ? "flat" : "light"}
              color={activeItem === item.id ? "primary" : "default"}
              className="w-full justify-start h-12 px-4"
              startContent={item.icon}
              endContent={
                item.expandable ? (
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${
                      coursesExpanded ? "rotate-90" : ""
                    }`}
                  />
                ) : null
              }
              onPress={() => handleItemClick(item.id)}
            >
              <span className="flex-1 text-left">{item.label}</span>
            </Button>

            {/* Submenu for Courses */}
            {item.expandable && coursesExpanded && (
              <div className="ml-6 mt-2 space-y-1">
                {item.submenu?.map((subitem) => (
                  <Button
                    key={subitem.id}
                    variant={activeItem === subitem.id ? "flat" : "light"}
                    color={activeItem === subitem.id ? "primary" : "default"}
                    size="sm"
                    className="w-full justify-start h-10 px-4 text-sm"
                    onPress={() => setActiveItem(subitem.id)}
                  >
                    {subitem.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <Divider className="mb-4" />
        <div className="px-2 text-center">
          <p className="text-xs text-default-400">
            Built for Boston University Students
          </p>
        </div>
      </div>
    </Card>
  );
}
