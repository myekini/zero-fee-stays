/**
 * Admin Initialization Script
 *
 * This script promotes an existing user to admin role.
 * Run with: npx tsx scripts/init-admin.ts <user-email>
 *
 * Example: npx tsx scripts/init-admin.ts admin@example.com
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  console.error('You can find these in your Supabase project settings');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function promoteToAdmin(email: string) {
  console.log(`\n🔍 Looking for user with email: ${email}`);

  try {
    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const user = users?.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\n💡 Available users:');
      users?.forEach(u => console.log(`   - ${u.email} (${u.id})`));
      return;
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`);

    // Update user metadata to admin role
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }
    );

    if (updateAuthError) {
      console.error('❌ Error updating auth user:', updateAuthError.message);
      return;
    }

    console.log('✅ Updated auth user metadata');

    // Update profiles table
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        is_host: true
      })
      .eq('user_id', user.id);

    if (updateProfileError) {
      console.error('❌ Error updating profile:', updateProfileError.message);
      return;
    }

    console.log('✅ Updated profile record');
    console.log(`\n🎉 Successfully promoted ${email} to admin!`);
    console.log('\n📋 Next steps:');
    console.log('   1. The user should sign out and sign in again to refresh their session');
    console.log('   2. They can now access /admin routes');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function createNewAdmin(email: string, password: string, firstName: string, lastName: string) {
  console.log(`\n🔨 Creating new admin user: ${email}`);

  try {
    // Create user with admin role
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'admin'
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ User creation failed - no user data returned');
      return;
    }

    console.log(`✅ Created auth user: ${authData.user.id}`);

    // Create profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
        is_host: true,
        is_verified: true
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      // Try to delete the auth user since profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('🔄 Rolled back user creation');
      return;
    }

    console.log('✅ Created profile record');
    console.log(`\n🎉 Successfully created admin user!`);
    console.log('\n📋 Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
📚 Admin Initialization Script

Usage:
  npx tsx scripts/init-admin.ts promote <email>
  npx tsx scripts/init-admin.ts create <email> <password> <firstName> <lastName>

Examples:
  npx tsx scripts/init-admin.ts promote admin@example.com
  npx tsx scripts/init-admin.ts create admin@example.com SecurePass123! John Doe

Commands:
  promote  - Promote an existing user to admin
  create   - Create a new admin user
  `);
  process.exit(0);
}

if (command === 'promote') {
  const email = args[1];
  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: npx tsx scripts/init-admin.ts promote <email>');
    process.exit(1);
  }
  promoteToAdmin(email);
} else if (command === 'create') {
  const [, email, password, firstName, lastName] = args;
  if (!email || !password || !firstName || !lastName) {
    console.error('❌ Error: All fields are required');
    console.log('Usage: npx tsx scripts/init-admin.ts create <email> <password> <firstName> <lastName>');
    process.exit(1);
  }
  createNewAdmin(email, password, firstName, lastName);
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Valid commands: promote, create');
  process.exit(1);
}
