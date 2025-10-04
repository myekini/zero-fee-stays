import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Setting up existing properties via API...");

    // Get any existing profile and make it a host
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (profilesError || !profiles || profiles.length === 0) {
      return NextResponse.json({ error: "No profiles found" }, { status: 400 });
    }

    let hostProfile = profiles[0];

    // If not already a host, update it
    if (!hostProfile.is_host) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ is_host: true })
        .eq("id", hostProfile.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update profile to host" },
          { status: 500 }
        );
      }

      hostProfile = updatedProfile;
    }
    console.log("✅ Using host profile:", hostProfile.id);

    // Check if properties already exist
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("id, title")
      .eq("host_id", hostProfile.id);

    if (existingProperties && existingProperties.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Properties already exist",
        properties: existingProperties,
      });
    }

    // Create properties with existing schema
    const properties = [
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
      },
    ];

    const createdProperties = [];

    for (const propertyData of properties) {
      console.log(`🏠 Creating property: ${propertyData.title}`);

      // Create property with existing schema
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          host_id: hostProfile.id,
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

      console.log(`✅ Property created successfully: ${property.id}`);
      createdProperties.push(property);

      // Add images for the first property (using apartment images)
      if (propertyData.title === "Modern Downtown Apartment") {
        console.log("🖼️ Adding apartment images...");

        const imageInserts = apartmentImages.map((imageName, index) => ({
          property_id: property.id,
          image_url: `/assets/${imageName}`,
          is_primary: index === 0,
        }));

        const { error: imageError } = await supabase
          .from("property_images")
          .insert(imageInserts);

        if (imageError) {
          console.error("❌ Error adding images:", imageError);
        } else {
          console.log(`✅ Added ${imageInserts.length} images to property`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Properties created successfully",
      properties: createdProperties,
    });
  } catch (error) {
    console.error("❌ Setup failed:", error);
    return NextResponse.json(
      { error: "Failed to setup properties" },
      { status: 500 }
    );
  }
}
