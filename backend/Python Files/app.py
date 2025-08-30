from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
# Import your CourseDataManager
from your_course_manager_file import CourseDataManager

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize your course manager
course_manager = CourseDataManager(Path('CSV Files/bu_hub_courses.csv'))

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "BU Course API"})

@app.route('/api/search-course', methods=['POST'])
def search_course():
    data = request.json
    course_identifier = data.get('course_identifier', '')
    
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

@app.route('/api/multiple-courses', methods=['POST'])
def multiple_courses():
    data = request.json
    courses = data.get('courses', [])
    
    results, hub_req_set = CourseDataManager.print_multiple_hub_requirements(courses)
    return jsonify({
        "results": results,
        "unique_hubs": list(hub_req_set),
        "total_unique_hubs": len(hub_req_set)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)