import React, { useState, useEffect } from "react";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  Filter,
} from "lucide-react";

export default function HubHelper() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const majors = [
    { id: "cs", name: "Computer Science", school: "CAS" },
    { id: "math", name: "Mathematics", school: "CAS" },
    { id: "bio", name: "Biology", school: "CAS" },
    { id: "econ", name: "Economics", school: "CAS" },
    { id: "eng", name: "Engineering", school: "ENG" },
    { id: "psych", name: "Psychology", school: "CAS" },
    { id: "hist", name: "History", school: "CAS" },
    { id: "chem", name: "Chemistry", school: "CAS" },
  ];

  const mockCourses = [
    {
      id: "cas-cs-131",
      code: "CAS CS 131",
      name: "Combinatoric Structures",
      hubRequirements: ["Quantitative Reasoning II", "Mathematical Modeling"],
      school: "CAS",
      credits: 4,
      description:
        "Introduction to combinatorial analysis and discrete mathematics.",
    },
    {
      id: "cas-cs-132",
      code: "CAS CS 132",
      name: "Geometric Algorithms",
      hubRequirements: [
        "Quantitative Reasoning II",
        "Digital/Multimedia Expression",
      ],
      school: "CAS",
      credits: 4,
      description:
        "Computational geometry and algorithmic approaches to geometric problems.",
    },
    {
      id: "cas-ma-121",
      code: "CAS MA 121",
      name: "Calculus I",
      hubRequirements: ["Quantitative Reasoning II"],
      school: "CAS",
      credits: 4,
      description:
        "Differential and integral calculus of functions of one variable.",
    },
    {
      id: "cas-bi-108",
      code: "CAS BI 108",
      name: "Introduction to Biology",
      hubRequirements: ["Scientific Inquiry I", "Scientific Inquiry II"],
      school: "CAS",
      credits: 4,
      description:
        "Fundamental principles of biology including cell structure and function.",
    },
    {
      id: "cas-ec-101",
      code: "CAS EC 101",
      name: "Introductory Microeconomics",
      hubRequirements: ["Social Inquiry I", "Quantitative Reasoning I"],
      school: "CAS",
      credits: 4,
      description: "Introduction to microeconomic theory and market analysis.",
    },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    setTimeout(() => {
      const results = mockCourses.filter(
        (course) =>
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleMajorChange = (majorId) => {
    setSelectedMajor(majorId);

    const major = majors.find((m) => m.id === majorId);
    if (major) {
      const courses = mockCourses
        .filter((course) => course.school === major.school)
        .slice(0, 3);
      setRecommendedCourses(courses);
    } else {
      setRecommendedCourses([]);
    }
  };

  const toggleBookmark = (courseId) => {
    setBookmarkedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const isBookmarked = (courseId) => bookmarkedCourses.includes(courseId);

  const CourseCard = ({ course }) => (
    <div className="bg-gray border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
          <p className="text-gray-700 font-medium">{course.name}</p>
        </div>
        <button
          onClick={() => toggleBookmark(course.id)}
          className={`p-2 rounded-full transition-colors ${
            isBookmarked(course.id)
              ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
              : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
          }`}
        >
          {isBookmarked(course.id) ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">{course.description}</p>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Hub Requirements:
        </p>
        <div className="flex flex-wrap gap-2">
          {course.hubRequirements.map((req, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {req}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{course.credits} credits</span>
        <span>{course.school}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Hub Helper</h1>
      <p className="text-gray-600 mb-8">
        Find courses that fulfill your hub requirements and bookmark them for
        easy reference.
      </p>

      <div className="bg-gray rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Course Search</h2>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by course ID (e.g., CAS CS 131) or name (e.g., Combinatoric Structures)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No courses found for "{searchQuery}"</p>
            <p className="text-sm">
              Try searching by course code or course name
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold">Recommendations by Major</h2>
        </div>

        <div className="mb-6">
          <label
            htmlFor="major-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select your major:
          </label>
          <select
            id="major-select"
            value={selectedMajor}
            onChange={(e) => handleMajorChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray min-w-64"
          >
            <option value="">Choose your major...</option>
            {majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.name} ({major.school})
              </option>
            ))}
          </select>
        </div>

        {selectedMajor && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-green-600" />
              <h3 className="text-lg font-medium">
                Recommended courses for{" "}
                {majors.find((m) => m.id === selectedMajor)?.name}
              </h3>
            </div>

            {recommendedCourses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Loading recommendations...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {bookmarkedCourses.length > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkCheck className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">
              Bookmarked Courses ({bookmarkedCourses.length})
            </h3>
          </div>
          <p className="text-yellow-700 text-sm">
            You have bookmarked {bookmarkedCourses.length} course
            {bookmarkedCourses.length !== 1 ? "s" : ""}. These will be saved for
            easy reference when planning your schedule.
          </p>
        </div>
      )}
    </div>
  );
}
