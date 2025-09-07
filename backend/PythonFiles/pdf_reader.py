from pypdf import PdfReader
from course_data_manager import CourseDataManager
from pathlib import Path

def fetch_semester(reader):
    """Extract semester information from the PDF"""
    print("=== EXTRACTING SEMESTER ===")
    try:
        page = reader.pages[0]
        text_lines = page.extract_text().split("\n")
        print(f"First page has {len(text_lines)} lines of text")
        
        for i, row in enumerate(text_lines[:10]):  # Show first 10 lines
            print(f"Line {i}: '{row}'")
            
        for row in text_lines:
            if "Fall" in row or "Spring" in row or "Summer" in row:
                semester = row[36:] if len(row) > 36 else row.strip()
                print(f"Found semester line: '{row}' -> extracted: '{semester}'")
                return semester.strip()
                
        print("No semester found in any line")
    except Exception as e:
        print(f"Error extracting semester: {e}")
    return "Unknown Semester"

def raw_fetch_courses_info(reader):
    """Extract course information from all pages of the PDF - UPDATED VERSION"""
    print("=== EXTRACTING COURSES - NEW VERSION ===")
    courses = []
    
    try:
        print(f"PDF has {len(reader.pages)} pages")
        
        for page_num in range(len(reader.pages)):
            print(f"\n--- Processing page {page_num + 1} ---")
            page = reader.pages[page_num]
            text_lines = page.extract_text().split("\n")
            print(f"Page {page_num + 1} has {len(text_lines)} lines")
            
            # Show all lines to debug
            print("All lines on this page:")
            for line_idx, line_text in enumerate(text_lines):
                print(f"Line {line_idx}: '{line_text}'")
            
            print("\nLooking for course lines...")
            
            for line_idx, line_text in enumerate(text_lines):
                print(f"Checking line {line_idx}: '{line_text}' (length: {len(line_text)})")
                
                # NEW LOGIC - Check each condition separately  
                contains_cas = "CAS" in line_text
                contains_khc = "KHC" in line_text
                no_room_keyword = "Room" not in line_text
                minimum_length = len(line_text) > 5  # NEW: Changed from 10 to 5
                
                print(f"  - Contains CAS: {contains_cas}")
                print(f"  - Contains KHC: {contains_khc}")
                print(f"  - No Room keyword: {no_room_keyword}")
                print(f"  - Minimum length (>5): {minimum_length}")
                
                # Course detection logic
                is_course_line = (contains_cas or contains_khc) and no_room_keyword and minimum_length
                
                if is_course_line:
                    print(f"*** FOUND POTENTIAL COURSE LINE {line_idx}: '{line_text}' ***")
                    
                    try:
                        # Parse course code - handle format like "CASCS 131", "KHCST 111"
                        parts = line_text.split()
                        if len(parts) >= 2:
                            # First part contains school + department
                            school_dept = parts[0]  # e.g., "KHCST", "CASCS" 
                            course_num = parts[1]   # e.g., "111", "131"
                            
                            # Extract school code (first 3 characters)
                            school = school_dept[0:3] if len(school_dept) >= 3 else school_dept
                            # Extract department code (remaining characters)
                            dept = school_dept[3:] if len(school_dept) > 3 else ""
                            
                            print(f"Parsed: school='{school}', dept='{dept}', course_num='{course_num}'")
                            
                            # Create full course code in standard format: "SCHOOL DEPT COURSENUM"
                            full_course_code = f"{school} {dept} {course_num}"
                            print(f"Full course code: '{full_course_code}'")
                        else:
                            # Fallback to original parsing if split doesn't work
                            school = line_text[0:3]
                            dept = line_text[3:5] if len(line_text) > 5 else ""
                            course_code = line_text[3:10] if len(line_text) > 10 else line_text[3:]
                            full_course_code = school + " " + course_code
                            print(f"Fallback parsing: school='{school}', dept='{dept}', full='{full_course_code}'")
                        
                        # Initialize course entry
                        course_entry = [full_course_code, school, dept, ""]
                        print(f"Initial course entry: {course_entry}")
                        
                        # Look for Units in next few lines
                        print(f"Looking for Units in lines {line_idx+1} to {min(line_idx+5, len(text_lines))}...")
                        
                        for k in range(line_idx + 1, min(line_idx + 5, len(text_lines))):
                            if k < len(text_lines):
                                units_line = text_lines[k]
                                print(f"  Checking line {k}: '{units_line}'")
                                
                                if "Units" in units_line:
                                    print(f"*** FOUND UNITS LINE {k}: '{units_line}' ***")
                                    
                                    try:
                                        if len(units_line) > 8:
                                            credits = units_line[8]
                                            print(f"Credits at position 8: '{credits}'")
                                            
                                            if credits.isdigit() and credits != "0":
                                                course_entry[3] = credits
                                                courses.append(course_entry)
                                                print(f"*** ADDED COURSE: {course_entry} ***")
                                                break
                                            else:
                                                print(f"Credits '{credits}' is not valid (not digit or is 0)")
                                        else:
                                            print(f"Units line too short: {len(units_line)} chars")
                                    except (IndexError, ValueError) as e:
                                        print(f"Error extracting credits: {e}")
                                        courses.append(course_entry)
                                        print(f"*** ADDED COURSE WITHOUT CREDITS: {course_entry} ***")
                                        break
                        else:
                            # No Units line found, add with default credits
                            course_entry[3] = "4"
                            courses.append(course_entry)
                            print(f"*** NO UNITS FOUND, ADDED WITH DEFAULT 4 CREDITS: {course_entry} ***")
                            
                    except (IndexError, ValueError) as e:
                        print(f"Error processing course line: {line_text}, Error: {e}")
                        continue
                else:
                    print(f"  -> Not a course line")
    
    except Exception as e:
        print(f"Error processing PDF: {e}")
    
    print(f"\n=== COURSE EXTRACTION COMPLETE ===")
    print(f"Total courses found: {len(courses)}")
    for i, course in enumerate(courses):
        print(f"Final course {i + 1}: {course}")
    
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