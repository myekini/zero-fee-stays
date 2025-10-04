#!/usr/bin/env node

/**
 * Quick Setup Script for HiddyStays
 * This script creates mock properties for testing the application
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MOCK_PROPERTIES = [
  {
    title: "Modern Downtown Apartment",
    description:
      "Beautiful modern apartment in the heart of downtown with stunning city views. Features a fully equipped kitchen, comfortable living space, and modern amenities. Perfect for business travelers and tourists alike.",
    address: "123 Main Street, Downtown",
    location: "Toronto, ON, Canada",
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
    ],
    house_rules:
      "No smoking, No pets, No parties, Check-in after 3 PM, Check-out before 11 AM",
    is_active: true,
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
    ],
  },
  {
    title: "Luxury City Center Suite",
    description:
      "Elegant suite with panoramic city views, premium amenities, and sophisticated design. Features a spacious living area, modern kitchen, and access to building facilities including gym and lounge areas.",
    address: "456 Business District Ave",
    location: "Toronto, ON, Canada",
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
      "TV",
      "Gym",
      "Pool",
      "Balcony",
      "Washer",
      "Dryer",
    ],
    house_rules:
      "No smoking, No pets, No parties, Check-in after 4 PM, Check-out before 12 PM",
    is_active: true,
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631889993959-41b8d4b8a8b8?w=1200&h=800&fit=crop",
    ],
  },
];

async function setupMockData() {
  console.log("🚀 Setting up mock data for HiddyStays...\n");

  try {
    // Check if we have a default host
    const { data: existingHost } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_host", true)
      .limit(1)
      .single();

    let hostId;

    if (existingHost) {
      console.log(
        "✅ Found existing host:",
        existingHost.first_name,
        existingHost.last_name
      );
      hostId = existingHost.id;
    } else {
      console.log(
        "⚠️  No host found. Please run the host initialization first."
      );
      console.log("   Run: npm run setup:host");
      return;
    }

    // Check if properties already exist
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("id, title")
      .eq("host_id", hostId);

    if (existingProperties && existingProperties.length > 0) {
      console.log(
        `\n📋 Found ${existingProperties.length} existing properties:`
      );
      existingProperties.forEach((prop) => {
        console.log(`   - ${prop.title}`);
      });
      console.log("\n✅ Properties already exist! Setup complete.");
      return;
    }

    // Create properties
    console.log("\n🏠 Creating mock properties...");

    for (const propertyData of MOCK_PROPERTIES) {
      console.log(`\nCreating: ${propertyData.title}`);

      // Create property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          host_id: hostId,
          title: propertyData.title,
          description: propertyData.description,
          address: propertyData.address,
          location: propertyData.location,
          city: propertyData.city,
          country: propertyData.country,
          price_per_night: propertyData.price_per_night,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          max_guests: propertyData.max_guests,
          property_type: propertyData.property_type,
          amenities: propertyData.amenities,
          house_rules: propertyData.house_rules,
          is_active: propertyData.is_active,
          status: propertyData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (propertyError) {
        console.error(
          `❌ Error creating property ${propertyData.title}:`,
          propertyError
        );
        continue;
      }

      console.log(`✅ Property created: ${property.id}`);

      // Add images
      if (propertyData.images && propertyData.images.length > 0) {
        const imageInserts = propertyData.images.map((imageUrl, index) => ({
          property_id: property.id,
          image_url: imageUrl,
          is_primary: index === 0,
          sort_order: index,
        }));

        const { error: imageError } = await supabase
          .from("property_images")
          .insert(imageInserts);

        if (imageError) {
          console.warn(
            `⚠️  Could not add images for ${propertyData.title}:`,
            imageError
          );
        } else {
          console.log(`✅ Added ${propertyData.images.length} images`);
        }
      }
    }

    console.log("\n🎉 Mock data setup complete!");
    console.log("\nYou can now:");
    console.log(
      "1. Visit http://localhost:3000/properties to see the properties"
    );
    console.log("2. Click on a property to view details");
    console.log("3. Test the booking flow");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

// Run the setup
setupMockData();
