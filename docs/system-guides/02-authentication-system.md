# 🔐 Complete Authentication System Guide

> **Last Updated:** October 13, 2025
> **Status:** ✅ Fully Fixed and Operational

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [What's Working](#whats-working)
4. [Recent Fixes](#recent-fixes)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### Multi-Role Authentication System

The Zero Fee Stays platform uses a comprehensive authentication system with three user roles:

| Role | Level | Permissions |
|------|-------|-------------|
| **Guest (user)** | 1 | Browse properties, make bookings, view own bookings |
| **Host** | 2 | All guest permissions + list/manage properties |
| **Admin** | 3 | All permissions + user management, platform administration |

### Key Features

- ✅ **Multi-provider authentication** (Email, Google, GitHub, Twitter, Apple)
- ✅ **JWT-based sessions** with automatic refresh
- ✅ **Role-based access control (RBAC)** with hierarchy
- ✅ **Bidirectional role sync** between metadata and database
- ✅ **Middleware-based route protection**
- ✅ **Profile caching** for performance (5-min TTL)
- ✅ **Activity logging** for audit trail
- ✅ **Email verification** required for email/password auth
- ✅ **Password strength validation** (client + server)
- ✅ **Rate limiting** to prevent abuse

---

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Sign-Up/Sign-In                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Supabase Auth        │
         │  Creates auth.users   │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Trigger Fires:       │
         │  handle_new_user()    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Creates Profile      │
         │  in profiles table    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  AuthProvider         │
         │  Validates Session    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Middleware           │
         │  Checks Role & Cache  │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Protected Route      │
         │  Access Granted       │
         └───────────────────────┘
```

### Role Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Admin/User Changes Role                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  API Route            │
         │  /api/profile/role    │
         │  or /api/admin/users  │
         └───────────┬───────────┘
                     │
                     ▼
    ┌────────────────┴────────────────┐
    │                                  │
    ▼                                  ▼
┌─────────────────┐          ┌─────────────────┐
│ Update          │          │ Update          │
│ user_metadata   │          │ profiles table  │
└────────┬────────┘          └────────┬────────┘
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌───────────────────────┐
         │  Trigger Fires:       │
         │  Profile role change  │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Sync metadata ↔️      │
         │  profiles             │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Send notification:   │
         │  invalidate_cache     │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Log to               │
         │  activity_logs        │
         └───────────────────────┘
```

### Data Consistency Model

The system maintains role data in **two places** with automatic synchronization:

1. **`auth.users.raw_user_meta_data.role`** - Fast access via JWT
2. **`profiles.role`** - Source of truth for server-side checks

**Synchronization happens:**
- On user creation (via `handle_new_user` trigger)
- On metadata update (via `sync_profile_from_auth_metadata` trigger)
- On profile update (via `sync_metadata_from_profile` trigger)
- On explicit role change via API

---

## What's Working

### ✅ Core Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Email/Password Signup | ✅ Working | Requires email verification |
| Email/Password Login | ✅ Working | Verified accounts only |
| OAuth (Google) | ✅ Working | Profile auto-created |
| OAuth (GitHub, Twitter) | ✅ Working | Profile auto-created |
| Email Verification | ✅ Working | Required for email auth |
| Password Reset | ✅ Working | Email-based flow |
| Session Management | ✅ Working | Auto-refresh every 5 min |

### ✅ Role Management

| Feature | Status | Notes |
|---------|--------|-------|
| Default Role (user) | ✅ Working | All new users start as guest |
| Become Host | ✅ Working | Self-service via `/api/profile/role` |
| Admin Role Assignment | ✅ Working | Admin-only via `/api/admin/users/[userId]/role` |
| Role Hierarchy | ✅ Working | admin > host > user |
| Role Sync | ✅ Working | Bidirectional between metadata & DB |

### ✅ Security

| Feature | Status | Notes |
|---------|--------|-------|
| JWT Token Validation | ✅ Working | Auto-expiry and refresh |
| Middleware Protection | ✅ Working | `/admin` and `/host-dashboard` |
| Rate Limiting | ✅ Working | Auth routes: 60 req/5min per IP |
| Password Validation | ✅ Working | Client + server side |
| CSRF Protection | ✅ Working | Token generation available |
| Activity Logging | ✅ Working | Audit trail for role changes |

### ✅ Performance

| Feature | Status | Notes |
|---------|--------|-------|
| Profile Caching | ✅ Working | 5-min TTL, auto-cleanup |
| Cache Invalidation | ✅ Working | On role changes |
| Optimized Middleware | ✅ Working | Skips public routes |

---

## Recent Fixes

### Phase 1: Database & Sync (✅ Completed)

**Migration:** `20251013000000_auth_system_fixes.sql`

1. **Created `activity_logs` table**
   - Audit trail for all auth/role changes
   - RLS policies (admin-only read)
   - Indexed for performance

2. **Added bidirectional role sync**
   - `sync_profile_from_auth_metadata()` - metadata → profile
   - `sync_metadata_from_profile()` - profile → metadata
   - Triggers on UPDATE for automatic sync

3. **Cache invalidation system**
   - PostgreSQL notification via `pg_notify()`
   - `invalidate_profile_cache()` function
   - Called automatically on role changes

4. **Profile consistency check**
   - `check_role_consistency()` function
   - Diagnostic tool for finding mismatches
   - Auto-fixes missing profiles

### Phase 2: API Routes (✅ Completed)

**Files Updated:**
- `app/api/profile/role/route.ts`
- `app/api/admin/users/[userId]/role/route.ts`

**Changes:**
1. **Profile sync on role update**
   - Now updates both `user_metadata` AND `profiles` table
   - Rollback on failure
   - Activity logging

2. **Cache invalidation on change**
   - Calls `invalidate_profile_cache()` RPC
   - Non-blocking (won't fail request if cache clear fails)

3. **Error handling improvements**
   - Activity log failures don't block requests
   - Better error messages
   - Proper HTTP status codes

### Phase 3: Middleware & Client (✅ Completed)

**Files Updated:**
- `middleware.ts`
- `lib/auth.ts`
- `lib/auth-validation.ts` (new)

**Changes:**
1. **Exported cache invalidation**
   - `invalidateProfileCache()` now available to API routes

2. **Enhanced AuthUtils**
   - `getUserRoleFromProfile()` - server-side role lookup
   - `checkRolePermission()` - static permission check
   - Better documentation

3. **Server-side validation**
   - New `AuthValidation` class
   - Email, password, role, metadata validation
   - Rate limiting utilities

---

## Usage Guide

### For Frontend Developers

#### Using the Auth Context

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { authUser, loading, signIn, signOut } = useAuth();

  if (loading) return <Loader />;
  if (!authUser) return <SignInPrompt />;

  return (
    <div>
      <p>Welcome, {authUser.firstName}!</p>
      <p>Role: {authUser.role}</p>
    </div>
  );
}
```

#### Protecting Routes

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

function HostDashboard() {
  return (
    <ProtectedRoute requiredRole="host">
      <div>Host content here</div>
    </ProtectedRoute>
  );
}
```

#### Checking Permissions

```typescript
const { hasPermission } = useAuth();

const canAccessHostFeatures = await hasPermission("host");
if (canAccessHostFeatures) {
  // Show host features
}
```

### For Backend Developers

#### Validating Auth in API Routes

```typescript
import { createClient } from "@/integrations/supabase/server";
import AuthUtils from "@/lib/auth";

export async function GET(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role from profiles (source of truth)
  const { role, isHost, error: roleError } = await AuthUtils.getUserRoleFromProfile(
    supabase,
    user.id
  );

  if (roleError) {
    return NextResponse.json({ error: "Failed to verify role" }, { status: 500 });
  }

  // Check permission
  if (!AuthUtils.checkRolePermission(role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with admin logic
  return NextResponse.json({ success: true });
}
```

#### Validating User Input

```typescript
import AuthValidation from "@/lib/auth-validation";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Validate email
  const emailResult = AuthValidation.validateEmail(email);
  if (!emailResult.isValid) {
    return NextResponse.json({ error: emailResult.error }, { status: 400 });
  }

  // Validate password
  const passwordResult = AuthValidation.validatePassword(password);
  if (!passwordResult.isValid) {
    return NextResponse.json(
      { error: passwordResult.errors[0] },
      { status: 400 }
    );
  }

  // Proceed with signup
}
```

---

## API Reference

### Public Endpoints

#### POST `/api/auth/signup`
Create new user account (handled by Supabase client)

#### POST `/api/auth/signin`
Sign in with credentials (handled by Supabase client)

### Protected Endpoints

#### GET `/api/profile/role`
Get current user's role

**Response:**
```json
{
  "role": "user",
  "isHost": false,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### POST `/api/profile/role`
Update own role (user ↔️ host only)

**Request:**
```json
{
  "role": "host"
}
```

**Response:**
```json
{
  "success": true,
  "role": "host",
  "message": "Successfully updated role to host"
}
```

### Admin Endpoints

#### PATCH `/api/admin/users/[userId]/role`
Update any user's role (admin only)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

---

## Database Schema

### Tables

#### `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'host', 'admin')),
  is_host BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0
);
```

#### `activity_logs`
```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Functions

