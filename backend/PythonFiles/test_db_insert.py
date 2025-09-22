import psycopg2
import bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'terriertracker'),
        user=os.getenv('DB_USER', 'kushzingade'),
        password=os.getenv('DB_PASSWORD', '')
    )
    
    cur = conn.cursor()
    
    test_password = bcrypt.hashpw("testpass".encode('utf-8'), bcrypt.gensalt())
    cur.execute(
        'INSERT INTO userinfo (email, password, first_name, last_name) VALUES (%s, %s, %s, %s) RETURNING user_id',
        ('test@test.com', test_password.decode('utf-8'), 'Test', 'User')
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    
    print(f"Test insert successful! User ID: {user_id}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Database test failed: {e}")