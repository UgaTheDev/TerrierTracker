import { useState } from "react";
import { Card, Button, Divider, Avatar } from "@heroui/react";
import {
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Target,
  Bookmark,
} from "lucide-react";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const [coursesExpanded, setCoursesExpanded] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      page: "dashboard",
    },
    {
      id: "courses",
      label: "Courses",
      icon: <BookOpen size={20} />,
      expandable: true,
      submenu: [
        { id: "your-courses", label: "Your Courses", page: "your-courses" },
        { id: "add-course", label: "Add Course", page: "add-courses" },
      ],
    },
    {
      id: "hub-tracker",
      label: "Hub Tracker",
      icon: <Target size={20} />,
      page: "hub-tracker",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: <Bookmark size={20} />,
      page: "bookmarks",
    },
  ];

  const handleItemClick = (item) => {
    if (item.expandable) {
      setCoursesExpanded(!coursesExpanded);
    } else {
      onNavigate(item.page);
    }
  };

  const handleSubmenuClick = (submenuItem) => {
    onNavigate(submenuItem.page);
  };

  return (
    <Card className="h-screen w-72 rounded-none border-r border-default-200 bg-background/60 backdrop-blur-lg p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <Avatar
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCwX8PlKDGl3Zz5YsKZ3TL6ROXuebh89ZLm-Qa9q1zEchvK9BY5T6ppKEZCKLqcJD7gno&usqp=CAU"
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
              variant={currentPage === item.page ? "flat" : "light"}
              color={currentPage === item.page ? "primary" : "default"}
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
              onPress={() => handleItemClick(item)}
            >
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
            {item.expandable && coursesExpanded && (
              <div className="ml-6 mt-2 space-y-1">
                {item.submenu?.map((subitem) => (
                  <Button
                    key={subitem.id}
                    variant={currentPage === subitem.page ? "flat" : "light"}
                    color={currentPage === subitem.page ? "primary" : "default"}
                    size="sm"
                    className="w-full justify-start h-10 px-4 text-sm"
                    onPress={() => handleSubmenuClick(subitem)}
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
