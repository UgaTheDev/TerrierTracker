import csv
import logging
from pathlib import Path
from typing import Dict, List, Set, Union, Tuple, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourseDataManager:
    """Manages course data loading, caching, and searching operations from multiple CSV sources."""
    
    def __init__(self, csv_paths: Union[str, Path, List[Union[str, Path]]]):
        # Convert single path to list for uniform handling
        if isinstance(csv_paths, (str, Path)):
            csv_paths = [csv_paths]
        
        self.csv_paths = [Path(path) for path in csv_paths]
        self._course_code_to_name: Dict[str, str] = {}  # code -> name
        self._course_name_to_code: Dict[str, str] = {}  # name -> code
        self._hub_requirements_cache: Dict[str, Set[str]] = {}  # hub -> courses
        self._course_to_hubs_cache: Dict[str, List[str]] = {}  # course -> hubs
        self._course_to_source: Dict[str, str] = {}  # course -> source file
        self._data_loaded = False
        
        logger.info(f"Initialized CourseDataManager with {len(self.csv_paths)} CSV files")
    
    def _load_data(self) -> None:
        """Load and cache all course data from multiple CSV files."""
        if self._data_loaded:
            return
            
        all_hub_columns = set()
        
        # First pass: collect all unique hub columns from all files
        for csv_path in self.csv_paths:
            if not csv_path.exists():
                logger.warning(f"CSV file not found: {csv_path}")
                continue
                
            try:
                with open(csv_path, 'r', encoding='utf-8') as file:
                    reader = csv.reader(file)
                    headers = next(reader)
                    hub_columns = headers[2:]  # Assuming columns 0,1 are course code/name
                    all_hub_columns.update(hub_columns)
            except Exception as e:
                logger.error(f"Error reading headers from {csv_path}: {e}")
                continue
        
        # Initialize hub requirements cache
        for hub in all_hub_columns:
            self._hub_requirements_cache[hub] = set()
        
        # Second pass: load data from all files
        total_courses_loaded = 0
        for csv_path in self.csv_paths:
            if not csv_path.exists():
                continue
                
            try:
                with open(csv_path, 'r', encoding='utf-8') as file:
                    reader = csv.reader(file)
                    headers = next(reader)
                    hub_columns = headers[2:]
                    courses_in_file = 0
                    
                    for row in reader:
                        if len(row) < 2:
                            continue
                            
                        course_code = row[0].strip()
                        course_name = row[1].strip()
                        
                        if not course_code or course_code.startswith('0'):  
                            continue
                        
                        course_code_upper = course_code.upper()
                        course_name_upper = course_name.upper()
                        
                        if course_code_upper not in self._course_code_to_name:
                            self._course_code_to_name[course_code_upper] = course_name
                            self._course_name_to_code[course_name_upper] = course_code
                            self._course_to_source[course_code_upper] = csv_path.name
                            
                            # Process hub requirements
                            course_hubs = []
                            for i, hub in enumerate(hub_columns):
                                if len(row) > i + 2 and row[i + 2] == '1':
                                    self._hub_requirements_cache[hub].add(course_code)
                                    course_hubs.append(hub)
                            
                            self._course_to_hubs_cache[course_code_upper] = course_hubs
                            courses_in_file += 1
                        else:
                            # Course already exists, merge hub requirements if needed
                            existing_hubs = set(self._course_to_hubs_cache.get(course_code_upper, []))
                            new_hubs = set()
                            
                            for i, hub in enumerate(hub_columns):
                                if len(row) > i + 2 and row[i + 2] == '1':
                                    new_hubs.add(hub)
                                    self._hub_requirements_cache[hub].add(course_code)
                            
                            # Merge hub requirements
                            combined_hubs = existing_hubs.union(new_hubs)
                            self._course_to_hubs_cache[course_code_upper] = list(combined_hubs)
                    
                    logger.info(f"Loaded {courses_in_file} courses from {csv_path.name}")
                    total_courses_loaded += courses_in_file
                    
            except FileNotFoundError:
                logger.error(f"CSV file not found at {csv_path}")
                continue
            except Exception as e:
                logger.error(f"Error loading course data from {csv_path}: {e}")
                continue
        
        if total_courses_loaded == 0:
            raise ValueError("No courses could be loaded from any CSV files")
        
        self._data_loaded = True
        logger.info(f"Total unique courses loaded: {len(self._course_code_to_name)}")
        logger.info(f"Total hub requirements: {len(all_hub_columns)}")
    
    def find_course_code(self, search_term: str) -> Optional[str]:
        """Find course code by course code or name."""
        self._load_data()
        
        search_key = search_term.strip().upper()
        
        # Direct course code match
        if search_key in self._course_code_to_name:
            return search_key
        
        # Direct course name match
        if search_key in self._course_name_to_code:
            return self._course_name_to_code[search_key]
        
        return None
    
    def get_hub_requirements_for_course(self, course_identifier: str) -> List[str]:
        """Get all hub requirements fulfilled by a course."""
        self._load_data()
        
        course_code = self.find_course_code(course_identifier)
        if not course_code:
            return []
    
        return self._course_to_hubs_cache.get(course_code.upper(), [])
    
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
    
    def get_course_source(self, course_code: str) -> Optional[str]:
        """Get the source file for a course."""
        self._load_data()
        return self._course_to_source.get(course_code.upper())
    
    def print_multiple_hub_requirements(self, course_list: List[str]) -> Tuple[List[Dict], Set[str]]:
        """Get hub requirements for multiple courses."""
        self._load_data()
        
        results = []
        all_hub_requirements = set()
        
        for course in course_list:
            course_code = self.find_course_code(course)
            if course_code:
                hub_requirements = self.get_hub_requirements_for_course(course_code)
                results.append({
                    "course": course,
                    "standardized_code": course_code,
                    "hub_requirements": hub_requirements,
                    "found": True,
                    "source": self.get_course_source(course_code)
                })
                all_hub_requirements.update(hub_requirements)
            else:
                results.append({
                    "course": course,
                    "standardized_code": None,
                    "hub_requirements": [],
                    "found": False,
                    "source": None
                })
        
        return results, all_hub_requirements
    
    def get_data_source_info(self) -> Dict:
        """Get information about the data sources being used."""
        self._load_data()
        
        source_info = {}
        for csv_path in self.csv_paths:
            if csv_path.exists():
                # Count courses from each source
                course_count = sum(1 for source in self._course_to_source.values() if source == csv_path.name)
                source_info[csv_path.name] = {
                    'path': str(csv_path),
                    'courses_loaded': course_count,
                    'exists': True
                }
            else:
                source_info[csv_path.name] = {
                    'path': str(csv_path),
                    'courses_loaded': 0,
                    'exists': False
                }
        
        return source_info

