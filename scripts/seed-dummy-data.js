const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DUMMY_HOST_EMAIL = "dummy-host@example.com";
const DUMMY_GUEST_EMAIL = "dummy-guest@example.com";

const dummyProperties = [
  {
    title: "Cozy Beachfront Cottage",
    description: "A charming cottage right on the beach. Perfect for a romantic getaway.",
    address: "123 Ocean View, Beachside",
    location: "Beachside, CA, USA",
    price_per_night: 250,
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    property_type: "cottage",
    amenities: ["WiFi", "Kitchen", "Air conditioning", "Heating", "TV"],
    house_rules: ["No smoking", "No pets", "No parties"],
    cancellation_policy: "strict",
    min_nights: 2,
    max_nights: 14,
    advance_notice_hours: 48,
    same_day_booking: false,
    is_active: true,
    status: "active",
  },
  {
    title: "Urban Loft with Rooftop Patio",
    description: "A stylish loft in the heart of the city. Enjoy the amazing views from the private rooftop patio.",
    address: "456 City Center, Downtown",
    location: "Metropolis, NY, USA",
    price_per_night: 350,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    property_type: "loft",
    amenities: ["WiFi", "Kitchen", "Air conditioning", "Heating", "TV", "Gym"],
    house_rules: ["No smoking", "No parties"],
    cancellation_policy: "moderate",
    min_nights: 1,
    max_nights: 30,
    advance_notice_hours: 24,
    same_day_booking: true,
    is_active: true,
    status: "active",
  },
];

async function seedDummyData() {
  try {
    console.log("🌱 Starting to seed dummy data...");

    // 1. Create dummy host and guest users
    const { data: hostUser, error: hostUserError } = await supabase.auth.admin.createUser({
      email: DUMMY_HOST_EMAIL,
      password: "password",
      email_confirm: true,
    });
    if (hostUserError) throw hostUserError;

    const { data: guestUser, error: guestUserError } = await supabase.auth.admin.createUser({
      email: DUMMY_GUEST_EMAIL,
      password: "password",
      email_confirm: true,
    });
    if (guestUserError) throw guestUserError;

    // 2. Create dummy host and guest profiles
    const { data: hostProfile, error: hostProfileError } = await supabase
      .from("profiles")
      .insert({ user_id: hostUser.user.id, first_name: "Dummy", last_name: "Host", is_host: true })
      .select()
      .single();
    if (hostProfileError) throw hostProfileError;

    const { data: guestProfile, error: guestProfileError } = await supabase
      .from("profiles")
      .insert({ user_id: guestUser.user.id, first_name: "Dummy", last_name: "Guest", is_host: false })
      .select()
      .single();
    if (guestProfileError) throw guestProfileError;

    // 3. Create dummy properties
    for (const propertyData of dummyProperties) {
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({ ...propertyData, host_id: hostProfile.id })
        .select()
        .single();
      if (propertyError) throw propertyError;

      console.log(`🏡 Created property: ${property.title}`);

      // 4. Create dummy bookings for each property
      const bookingsToCreate = [
        {
          check_in_date: "2025-09-01",
          check_out_date: "2025-09-05",
          guests_count: 2,
          total_amount: property.price_per_night * 4,
          status: "confirmed",
        },
        {
          check_in_date: "2025-09-10",
          check_out_date: "2025-09-12",
          guests_count: 1,
          total_amount: property.price_per_night * 2,
          status: "pending",
        },
        {
          check_in_date: "2025-09-15",
          check_out_date: "2025-09-20",
          guests_count: 4,
          total_amount: property.price_per_night * 5,
          status: "cancelled",
        },
      ];

      for (const bookingData of bookingsToCreate) {
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            ...bookingData,
            property_id: property.id,
            guest_id: guestProfile.id,
            host_id: hostProfile.id,
          })
          .select()
          .single();
        if (bookingError) throw bookingError;

        console.log(`  📅 Created booking ${booking.id} with status: ${booking.status}`);
      }
    }

    console.log("✅ Dummy data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding dummy data:", error);
  }
}

seedDummyData();
