from flask import Flask, jsonify, request, Response
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
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import json
from datetime import datetime, timedelta

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
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent.absolute()

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin and (origin.endswith('.vercel.app') or origin == 'http://localhost:3000' or origin == 'http://localhost:5000'):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Max-Age'] = '3600'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 204

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        return conn
    except Exception as e:
        return None

active_users = {}
ACTIVITY_TIMEOUT = timedelta(minutes=5)

def cleanup_inactive_users():
    now = datetime.now()
    inactive_users = [user_id for user_id, last_active in active_users.items() if now - last_active > ACTIVITY_TIMEOUT]
    for user_id in inactive_users:
        del active_users[user_id]

def update_user_activity(user_id):
    active_users[user_id] = datetime.now()
    cleanup_inactive_users()

def get_online_users_count():
    cleanup_inactive_users()
    return len(active_users)

@app.route('/sitemap.xml', methods=['GET'])
def sitemap():
    return '', 404

@app.route('/robots.txt', methods=['GET'])
def robots():
    return '', 404

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    try:
        data = request.json
        token = data.get('credential')
        if not token:
            return jsonify({"error": "No credential provided"}), 400
        if not GOOGLE_CLIENT_ID:
            return jsonify({"error": "Server configuration error"}), 500
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        if not email:
            return jsonify({"error": "Email not found in token"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT user_id, email FROM userinfo WHERE email = %s', (email,))
            user = cur.fetchone()
            if user:
                user_id = user[0]
            else:
                cur.execute('INSERT INTO userinfo (email, password, first_name, last_name) VALUES (%s, %s, %s, %s) RETURNING user_id', (email, '', first_name, last_name))
                user_id = cur.fetchone()[0]
                conn.commit()
            return jsonify({'message': 'Login successful', 'user': {'id': user_id, 'email': email}, 'success': True}), 200
        finally:
            cur.close()
            conn.close()
    except ValueError:
        return jsonify({'error': 'Invalid token', 'success': False}), 401
    except Exception:
        return jsonify({'error': 'Authentication failed', 'success': False}), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT user_id FROM userinfo WHERE email = %s', (email,))
            if cur.fetchone():
                return jsonify({'error': 'User already exists'}), 400
            cur.execute('INSERT INTO userinfo (email, password, first_name, last_name) VALUES (%s, %s, %s, %s) RETURNING user_id', (email, hashed_password.decode('utf-8'), first_name, last_name))
            user_id = cur.fetchone()[0]
            conn.commit()
            return jsonify({'message': 'User created successfully', 'user_id': user_id, 'success': True}), 201
        finally:
            cur.close()
            conn.close()
    except Exception:
        return jsonify({'error': 'Registration failed', 'success': False}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT user_id, email, password FROM userinfo WHERE email = %s', (email,))
            user = cur.fetchone()
            if user and bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
                return jsonify({'message': 'Login successful', 'user': {'id': user[0], 'email': user[1]}, 'success': True}), 200
            else:
                return jsonify({'error': 'Invalid credentials', 'success': False}), 401
        finally:
            cur.close()
            conn.close()
    except Exception:
        return jsonify({'error': 'Login failed', 'success': False}), 500

@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "BU Course API is running!", "version": "2.0.0", "data_source": "PostgreSQL", "endpoints": {"health": "/api/health (GET)", "register": "/api/register (POST)", "login": "/api/login (POST)", "google_auth": "/api/auth/google (POST)", "search_course": "/api/search-course (POST)", "multiple_courses": "/api/multiple-courses (POST)", "bulk_hub_requirements": "/api/bulk-hub-requirements (POST)", "all_courses": "/api/all-courses (GET)", "process_pdf": "/api/process-pdf (POST)", "users_online": "/api/users/online (GET)", "user_heartbeat": "/api/users/heartbeat (POST)", "user_courses": "/api/user/<user_id>/courses (GET)", "add_enrolled": "/api/user/<user_id>/courses/enrolled (POST)", "remove_enrolled": "/api/user/<user_id>/courses/enrolled (DELETE)", "add_bookmarked": "/api/user/<user_id>/courses/bookmarked (POST)", "remove_bookmarked": "/api/user/<user_id>/courses/bookmarked (DELETE)"}})

@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = "connected"
    course_count = 0
    hub_count = 0
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute('SELECT COUNT(*) FROM courses')
            course_count = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM hub_requirements')
            hub_count = cur.fetchone()[0]
            cur.close()
            conn.close()
        else:
            db_status = "disconnected"
    except Exception:
        db_status = "error"
    return jsonify({"status": "healthy", "service": "BU Course API", "database_status": db_status, "data_source": "PostgreSQL", "total_courses": course_count, "total_hub_requirements": hub_count})

@app.route('/api/search-course', methods=['POST'])
def search_course():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        course_identifier = data.get('course_identifier', '')
        if not course_identifier:
            return jsonify({"error": "course_identifier is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            normalized_input = course_identifier.replace(' ', '').upper()
            cur.execute('SELECT c.id, c.code, c.name FROM courses c WHERE REPLACE(c.code, \' \', \'\') ILIKE %s LIMIT 1', (f'%{normalized_input}%',))
            course = cur.fetchone()
            if not course:
                return jsonify({"found": False, "course_code": None, "hub_requirements": []})
            course_id, course_code, course_name = course
            cur.execute('SELECT hr.name FROM hub_requirements hr JOIN course_hub_requirements chr ON hr.id = chr.hub_requirement_id WHERE chr.course_id = %s ORDER BY hr.display_order', (course_id,))
            hub_requirements = [row[0] for row in cur.fetchall()]
            return jsonify({"found": True, "course_code": course_code, "hub_requirements": hub_requirements})
        finally:
            cur.close()
            conn.close()
    except Exception:
        return jsonify({"error": "Search failed"}), 500

@app.route('/api/bulk-hub-requirements', methods=['POST'])
def bulk_hub_requirements():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        course_codes = data.get('course_codes', [])
        if not course_codes:
            return jsonify({"error": "course_codes array is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT c.code, hr.name FROM courses c JOIN course_hub_requirements chr ON c.id = chr.course_id JOIN hub_requirements hr ON chr.hub_requirement_id = hr.id WHERE c.code = ANY(%s) ORDER BY c.code, hr.display_order', (course_codes,))
            results = {}
            for code, hub_name in cur.fetchall():
                if code not in results:
                    results[code] = []
                results[code].append(hub_name)
            for code in course_codes:
                if code not in results:
                    results[code] = []
            return jsonify({"success": True, "results": results, "total_courses": len(results)})
        finally:
            cur.close()
            conn.close()
    except Exception:
        return jsonify({"error": "Bulk fetch failed"}), 500

@app.route('/api/all-courses', methods=['GET'])
def get_all_courses():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT code, name FROM courses ORDER BY code')
            all_courses = {row[0]: row[1] for row in cur.fetchall()}
            return jsonify({"courses": all_courses, "total_courses": len(all_courses)})
        finally:
            cur.close()
            conn.close()
    except Exception:
        return jsonify({"error": "Failed to fetch courses"}), 500

@app.route('/api/multiple-courses', methods=['POST'])
def multiple_courses():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        courses = data.get('courses', [])
        if not courses:
            return jsonify({"error": "courses array is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT c.code, hr.name FROM courses c JOIN course_hub_requirements chr ON c.id = chr.course_id JOIN hub_requirements hr ON chr.hub_requirement_id = hr.id WHERE c.code = ANY(%s) ORDER BY c.code, hr.display_order', (courses,))
            results = []
            hub_req_set = set()
            course_hubs = {}
            for code, hub_name in cur.fetchall():
                if code not in course_hubs:
                    course_hubs[code] = []
                course_hubs[code].append(hub_name)
                hub_req_set.add(hub_name)
            for course_code in courses:
                hubs = course_hubs.get(course_code, [])
                results.append({"course_code": course_code, "hub_requirements": hubs})
            return jsonify({"results": results, "unique_hubs": list(hub_req_set), "total_unique_hubs": len(hub_req_set)})
        finally:
            cur.close()
            conn.close()
    except Exception:
        return jsonify({"error": "Multiple courses fetch failed"}), 500

@app.route('/api/process-pdf', methods=['POST'])
def process_pdf():
    try:
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
        file = request.files['pdf_file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 400
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        try:
            from pdf_reader import raw_fetch_courses_info, fetch_semester
            from pypdf import PdfReader
            reader = PdfReader(temp_file_path)
            semester = fetch_semester(reader)
            courses = raw_fetch_courses_info(reader)
            conn = get_db_connection()
            if not conn:
                return jsonify({"error": "Database connection failed"}), 500
            cur = conn.cursor()
            try:
                course_results = []
                for course_info in courses:
                    course_code = course_info[0]
                    cur.execute('SELECT hr.name FROM courses c JOIN course_hub_requirements chr ON c.id = chr.course_id JOIN hub_requirements hr ON chr.hub_requirement_id = hr.id WHERE c.code = %s ORDER BY hr.display_order', (course_code,))
                    hub_requirements = [row[0] for row in cur.fetchall()]
                    course_result = {"course_code": course_code, "school": course_info[1], "department": course_info[2], "credits": course_info[3], "hub_requirements": hub_requirements, "semester": semester}
                    course_results.append(course_result)
                return jsonify({"success": True, "courses": course_results, "total_courses": len(course_results), "semester": semester})
            finally:
                cur.close()
                conn.close()
        finally:
            os.unlink(temp_file_path)
    except Exception:
        return jsonify({"error": "PDF processing failed"}), 500

@app.route('/api/user/<int:user_id>/courses', methods=['GET'])
def get_user_courses(user_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('SELECT enrolled_courses, bookmarked_courses FROM courseinfo WHERE user_id = %s', (user_id,))
        result = cur.fetchone()
        if result:
            return jsonify({'enrolled_courses': result[0] or [], 'bookmarked_courses': result[1] or []})
        else:
            return jsonify({'enrolled_courses': [], 'bookmarked_courses': []})
    except Exception:
        return jsonify({'error': 'Failed to fetch courses'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/enrolled', methods=['POST'])
def add_enrolled_course(user_id):
    try:
        data = request.json
        course_code = data.get('course_code')
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('INSERT INTO courseinfo (user_id, enrolled_courses, bookmarked_courses) VALUES (%s, ARRAY[%s], ARRAY[]::TEXT[]) ON CONFLICT (user_id) DO UPDATE SET enrolled_courses = array_append(courseinfo.enrolled_courses, %s) WHERE NOT (%s = ANY(courseinfo.enrolled_courses))', (user_id, course_code, course_code, course_code))
        conn.commit()
        return jsonify({'success': True, 'message': 'Course added'})
    except Exception:
        return jsonify({'error': 'Failed to add course'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/enrolled', methods=['DELETE'])
def remove_enrolled_course(user_id):
    try:
        data = request.json
        course_code = data.get('course_code')
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('UPDATE courseinfo SET enrolled_courses = array_remove(enrolled_courses, %s) WHERE user_id = %s', (course_code, user_id))
        conn.commit()
        return jsonify({'success': True, 'message': 'Course removed'})
    except Exception:
        return jsonify({'error': 'Failed to remove course'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/bookmarked', methods=['POST'])
def add_bookmarked_course(user_id):
    try:
        data = request.json
        course_code = data.get('course_code')
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('INSERT INTO courseinfo (user_id, enrolled_courses, bookmarked_courses) VALUES (%s, ARRAY[]::TEXT[], ARRAY[%s]) ON CONFLICT (user_id) DO UPDATE SET bookmarked_courses = array_append(courseinfo.bookmarked_courses, %s) WHERE NOT (%s = ANY(courseinfo.bookmarked_courses))', (user_id, course_code, course_code, course_code))
        conn.commit()
        return jsonify({'success': True, 'message': 'Course bookmarked'})
    except Exception:
        return jsonify({'error': 'Failed to bookmark course'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/bookmarked', methods=['DELETE'])
def remove_bookmarked_course(user_id):
    try:
        data = request.json
        course_code = data.get('course_code')
        if not course_code:
            return jsonify({"error": "course_code is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('UPDATE courseinfo SET bookmarked_courses = array_remove(bookmarked_courses, %s) WHERE user_id = %s', (course_code, user_id))
        conn.commit()
        return jsonify({'success': True, 'message': 'Bookmark removed'})
    except Exception:
        return jsonify({'error': 'Failed to remove bookmark'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/custom', methods=['GET'])
def get_custom_courses(user_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('SELECT custom_courses FROM courseinfo WHERE user_id = %s', (user_id,))
        result = cur.fetchone()
        if result and result[0]:
            return jsonify({'custom_courses': result[0], 'success': True})
        else:
            return jsonify({'custom_courses': [], 'success': True})
    except Exception:
        return jsonify({'error': 'Failed to fetch custom courses'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/custom', methods=['POST'])
def add_custom_course(user_id):
    try:
        data = request.json
        custom_course = [data.get('courseId'), data.get('courseName'), ' | '.join(data.get('hubRequirements', [])), data.get('credits', 4)]
        if not custom_course[0] or not custom_course[1]:
            return jsonify({"error": "courseId and courseName are required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT custom_courses FROM courseinfo WHERE user_id = %s', (user_id,))
            result = cur.fetchone()
            if result:
                existing_courses = result[0] if result[0] else []
                existing_courses.append(custom_course)
                cur.execute('UPDATE courseinfo SET custom_courses = %s::jsonb WHERE user_id = %s', (json.dumps(existing_courses), user_id))
            else:
                cur.execute('INSERT INTO courseinfo (user_id, enrolled_courses, bookmarked_courses, custom_courses) VALUES (%s, ARRAY[]::TEXT[], ARRAY[]::TEXT[], %s::jsonb)', (user_id, json.dumps([custom_course])))
            conn.commit()
            return jsonify({'success': True, 'message': 'Custom course added', 'course': custom_course})
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()
    except Exception:
        return jsonify({'error': 'Failed to add custom course'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/user/<int:user_id>/courses/custom/<course_id>', methods=['DELETE'])
def delete_custom_course(user_id, course_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('UPDATE courseinfo SET custom_courses = (SELECT jsonb_agg(elem) FROM jsonb_array_elements(custom_courses) elem WHERE elem->>0 != %s) WHERE user_id = %s', (course_id, user_id))
        conn.commit()
        return jsonify({'success': True, 'message': 'Custom course deleted'})
    except Exception:
        return jsonify({'error': 'Failed to delete custom course'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/edited', methods=['GET'])
def get_edited_courses(user_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('SELECT edited_courses FROM courseinfo WHERE user_id = %s', (user_id,))
        result = cur.fetchone()
        if result and result[0]:
            return jsonify({'edited_courses': result[0], 'success': True})
        else:
            return jsonify({'edited_courses': [], 'success': True})
    except Exception:
        return jsonify({'error': 'Failed to fetch edited courses'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/user/<int:user_id>/courses/edited', methods=['POST'])
def save_edited_course(user_id):
    try:
        data = request.json
        edited_course = [data.get('courseId'), data.get('courseName'), ' | '.join(data.get('hubRequirements', [])), data.get('credits', 4)]
        if not edited_course[0]:
            return jsonify({"error": "courseId is required"}), 400
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        try:
            cur.execute('SELECT edited_courses FROM courseinfo WHERE user_id = %s', (user_id,))
            result = cur.fetchone()
            if result:
                existing_edits = result[0] if result[0] else []
                existing_edits = [e for e in existing_edits if e[0] != edited_course[0]]
                existing_edits.append(edited_course)
                cur.execute('UPDATE courseinfo SET edited_courses = %s::jsonb WHERE user_id = %s', (json.dumps(existing_edits), user_id))
            else:
                cur.execute('INSERT INTO courseinfo (user_id, enrolled_courses, bookmarked_courses, custom_courses, edited_courses) VALUES (%s, ARRAY[]::TEXT[], ARRAY[]::TEXT[], \'[]\'::jsonb, %s::jsonb)', (user_id, json.dumps([edited_course])))
            conn.commit()
            return jsonify({'success': True, 'message': 'Course edit saved', 'course': edited_course})
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()
    except Exception:
        return jsonify({'error': 'Failed to save edited course'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/user/<int:user_id>/courses/edited/<course_id>', methods=['DELETE'])
def delete_edited_course(user_id, course_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cur = conn.cursor()
        cur.execute('UPDATE courseinfo SET edited_courses = (SELECT jsonb_agg(elem) FROM jsonb_array_elements(edited_courses) elem WHERE elem->>0 != %s) WHERE user_id = %s', (course_id, user_id))
        conn.commit()
        return jsonify({'success': True, 'message': 'Course edit removed'})
    except Exception:
        return jsonify({'error': 'Failed to remove edited course'}), 500
    finally:
        cur.close()
        conn.close()

@app.before_request
def track_user_activity():
    if request.path in ['/api/health', '/sitemap.xml', '/robots.txt']:
        return
    user_id = None
    if request.is_json and request.method in ['POST', 'PUT']:
        data = request.get_json(silent=True)
        if data:
            user_id = data.get('user_id')
    if not user_id:
        user_id = request.args.get('user_id')
    if user_id:
        try:
            update_user_activity(int(user_id))
        except (ValueError, TypeError):
            pass

@app.route('/api/users/online', methods=['GET'])
def get_online_users():
    count = get_online_users_count()
    return jsonify({'online_users': count, 'timestamp': datetime.now().isoformat()})

@app.route('/api/users/heartbeat', methods=['POST'])
def user_heartbeat():
    try:
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        update_user_activity(int(user_id))
        return jsonify({'success': True, 'online_users': get_online_users_count()})
    except Exception:
        return jsonify({'error': 'Heartbeat failed'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)