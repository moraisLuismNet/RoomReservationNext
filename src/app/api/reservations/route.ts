import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Reservation } from "@/lib/entities/Reservation";
import { Room } from "@/lib/entities/Room";
import { ReservationStatus } from "@/lib/entities/ReservationStatus";
import { ReservationStatusName } from "@/lib/entities/ReservationStatusName";
import { withAuth } from "@/lib/utils/auth";
import { Not } from "typeorm";

// GET - Get user's reservations
export async function GET(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const dataSource = await getDatabase();
      const reservationRepository = dataSource.getRepository(Reservation);

      const reservations = await reservationRepository.find({
        where: {
          email: context.user.email,
          status: {
            name: Not(ReservationStatusName.CANCELLED),
          },
        },
        relations: ["room", "room.roomType", "status"],
        order: { reservationDate: "DESC" },
      });

      return NextResponse.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      console.error("Get reservations error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}

// POST - Create new reservation
export async function POST(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const { roomId, checkInDate, checkOutDate, numberOfGuests } = body;

      if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
        return NextResponse.json(
          { success: false, message: "All fields are required" },
          { status: 400 }
        );
      }

      const dataSource = await getDatabase();
      const reservationRepository = dataSource.getRepository(Reservation);
      const roomRepository = dataSource.getRepository(Room);
      const reservationStatusRepository =
        dataSource.getRepository(ReservationStatus);

      // Check if room exists and is active
      const room = await roomRepository.findOne({
        where: { roomId, isActive: true },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, message: "Room not found or not available" },
          { status: 404 }
        );
      }

      // Check if number of guests is valid
      if (numberOfGuests > room.roomType.capacity) {
        return NextResponse.json(
          { success: false, message: "Number of guests exceeds room capacity" },
          { status: 400 }
        );
      }

      // Check for overlapping reservations
      // Overlap condition: requested_start < existing_end AND requested_end > existing_start
      const overlappingReservation = await reservationRepository
        .createQueryBuilder("reservation")
        .innerJoin("reservation.status", "status")
        .where("reservation.room_id = :roomId", { roomId })
        .andWhere("status.name != :cancelledStatus", {
          cancelledStatus: ReservationStatusName.CANCELLED,
        })
        .andWhere(
          "reservation.check_in_date < :checkOutDate AND reservation.check_out_date > :checkInDate",
          {
            checkInDate,
            checkOutDate,
          }
        )
        .getOne();

      if (overlappingReservation) {
        return NextResponse.json(
          {
            success: false,
            message: "Room is not available for the selected dates",
          },
          { status: 400 }
        );
      }

      // Get pending status
      const pendingStatus = await reservationStatusRepository.findOne({
        where: { name: ReservationStatusName.PENDING },
      });

      if (!pendingStatus) {
        return NextResponse.json(
          { success: false, message: "Reservation status not configured" },
          { status: 500 }
        );
      }

      // Create reservation
      const reservationData = {
        email: context.user.email,
        roomId: roomId,
        statusId: pendingStatus.statusId,
        reservationDate: new Date(),
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
      };

      const savedReservation = await reservationRepository.save(
        reservationData
      );

      return NextResponse.json({
        success: true,
        data: savedReservation,
        message: "Reservation created successfully",
      });
    } catch (error) {
      console.error("Create reservation error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}
