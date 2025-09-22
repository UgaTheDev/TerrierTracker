import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'terriertracker'),
        user=os.getenv('DB_USER', 'your_username'),
        password=os.getenv('DB_PASSWORD', '')
    )
    print("Database connection successful!")
    
    cur = conn.cursor()
    cur.execute("SELECT * FROM userinfo;")
    rows = cur.fetchall()
    print(f"Current records in userinfo: {rows}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Database connection failed: {e}")