#### `handle_new_user()`
Automatically creates profile when user signs up

#### `sync_profile_from_auth_metadata()`
Syncs role from `auth.users.raw_user_meta_data` → `profiles.role`

#### `sync_metadata_from_profile()`
Syncs role from `profiles.role` → `auth.users.raw_user_meta_data`

#### `invalidate_profile_cache(user_id)`
Sends cache invalidation notification

#### `check_role_consistency()`
Returns users with role mismatches

### Triggers

- `on_auth_user_created` - Creates profile on signup
- `on_auth_user_metadata_updated` - Syncs metadata → profile
- `on_profile_role_updated` - Syncs profile → metadata

---

## Testing

### Manual Testing Checklist

#### Email/Password Flow
- [ ] Sign up with new email
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Sign in with verified account
- [ ] Sign out
- [ ] Request password reset
- [ ] Reset password via email link

#### OAuth Flow
- [ ] Sign in with Google
- [ ] Profile created automatically
- [ ] Sign out
- [ ] Sign in again (existing account)

#### Role Management
- [ ] New user has "user" role
- [ ] User becomes host via profile page
- [ ] Host can access `/host-dashboard`
- [ ] Admin assigns admin role to user
- [ ] Admin can access `/admin`
- [ ] Role shows consistently across app

#### Security
- [ ] Unauthenticated user redirected from protected routes
- [ ] User cannot access admin routes
- [ ] Host cannot access admin routes
- [ ] Admin cannot demote themselves