if __name__ == "__main__":
    # Test with multiple CSV files
    csv_files = [
        Path('CSVFiles/bu_all_courses.csv'),
        Path('CSVFiles/khc_hub_courses.csv')
    ]
    
    # Filter to only existing files for testing
    existing_files = [f for f in csv_files if f.exists()]
    
    if not existing_files:
        # Fallback to original single file for testing
        existing_files = [Path('CSVFiles/bu_hub_courses.csv')]
    
    manager = CourseDataManager(existing_files)
    
    # Test data source info
    source_info = manager.get_data_source_info()
    print(f"Data source info: {source_info}")
    
    course_code = manager.find_course_code('Combinatoric Structures')
    print(f"Course code for 'Combinatoric Structures': {course_code}")
    
    hub_reqs = manager.get_hub_requirements_for_course('CAS CS 131')
    print(f"Hub requirements for 'CAS CS 131': {hub_reqs}")
    
    code_lookup = manager.find_course_code('CAS CS 131')
    print(f"Course code lookup for 'CAS CS 131': {code_lookup}")
    
    course_name = manager.get_course_name('CAS CS 131')
    print(f"Course name for 'CAS CS 131': {course_name}")
    
    source = manager.get_course_source('CAS CS 131')
    print(f"Source file for 'CAS CS 131': {source}")