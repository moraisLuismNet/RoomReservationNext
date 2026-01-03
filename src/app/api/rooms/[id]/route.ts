import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Room } from "@/lib/entities/Room";
import { ReservationStatusName } from "@/lib/entities/ReservationStatusName";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if user is admin to allow fetching inactive rooms
    const { getTokenFromRequest, verifyToken } = await import(
      "@/lib/utils/auth"
    );
    const { UserRole } = await import("@/lib/entities/UserRole");

    const token = getTokenFromRequest(request);
    const decoded = token ? verifyToken(token) : null;
    const isAdmin =
      decoded?.role.toLowerCase() === UserRole.ADMIN.toLowerCase();

    const room = await roomRepository.findOne({
      where: isAdmin ? { roomId } : { roomId, isActive: true },
      relations: ["roomType", "reservations", "reservations.status"],
    });

    if (room && room.reservations) {
      room.reservations = room.reservations.filter(
        (res) => res.status.name !== ReservationStatusName.CANCELLED
      );
    }

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
