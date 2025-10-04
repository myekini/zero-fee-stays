import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateUser, createAuthResponse } from "@/lib/auth-middleware";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("host_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Search and filter parameters
    const location = searchParams.get("location");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const guests = searchParams.get("guests");
    const propertyType = searchParams.get("property_type");

    console.log(`Fetching properties with filters:`, {
      hostId,
      status,
      location,
      maxPrice,
      minPrice,
      guests,
      propertyType,
    });

    let query = supabase
      .from("properties")
      .select(
        `
        *,
        property_images!property_images_property_id_fkey(*),
        bookings!bookings_property_id_fkey(
          id,
          status,
          check_in_date,
          check_out_date,
          total_amount
        ),
        profiles!properties_host_id_fkey(
          user_id,
          first_name,
          last_name
        )
      `
      )
      .eq("is_active", true) // Only show active properties by default
      .order("created_at", { ascending: false });

    // Apply filters
    if (hostId) {
      query = query.eq("host_id", hostId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Search location in address or city
    if (location) {
      query = query.or(`address.ilike.%${location}%,city.ilike.%${location}%`);
    }

    // Price range filters
    if (minPrice) {
      query = query.gte("price_per_night", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("price_per_night", parseFloat(maxPrice));
    }

    // Guest capacity filter
    if (guests) {
      query = query.gte("max_guests", parseInt(guests));
    }

    // Property type filter
    if (propertyType && propertyType !== "all") {
      query = query.eq("property_type", propertyType);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data: properties, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch host emails from auth.users (profiles table doesn't have email)
    const hostUserIds = properties?.map((p) => p.profiles?.user_id).filter(Boolean) || [];
    const emailMap = new Map<string, string>();

    if (hostUserIds.length > 0) {
      for (const userId of hostUserIds) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user?.email) {
          emailMap.set(userId, authUser.user.email);
        }
      }
    }

    // Calculate additional metrics for each property
    const propertiesWithMetrics = properties?.map((property) => {
      const confirmedBookings =
        property.bookings?.filter(
          (booking: any) => booking.status === "confirmed"
        ) || [];

      const totalRevenue = confirmedBookings.reduce(
        (sum: number, booking: any) => sum + (booking.total_amount || 0),
        0
      );

      // Use property rating if available, otherwise default rating
      const avgRating = property.rating || 4.5; // Default rating for new properties
      const reviewCount = property.review_count || 0;

      // Add host email from auth.users
      const hostEmail = property.profiles?.user_id
        ? emailMap.get(property.profiles.user_id)
        : null;

      return {
        ...property,
        profiles: {
          ...property.profiles,
          email: hostEmail,
        },
        metrics: {
          total_bookings: property.bookings?.length || 0,
          confirmed_bookings: confirmedBookings.length,
          total_revenue: totalRevenue,
          avg_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          review_count: reviewCount,
          occupancy_rate: calculateOccupancyRate(property.bookings || []),
          images:
            property.property_images?.map((img: any) => img.image_url) || [],
        },
      };
    });

    return NextResponse.json({
      success: true,
      properties: propertiesWithMetrics,
      count: propertiesWithMetrics?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const body = await request.json();
    const {
      title,
      description,
      address,
      location,
      city,
      country,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      property_type,
      amenities,
      images,
      availability_rules,
      house_rules,
      cancellation_policy,
      min_nights,
      max_nights,
      advance_notice_hours,
      same_day_booking,
      status,
      is_active,
    } = body;

    if (!title || !description || !address || !price_per_night) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`Creating property for host: ${user.profile_id}`);

    // Create property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        host_id: user.profile_id,
        title,
        description,
        address,
        location,
        city: city || "Toronto",
        country: country || "Canada",
        price_per_night: parseFloat(price_per_night),
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        max_guests: parseInt(max_guests) || 2,
        property_type: property_type || "apartment",
        amenities: amenities || [],
        availability_rules: availability_rules || {},
        house_rules: house_rules || [],
        cancellation_policy: cancellation_policy || "moderate",
        min_nights: parseInt(min_nights) || 1,
        max_nights: parseInt(max_nights) || 30,
        advance_notice_hours: parseInt(advance_notice_hours) || 24,
        same_day_booking: same_day_booking || false,
        status: status || "draft",
        is_active: is_active || false,
      })
      .select()
      .single();

    if (propertyError) {
      throw propertyError;
    }

    // Add images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((imageUrl: string) => ({
        property_id: property.id,
        image_url: imageUrl,
        is_primary: images.indexOf(imageUrl) === 0,
      }));

      const { error: imageError } = await supabase
        .from("property_images")
        .insert(imageInserts);

      if (imageError) {
        console.error("Error adding images:", imageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Property created successfully",
      property: {
        ...property,
        images: images || [],
      },
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      address,
      location,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      property_type,
      amenities,
      images,
      availability_rules,
      house_rules,
      cancellation_policy,
      status,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if user owns this property
    const { data: existingProperty } = await supabase
      .from("properties")
      .select("host_id")
      .eq("id", id)
      .single();

    if (!existingProperty || existingProperty.host_id !== user.profile_id) {
      return NextResponse.json(
        { error: "Unauthorized to update this property" },
        { status: 403 }
      );
    }

    console.log(`Updating property: ${id}`);

    // Update property
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (location) updateData.location = location;
    if (price_per_night)
      updateData.price_per_night = parseFloat(price_per_night);
    if (bedrooms) updateData.bedrooms = parseInt(bedrooms);
    if (bathrooms) updateData.bathrooms = parseInt(bathrooms);
    if (max_guests) updateData.max_guests = parseInt(max_guests);
    if (property_type) updateData.property_type = property_type;
    if (amenities) updateData.amenities = amenities;
    if (availability_rules) updateData.availability_rules = availability_rules;
    if (house_rules) updateData.house_rules = house_rules;
    if (cancellation_policy)
      updateData.cancellation_policy = cancellation_policy;
    if (status) updateData.status = status;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedProperty, error: propertyError } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (propertyError) {
      throw propertyError;
    }

    // Update images if provided
    if (images) {
      // Delete existing images
      await supabase.from("property_images").delete().eq("property_id", id);

      // Add new images
      if (images.length > 0) {
        const imageInserts = images.map((imageUrl: string) => ({
          property_id: id,
          image_url: imageUrl,
          is_primary: images.indexOf(imageUrl) === 0,
        }));

        const { error: imageError } = await supabase
          .from("property_images")
          .insert(imageInserts);

        if (imageError) {
          console.error("Error updating images:", imageError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if user owns this property
    const { data: existingProperty } = await supabase
      .from("properties")
      .select("host_id")
      .eq("id", propertyId)
      .single();

    if (!existingProperty || existingProperty.host_id !== user.profile_id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this property" },
        { status: 403 }
      );
    }

    console.log(`Deleting property: ${propertyId}`);

    // Check if property has active bookings
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("property_id", propertyId)
      .in("status", ["pending", "confirmed"]);

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete property with active bookings" },
        { status: 400 }
      );
    }

    // Delete property images first
    await supabase
      .from("property_images")
      .delete()
      .eq("property_id", propertyId);

    // Delete property
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}

function calculateOccupancyRate(bookings: any[]): number {
  if (!bookings || bookings.length === 0) return 0;

  const confirmedBookings = bookings.filter(
    (booking: any) => booking.status === "confirmed"
  );

  // This is a simplified calculation
  // In a real app, you'd calculate based on actual availability vs bookings
  return Math.min(100, (confirmedBookings.length / bookings.length) * 100);
}
