import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { RoomType } from "@/lib/entities/RoomType";

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDatabase();
    const roomTypeRepository = dataSource.getRepository(RoomType);

    const roomTypes = await roomTypeRepository.find();

    return NextResponse.json({
      success: true,
      data: roomTypes,
    });
  } catch (error) {
    console.error("Get room types error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
