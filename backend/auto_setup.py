#!/usr/bin/env python3
import os
import sys

print("=" * 70)
print("ZOOCARE DATABASE AUTO-SETUP")
print("=" * 70)

# Check environment variables
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables")
    sys.exit(1)

print(f"\n✓ Supabase URL: {supabase_url}")
print(f"✓ Supabase Key: {supabase_key[:20]}...")

print("\n" + "=" * 70)
print("IMPORTANT: Manual Setup Required")
print("=" * 70)
print("\nThe Supabase Python SDK cannot create database tables.")
print("You must run SQL directly in the Supabase dashboard.\n")

print("📋 STEP-BY-STEP INSTRUCTIONS:")
print("-" * 70)
print("\n1. Open this link in your browser:")
print("   👉 https://supabase.com/dashboard/project/eogegrjpexfgverjnfcc/sql/new")

print("\n2. You'll see a SQL editor. Click 'New Query' if needed.")

print("\n3. In your Replit file browser (left side), open:")
print("   📁 backend/SETUP_DATABASE.sql")

print("\n4. Copy ALL the content from that file (Ctrl+A, Ctrl+C)")

print("\n5. Paste it into the Supabase SQL editor (Ctrl+V)")

print("\n6. Click the green 'RUN' button (or press Ctrl+Enter)")

print("\n7. Wait for 'Success. No rows returned' message")

print("\n" + "=" * 70)
print("✅ AFTER RUNNING THE SQL:")
print("=" * 70)
print("\nYour app will be ready! Login with:")
print("   📧 Email: admin@zoo.com")
print("   🔑 Password: password123")
print("\n⚠️  IMPORTANT: Change this password after first login!")

print("\n" + "=" * 70)
print("🔄 The 401 errors will be GONE after this setup!")
print("=" * 70)
