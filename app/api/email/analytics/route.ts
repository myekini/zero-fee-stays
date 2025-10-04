import { NextRequest, NextResponse } from "next/server";
import { unifiedEmailService } from "@/lib/unified-email-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get("type") || undefined;
    const days = parseInt(searchParams.get("days") || "30");

    const result = await unifiedEmailService.getEmailAnalytics(emailType, days);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email analytics API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
