import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default host configuration
const DEFAULT_HOST_CONFIG = {
  email: "hiddy@zerofeestays.com",
  password: "HiddyStays2024!",
  firstName: "Hiddy",
  lastName: "Stays",
  phone: "+1-555-HIDDY-STAYS",
  bio: "Welcome to HiddyStays! I'm your friendly host, here to help you find the perfect zero-fee accommodation for your travels. Let's make your stay memorable!",
  location: "Global",
  avatarUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
};

const SAMPLE_PROPERTIES = [
  {
    name: "Cozy Downtown Apartment",
    description:
      "A beautiful apartment in the heart of the city, perfect for business travelers and tourists alike.",
    address: "123 Main Street, Downtown",
    city: "New York",
    state: "NY",
    country: "USA",
    price_per_night: 89.99,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "Parking", "Air Conditioning"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    ],
    is_active: true,
  },
  {
    name: "Beachside Villa",
    description:
      "Stunning oceanfront villa with panoramic views. Perfect for a relaxing getaway.",
    address: "456 Ocean Drive, Beachfront",
    city: "Miami",
    state: "FL",
    country: "USA",
    price_per_night: 199.99,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Pool", "Beach Access", "Kitchen", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=600&fit=crop",
    ],
    is_active: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log("🏠 Starting default host initialization...");

    // Check if host already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingHost = existingUsers?.users?.find(
      (user) => user.email === DEFAULT_HOST_CONFIG.email
    );

    if (existingHost) {
      return NextResponse.json({
        success: true,
        message: "Default host already exists",
        host: {
          id: existingHost.id,
          email: existingHost.email,
          name: `${DEFAULT_HOST_CONFIG.firstName} ${DEFAULT_HOST_CONFIG.lastName}`,
        },
      });
    }

    // Create the host user
    const { data: hostUser, error: hostError } =
      await supabase.auth.admin.createUser({
        email: DEFAULT_HOST_CONFIG.email,
        password: DEFAULT_HOST_CONFIG.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: DEFAULT_HOST_CONFIG.firstName,
          last_name: DEFAULT_HOST_CONFIG.lastName,
          phone: DEFAULT_HOST_CONFIG.phone,
          bio: DEFAULT_HOST_CONFIG.bio,
          location: DEFAULT_HOST_CONFIG.location,
          role: "host",
          is_host: true,
          is_verified: true,
          avatar_url: DEFAULT_HOST_CONFIG.avatarUrl,
        },
      });

    if (hostError) {
      console.error("Error creating host user:", hostError);
      return NextResponse.json(
        { success: false, error: hostError.message },
        { status: 500 }
      );
    }

    if (!hostUser.user) {
      return NextResponse.json(
        { success: false, error: "Failed to create host user" },
        { status: 500 }
      );
    }

    console.log("✅ Default host created successfully!");

    // Create profile in profiles table
    try {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: hostUser.user.id,
        first_name: DEFAULT_HOST_CONFIG.firstName,
        last_name: DEFAULT_HOST_CONFIG.lastName,
        phone: DEFAULT_HOST_CONFIG.phone,
        bio: DEFAULT_HOST_CONFIG.bio,
        location: DEFAULT_HOST_CONFIG.location,
        is_host: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn("Profiles table update failed:", profileError);
      } else {
        console.log("✅ Host profile created in profiles table");
      }
    } catch (profileError) {
      console.warn(
        "Profiles table doesn't exist or update failed:",
        profileError
      );
    }

    // Create sample properties
    const createdProperties = [];
    for (const propertyData of SAMPLE_PROPERTIES) {
      try {
        const { data: property, error: propertyError } = await supabase
          .from("properties")
          .insert({
            ...propertyData,
            host_id: hostUser.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (propertyError) {
          console.warn(
            `Could not create property '${propertyData.name}':`,
            propertyError
          );
        } else {
          console.log(`✅ Created property: ${propertyData.name}`);
          createdProperties.push(property);
        }
      } catch (error) {
        console.warn(`Error creating property '${propertyData.name}':`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Default host setup completed successfully!",
      host: {
        id: hostUser.user.id,
        email: DEFAULT_HOST_CONFIG.email,
        name: `${DEFAULT_HOST_CONFIG.firstName} ${DEFAULT_HOST_CONFIG.lastName}`,
        role: "host",
      },
      properties: createdProperties,
      credentials: {
        email: DEFAULT_HOST_CONFIG.email,
        password: DEFAULT_HOST_CONFIG.password,
      },
    });
  } catch (error) {
    console.error("Error in host initialization:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if host exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingHost = existingUsers?.users?.find(
      (user) => user.email === DEFAULT_HOST_CONFIG.email
    );

    if (existingHost) {
      return NextResponse.json({
        success: true,
        exists: true,
        host: {
          id: existingHost.id,
          email: existingHost.email,
          name: `${DEFAULT_HOST_CONFIG.firstName} ${DEFAULT_HOST_CONFIG.lastName}`,
          role: "host",
        },
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
      message: "Default host does not exist",
    });
  } catch (error) {
    console.error("Error checking host status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

