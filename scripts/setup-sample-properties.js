#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ihgzllefbkzqnomsviwh.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZ3psbGVmYmt6cW5vbXN2aXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk5ODQ2NCwiZXhwIjoyMDY5NTc0NDY0fQ.hcNdhRf_B3KpqIULULvRX17sP-pZtBx8MuBQodslMRA";
const DEFAULT_ADMIN_EMAIL = "myekini1@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Muhammadyk1@$";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const apartmentImages = [
  "apartment_lobby_ss.jpg",
  "bathoom_and_toilet.jpg",
  "bed_lanscape.jpg",
  "bed_upclose.jpg",
  "city_view_from_backyard.jpg",
  "dining_area.jpg",
  "Full_kitchen.jpg",
  "Gym_area_ss.jpg",
  "kitchen_cutleries_showcase.jpg",
  "little_dinning_area.jpg",
  "night_city_view_from_upstair.jpg",
  "Ouside_infront_apartment_through_the_glass.jpg",
  "sititng_room_washhand_base.jpg",
  "smart_tv_on_stand.jpg",
  "snoker_area_ss.jpg",
  "waiting_room_lobby_ss.jpg",
  "walkway_to_the_room.jpg",
  "washing_machine.jpg",
];

const properties = [
  {
    title: "Modern Downtown Apartment - Toronto",
    description:
      "Beautiful modern apartment in the heart of downtown with stunning city views. Features a fully equipped kitchen, comfortable living space, and modern amenities. Perfect for business travelers and tourists alike. Enjoy access to the building's gym, lobby lounge, and secure parking.",
    address: "123 Main Street, Downtown Toronto",
    city: "Toronto",
    country: "Canada",
    price_per_night: 120,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    property_type: "apartment",
    amenities: [
      "WiFi",
      "Kitchen",
      "Air conditioning",
      "Heating",
      "TV",
      "Gym",
      "Washer",
      "Dryer",
      "Parking",
      "Elevator",
    ],
    house_rules: [
      "No smoking",
      "No pets",
      "No parties or events",
      "Check-in after 3:00 PM",
      "Check-out before 11:00 AM",
      "Quiet hours 10 PM - 8 AM",
    ],
    cancellation_policy: "moderate",
    min_nights: 1,
    max_nights: 30,
    advance_notice_hours: 24,
    same_day_booking: true,
    is_active: true,
    status: "active",
    rating: 4.8,
    review_count: 24,
    is_featured: true,
  },
  {
    title: "Luxury City Center Suite with Balcony",
    description:
      "Elegant suite with panoramic city views, premium amenities, and sophisticated design. Features a spacious living area, modern kitchen, and access to building facilities including gym, pool, and lounge areas. Perfect for those seeking comfort and style.",
    address: "456 Business District Avenue, Toronto",
    city: "Toronto",
    country: "Canada",
    price_per_night: 180,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    property_type: "apartment",
    amenities: [
      "WiFi",
      "Kitchen",
      "Air conditioning",
      "Heating",
      "Smart TV",
      "Gym",
      "Pool",
      "Balcony",
      "Washer",
      "Dryer",
      "Parking",
      "24/7 Security",
    ],
    house_rules: [
      "No smoking",
      "No pets",
      "No parties or events",
      "Check-in after 4:00 PM",
      "Check-out before 12:00 PM",
      "Respect quiet hours",
    ],
    cancellation_policy: "flexible",
    min_nights: 2,
    max_nights: 14,
    advance_notice_hours: 12,
    same_day_booking: false,
    is_active: true,
    status: "active",
    rating: 4.9,
    review_count: 18,
    is_featured: false,
  },
  {
    title: "Cozy Studio Near University",
    description:
      "Perfect for students and young professionals! This cozy studio apartment is located near the university campus with easy access to public transport. Features a comfortable sleeping area, kitchenette, and modern bathroom.",
    address: "789 College Street, Toronto",
    city: "Toronto",
    country: "Canada",
    price_per_night: 85,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    property_type: "studio",
    amenities: [
      "WiFi",
      "Kitchenette",
      "Heating",
      "TV",
      "Desk",
      "Microwave",
      "Laundry in building",
    ],
    house_rules: [
      "No smoking",
      "No pets",
      "No parties",
      "Check-in after 2:00 PM",
      "Check-out before 10:00 AM",
    ],
    cancellation_policy: "flexible",
    min_nights: 7,
    max_nights: 90,
    advance_notice_hours: 48,
    same_day_booking: false,
    is_active: true,
    status: "active",
    rating: 4.6,
    review_count: 12,
    is_featured: false,
  },
];

