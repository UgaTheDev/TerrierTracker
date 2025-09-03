from pypdf import PdfReader
from course_data_manager import CourseDataManager
from pathlib import Path

reader = PdfReader("schedule.pdf")

def fetch_semester(reader):
    page = reader.pages[0]
    for row in page.extract_text().split("\n"):
        if "Fall" in row or "Spring" in row:
            break
    semester = row[36:]
    print(semester)

fetch_semester(reader)

def raw_fetch_courses_info(reader):
    courses = []
    for i in range(0, len(reader.pages)):
        page = reader.pages[i]
        for row in page.extract_text().split("\n"):
            if ("CAS" in row or "KHC" in row) and "Room" not in row:
                school = row[0:3]
                dept = row[3:5]
                course_code = row[3:10]
                print(school, dept, course_code, sep=", ")
                courses.append([school + " " + course_code, school, dept, ""])
            if "Units" in row:
                credits = row[8]
                if credits != "0":
                    courses[-1][3] = credits
                else:
                    courses.remove(courses[-1])
    print(courses)
    return courses

def find_course_requirements(courses):
    for i in courses:
        csv_path = None
        if i[1] == "CAS":
            csv_path = "../CSVFiles/bu_all_courses.csv"
        elif i[1] == "KHC": 
            csv_path = "../CSVFiles/khc_hub_courses.csv" 
        if csv_path: 
            m = CourseDataManager(Path(csv_path))
            requirements = m.get_hub_requirements_for_course(i[0])
            print(requirements)


