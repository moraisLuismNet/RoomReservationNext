import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Room } from "@/lib/entities/Room";
import { UserRole } from "@/lib/entities/UserRole";
import { withAuth } from "@/lib/utils/auth";
import { revalidateTag } from "next/cache";

// PUT - Update room (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const { id } = await params;
      const roomId = parseInt(id);

      if (isNaN(roomId)) {
        return NextResponse.json(
          { success: false, message: "Invalid room ID" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { roomNumber, isActive, imageRoom, roomTypeId } = body;
      const dataSource = await getDatabase();
      const roomRepository = dataSource.getRepository(Room);

      const room = await roomRepository.findOne({
        where: { roomId },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, message: "Room not found" },
          { status: 404 }
        );
      }

      // Update room fields
      if (roomNumber !== undefined) room.roomNumber = roomNumber;
      if (isActive !== undefined) room.isActive = isActive;
      if (imageRoom !== undefined) room.imageRoom = imageRoom;
      if (roomTypeId !== undefined) room.roomTypeId = roomTypeId;

      await roomRepository.save(room);

      revalidateTag("rooms");

      return NextResponse.json({
        success: true,
        data: room,
        message: "Room updated successfully",
      });
    } catch (error) {
      console.error("Update room error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }, UserRole.ADMIN)(request, {});
}

// DELETE - Delete room (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const { id } = await params;
      const roomId = parseInt(id);

      if (isNaN(roomId)) {
        return NextResponse.json(
          { success: false, message: "Invalid room ID" },
          { status: 400 }
        );
      }

      const dataSource = await getDatabase();
      const roomRepository = dataSource.getRepository(Room);

      const room = await roomRepository.findOne({
        where: { roomId },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, message: "Room not found" },
          { status: 404 }
        );
      }

      await roomRepository.remove(room);

      revalidateTag("rooms");

      return NextResponse.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error) {
      console.error("Delete room error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }, UserRole.ADMIN)(request, {});
}
