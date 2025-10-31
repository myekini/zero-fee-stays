import { createClient } from "@/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/properties/[id]/images/[imageId]
 * Delete a property image
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const imageId = resolvedParams.imageId;

    // Get image details
    const { data: image, error: imageError } = await supabase
      .from("property_images")
      .select("*, properties!inner(host_id)")
      .eq("id", imageId)
      .eq("property_id", propertyId)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Verify ownership
    if (image.properties.host_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete images from your own properties" },
        { status: 403 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(image.storage_bucket || '')
      .remove([image.storage_path || '']);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database (will trigger image count update)
    const { error: deleteError } = await supabase
      .from("property_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      console.error("Database deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    // If deleted image was primary, set another image as primary
    if (image.is_primary) {
      const { data: remainingImages } = await supabase
        .from("property_images")
        .select("id")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: true })
        .limit(1);

      if (remainingImages && remainingImages.length > 0) {
        await supabase
          .from("property_images")
          .update({ is_primary: true })
          .eq("id", remainingImages[0].id);
      }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete_property_image",
      entity_type: "property",
      entity_id: propertyId,
      metadata: {
        image_id: imageId,
        file_name: image.file_name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/properties/[id]/images/[imageId]
 * Update image properties (set as primary, update caption, reorder)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const imageId = resolvedParams.imageId;

    // Get image details
    const { data: image, error: imageError } = await supabase
      .from("property_images")
      .select("*, properties!inner(host_id)")
      .eq("id", imageId)
      .eq("property_id", propertyId)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Verify ownership
    if (image.properties.host_id !== user.id) {
      return NextResponse.json(
        { error: "You can only update images from your own properties" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { isPrimary, caption, displayOrder } = body;

    const updates: any = { updated_at: new Date().toISOString() };

    if (isPrimary !== undefined) {
      updates.is_primary = isPrimary;
    }

    if (caption !== undefined) {
      updates.caption = caption;
    }

    if (displayOrder !== undefined) {
      updates.display_order = displayOrder;
    }

    // Update image
    const { error: updateError } = await supabase
      .from("property_images")
      .update(updates)
      .eq("id", imageId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update_property_image",
      entity_type: "property",
      entity_id: propertyId,
      metadata: {
        image_id: imageId,
        updates: updates,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image updated successfully",
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/properties/[id]/images/[imageId]
 * Get image details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const supabase = await createClient();

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const imageId = resolvedParams.imageId;

    const { data: image, error: imageError } = await supabase
      .from("property_images")
      .select("*")
      .eq("id", imageId)
      .eq("property_id", propertyId)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: image.id,
      propertyId: image.property_id,
      url: image.public_url,
      fileName: image.file_name,
      fileSize: image.file_size,
      mimeType: image.mime_type,
      width: image.width,
      height: image.height,
      isPrimary: image.is_primary,
      displayOrder: image.display_order,
      caption: image.caption,
      createdAt: image.created_at,
      updatedAt: image.updated_at,
    });
  } catch (error) {
    console.error("Error getting image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
