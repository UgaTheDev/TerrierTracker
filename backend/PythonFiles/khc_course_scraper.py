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
    url = f"https://www.bu.edu/academics/khc/courses/{page_num}/"
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        courses = []
        for course in soup.select('ul.course-feed li'):
            course_data = {req: 0 for req in ['code', 'name'] + hub_requirements}
            title = course.find('a')
            if title:
                title_text = title.get_text(strip=True)
                if ':' in title_text:
                    course_data['code'], course_data['name'] = [x.strip() for x in title_text.split(':', 1)]
                else:
                    course_data['code'] = title_text.strip()
            
            hub_div = course.find('div', class_='cf-hub-ind')
            if hub_div:
                for item in hub_div.select('ul.cf-hub-offerings li'):
                    req = item.get_text(strip=True)
                    if req == "Scientific Inquiry II or Social Inquiry II":
                        course_data['Scientific Inquiry II'] = 1
                        course_data['Social Inquiry II'] = 1
                    elif req in hub_requirements:
                        course_data[req] = 1
            
            courses.append(course_data)
        
        return courses
    
    except Exception as e:
        print(f"Error scraping page {page_num}: {str(e)}")
        return []

def main():
    all_courses = []
    total_pages = 4 
    
    print(f"Starting KHC Hub course scraping (pages 1-{total_pages})...")
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(scrape_page, page_num) for page_num in range(1, total_pages+1)]
        
        for i, future in enumerate(futures, 1):
            result = future.result()
            if result:
                all_courses.extend(result)
                print(f"Page {i}: Scraped {len(result)} courses")
            else:
                print(f"Page {i}: No courses found")
            time.sleep(1) 
    
    if all_courses:
        with open('khc_hub_courses.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['code', 'name'] + hub_requirements)
            writer.writeheader()
            writer.writerows(all_courses)
        print(f"\nSuccess! Saved {len(all_courses)} KHC Hub courses to khc_hub_courses.csv")
        
        print("\nSample course:")
        sample = all_courses[0]
        print(f"Code: {sample['code']}")
        print(f"Name: {sample['name']}")
        print("Hub Requirements:")
        for req in hub_requirements:
            if sample[req] == 1:
                print(f"- {req}")
    else:
        print("\nNo courses were scraped. Please check:")
        print("1. Internet connection")
        print("2. Website availability")
        print("3. HTML structure changes")

if __name__ == "__main__":
    main()