async function setupSampleProperties() {
  console.log("🚀 Setting up sample properties for HiddyStays...\n");

  try {
    // Test Supabase connection
    console.log("🔌 Testing Supabase connection...");
    const { error: testError } = await supabase.from("profiles").select("count").limit(1);

    if (testError) {
      console.error("❌ Cannot connect to Supabase:", testError.message);
      return;
    }

    console.log("✅ Connected to Supabase successfully!\n");

    // Get or create admin user
    console.log(`👤 Checking for admin user: ${DEFAULT_ADMIN_EMAIL}...`);

    // First check if user exists in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error listing users:", authError.message);
      return;
    }

    let userId = null;
    let existingUser = authData.users.find((u) => u.email === DEFAULT_ADMIN_EMAIL);

    if (!existingUser) {
      console.log("👤 Creating admin user...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: "Admin",
          last_name: "User",
        },
      });

      if (createError) {
        console.error("❌ Error creating user:", createError.message);
        return;
      }

      userId = newUser.user.id;
      console.log("✅ Created admin user:", userId);
    } else {
      userId = existingUser.id;
      console.log("✅ Found existing admin user:", userId);
    }

    // Get or create profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.log("👤 Creating profile for admin user...");
      const { data: newProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          first_name: "Admin",
          last_name: "User",
          email: DEFAULT_ADMIN_EMAIL,
          is_host: true,
        })
        .select()
        .single();

      if (createProfileError) {
        console.error("❌ Error creating profile:", createProfileError.message);
        return;
      }

      profile = newProfile;
      console.log("✅ Created profile:", profile.id);
    } else {
      // Update profile to be a host if not already
      if (!profile.is_host) {
        await supabase.from("profiles").update({ is_host: true }).eq("id", profile.id);
        console.log("✅ Updated profile to be a host");
      }
      console.log("✅ Using existing profile:", profile.id);
    }

    // Check if properties already exist
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("id, title")
      .eq("host_id", profile.id);

    if (existingProperties && existingProperties.length > 0) {
      console.log(`\n📋 Found ${existingProperties.length} existing properties:`);
      existingProperties.forEach((prop) => {
        console.log(`   - ${prop.title}`);
      });

      console.log("\n🔄 Deleting existing properties to start fresh...");
      for (const prop of existingProperties) {
        // Delete property images first
        await supabase.from("property_images").delete().eq("property_id", prop.id);
        // Delete property
        await supabase.from("properties").delete().eq("id", prop.id);
      }
      console.log("✅ Deleted existing properties");
    }

    // Create properties
    console.log("\n🏠 Creating sample properties...\n");
    let createdCount = 0;

    for (const propertyData of properties) {
      console.log(`📍 Creating: ${propertyData.title}`);

      // Create property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          host_id: profile.id,
          title: propertyData.title,
          description: propertyData.description,
          address: propertyData.address,
          location: `${propertyData.city}, ${propertyData.country}`,
          city: propertyData.city,
          country: propertyData.country,
          price_per_night: propertyData.price_per_night,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          max_guests: propertyData.max_guests,
          property_type: propertyData.property_type,
          amenities: propertyData.amenities,
          house_rules: propertyData.house_rules,
          cancellation_policy: propertyData.cancellation_policy,
          min_nights: propertyData.min_nights,
          max_nights: propertyData.max_nights,
          advance_notice_hours: propertyData.advance_notice_hours,
          same_day_booking: propertyData.same_day_booking,
          is_active: propertyData.is_active,
          is_featured: propertyData.is_featured,
          status: propertyData.status,
          rating: propertyData.rating,
          review_count: propertyData.review_count,
        })
        .select()
        .single();

      if (propertyError) {
        console.error(`❌ Error creating property: ${propertyError.message}`);
        continue;
      }

      console.log(`   ✅ Created property: ${property.id}`);

      // Add images (use apartment images for first property, placeholders for others)
      if (propertyData.title.includes("Modern Downtown Apartment")) {
        console.log("   🖼️ Adding apartment images...");

        const imageInserts = apartmentImages.map((imageName, index) => ({
          property_id: property.id,
          image_url: `/assets/${imageName}`,
          is_primary: index === 0,
          image_type: imageName.endsWith("_ss.jpg") ? "screenshot" : "photo",
          sort_order: index,
        }));

        const { error: imageError } = await supabase
          .from("property_images")
          .insert(imageInserts);

        if (imageError) {
          console.error("   ❌ Error adding images:", imageError.message);
        } else {
          console.log(`   ✅ Added ${imageInserts.length} images`);
        }
      } else {
        // Add placeholder images for other properties
        const placeholderImages = [
          `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop`,
        ];

        const imageInserts = placeholderImages.map((url, index) => ({
          property_id: property.id,
          image_url: url,
          is_primary: index === 0,
          image_type: "photo",
          sort_order: index,
        }));

        const { error: imageError } = await supabase
          .from("property_images")
          .insert(imageInserts);

        if (!imageError) {
          console.log(`   ✅ Added ${imageInserts.length} placeholder images`);
        }
      }

      createdCount++;
    }

    console.log(`\n🎉 Successfully created ${createdCount} properties!`);
    console.log("\n📋 Next steps:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Visit http://localhost:3000/properties to see properties");
    console.log("   3. Visit http://localhost:3000/host-dashboard for host view");
    console.log(`   4. Login with: ${DEFAULT_ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   - Check your .env.local file");
    console.log("   - Ensure Supabase project is running");
    console.log("   - Verify database permissions");
  }
}

// Run the setup
setupSampleProperties();
