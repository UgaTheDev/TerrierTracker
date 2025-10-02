import csv

TARGET_COLUMNS = [
    "Aesthetic Exploration",
    "Historical Consciousness"
]

def filter_courses(input_csv='cas_hub_courses.csv', output_csv='filtered_courses.csv'):
    filtered_courses = []    
    with open(input_csv, mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        for row in reader:
            count = sum(1 for col in TARGET_COLUMNS if row.get(col) == '1')
            
            if count >= 2:
                filtered_course = {
                    'code': row['code'],
                    'name': row['name'],
                    **{col: row[col] for col in TARGET_COLUMNS},
                    'matched_requirements_count': count
                }
                filtered_courses.append(filtered_course)
    if filtered_courses:
        with open(output_csv, mode='w', newline='', encoding='utf-8') as outfile:
            fieldnames = ['code', 'name'] + TARGET_COLUMNS + ['matched_requirements_count']
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(filtered_courses)
        
        print(f"Found {len(filtered_courses)} courses meeting the criteria.")
        print(f"Results saved to {output_csv}")
    else:
        print("No courses found meeting the criteria.")

def print_sample_results(csv_file='filtered_courses.csv', num_rows=5):
    """Prints a sample of the filtered results"""
    try:
        with open(csv_file, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            print("\nSample of filtered courses:")
            print("-" * 100)
            print(f"{'Code':<10}{'Course Name':<50}{' '.join(TARGET_COLUMNS):<50}Count")
            print("-" * 100)
            
            for i, row in enumerate(reader):
                if i >= num_rows:
                    break
                markers = ['✓' if row[col] == '1' else '✗' for col in TARGET_COLUMNS]
                print(f"{row['code']:<10}{row['name'][:45]:<45} {' '.join(markers):<50}{row['matched_requirements_count']}")
    
    except FileNotFoundError:
        print("No filtered courses file found. Run filter_courses() first.")
if __name__ == "__main__":
    filter_courses()
    print_sample_results()