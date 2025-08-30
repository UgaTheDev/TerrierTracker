import csv
from typing import Dict, List, Optional, Set
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourseDataManager:
    """Manages course data loading, caching, and searching operations."""
    
    def __init__(self, csv_path: Path):
        self.csv_path = csv_path
        self._course_code_to_name: Dict[str, str] = {}  # code -> name
        self._course_name_to_code: Dict[str, str] = {}  # name -> code
        self._hub_requirements_cache: Dict[str, Set[str]] = {}  # hub -> courses
        self._course_to_hubs_cache: Dict[str, List[str]] = {}  # course -> hubs
        self._data_loaded = False
    
    def _load_data(self) -> None:
        """Load and cache all course data from CSV."""
        if self._data_loaded:
            return
            
        try:
            with open(self.csv_path, 'r', encoding='utf-8') as file:
                reader = csv.reader(file)
                headers = next(reader)
                hub_columns = headers[2:]  # Skip course_code and course_name columns
                
                # Initialize hub requirements cache
                for hub in hub_columns:
                    self._hub_requirements_cache[hub] = set()
                
                # Process each course row
                for row in reader:
                    course_code = row[0].strip()
                    course_name = row[1].strip()
                    
                    # Cache course mappings separately
                    self._course_code_to_name[course_code.upper()] = course_name
                    self._course_name_to_code[course_name.upper()] = course_code
                    
                    # Process hub requirements for this course
                    course_hubs = []
                    for i, hub in enumerate(hub_columns):
                        if len(row) > i + 2 and row[i + 2] == '1':
                            self._hub_requirements_cache[hub].add(course_code)
                            course_hubs.append(hub)
                    
                    self._course_to_hubs_cache[course_code] = course_hubs
                
                self._data_loaded = True
                logger.info(f"Loaded {len(self._course_code_to_name)} courses with {len(hub_columns)} hub requirements")
                
        except FileNotFoundError:
            logger.error(f"CSV file not found at {self.csv_path}")
            raise
        except Exception as e:
            logger.error(f"Error loading course data: {e}")
            raise
    
    def find_course_code(self, search_term: str) -> Optional[str]:
        """Find course code by course code or name."""
        self._load_data()
        
        search_key = search_term.strip().upper()
        
        # Check if it's already a course code
        if search_key in self._course_code_to_name:
            return search_key
        
        # Check if it's a course name
        if search_key in self._course_name_to_code:
            return self._course_name_to_code[search_key]
        
        return None
    
    def get_hub_requirements_for_course(self, course_identifier: str) -> List[str]:
        """Get all hub requirements fulfilled by a course."""
        self._load_data()
        
        # First try to get the course code
        course_code = self.find_course_code(course_identifier)
        if not course_code:
            return []
        
        # Return cached hub requirements
        return self._course_to_hubs_cache.get(course_code, [])
    
    def get_courses_for_hub(self, hub_requirement: str) -> List[str]:
        """Get all courses that fulfill a specific hub requirement."""
        self._load_data()
        
        if hub_requirement in self._hub_requirements_cache:
            return sorted(list(self._hub_requirements_cache[hub_requirement]))
        return []
    
    def get_all_courses(self) -> Dict[str, str]:
        """Get all courses as {code: name} mapping."""
        self._load_data()
        return self._course_code_to_name.copy()
    
    def get_course_name(self, course_code: str) -> Optional[str]:
        """Get course name from course code."""
        self._load_data()
        return self._course_code_to_name.get(course_code.upper())

# Example usage:
if __name__ == "__main__":
    manager = CourseDataManager(Path('CSV Files/bu_hub_courses.csv'))
    
    # Test course name lookup
    course_code = manager.find_course_code('Combinatoric Structures')
    print(f"Course code for 'Combinatoric Structures': {course_code}")
    
    # Test hub requirements
    hub_reqs = manager.get_hub_requirements_for_course('CAS CS 131')
    print(f"Hub requirements for 'CAS CS 131': {hub_reqs}")
    
    # Test course code lookup
    code_lookup = manager.find_course_code('CAS CS 131')
    print(f"Course code lookup for 'CAS CS 131': {code_lookup}")
    
    # Test course name retrieval
    course_name = manager.get_course_name('CAS CS 131')
    print(f"Course name for 'CAS CS 131': {course_name}")