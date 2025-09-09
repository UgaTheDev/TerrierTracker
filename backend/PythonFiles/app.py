from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import logging
import traceback
import os
import tempfile
from werkzeug.utils import secure_filename

from course_data_manager import CourseDataManager

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
logger.info(f"Script directory: {SCRIPT_DIR}")

# Define paths for multiple CSV files
CSV_DIR = SCRIPT_DIR.parent / 'CSVFiles'
BU_ALL_COURSES_PATH = CSV_DIR / 'bu_all_courses.csv'
KHC_HUB_COURSES_PATH = CSV_DIR / 'khc_hub_courses.csv'

logger.info(f"Looking for BU all courses CSV at: {BU_ALL_COURSES_PATH.absolute()}")
logger.info(f"Looking for KHC hub courses CSV at: {KHC_HUB_COURSES_PATH.absolute()}")

# Initialize your course manager with multiple CSV files
course_manager = None
try:
    csv_files = []
    
    if BU_ALL_COURSES_PATH.exists():
        csv_files.append(BU_ALL_COURSES_PATH)
        logger.info(f"Found BU all courses CSV: {BU_ALL_COURSES_PATH}")
    else:
        logger.warning(f"BU all courses CSV not found at: {BU_ALL_COURSES_PATH.absolute()}")
    
    if KHC_HUB_COURSES_PATH.exists():
        csv_files.append(KHC_HUB_COURSES_PATH)
        logger.info(f"Found KHC hub courses CSV: {KHC_HUB_COURSES_PATH}")
    else:
        logger.warning(f"KHC hub courses CSV not found at: {KHC_HUB_COURSES_PATH.absolute()}")
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found. Checked: {BU_ALL_COURSES_PATH}, {KHC_HUB_COURSES_PATH}")
    
    # Initialize CourseDataManager with multiple CSV files
    # If CourseDataManager doesn't support multiple files, we'll need to modify it
    # For now, assuming it can take a list of files or we'll modify it
    course_manager = CourseDataManager(csv_files)
    logger.info(f"CourseDataManager initialized successfully with {len(csv_files)} CSV files")
    
except Exception as e:
    logger.error(f"Failed to initialize CourseDataManager: {e}")
    logger.error(f"Full traceback: {traceback.format_exc()}")
    
    # Debug file structure
    logger.info("Current file structure:")
    logger.info(f"Script is in: {SCRIPT_DIR}")
    logger.info(f"Parent directory: {SCRIPT_DIR.parent}")
    logger.info(f"CSV directory: {CSV_DIR}")
    logger.info(f"CSV directory exists: {CSV_DIR.exists()}")
    
    # List contents of relevant directories
    try:
        logger.info("Contents of parent directory:")
        for item in SCRIPT_DIR.parent.iterdir():
            logger.info(f"  {item.name} ({'dir' if item.is_dir() else 'file'})")
        
        if CSV_DIR.exists():
            logger.info("Contents of CSV Files directory:")
            for item in CSV_DIR.iterdir():
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
        "data_sources": ["bu_all_courses.csv", "khc_hub_courses.csv"],
        "endpoints": {
            "health": "/api/health",
            "search_course": "/api/search-course (POST)",
            "multiple_courses": "/api/multiple-courses (POST)",
            "all_courses": "/api/all-courses (GET)",
            "process_pdf": "/api/process-pdf (POST)"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    data_sources_status = {
        "bu_all_courses": {
            "path": str(BU_ALL_COURSES_PATH),
            "exists": BU_ALL_COURSES_PATH.exists()
        },
        "khc_hub_courses": {
            "path": str(KHC_HUB_COURSES_PATH),
            "exists": KHC_HUB_COURSES_PATH.exists()
        }
    }
    
    return jsonify({
        "status": "healthy", 
        "service": "BU Course API",
        "course_manager_status": "ready" if course_manager else "not initialized",
        "script_directory": str(SCRIPT_DIR),
        "csv_directory": str(CSV_DIR),
        "data_sources": data_sources_status
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
            "total_courses": len(all_courses),
            "data_sources": ["bu_all_courses.csv", "khc_hub_courses.csv"]
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

@app.route('/api/process-pdf', methods=['POST'])
def process_pdf():
    logger.info("=== PDF PROCESSING STARTED ===")
    
    if not course_manager:
        logger.error("Course manager not initialized")
        return jsonify({"error": "Course manager not initialized"}), 500
    
    try:
        # Check if a file was uploaded
        if 'pdf_file' not in request.files:
            logger.error("No PDF file in request")
            return jsonify({"error": "No PDF file provided"}), 400
        
        file = request.files['pdf_file']
        logger.info(f"Received file: {file.filename}")
        
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({"error": "File must be a PDF"}), 400
        
        # Create a temporary file to save the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        logger.info(f"PDF saved to temporary file: {temp_file_path}")
        
        try:
            # Import PDF processing functions
            logger.info("Importing PDF processing functions...")
            from pdf_reader import raw_fetch_courses_info, fetch_semester
            from pypdf import PdfReader
            
            logger.info("Creating PDF reader...")
            reader = PdfReader(temp_file_path)
            logger.info(f"PDF has {len(reader.pages)} pages")
            
            # Extract semester information
            logger.info("Extracting semester information...")
            semester = fetch_semester(reader)
            logger.info(f"Extracted semester: {semester}")
            
            # Extract courses from PDF
            logger.info("Extracting courses from PDF...")
            courses = raw_fetch_courses_info(reader)
            logger.info(f"Extracted {len(courses)} courses: {courses}")
            
            # Get requirements for each course
            logger.info("Processing course requirements...")
            course_results = []
            for i, course_info in enumerate(courses):
                course_code = course_info[0]  # e.g., "CAS CS111"
                logger.info(f"Processing course {i+1}/{len(courses)}: {course_code}")
                
                # Use your existing course manager to find requirements
                hub_requirements = course_manager.get_hub_requirements_for_course(course_code)
                logger.info(f"Found hub requirements for {course_code}: {hub_requirements}")
                
                course_result = {
                    "course_code": course_code,
                    "school": course_info[1],
                    "department": course_info[2],
                    "credits": course_info[3],
                    "hub_requirements": hub_requirements,
                    "semester": semester
                }
                course_results.append(course_result)
                logger.info(f"Added course result: {course_result}")
            
            logger.info(f"Final course results: {course_results}")
            
            response_data = {
                "success": True,
                "courses": course_results,
                "total_courses": len(course_results),
                "semester": semester
            }
            
            logger.info(f"Sending response: {response_data}")
            logger.info("=== PDF PROCESSING COMPLETED SUCCESSFULLY ===")
            
            return jsonify(response_data)
            
        finally:
            # Clean up the temporary file
            logger.info(f"Cleaning up temporary file: {temp_file_path}")
            os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        logger.error("=== PDF PROCESSING FAILED ===")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)