from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import logging
import traceback
import os

from course_data_manager import CourseDataManager

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
logger.info(f"Script directory: {SCRIPT_DIR}")

# Navigate to the CSV file using absolute path
# From Python Files/ go up to frontend/ then into CSV Files/
CSV_PATH = SCRIPT_DIR.parent / 'CSVFiles' / 'bu_hub_courses.csv'

logger.info(f"Looking for CSV at: {CSV_PATH.absolute()}")

# Initialize your course manager
course_manager = None
try:
    if CSV_PATH.exists():
        course_manager = CourseDataManager(CSV_PATH)
        logger.info("CourseDataManager initialized successfully")
    else:
        raise FileNotFoundError(f"CSV file not found at: {CSV_PATH.absolute()}")
    
except Exception as e:
    logger.error(f"Failed to initialize CourseDataManager: {e}")
    logger.error(f"Full traceback: {traceback.format_exc()}")
    
    # Debug file structure
    logger.info("Current file structure:")
    logger.info(f"Script is in: {SCRIPT_DIR}")
    logger.info(f"Parent directory: {SCRIPT_DIR.parent}")
    logger.info(f"Looking for CSV at: {CSV_PATH}")
    logger.info(f"CSV exists: {CSV_PATH.exists()}")
    
    # List contents of relevant directories
    try:
        logger.info("Contents of parent directory:")
        for item in SCRIPT_DIR.parent.iterdir():
            logger.info(f"  {item.name} ({'dir' if item.is_dir() else 'file'})")
        
        csv_dir = SCRIPT_DIR.parent / 'CSV Files'
        if csv_dir.exists():
            logger.info("Contents of CSV Files directory:")
            for item in csv_dir.iterdir():
                logger.info(f"  {item.name}")
        else:
            logger.info("CSV Files directory does not exist")
    except Exception as debug_e:
        logger.error(f"Error listing directories: {debug_e}")
    
    course_manager = None

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "BU Course API is running!",
        "endpoints": {
            "health": "/api/health",
            "search_course": "/api/search-course (POST)",
            "multiple_courses": "/api/multiple-courses (POST)",
            "all_courses": "/api/all-courses (GET)"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "BU Course API",
        "course_manager_status": "ready" if course_manager else "not initialized",
        "script_directory": str(SCRIPT_DIR),
        "csv_path": str(CSV_PATH),
        "csv_exists": CSV_PATH.exists()
    })

@app.route('/api/search-course', methods=['POST'])
def search_course():
    if not course_manager:
        return jsonify({"error": "Course manager not initialized"}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        course_identifier = data.get('course_identifier', '')
        if not course_identifier:
            return jsonify({"error": "course_identifier is required"}), 400
        
        course_code = course_manager.find_course_code(course_identifier)
        
        if not course_code:
            return jsonify({
                "found": False,
                "course_code": None,
                "hub_requirements": []
            })
        
        hub_requirements = course_manager.get_hub_requirements_for_course(course_code)
        return jsonify({
            "found": True,
            "course_code": course_code,
            "hub_requirements": hub_requirements
        })
    
    except Exception as e:
        logger.error(f"Error in search_course: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/all-courses', methods=['GET'])
def get_all_courses():
    if not course_manager:
        return jsonify({"error": "Course manager not initialized"}), 500
    
    try:
        all_courses = course_manager.get_all_courses()
        return jsonify({
            "courses": all_courses,
            "total_courses": len(all_courses)
        })
    
    except Exception as e:
        logger.error(f"Error in get_all_courses: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/multiple-courses', methods=['POST'])
def multiple_courses():
    if not course_manager:
        return jsonify({"error": "Course manager not initialized"}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        courses = data.get('courses', [])
        if not courses:
            return jsonify({"error": "courses array is required"}), 400
        
        results, hub_req_set = course_manager.print_multiple_hub_requirements(courses)
        
        return jsonify({
            "results": results,
            "unique_hubs": list(hub_req_set),
            "total_unique_hubs": len(hub_req_set)
        })
    
    except Exception as e:
        logger.error(f"Error in multiple_courses: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)