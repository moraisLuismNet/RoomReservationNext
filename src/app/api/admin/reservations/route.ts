import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Reservation } from "@/lib/entities/Reservation";
import { UserRole } from "@/lib/entities/UserRole";
import { ReservationStatusName } from "@/lib/entities/ReservationStatusName";
import { withAuth } from "@/lib/utils/auth";
import { Not } from "typeorm";

// GET - Get all reservations (Admin only)
export async function GET(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "5");
      const skip = (page - 1) * limit;

      const dataSource = await getDatabase();
      const reservationRepository = dataSource.getRepository(Reservation);

      const [reservations, total] = await reservationRepository.findAndCount({
        where: {
          status: {
            name: Not(ReservationStatusName.CANCELLED),
          },
        },
        relations: ["room", "room.roomType", "status", "user"],
        order: { reservationDate: "DESC" },
        take: limit,
        skip: skip,
      });

      // Transform data for frontend
      const dataWithPrice = reservations.map((res) => {
        const checkIn = new Date(res.checkInDate);
        const checkOut = new Date(res.checkOutDate);
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalPrice = nights * (res.room.roomType.pricePerNight || 0);

        return {
          ...res,
          fullName: res.user?.fullName || "No Name",
          phoneNumber: res.user?.phoneNumber || "No Phone",
          totalPrice,
        };
      });

      return NextResponse.json({
        success: true,
        data: dataWithPrice,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get admin reservations error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }, UserRole.ADMIN)(request, {});
}
