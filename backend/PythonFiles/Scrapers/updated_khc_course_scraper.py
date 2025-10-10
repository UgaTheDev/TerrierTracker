import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import time
import psycopg2
from datetime import datetime

DATABASE_URL = 'postgresql://postgres:wTkDSMszeTqWQzlBRdAWQtdIxCURnYKI@nozomi.proxy.rlwy.net:37551/railway'

hub_requirements = [
    "Philosophical Inquiry and Life's Meanings",
    "Aesthetic Exploration",
    "Historical Consciousness",
    "Scientific Inquiry I",
    "Social Inquiry I",
    "Scientific Inquiry II",
    "Social Inquiry II",
    "Quantitative Reasoning I",
    "Quantitative Reasoning II",
    "The Individual in Community",
    "Global Citizenship and Intercultural Literacy",
    "Ethical Reasoning",
    "First-Year Writing Seminar",
    "Writing, Research, and Inquiry",
    "Writing-Intensive Course",
    "Oral and/or Signed Communication",
    "Digital/Multimedia Expression",
    "Critical Thinking",
    "Research and Information Literacy",
    "Teamwork/Collaboration",
    "Creativity/Innovation"
]

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def scrape_page(page_num):
    url = f"https://www.bu.edu/academics/khc/courses/{page_num}/"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        courses = []
        
        course_entries = soup.select('ul.course-feed li')
        
        for course in course_entries:
            course_data = {
                'code': '',
                'name': '',
                'hub_reqs': [] 
            }
            
            title_tag = course.find('a')
            if title_tag:
                title_text = title_tag.get_text(strip=True)
                parts = title_text.split(':', 1)
                if len(parts) == 2:
                    course_data['code'] = parts[0].strip()
                    course_data['name'] = parts[1].strip()
            
            hub_div = course.find('div', class_='cf-hub-ind')
            if hub_div:
                hub_items = hub_div.select('ul.cf-hub-offerings li')
                for item in hub_items:
                    req = item.get_text(strip=True)
                    if req == "Scientific Inquiry II or Social Inquiry II":
                        course_data['hub_reqs'].extend(['Scientific Inquiry II', 'Social Inquiry II'])
                    elif req in hub_requirements:
                        course_data['hub_reqs'].append(req)
            
            if course_data['code']:
                courses.append(course_data)
        
        return courses
    except Exception as e:
        print(f"Error scraping page {page_num}: {e}")
        return []

def save_to_database(all_courses):
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database")
        return
    
    cur = conn.cursor()
    
    try:
        cur.execute('SELECT id, name FROM hub_requirements')
        hub_id_map = {name: id for id, name in cur.fetchall()}
        
        courses_inserted = 0
        courses_updated = 0
        relationships_created = 0
        
        for idx, course in enumerate(all_courses, 1):
            code = course['code']
            name = course['name']
            
            parts = code.split()
            school = parts[0][:3] if parts else ''
            department = parts[1] if len(parts) > 1 else ''
            
            cur.execute('SELECT id FROM courses WHERE code = %s', (code,))
            existing = cur.fetchone()
            
            if existing:
                cur.execute('''
                    UPDATE courses 
                    SET name = %s, school = %s, department = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE code = %s
                    RETURNING id
                ''', (name, school, department, code))
                course_id = cur.fetchone()[0]
                courses_updated += 1
                
                cur.execute('DELETE FROM course_hub_requirements WHERE course_id = %s', (course_id,))
            else:
                cur.execute('''
                    INSERT INTO courses (code, name, school, department) 
                    VALUES (%s, %s, %s, %s) 
                    RETURNING id
                ''', (code, name, school, department))
                course_id = cur.fetchone()[0]
                courses_inserted += 1
            
            for hub_name in course['hub_reqs']:
                if hub_name in hub_id_map:
                    hub_id = hub_id_map[hub_name]
                    cur.execute('''
                        INSERT INTO course_hub_requirements (course_id, hub_requirement_id)
                        VALUES (%s, %s) ON CONFLICT DO NOTHING
                    ''', (course_id, hub_id))
                    relationships_created += 1
            
            if idx % 50 == 0:
                conn.commit()
                print(f"Processed {idx}/{len(all_courses)} courses...")
        
        conn.commit()
        
        print(f"\n{'='*60}")
        print(f"Database update complete!")
        print(f"Courses inserted: {courses_inserted}")
        print(f"Courses updated: {courses_updated}")
        print(f"Hub requirement relationships created: {relationships_created}")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"Error saving to database: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def main():
    PAGES = 4
    all_courses = []
    
    print(f"Starting to scrape {PAGES} pages...")
    print(f"{'='*60}\n")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(scrape_page, page_num) for page_num in range(1, PAGES + 1)]
        for i, future in enumerate(futures, 1):
            result = future.result()
            all_courses.extend(result)
            hub_count = sum(1 for course in result if course['hub_reqs'])
            print(f"Page {i}/{PAGES}: {len(result)} courses ({hub_count} with Hub requirements)")
            time.sleep(0.5)
    
    print(f"\n{'='*60}")
    print(f"Scraping complete! Found {len(all_courses)} total courses")
    print(f"{'='*60}\n")
    
    print("Saving to database...")
    save_to_database(all_courses)

if __name__ == "__main__":
    main()