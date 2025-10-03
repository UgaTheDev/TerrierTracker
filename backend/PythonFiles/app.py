from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import logging
import traceback
import os
import tempfile
from werkzeug.utils import secure_filename
import psycopg2
import bcrypt
from dotenv import load_dotenv
from urllib.parse import urlparse

from course_data_manager import CourseDataManager
load_dotenv()


database_url = os.getenv('DATABASE_URL')
if database_url:
    parsed_url = urlparse(database_url)

    os.environ['DB_HOST'] = parsed_url.hostname or ''
    os.environ['DB_PORT'] = str(parsed_url.port) if parsed_url.port else ''
    os.environ['DB_NAME'] = parsed_url.path.lstrip('/') if parsed_url.path else ''
    os.environ['DB_USER'] = parsed_url.username or ''
    os.environ['DB_PASSWORD'] = parsed_url.password or ''

app = Flask(__name__)

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    
    if origin and (
        origin.endswith('.vercel.app') or 
        origin == 'http://localhost:3000' or 
        origin == 'http://localhost:5000'
    ):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Max-Age'] = '3600'
    return response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent.absolute()
logger.info(f"Script directory: {SCRIPT_DIR}")

CSV_DIR = SCRIPT_DIR.parent / 'CSVFiles'
CSV_FILES = {
    'cas': CSV_DIR / 'cas_all_courses.csv',
    'khc': CSV_DIR / 'khc_hub_courses.csv',
    'cds': CSV_DIR / 'cds_all_courses.csv',
    'cfa': CSV_DIR / 'cfa_all_courses.csv',
    'com': CSV_DIR / 'com_all_courses.csv',
    'questrom': CSV_DIR / 'questrom_all_courses.csv',
    'sar': CSV_DIR / 'sar_all_courses.csv',
    'sha': CSV_DIR / 'sha_all_courses.csv',
    'wheelock': CSV_DIR / 'wheelock_all_courses.csv',
}

for name, path in CSV_FILES.items():
    logger.info(f"Looking for {name} CSV at: {path.absolute()}")

def get_db_connection():
    try:
        host = os.getenv('DB_HOST')
        port = os.getenv('DB_PORT')
        database = os.getenv('DB_NAME')
        user = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')

        logger.info(f"Trying DB connection with host={host}, port={port}, database={database}, user={user}")
        
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

course_manager = None
try:
    csv_files = []
    
    for name, path in CSV_FILES.items():
        if path.exists():
            csv_files.append(path)
            logger.info(f"Found {name} CSV: {path}")
        else:
            logger.warning(f"{name} CSV not found at: {path.absolute()}")
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {CSV_DIR}")
    
    course_manager = CourseDataManager(csv_files)
    logger.info(f"CourseDataManager initialized successfully with {len(csv_files)} CSV files")
    
except Exception as e:
    logger.error(f"Failed to initialize CourseDataManager: {e}")
    logger.error(f"Full traceback: {traceback.format_exc()}")
    
    logger.info("Current file structure:")
    logger.info(f"Script is in: {SCRIPT_DIR}")
    logger.info(f"Parent directory: {SCRIPT_DIR.parent}")
    logger.info(f"CSV directory: {CSV_DIR}")
    logger.info(f"CSV directory exists: {CSV_DIR.exists()}")
    
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

@app.route('/api/register', methods=['POST'])
def register():
    logger.info("Registration attempt started")
    try:
        data = request.json
        if not data:
            logger.warning("No JSON data provided for registration")
            return jsonify({"error": "No JSON data provided"}), 400
            
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        
        if not email or not password:
            logger.warning("Missing email or password in registration")
            return jsonify({"error": "Email and password are required"}), 400
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        conn = get_db_connection()
        if not conn:
            logger.error("Database connection failed during registration")
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        
        try:
            cur.execute('SELECT user_id FROM userinfo WHERE email = %s', (email,))
            if cur.fetchone():
                logger.info(f"Registration failed - user already exists: {email}")
                return jsonify({'error': 'User already exists'}), 400
            
            cur.execute(
                'INSERT INTO userinfo (email, password, first_name, last_name) VALUES (%s, %s, %s, %s) RETURNING user_id',
                (email, hashed_password.decode('utf-8'), first_name, last_name)
            )
            user_id = cur.fetchone()[0]
            
            conn.commit()
            logger.info(f"User registered successfully: {email} (ID: {user_id})")
            
            return jsonify({
                'message': 'User created successfully', 
                'user_id': user_id,
                'success': True
            }), 201
            
        finally:
            cur.close()
            conn.close()
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Registration failed', 'success': False}), 500

