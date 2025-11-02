import os
import psycopg2
from urllib.parse import urlparse

def setup_database():
    supabase_url = os.environ.get("SUPABASE_URL")
    
    if not supabase_url:
        print("ERROR: SUPABASE_URL not found")
        return False
    
    db_url = supabase_url.replace("https://", "postgresql://postgres:")
    password = os.environ.get("SUPABASE_KEY")
    parsed = urlparse(supabase_url)
    host = parsed.netloc
    
    connection_string = f"postgresql://postgres.{host.split('.')[0]}:{password}@{host}:5432/postgres"
    
    print(f"Attempting to connect to database...")
    
    try:
        conn = psycopg2.connect(connection_string)
        cur = conn.cursor()
        
        print("Connected successfully!")
        print("Reading database schema...")
        
        with open('/home/runner/workspace/backend/database_schema.sql', 'r') as f:
            schema_sql = f.read()
        
        print("Executing schema creation...")
        cur.execute(schema_sql)
        conn.commit()
        
        print("✅ Database schema created successfully!")
        
        print("\nDisabling Row Level Security...")
        cur.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
        cur.execute("ALTER TABLE animals DISABLE ROW LEVEL SECURITY;")
        cur.execute("ALTER TABLE observations DISABLE ROW LEVEL SECURITY;")
        cur.execute("ALTER TABLE emergency_alerts DISABLE ROW LEVEL SECURITY;")
        conn.commit()
        
        print("✅ Row Level Security disabled!")
        
        print("\nCreating admin user...")
        cur.execute("""
            INSERT INTO users (email, name, password_hash, role)
            VALUES (
                'admin@zoo.com',
                'Admin User',
                '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5jtI7pJBtQwGS',
                'admin'
            )
            ON CONFLICT (email) DO NOTHING;
        """)
        conn.commit()
        
        print("✅ Admin user created!")
        print("\nLogin credentials:")
        print("  Email: admin@zoo.com")
        print("  Password: password123")
        print("\n⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!")
        
        cur.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"\nConnection string format: {connection_string.split(':')[0]}://...")
        return False

if __name__ == "__main__":
    setup_database()
