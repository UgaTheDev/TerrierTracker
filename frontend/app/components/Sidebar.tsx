"use client";
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
  LogOut,
} from "lucide-react";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

export default function Sidebar({
  onNavigate,
  currentPage,
  onLogout,
}: SidebarProps) {
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [hubHelperExpanded, setHubHelperExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      expandable: true,
      submenu: [
        { id: "course-searcher", label: "Course Searcher", page: "hub-helper" },
        {
          id: "course-recommender",
          label: "Course Recommender",
          page: "recommender",
        },
      ],
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: <Bookmark size={20} />,
      page: "bookmarks",
    },
  ];

  const handleItemClick = (item: any) => {
    if (item.expandable) {
      if (isCollapsed) {
        setIsCollapsed(false);
        if (item.id === "courses") {
          setCoursesExpanded(true);
        } else if (item.id === "hub-helper") {
          setHubHelperExpanded(true);
        }
      } else {
        if (item.id === "courses") {
          setCoursesExpanded(!coursesExpanded);
        } else if (item.id === "hub-helper") {
          setHubHelperExpanded(!hubHelperExpanded);
        }
      }
    } else {
      onNavigate(item.page);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubmenuClick = (submenuItem: any) => {
    onNavigate(submenuItem.page);
    setIsMobileMenuOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setCoursesExpanded(false);
      setHubHelperExpanded(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-content1 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Card
        className={`
          h-screen rounded-none border-r border-default-200 bg-background/60 backdrop-blur-lg p-4 transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? "w-16" : "w-72"}
          fixed lg:static inset-y-0 left-0 z-40
          transform lg:transform-none
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div
          className="flex items-center gap-3 mb-8 px-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            onNavigate("dashboard");
            setIsMobileMenuOpen(false);
          }}
        >
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
          className={`hidden lg:flex ${isCollapsed ? "justify-center" : "justify-end"} mb-4`}
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

        <nav className="space-y-2 flex-1 overflow-y-auto">
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
                            (item.id === "courses" && coursesExpanded) ||
                            (item.id === "hub-helper" && hubHelperExpanded)
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                      ) : null
                    }
                    onPress={() => handleItemClick(item)}
                  >
                    <span className="flex-1 text-left">{item.label}</span>
                  </Button>
                  {item.expandable &&
                    ((item.id === "courses" && coursesExpanded) ||
                      (item.id === "hub-helper" && hubHelperExpanded)) &&
                    !isCollapsed && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subitem) => (
                          <Button
                            key={subitem.id}
                            variant={
                              currentPage === subitem.page ? "flat" : "light"
                            }
                            color={
                              currentPage === subitem.page
                                ? "primary"
                                : "default"
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

        <div className="mt-4">
          <Divider className="mb-4" />
          {isCollapsed ? (
            <Tooltip content="Logout" placement="right" delay={300}>
              <Button
                isIconOnly
                variant="light"
                color="danger"
                className="w-full h-12"
                onPress={onLogout}
              >
                <LogOut size={20} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="light"
              color="danger"
              className="w-full justify-start h-12 px-4"
              startContent={<LogOut size={20} />}
              onPress={onLogout}
            >
              <span className="flex-1 text-left">Logout</span>
            </Button>
          )}
        </div>

        {!isCollapsed && (
          <div className="mt-4 pt-4">
            <Divider className="mb-4" />
            <div className="px-2 text-center">
              <p className="text-xs text-default-400">
                Built for Boston University Students Developed by Kush Zingade
              </p>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
