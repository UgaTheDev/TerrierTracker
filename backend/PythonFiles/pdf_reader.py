from pypdf import PdfReader
from course_data_manager import CourseDataManager
from pathlib import Path

def fetch_semester(reader):
    """Extract semester information from the PDF"""
    try:
        page = reader.pages[0]
        for row in page.extract_text().split("\n"):
            if "Fall" in row or "Spring" in row or "Summer" in row:
                semester = row[36:] if len(row) > 36 else row.strip()
                return semester.strip()
    except Exception as e:
        print(f"Error extracting semester: {e}")
    return "Unknown Semester"

def raw_fetch_courses_info(reader):
    """Extract course information from all pages of the PDF"""
    courses = []
    
    try:
        for i in range(len(reader.pages)):
            page = reader.pages[i]
            text_lines = page.extract_text().split("\n")
            
            for j, row in enumerate(text_lines):
                if ("CAS" in row or "KHC" in row) and "Room" not in row and len(row) > 10:
                    try:
                        school = row[0:3]
                        dept = row[3:5] if len(row) > 5 else ""
                        course_code = row[3:10] if len(row) > 10 else row[3:]
                        full_course_code = school + " " + course_code
                        course_entry = [full_course_code, school, dept, ""]
                        for k in range(j + 1, min(j + 5, len(text_lines))):
                            if k < len(text_lines) and "Units" in text_lines[k]:
                                try:
                                    
                                    if len(text_lines[k]) > 8:
                                        credits = text_lines[k][8]
                                        if credits.isdigit() and credits != "0":
                                            course_entry[3] = credits
                                            courses.append(course_entry)
                                            break
                                except (IndexError, ValueError):
                                    
                                    courses.append(course_entry)
                                    break
                        else:
                            course_entry[3] = "4" 
                            courses.append(course_entry)
                            
                    except (IndexError, ValueError) as e:
                        print(f"Error processing course line: {row}, Error: {e}")
                        continue
    
    except Exception as e:
        print(f"Error processing PDF: {e}")
    
    return courses

def find_course_requirements(courses):
    """Find hub requirements for a list of courses"""
    results = []
    
    for course in courses:
        course_code = course[0]  # Full course code like "CAS CS111"
        school = course[1]
        
        try:
            csv_path = None
            if school == "CAS":
                csv_path = "../CSVFiles/bu_all_courses.csv"
            elif school == "KHC":
                csv_path = "../CSVFiles/khc_hub_courses.csv"
            
            if csv_path and Path(csv_path).exists():
                manager = CourseDataManager(Path(csv_path))
                requirements = manager.get_hub_requirements_for_course(course_code)
                results.append({
                    "course": course_code,
                    "requirements": requirements
                })
                print(f"{course_code}: {requirements}")
            else:
                print(f"No CSV file found for {school}")
                results.append({
                    "course": course_code,
                    "requirements": []
                })
                
        except Exception as e:
            print(f"Error finding requirements for {course_code}: {e}")
            results.append({
                "course": course_code,
                "requirements": []
            })
    
    return results

# For testing purposes
if __name__ == "__main__":
    try:
        reader = PdfReader("schedule.pdf")
        semester = fetch_semester(reader)
        print(f"Semester: {semester}")
        
        courses = raw_fetch_courses_info(reader)
        print(f"Found {len(courses)} courses:")
        for course in courses:
            print(course)
        
        requirements = find_course_requirements(courses)
        print("\nCourse Requirements:")
        for req in requirements:
            print(f"{req['course']}: {req['requirements']}")
            
    except FileNotFoundError:
        print("schedule.pdf not found. This is normal when running as a module.")