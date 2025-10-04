import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const propertyId = formData.get("propertyId") as string;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${propertyId || "temp"}/${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `public/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("property-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("property-images").getPublicUrl(filePath);

    // Create optimized thumbnail URL
    const thumbnailUrl = `https://ihgzllefbkzqnomsviwh.supabase.co/storage/v1/render/image/public/property-images/${filePath}?width=400&height=300&quality=80&resize=cover`;

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      thumbnailUrl: thumbnailUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");
    const userId = searchParams.get("userId");

    if (!imageUrl || !userId) {
      return NextResponse.json(
        { error: "Image URL and userId are required" },
        { status: 400 }
      );
    }

    // Extract file path from URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `public/${userId}/${fileName}`;

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from("property-images")
      .remove([filePath]);

    if (error) {
      console.error("Storage delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Image delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

