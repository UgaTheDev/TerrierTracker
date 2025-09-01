const API_BASE_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const checkHealth = async () => {
  return apiRequest("/health", {
    method: "GET",
  });
};

export const getAllCourses = async () => {
  return apiRequest("/all-courses", {
    method: "GET",
  });
};

export const searchCourse = async (courseIdentifier) => {
  if (!courseIdentifier || typeof courseIdentifier !== "string") {
    throw new Error("Course identifier is required and must be a string");
  }

  return apiRequest("/search-course", {
    method: "POST",
    body: JSON.stringify({
      course_identifier: courseIdentifier.trim(),
    }),
  });
};

export const getMultipleCourseHubs = async (courses) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    throw new Error("Courses must be a non-empty array");
  }

  return apiRequest("/multiple-courses", {
    method: "POST",
    body: JSON.stringify({
      courses: courses,
    }),
  });
};

export const isApiAvailable = async () => {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    console.warn("API is not available:", error);
    return false;
  }
};
