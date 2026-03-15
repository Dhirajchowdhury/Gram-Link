#!/usr/bin/env python3
"""
Add occupation column to user_profiles table
"""
import sqlite3

def add_occupation_column():
    """Add occupation column if it doesn't exist"""
    try:
        conn = sqlite3.connect('ai_mitra.db')
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'occupation' not in columns:
            print("Adding occupation column...")
            cursor.execute("""
                ALTER TABLE user_profiles 
                ADD COLUMN occupation TEXT
            """)
            conn.commit()
            print("✅ Occupation column added successfully!")
        else:
            print("✅ Occupation column already exists")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = cursor.fetchall()
        print("\nCurrent columns in user_profiles:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔧 Adding occupation column to database\n")
    add_occupation_column()