@app.route('/api/login', methods=['POST'])
def login():
    logger.info("Login attempt started")
    try:
        data = request.json
        if not data:
            logger.warning("No JSON data provided for login")
            return jsonify({"error": "No JSON data provided"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            logger.warning("Missing email or password in login")
            return jsonify({"error": "Email and password are required"}), 400
        
        conn = get_db_connection()
        if not conn:
            logger.error("Database connection failed during login")
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        
        try:
            cur.execute('SELECT user_id, email, password FROM userinfo WHERE email = %s', (email,))
            user = cur.fetchone()
            
            if user and bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
                logger.info(f"User logged in successfully: {email} (ID: {user[0]})")
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user[0],
                        'email': user[1]
                    },
                    'success': True
                }), 200
            else:
                logger.warning(f"Failed login attempt for: {email}")
                return jsonify({'error': 'Invalid credentials', 'success': False}), 401
                
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Login failed', 'success': False}), 500

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "BU Course API is running!",
        "version": "1.0.0",
        "data_sources": list(CSV_FILES.keys()),
        "endpoints": {
            "health": "/api/health (GET)",
            "register": "/api/register (POST)",
            "login": "/api/login (POST)",
            "search_course": "/api/search-course (POST)",
            "multiple_courses": "/api/multiple-courses (POST)",
            "bulk_hub_requirements": "/api/bulk-hub-requirements (POST)",
            "all_courses": "/api/all-courses (GET)",
            "process_pdf": "/api/process-pdf (POST)",
            "user_courses": "/api/user/<user_id>/courses (GET)",
            "add_enrolled": "/api/user/<user_id>/courses/enrolled (POST)",
            "remove_enrolled": "/api/user/<user_id>/courses/enrolled (DELETE)",
            "add_bookmarked": "/api/user/<user_id>/courses/bookmarked (POST)",
            "remove_bookmarked": "/api/user/<user_id>/courses/bookmarked (DELETE)"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = "connected"
    try:
        conn = get_db_connection()
        if conn:
            conn.close()
        else:
            db_status = "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    data_sources_status = {
        name: {
            "path": str(path),
            "exists": path.exists()
        }
        for name, path in CSV_FILES.items()
    }
    
    return jsonify({
        "status": "healthy", 
        "service": "BU Course API",
        "database_status": db_status,
        "course_manager_status": "ready" if course_manager else "not initialized",
        "script_directory": str(SCRIPT_DIR),
        "csv_directory": str(CSV_DIR),
        "data_sources": data_sources_status,
        "total_csv_files_loaded": len([name for name, path in CSV_FILES.items() if path.exists()]),
        "environment": {
            "db_host": os.getenv('DB_HOST', 'localhost'),
            "db_name": os.getenv('DB_NAME', 'not set'),
            "db_user": os.getenv('DB_USER', 'not set')
        }
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
        
        logger.info(f"Searching for course: {course_identifier}")
        course_code = course_manager.find_course_code(course_identifier)
        
        if not course_code:
            logger.info(f"Course not found: {course_identifier}")
            return jsonify({
                "found": False,
                "course_code": None,
                "hub_requirements": []
            })
        
        hub_requirements = course_manager.get_hub_requirements_for_course(course_code)
        logger.info(f"Found course {course_code} with {len(hub_requirements)} hub requirements")
        
        return jsonify({
            "found": True,
            "course_code": course_code,
            "hub_requirements": hub_requirements
        })
    
    except Exception as e:
        logger.error(f"Error in search_course: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/bulk-hub-requirements', methods=['POST'])
def bulk_hub_requirements():
    """Fetch hub requirements for multiple courses in one request"""
    if not course_manager:
        return jsonify({"error": "Course manager not initialized"}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        course_codes = data.get('course_codes', [])
        if not course_codes:
            return jsonify({"error": "course_codes array is required"}), 400
        
        logger.info(f"Bulk fetching hub requirements for {len(course_codes)} courses")
        
        results = {}
        for course_code in course_codes:
            try:
                hub_requirements = course_manager.get_hub_requirements_for_course(course_code)
                results[course_code] = hub_requirements
            except Exception as e:
                logger.error(f"Error fetching requirements for {course_code}: {e}")
                results[course_code] = []
        
        logger.info(f"Successfully fetched requirements for {len(results)} courses")
        return jsonify({
            "success": True,
            "results": results,
            "total_courses": len(results)
        })
    
    except Exception as e:
        logger.error(f"Error in bulk_hub_requirements: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/all-courses', methods=['GET'])
def get_all_courses():
    if not course_manager:
        return jsonify({"error": "Course manager not initialized"}), 500
    
    try:
        logger.info("Fetching all courses")
        all_courses = course_manager.get_all_courses()
        logger.info(f"Retrieved {len(all_courses)} courses")
        
        return jsonify({
            "courses": all_courses,
            "total_courses": len(all_courses),
            "data_sources": list(CSV_FILES.keys())
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
        
        logger.info(f"Processing multiple courses: {courses}")
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
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        logger.info(f"PDF saved to temporary file: {temp_file_path}")
        
        try:
            logger.info("Importing PDF processing functions...")
            from pdf_reader import raw_fetch_courses_info, fetch_semester
            from pypdf import PdfReader
            
            logger.info("Creating PDF reader...")
            reader = PdfReader(temp_file_path)
            logger.info(f"PDF has {len(reader.pages)} pages")
            
            logger.info("Extracting semester information...")
            semester = fetch_semester(reader)
            logger.info(f"Extracted semester: {semester}")
            
            logger.info("Extracting courses from PDF...")
            courses = raw_fetch_courses_info(reader)
            logger.info(f"Extracted {len(courses)} courses: {courses}")
            
            logger.info("Processing course requirements...")
            course_results = []
            for i, course_info in enumerate(courses):
                course_code = course_info[0]  
                logger.info(f"Processing course {i+1}/{len(courses)}: {course_code}")
                
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
            logger.info(f"Cleaning up temporary file: {temp_file_path}")
            os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        logger.error("=== PDF PROCESSING FAILED ===")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<int:user_id>/courses', methods=['GET'])
def get_user_courses(user_id):
    """Get user's enrolled and bookmarked courses"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        cur.execute(
            'SELECT enrolled_courses, bookmarked_courses FROM courseinfo WHERE user_id = %s',
            (user_id,)
        )
        result = cur.fetchone()
        
        if result:
            return jsonify({
                'enrolled_courses': result[0] or [],
                'bookmarked_courses': result[1] or []
            })
        else:
            
            return jsonify({
                'enrolled_courses': [],
                'bookmarked_courses': []
            })
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/enrolled', methods=['POST'])
def add_enrolled_course(user_id):
    """Add a course to enrolled_courses"""
    try:
        data = request.json
        course_code = data.get('course_code')
        
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
            
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        
        
        cur.execute('''
            INSERT INTO courseinfo (user_id, enrolled_courses, bookmarked_courses)
            VALUES (%s, ARRAY[%s], ARRAY[]::TEXT[])
            ON CONFLICT (user_id) 
            DO UPDATE SET enrolled_courses = array_append(courseinfo.enrolled_courses, %s)
            WHERE NOT (%s = ANY(courseinfo.enrolled_courses))
        ''', (user_id, course_code, course_code, course_code))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Course added'})
    except Exception as e:
        logger.error(f"Error adding enrolled course: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/enrolled', methods=['DELETE'])
def remove_enrolled_course(user_id):
    """Remove a course from enrolled_courses"""
    try:
        data = request.json
        course_code = data.get('course_code')
        
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
            
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        cur.execute(
            'UPDATE courseinfo SET enrolled_courses = array_remove(enrolled_courses, %s) WHERE user_id = %s',
            (course_code, user_id)
        )
        conn.commit()
        return jsonify({'success': True, 'message': 'Course removed'})
    except Exception as e:
        logger.error(f"Error removing enrolled course: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/bookmarked', methods=['POST'])
def add_bookmarked_course(user_id):
    """Add a course to bookmarked_courses"""
    try:
        data = request.json
        course_code = data.get('course_code')
        
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
            
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO courseinfo (user_id, enrolled_courses, bookmarked_courses)
            VALUES (%s, ARRAY[]::TEXT[], ARRAY[%s])
            ON CONFLICT (user_id) 
            DO UPDATE SET bookmarked_courses = array_append(courseinfo.bookmarked_courses, %s)
            WHERE NOT (%s = ANY(courseinfo.bookmarked_courses))
        ''', (user_id, course_code, course_code, course_code))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Course bookmarked'})
    except Exception as e:
        logger.error(f"Error adding bookmarked course: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/bookmarked', methods=['DELETE'])
def remove_bookmarked_course(user_id):
    """Remove a course from bookmarked_courses"""
    try:
        data = request.json
        course_code = data.get('course_code')
        
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
            
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor()
        cur.execute(
            'UPDATE courseinfo SET bookmarked_courses = array_remove(bookmarked_courses, %s) WHERE user_id = %s',
            (course_code, user_id)
        )
        conn.commit()
        return jsonify({'success': True, 'message': 'Bookmark removed'})
    except Exception as e:
        logger.error(f"Error removing bookmarked course: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()
        
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    logger.info(f"Database configuration: Host={os.getenv('DB_HOST', 'localhost')}, DB={os.getenv('DB_NAME', 'not set')}")
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)