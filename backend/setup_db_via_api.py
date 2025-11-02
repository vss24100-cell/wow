import os
import requests

def setup_via_sql_api():
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
        return False
    
    print("📝 Reading SQL file...")
    with open('/home/runner/workspace/backend/SETUP_DATABASE.sql', 'r') as f:
        sql_content = f.read()
    
    print("🔑 Using Supabase REST API to execute SQL...")
    print(f"   URL: {supabase_url}")
    
    sql_endpoint = f"{supabase_url}/rest/v1/rpc/exec_sql"
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "query": sql_content
    }
    
    try:
        response = requests.post(sql_endpoint, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("✅ Database setup successful!")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("SUPABASE DATABASE SETUP")
    print("=" * 60)
    
    print("\n⚠️  IMPORTANT: You need to run the SQL manually in Supabase")
    print("=" * 60)
    print("\nHere's what to do:")
    print("1. Go to: https://supabase.com/dashboard/project/eogegrjpexfgverjnfcc/sql")
    print("2. Click 'New Query'")
    print("3. Copy content from: backend/SETUP_DATABASE.sql")
    print("4. Paste it in the SQL editor")
    print("5. Click 'Run' (or press Ctrl+Enter)")
    print("\n" + "=" * 60)
    print("After running, you can login with:")
    print("  Email: admin@zoo.com")
    print("  Password: password123")
    print("=" * 60)
