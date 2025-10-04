import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateUser,
  authorizePropertyAccess,
  createAuthResponse,
} from "@/lib/auth-middleware";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching property: ${propertyId}`);

    // Fetch property with related data
    const { data: property, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_images!property_images_property_id_fkey(*),
        profiles!properties_host_id_fkey(
          first_name,
          last_name,
          avatar_url,
          email
        )
      `
      )
      .eq("id", propertyId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Transform the property data
    const transformedProperty = {
      ...property,
      metrics: {
        images:
          property.property_images?.map((img: any) => img.image_url) || [],
      },
    };

    return NextResponse.json({
      success: true,
      property: transformedProperty,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const { id: propertyId } = await params;
    const body = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if user owns this property
    const isAuthorized = await authorizePropertyAccess(user, propertyId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized to update this property" },
        { status: 403 }
      );
    }

    console.log(`Updating property: ${propertyId}`);

    // Update property
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    const allowedFields = [
      "title",
      "description",
      "address",
      "location",
      "price_per_night",
      "bedrooms",
      "bathrooms",
      "max_guests",
      "property_type",
      "amenities",
      "availability_rules",
      "house_rules",
      "cancellation_policy",
      "status",
      "is_active",
      "is_featured",
      "min_nights",
      "max_nights",
      "advance_notice_hours",
      "same_day_booking",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", propertyId)
      .select()
      .single();

    if (propertyError) {
      throw propertyError;
    }

    // Update images if provided
    if (body.images) {
      // Delete existing images
      await supabase
        .from("property_images")
        .delete()
        .eq("property_id", propertyId);

      // Add new images
      if (body.images.length > 0) {
        const imageInserts = body.images.map((imageUrl: string) => ({
          property_id: propertyId,
          image_url: imageUrl,
          is_primary: body.images.indexOf(imageUrl) === 0,
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
      property,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const { id: propertyId } = await params;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if user owns this property
    const isAuthorized = await authorizePropertyAccess(user, propertyId);
    if (!isAuthorized) {
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
