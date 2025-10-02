import requests
from bs4 import BeautifulSoup
import csv
from concurrent.futures import ThreadPoolExecutor
import time

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

def scrape_page(page_num):
    url = f"https://www.bu.edu/academics/sha/courses/{page_num}/"
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
                **{req: 0 for req in hub_requirements}
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
                        course_data['Scientific Inquiry II'] = 1
                        course_data['Social Inquiry II'] = 1
                    elif req in hub_requirements:
                        course_data[req] = 1
            
            if course_data['code']:
                courses.append(course_data)
        
        return courses
    except Exception as e:
        print(f"Error scraping page {page_num}: {e}")
        return []

def main():
    PAGES = 4
    all_courses = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(scrape_page, page_num) for page_num in range(1, PAGES + 1)]
        for i, future in enumerate(futures, 1):
            result = future.result()
            all_courses.extend(result)
            hub_count = sum(1 for course in result if any(course[req] == 1 for req in hub_requirements))
            print(f"Processed page {i}/{PAGES} - found {len(result)} total courses ({hub_count} with Hub requirements)")
            time.sleep(0.5)
    
    # Separate hub and non-hub courses
    hub_courses = [course for course in all_courses if any(course[req] == 1 for req in hub_requirements)]
    
    with open('sha_all_courses.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['code', 'name'] + hub_requirements
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for course in all_courses:
            writer.writerow(course)
    
    # Write hub courses only CSV
    with open('sha_hub_courses.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['code', 'name'] + hub_requirements
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for course in hub_courses:
            writer.writerow(course)
    
    print(f"\nScraping complete.")
    print(f"Saved {len(all_courses)} total courses to sha_all_courses.csv")
    print(f"Saved {len(hub_courses)} Hub courses to sha_hub_courses.csv")

if __name__ == "__main__":
    main()