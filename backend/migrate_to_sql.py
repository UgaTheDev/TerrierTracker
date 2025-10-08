from pathlib import Path
import pandas as pd
import psycopg2
import logging
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = 'postgresql://postgres:wTkDSMszeTqWQzlBRdAWQtdIxCURnYKI@nozomi.proxy.rlwy.net:37551/railway'

def get_db_connection():
    try:
        logger.info(f"Connecting using DATABASE_URL...")
        
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
        logger.info("✓ Database connection successful!")
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"❌ Database connection failed: {e}")
        logger.error("\nPlease check your DATABASE_URL is correct")
        return None
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        logger.error(f"Full error: {traceback.format_exc()}")
        return None

def create_tables(conn):
    cur = conn.cursor()
    
    try:
        logger.info("Checking if tables exist...")
        
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('courses', 'hub_requirements', 'course_hub_requirements')
        """)
        existing_tables = [row[0] for row in cur.fetchall()]
        
        if existing_tables:
            logger.info(f"Found existing tables: {existing_tables}")
            logger.info("Tables already exist, skipping creation")
        else:
            logger.info("No existing tables found")
        
        logger.info("Table setup complete!")
        
    except Exception as e:
        logger.error(f"Error checking tables: {e}")
        conn.rollback()
        raise
    finally:
        cur.close()

def migrate_csv_to_postgres():
    BACKEND_DIR = Path(__file__).parent.absolute()
    CSV_DIR = BACKEND_DIR / 'CSVFiles'
    
    logger.info("=" * 60)
    logger.info("STARTING CSV TO POSTGRESQL MIGRATION")
    logger.info("=" * 60)
    logger.info(f"Backend directory: {BACKEND_DIR}")
    logger.info(f"CSV directory: {CSV_DIR}")
    logger.info(f"CSV directory exists: {CSV_DIR.exists()}")
    
    if not CSV_DIR.exists():
        logger.error(f"CSV directory does not exist: {CSV_DIR}")
        logger.info("Please ensure CSVFiles folder is in the backend directory")
        return
    
    conn = get_db_connection()
    if not conn:
        logger.error("Failed to connect to database")
        logger.error("Please check your database credentials in the DB_CONFIG dictionary")
        return
    
    create_tables(conn)
    
    cur = conn.cursor()
    
    try:
        csv_files = list(CSV_DIR.glob('*_all_courses.csv'))
        
        if not csv_files:
            logger.error(f"No CSV files found matching pattern '*_all_courses.csv' in {CSV_DIR}")
            logger.info("\nListing contents of CSV directory:")
            if CSV_DIR.exists():
                for item in CSV_DIR.iterdir():
                    logger.info(f"  - {item.name}")
            return
        
        logger.info(f"\nFound {len(csv_files)} CSV files:")
        for csv_file in csv_files:
            logger.info(f"  ✓ {csv_file.name}")
        
        logger.info("\n" + "-" * 60)
        logger.info("READING CSV FILES")
        logger.info("-" * 60)
        all_courses = []
        for csv_path in csv_files:
            logger.info(f"Reading {csv_path.name}...")
            df = pd.read_csv(csv_path)
            logger.info(f"  ✓ Loaded {len(df)} courses from {csv_path.name}")
            all_courses.append(df)
        
        combined_df = pd.concat(all_courses, ignore_index=True)
        logger.info(f"\n✓ Total courses across all files: {len(combined_df)}")
        
        initial_count = len(combined_df)
        combined_df = combined_df.drop_duplicates(subset=['code'], keep='first')
        if len(combined_df) < initial_count:
            logger.info(f"✓ Removed {initial_count - len(combined_df)} duplicate courses")
        
        hub_columns = [col for col in combined_df.columns if col not in ['code', 'name']]
        logger.info(f"\n✓ Found {len(hub_columns)} hub requirement columns")
        
        logger.info("\n" + "-" * 60)
        logger.info("INSERTING HUB REQUIREMENTS")
        logger.info("-" * 60)
        for idx, hub_name in enumerate(hub_columns):
            cur.execute(
                'INSERT INTO hub_requirements (name, display_order) VALUES (%s, %s) ON CONFLICT (name) DO NOTHING',
                (hub_name, idx)
            )
        conn.commit()
        logger.info(f"✓ Inserted {len(hub_columns)} hub requirements")
        
        cur.execute('SELECT id, name FROM hub_requirements')
        hub_id_map = {name: id for id, name in cur.fetchall()}
        
        logger.info("\n" + "-" * 60)
        logger.info("INSERTING COURSES AND RELATIONSHIPS")
        logger.info("-" * 60)
        courses_inserted = 0
        courses_updated = 0
        relationships_inserted = 0
        
        for idx, row in combined_df.iterrows():
            code = row['code']
            name = row['name']
            
            parts = code.split()
            school = parts[0][:3] if parts else ''
            department = parts[1] if len(parts) > 1 else ''
            
            cur.execute('SELECT id FROM courses WHERE code = %s', (code,))
            existing = cur.fetchone()
            
            if existing:
                cur.execute(
                    '''UPDATE courses 
                       SET name = %s, school = %s, department = %s, updated_at = CURRENT_TIMESTAMP
                       WHERE code = %s
                       RETURNING id''',
                    (name, school, department, code)
                )
                course_id = cur.fetchone()[0]
                courses_updated += 1
                
                cur.execute('DELETE FROM course_hub_requirements WHERE course_id = %s', (course_id,))
            else:
                cur.execute(
                    '''INSERT INTO courses (code, name, school, department) 
                       VALUES (%s, %s, %s, %s) 
                       RETURNING id''',
                    (code, name, school, department)
                )
                course_id = cur.fetchone()[0]
                courses_inserted += 1
            
            for hub_name in hub_columns:
                try:
                    if pd.notna(row[hub_name]) and int(row[hub_name]) == 1:
                        hub_id = hub_id_map[hub_name]
                        cur.execute(
                            '''INSERT INTO course_hub_requirements (course_id, hub_requirement_id)
                               VALUES (%s, %s) ON CONFLICT DO NOTHING''',
                            (course_id, hub_id)
                        )
                        relationships_inserted += 1
                except (ValueError, TypeError):
                    continue
            if idx % 100 == 0 and idx > 0:
                conn.commit()
                logger.info(f"Progress: {idx}/{len(combined_df)} courses processed...")
        
        conn.commit()
        
        logger.info("\n" + "=" * 60)
        logger.info("MIGRATION COMPLETE!")
        logger.info("=" * 60)
        logger.info(f"✓ New courses inserted: {courses_inserted}")
        logger.info(f"✓ Existing courses updated: {courses_updated}")
        logger.info(f"✓ Total courses processed: {courses_inserted + courses_updated}")
        logger.info(f"✓ Hub requirement relationships created: {relationships_inserted}")
        
        logger.info("\n" + "-" * 60)
        logger.info("VERIFICATION")
        logger.info("-" * 60)
        
        cur.execute('SELECT COUNT(*) FROM courses')
        course_count = cur.fetchone()[0]
        logger.info(f"✓ Total courses in database: {course_count}")
        
        cur.execute('SELECT COUNT(*) FROM hub_requirements')
        hub_count = cur.fetchone()[0]
        logger.info(f"✓ Total hub requirements in database: {hub_count}")
        
        cur.execute('SELECT COUNT(*) FROM course_hub_requirements')
        relationship_count = cur.fetchone()[0]
        logger.info(f"✓ Total course-hub relationships in database: {relationship_count}")
        
        logger.info("\n" + "-" * 60)
        logger.info("SAMPLE DATA")
        logger.info("-" * 60)
        cur.execute('''
            SELECT c.code, c.name, COUNT(chr.hub_requirement_id) as hub_count
            FROM courses c
            LEFT JOIN course_hub_requirements chr ON c.id = chr.course_id
            GROUP BY c.code, c.name
            LIMIT 5
        ''')
        logger.info("First 5 courses:")
        for code, name, hub_count in cur.fetchall():
            logger.info(f"  - {code}: {name} ({hub_count} hub requirements)")
        
        logger.info("\n" + "=" * 60)
        logger.info("SUCCESS! Your data has been migrated to PostgreSQL")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error("\n" + "=" * 60)
        logger.error("MIGRATION FAILED!")
        logger.error("=" * 60)
        logger.error(f"Error: {e}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "CSV TO POSTGRESQL MIGRATION TOOL" + " " * 15 + "║")
    print("╚" + "=" * 58 + "╝")
    print("\nMake sure you have pandas installed: pip install pandas\n")
    
    migrate_csv_to_postgres()