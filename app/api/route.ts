import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "HiddyStays API - Built by hosts, for hosts",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    docs:
      process.env.NODE_ENV === "development"
        ? "/api/docs"
        : "Documentation disabled in production",
  });
}

