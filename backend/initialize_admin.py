#!/usr/bin/env python3
"""
Initialize default admin user for HiddyStays platform
"""

import os
import sys
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ihgzllefbkzqnomsviwh.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables")
    print("Please set SUPABASE_SERVICE_ROLE_KEY in your .env file")
    sys.exit(1)

# Default admin credentials
ADMIN_EMAIL = "myekini1@gmail.com"
ADMIN_PASSWORD = "Muhammadyk1@$-"
ADMIN_FIRST_NAME = "Admin"
ADMIN_LAST_NAME = "User"

def initialize_admin():
    """Initialize the default admin user"""
    try:
        # Create Supabase client with service role key
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        print("🔧 Initializing default admin user...")
        print(f"📧 Email: {ADMIN_EMAIL}")
        print(f"👤 Name: {ADMIN_FIRST_NAME} {ADMIN_LAST_NAME}")
        
        # Check if admin user already exists
        try:
            # Try to get user by email
            response = supabase.auth.admin.list_users()
            existing_user = None
            
            for user in response.users:
                if user.email == ADMIN_EMAIL:
                    existing_user = user
                    break
            
            if existing_user:
                print("✅ Admin user already exists")
                
                # Update user metadata to ensure admin role
                supabase.auth.admin.update_user_by_id(
                    existing_user.id,
                    {
                        "user_metadata": {
                            "first_name": ADMIN_FIRST_NAME,
                            "last_name": ADMIN_LAST_NAME,
                            "role": "admin"
                        }
                    }
                )
                print("✅ Updated admin user metadata")
                
                # Ensure email is confirmed
                if not existing_user.email_confirmed_at:
                    supabase.auth.admin.update_user_by_id(
                        existing_user.id,
                        {"email_confirm": True}
                    )
                    print("✅ Confirmed admin user email")
                
                return existing_user
            else:
                print("📝 Creating new admin user...")
                
                # Create new admin user
                response = supabase.auth.admin.create_user({
                    "email": ADMIN_EMAIL,
                    "password": ADMIN_PASSWORD,
                    "email_confirm": True,
                    "user_metadata": {
                        "first_name": ADMIN_FIRST_NAME,
                        "last_name": ADMIN_LAST_NAME,
                        "role": "admin"
                    }
                })
                
                if response.user:
                    print("✅ Admin user created successfully")
                    print(f"🆔 User ID: {response.user.id}")
                    return response.user
                else:
                    print("❌ Failed to create admin user")
                    return None
                    
        except Exception as e:
            print(f"❌ Error checking/creating admin user: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return None

def create_profiles_table(supabase: Client):
    """Create profiles table if it doesn't exist"""
    try:
        print("🔧 Setting up profiles table...")
        
        # Create profiles table
        sql = """
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            bio TEXT,
            location TEXT,
            is_host BOOLEAN DEFAULT FALSE,
            is_verified BOOLEAN DEFAULT FALSE,
            is_suspended BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create RLS policies
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Allow users to read their own profile
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
        
        -- Allow users to update their own profile
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
        
        -- Allow users to insert their own profile
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        
        -- Allow admins to view all profiles
        CREATE POLICY "Admins can view all profiles" ON profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
        
        -- Allow admins to update all profiles
        CREATE POLICY "Admins can update all profiles" ON profiles
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
        """
        
        # Execute SQL (this would need to be done through Supabase dashboard or migrations)
        print("ℹ️  Please run the following SQL in your Supabase dashboard:")
        print("=" * 50)
        print(sql)
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error setting up profiles table: {e}")

def main():
    """Main function"""
    print("🚀 HiddyStays Admin Initialization")
    print("=" * 40)
    
    # Initialize admin user
    admin_user = initialize_admin()
    
    if admin_user:
        print("\n✅ Admin initialization completed successfully!")
        print(f"📧 Login with: {ADMIN_EMAIL}")
        print(f"🔑 Password: {ADMIN_PASSWORD}")
        print("\n🔗 You can now access the admin dashboard at /admin")
        
        # Setup profiles table
        try:
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            create_profiles_table(supabase)
        except Exception as e:
            print(f"⚠️  Could not setup profiles table: {e}")
    else:
        print("\n❌ Admin initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()