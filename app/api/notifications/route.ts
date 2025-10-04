import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`Creating notification for user: ${userId}`);

    // Create notification
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching notifications for user: ${userId}`);

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      count: notifications?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    console.log(`Updating notification: ${notificationId}`);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (isRead !== undefined) {
      updateData.is_read = isRead;
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .update(updateData)
      .eq("id", notificationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    console.log(`Deleting notification: ${notificationId}`);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
