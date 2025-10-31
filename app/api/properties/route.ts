import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateUser, createAuthResponse } from "@/lib/auth-middleware";

// Use anon key for public reads so RLS applies
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple in-memory rate limiter (per IP)
const __rateLimit = new Map<string, { count: number; reset: number }>();
function allowRequest(ip: string, max = 120, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const entry = __rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    __rateLimit.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limit per IP (public endpoint)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!allowRequest(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("host_id");
    const status = searchParams.get("status");
    const approvalStatus = searchParams.get("approval_status");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
    const offset = (page - 1) * limit;

    // Search and filter parameters
    const location = searchParams.get("location");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const guests = searchParams.get("guests");
    const propertyType = searchParams.get("property_type");
    const amenities = searchParams.get("amenities");
    const checkIn = searchParams.get("check_in");
    const checkOut = searchParams.get("check_out");
    const sortBy = searchParams.get("sort_by") || "created_at"; // created_at, price_asc, price_desc, rating
    const minRating = searchParams.get("min_rating");

    console.log(`Fetching properties with filters:`, {
      hostId,
      status,
      location,
      maxPrice,
      minPrice,
      guests,
      propertyType,
      amenities,
      checkIn,
      checkOut,
      page,
      limit,
      sortBy,
    });

    let query = supabase
      .from("properties")
      .select(
        `
        *,
        property_images!property_images_property_id_fkey(
          id,
          public_url,
          is_primary,
          display_order
        ),
        profiles!properties_host_id_fkey(
          user_id,
          first_name,
          last_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true); // Only show active properties by default

    // Apply filters
    if (hostId) {
      query = query.eq("host_id", hostId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (approvalStatus) {
      const validApprovalStatuses = [
        "pending",
        "approved",
        "rejected",
        "flagged",
      ];
      if (validApprovalStatuses.includes(approvalStatus)) {
        query = query.eq("approval_status", approvalStatus);
      }
    } else {
      // By default, only show approved properties to public users
      // Hosts and admins can see all their properties regardless of approval status
      if (!hostId) {
        query = query.eq("approval_status", "approved");
      }
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

    // Rating filter
    if (minRating) {
      query = query.gte("rating", parseFloat(minRating));
    }

    // SERVER-SIDE amenities filter (moved from client-side)
    if (amenities) {
      const requiredAmenities = amenities.split(",").map(a => a.trim());
      requiredAmenities.forEach(amenity => {
        query = query.contains("amenities", [amenity]);
      });
    }

    // Sorting
    if (sortBy === "price_asc") {
      query = query.order("price_per_night", { ascending: true });
    } else if (sortBy === "price_desc") {
      query = query.order("price_per_night", { ascending: false });
    } else if (sortBy === "rating") {
      query = query.order("rating", { ascending: false, nullsFirst: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: properties, error, count } = await query;

    if (error) {
      throw error;
    }

    let filteredProperties = properties || [];

    // SERVER-SIDE availability check using database function
    if (checkIn && checkOut && filteredProperties.length > 0) {
      const availabilityPromises = filteredProperties.map(async property => {
        const { data: availCheck } = await supabase.rpc(
          "check_property_availability",
          {
            property_uuid: property.id,
            check_in_date: checkIn,
            check_out_date: checkOut,
          }
        );

        return {
          property,
          isAvailable: availCheck?.[0]?.is_available || false,
        };
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      filteredProperties = availabilityResults
        .filter(r => r.isAvailable)
        .map(r => r.property);
    }

    // Calculate additional metrics for each property
    const propertiesWithMetrics = filteredProperties.map(property => {
      // Use property rating if available
      const avgRating = property.rating || null;
      const reviewCount = property.review_count || 0;

      // Get primary image or first image
      const primaryImage = property.property_images?.find(
        (img: any) => img.is_primary
      );
      const images =
        property.property_images
          ?.sort((a: any, b: any) => a.display_order - b.display_order)
          ?.map((img: any) => img.public_url) || [];

      return {
        id: property.id,
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        country: property.country,
        price_per_night: parseFloat(property.price_per_night),
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        max_guests: property.max_guests,
        property_type: property.property_type,
        amenities: property.amenities || [],
        house_rules: property.house_rules || [],
        cancellation_policy: property.cancellation_policy,
        min_nights: property.min_nights,
        max_nights: property.max_nights,
        created_at: property.created_at,
        host: {
          id: property.profiles?.user_id,
          name:
            `${property.profiles?.first_name || ""} ${property.profiles?.last_name || ""}`.trim() ||
            "Host",
          avatar: property.profiles?.avatar_url,
        },
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        review_count: reviewCount,
        images: images,
        primary_image: primaryImage?.public_url || images[0] || null,
      };
    });

    return NextResponse.json({
      success: true,
      properties: propertiesWithMetrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
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
