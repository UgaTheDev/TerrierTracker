import { useState } from "react";
import { Card, Button, Divider, Avatar, Tooltip } from "@heroui/react";
import {
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Search,
  Bookmark,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      id: "hub-helper",
      label: "Hub Helper",
      icon: <Search size={20} />,
      page: "hub-helper",
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
      if (isCollapsed) {
        setIsCollapsed(false);
        setCoursesExpanded(true);
      } else {
        setCoursesExpanded(!coursesExpanded);
      }
    } else {
      onNavigate(item.page);
    }
  };

  const handleSubmenuClick = (submenuItem) => {
    onNavigate(submenuItem.page);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setCoursesExpanded(false);
    }
  };

  return (
    <Card
      className={`h-screen ${isCollapsed ? "w-16" : "w-72"} rounded-none border-r border-default-200 bg-background/60 backdrop-blur-lg p-4 transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center gap-3 mb-8 px-2">
        {!isCollapsed ? (
          <>
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
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">
                Terrier Tracker
              </h1>
              <p className="text-xs text-default-500">Course Manager</p>
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center">
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
          </div>
        )}
      </div>

      <div
        className={`flex ${isCollapsed ? "justify-center" : "justify-end"} mb-4`}
      >
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={toggleCollapse}
          className="min-w-8 w-8 h-8"
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </Button>
      </div>

      <Divider className="mb-6" />
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            {isCollapsed ? (
              <Tooltip content={item.label} placement="right" delay={300}>
                <Button
                  isIconOnly
                  variant={currentPage === item.page ? "flat" : "light"}
                  color={currentPage === item.page ? "primary" : "default"}
                  className="w-full h-12"
                  onPress={() => handleItemClick(item)}
                >
                  {item.icon}
                </Button>
              </Tooltip>
            ) : (
              <>
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
                {item.expandable && coursesExpanded && !isCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu?.map((subitem) => (
                      <Button
                        key={subitem.id}
                        variant={
                          currentPage === subitem.page ? "flat" : "light"
                        }
                        color={
                          currentPage === subitem.page ? "primary" : "default"
                        }
                        size="sm"
                        className="w-full justify-start h-10 px-4 text-sm"
                        onPress={() => handleSubmenuClick(subitem)}
                      >
                        {subitem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
      {!isCollapsed && (
        <div className="mt-auto pt-6">
          <Divider className="mb-4" />
          <div className="px-2 text-center">
            <p className="text-xs text-default-400">
              Built for Boston University Students Developed by Kush Zingade
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