### Database Consistency Check

Run this to check for role mismatches:

```sql
SELECT * FROM public.check_role_consistency();
```

### View Activity Logs

```sql
SELECT
  al.action,
  al.metadata,
  al.created_at,
  p.first_name,
  p.last_name,
  u.email
FROM activity_logs al
JOIN auth.users u ON u.id = al.user_id
LEFT JOIN profiles p ON p.user_id = al.user_id
WHERE al.action LIKE '%role%'
ORDER BY al.created_at DESC
LIMIT 50;
```

---

## Troubleshooting

### Issue: User can't access host dashboard after becoming host

**Diagnosis:**
```sql
-- Check if role is synced
SELECT
  u.email,
  u.raw_user_meta_data ->> 'role' as metadata_role,
  p.role as profile_role,
  p.is_host
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE u.email = 'user@example.com';
```

**Fix:**
```sql
-- Manually sync roles if needed
UPDATE profiles
SET role = 'host', is_host = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Issue: Profile doesn't exist for user

**Fix:**
```sql
-- Create missing profile
SELECT public.create_missing_profile(
  (SELECT id FROM auth.users WHERE email = 'user@example.com')
);
```

### Issue: Middleware cache not invalidating

**Check:**
- Ensure `invalidate_profile_cache()` RPC is being called
- Check server logs for "Cache invalidation notification sent"
- Cache auto-expires after 5 minutes anyway

**Manual Fix:**
Cache will auto-clear after 5 minutes, or restart the server.

### Issue: Activity logs not recording

**Check:**
```sql
-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'activity_logs'
);
```

**Fix:**
Run migration: `supabase/migrations/20251013000000_auth_system_fixes.sql`

---

## Best Practices

### For Developers

1. **Always use profiles table for server-side role checks**
   ```typescript
   // ✅ Good
   const { role } = await AuthUtils.getUserRoleFromProfile(supabase, userId);

   // ❌ Bad (metadata can be stale)
   const role = user.user_metadata.role;
   ```

2. **Validate all user input server-side**
   ```typescript
   // ✅ Good
   const validation = AuthValidation.validateEmail(email);
   if (!validation.isValid) throw new Error(validation.error);

   // ❌ Bad (client validation can be bypassed)
   // Trusting client-side validation only
   ```

3. **Use the auth context for client-side checks**
   ```typescript
   // ✅ Good
   const { authUser, hasPermission } = useAuth();
   const canEdit = await hasPermission("host");

   // ❌ Bad (doesn't account for role hierarchy)
   const canEdit = authUser.role === "host";
   ```

4. **Log important auth events**
   ```typescript
   // ✅ Good
   await supabase.from("activity_logs").insert({
     user_id: userId,
     action: "password_changed",
     metadata: { method: "reset_link" }
   });
   ```

### For Admins

1. **Regularly check role consistency**
   ```sql
   SELECT * FROM public.check_role_consistency();
   ```

2. **Monitor activity logs for suspicious behavior**
   ```sql
   SELECT * FROM activity_logs
   WHERE action = 'update_user_role'
   AND created_at > NOW() - INTERVAL '7 days'
   ORDER BY created_at DESC;
   ```

3. **Never manually edit `auth.users` without syncing `profiles`**
   - Use the API endpoints instead
   - Triggers will keep everything in sync

---

## Future Enhancements

### Planned Features

- [ ] **Multi-Factor Authentication (MFA)**
  - TOTP/SMS support
  - Required for admin accounts

- [ ] **Session Management Dashboard**
  - View active sessions
  - Revoke sessions remotely

- [ ] **Advanced Rate Limiting**
  - Per-user rate limits
  - IP-based blocking

- [ ] **Role Permissions System**
  - Granular permissions beyond roles
  - Custom permission groups

- [ ] **Audit Log UI**
  - Admin dashboard for viewing logs
  - Export logs for compliance

---

## Support

### Getting Help

- **Documentation Issues:** Create an issue in the repo
- **Security Issues:** Email security@zerofee stays.com (don't create public issues)
- **General Questions:** Check existing issues or create a new one

### Contributing

When contributing auth-related changes:

1. Always update this documentation
2. Add tests for new features
3. Test all role transitions manually
4. Check role consistency before/after changes
5. Update migration files if schema changes

---

**Document Version:** 1.0
**Last Migration:** `20251013000000_auth_system_fixes.sql`
**Maintained By:** Zero Fee Stays Team
