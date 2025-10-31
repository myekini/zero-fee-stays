import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/integrations/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get("conversation_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!conversationId) {
      // Get all conversations for the user
      const { data: conversations, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${userProfile.id},receiver_id.eq.${userProfile.id}`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
          { error: "Failed to fetch conversations" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        conversations: conversations || [],
      });
    }

    // Get messages for a specific conversation
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        recipient:recipient_id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });
  } catch (error: any) {
    console.error("Error in messages GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!senderProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      conversation_id,
      property_id,
      recipient_id,
      content,
      message_type = "text",
    } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    let conversationId = conversation_id;

    // If no conversation_id, create a new conversation
    if (!conversationId && property_id && recipient_id) {
      // Get property to find host
      const { data: property } = await supabase
        .from("properties")
        .select("host_id")
        .eq("id", property_id)
        .single();

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Determine guest and host
      const guestId = senderProfile.id === property.host_id ? recipient_id : senderProfile.id;
      const hostId = property.host_id;

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("property_id", property_id)
        .eq("guest_id", guestId)
        .eq("host_id", hostId)
        .single();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("conversations")
          .insert({
            property_id,
            guest_id: guestId,
            host_id: hostId,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          return NextResponse.json(
            { error: "Failed to create conversation" },
            { status: 500 }
          );
        }

        conversationId = newConversation.id;
      }
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID or property details required" },
        { status: 400 }
      );
    }

    // Get conversation to determine recipient
    const { data: conversation } = await supabase
      .from("conversations")
      .select("guest_id, host_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Determine recipient
    const recipientId =
      senderProfile.id === conversation.guest_id
        ? conversation.host_id
        : conversation.guest_id;

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderProfile.id,
        recipient_id: recipientId,
        content: content.trim(),
        message_type,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Create notification for recipient
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .eq("id", recipientId)
      .single();

    if (recipientProfile) {
      await supabase.from("notifications").insert({
        user_id: recipientProfile.user_id,
        type: "new_message",
        title: "New Message",
        message: `You have a new message from ${message.sender.first_name}`,
        metadata: { conversation_id: conversationId, message_id: message.id },
      });
    }

    return NextResponse.json({
      success: true,
      message,
      conversation_id: conversationId,
    });
  } catch (error: any) {
    console.error("Error in messages POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { message_id, conversation_id, mark_all_read } = body;

    if (mark_all_read && conversation_id) {
      // Mark all messages in conversation as read
      // Note: Read tracking is not implemented in the current messages table schema
      return NextResponse.json({
        success: true,
        message: "Read tracking not implemented",
      });
    }

    if (message_id) {
      // Mark single message as read
      // Note: Read tracking is not implemented in the current messages table schema
      return NextResponse.json({
        success: true,
        message: "Read tracking not implemented",
      });
    }

    return NextResponse.json(
      { error: "message_id or mark_all_read required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in messages PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
