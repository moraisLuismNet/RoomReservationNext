import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Room } from "@/lib/entities/Room";
import { UserRole } from "@/lib/entities/UserRole";
import { withAuth } from "@/lib/utils/auth";
import { revalidateTag } from "next/cache";

// POST - Create new room (Admin only)
export async function POST(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const { roomNumber, roomTypeId, isActive, imageRoom } = body;

      if (!roomNumber || !roomTypeId) {
        return NextResponse.json(
          { success: false, message: "Room number and room type are required" },
          { status: 400 }
        );
      }

      const dataSource = await getDatabase();
      const roomRepository = dataSource.getRepository(Room);

      // Check if room number already exists
      const existingRoom = await roomRepository.findOne({
        where: { roomNumber },
      });

      if (existingRoom) {
        return NextResponse.json(
          { success: false, message: "Room number already exists" },
          { status: 400 }
        );
      }

      const room = roomRepository.create({
        roomNumber,
        roomTypeId,
        isActive: isActive !== undefined ? isActive : true,
        imageRoom: imageRoom || null,
      });

      await roomRepository.save(room);

      // Invalidate rooms cache
      revalidateTag("rooms");

      return NextResponse.json({
        success: true,
        data: room,
        message: "Room created successfully",
      });
    } catch (error) {
      console.error("Create room error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }, UserRole.ADMIN)(request, {});
}
