# Admin Setup Guide for HiddyStays

This guide will help you set up the default admin user and fix the authentication flow issues.

## 🚀 Quick Setup

### 1. Set Up Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://ihgzllefbkzqnomsviwh.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin Configuration
DEFAULT_ADMIN_EMAIL=myekini1@gmail.com
DEFAULT_ADMIN_PASSWORD=Muhammadyk1@$-
```

### 2. Initialize Admin User

Run the admin initialization script:

```bash
cd backend
python initialize_admin.py
```

This will:

- Create the default admin user with email `myekini1@gmail.com`
- Set the password to `Muhammadyk1@$-`
- Assign admin role to the user
- Confirm the email automatically

### 3. Set Up Database Tables

Run the following SQL in your Supabase dashboard SQL editor:

```sql
-- Create profiles table
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );
```

## 🔧 Authentication Flow Fixes

### Issues Fixed:

1. **Sign Out Functionality**: Fixed sign out button in header
2. **Email Verification**: Improved verification flow with proper redirects
3. **Profile Editing**: Added real Supabase integration for profile updates
4. **Admin Role**: Proper admin role assignment and dashboard access

### New Features:

1. **Admin Dashboard Access**: Admin users can access `/admin` route
2. **Role-Based Navigation**: Different menu items for admin vs regular users
3. **Profile Management**: Users can edit their profile information
4. **Email Verification Flow**: Proper handling of email verification redirects

## 🎯 User Roles

### Admin User (`myekini1@gmail.com`)

- **Password**: `Muhammadyk1@$-`
- **Access**: Full admin dashboard
- **Permissions**: Manage users, properties, bookings, analytics
- **Features**: User management, platform analytics, system settings

### Regular Users

- **Access**: Profile, bookings, property browsing
- **Permissions**: Edit own profile, make bookings
- **Features**: Personal dashboard, booking history

### Host Users

- **Access**: Host dashboard, property management
- **Permissions**: Manage properties, view bookings
- **Features**: Property listings, booking management

## 🔐 Security Features

1. **Role-Based Access Control**: Different permissions for different user types
2. **Email Verification**: Required for all new accounts
3. **Password Requirements**: Strong password validation
4. **Session Management**: Secure session handling with Supabase
5. **Rate Limiting**: Protection against brute force attacks

## 🚀 Getting Started

### For Admin Users:

1. **Sign In**: Use `myekini1@gmail.com` with password `Muhammadyk1@$-`
2. **Access Dashboard**: Click "Admin Dashboard" in the user menu
3. **Manage Platform**: Use the admin dashboard to manage users, properties, and view analytics

### For Regular Users:

1. **Sign Up**: Create a new account with email verification
2. **Complete Profile**: Fill in your personal information
3. **Browse Properties**: Start exploring available accommodations
4. **Make Bookings**: Book your stays through the platform

## 🔧 Troubleshooting

### Common Issues:

1. **Can't Sign Out**
   - Solution: Fixed in header component with proper sign out handler

2. **Email Verification Not Working**
   - Solution: Improved AuthCallback component with proper session handling

3. **Profile Not Saving**
   - Solution: Added real Supabase integration for profile updates

4. **Admin Dashboard Not Accessible**
   - Solution: Ensure admin role is properly assigned and user is signed in

### Debug Steps:

1. Check browser console for errors
2. Verify Supabase connection
3. Ensure environment variables are set correctly
4. Check user role in Supabase dashboard

## 📞 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure all environment variables are set correctly
4. Contact the development team with specific error details

## 🔄 Updates

This guide will be updated as new features are added or issues are resolved. Check back regularly for the latest information.
