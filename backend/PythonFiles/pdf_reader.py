from pypdf import PdfReader
from course_data_manager import CourseDataManager
from pathlib import Path

def fetch_semester(reader):
    """Extract semester information from the PDF"""
    try:
        page = reader.pages[0]
        text_lines = page.extract_text().split("\n")
        
        for row in text_lines:
            if "Fall" in row or "Spring" in row or "Summer" in row:
                semester = row[36:] if len(row) > 36 else row.strip()
                return semester.strip()
    except Exception:
        pass
    return "Unknown Semester"

def raw_fetch_courses_info(reader):
    """Extract course information from all pages of the PDF - FIXED VERSION"""
    courses = []
    
    try:
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text_lines = page.extract_text().split("\n")
            
            for line_idx, line_text in enumerate(text_lines):
                contains_cas = "CAS" in line_text
                contains_khc = "KHC" in line_text
                no_room_keyword = "Room" not in line_text
                minimum_length = len(line_text) > 5  
                
                is_course_line = (contains_cas or contains_khc) and no_room_keyword and minimum_length
                
                if is_course_line:
                    try:
                        parts = line_text.split()
                        if len(parts) >= 2:
                            school_dept = parts[0]
                            course_num = parts[1]   
                            
                            school = school_dept[0:3] if len(school_dept) >= 3 else school_dept
                            dept = school_dept[3:] if len(school_dept) > 3 else ""
                            
                            full_course_code = f"{school} {dept} {course_num}"
                        else:
                            school = line_text[0:3]
                            dept = line_text[3:5] if len(line_text) > 5 else ""
                            course_code = line_text[3:10] if len(line_text) > 10 else line_text[3:]
                            full_course_code = school + " " + course_code
                        
                        course_entry = [full_course_code, school, dept, ""]
                        
                        units_found = False
                        for k in range(line_idx + 1, min(line_idx + 5, len(text_lines))):
                            if k < len(text_lines):
                                units_line = text_lines[k]
                                
                                if "Units" in units_line:
                                    units_found = True
                                    
                                    try:
                                        if len(units_line) > 8:
                                            credits = units_line[8]
                                            
                                            if credits.isdigit():
                                                if credits == "0":
                                                    break
                                                else:
                                                    course_entry[3] = credits
                                                    courses.append(course_entry)
                                                    break
                                    except (IndexError, ValueError):
                                        break
                            
                    except (IndexError, ValueError):
                        continue
    
    except Exception:
        pass
    
    return courses

def find_course_requirements(courses):
    """Find hub requirements for a list of courses"""
    results = []
    
    for course in courses:
        course_code = course[0]
        school = course[1]
        
        try:
            csv_path = None
            if school == "CAS":
                csv_path = "../CSVFiles/cas_all_courses.csv"
            elif school == "KHC":
                csv_path = "../CSVFiles/khc_hub_courses.csv"
            elif school == "CDS":
                csv_path = "../CSVFiles/cds_all_courses.csv"
            elif school == "CFA":
                csv_path = "../CSVFiles/cfa_all_courses.csv"
            elif school == "COM":
                csv_path = "../CSVFiles/com_all_courses.csv"
            elif school == "QST":
                csv_path = "../CSVFiles/questrom_all_courses.csv"
            elif school == "SAR":
                csv_path = "../CSVFiles/sar_all_courses.csv"
            elif school == "SHA":
                csv_path = "../CSVFiles/sha_all_courses.csv"
            elif school == "WED":
                csv_path = "../CSVFiles/wheelock_all_courses.csv"
            elif school == "ENG":
                csv_path = "../CSVFiles/eng_all_courses.csv"
            elif school == "CGS":
                csv_path = "../CSVFiles/cgs_all_courses.csv"
            elif school == "MET":
                csv_path = "../CSVFiles/met_all_courses.csv"
            elif school == "SPH":
                csv_path = "../CSVFiles/sph_all_courses.csv"
            
            if csv_path and Path(csv_path).exists():
                manager = CourseDataManager(Path(csv_path))
                requirements = manager.get_hub_requirements_for_course(course_code)
                results.append({
                    "course": course_code,
                    "requirements": requirements
                })
            else:
                results.append({
                    "course": course_code,
                    "requirements": []
                })
                
        except Exception:
            results.append({
                "course": course_code,
                "requirements": []
            })
    
    return results

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