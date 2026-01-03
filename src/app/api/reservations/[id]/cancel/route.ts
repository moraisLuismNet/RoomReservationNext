import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/config/data-source";
import { Reservation } from "@/lib/entities/Reservation";
import { ReservationStatus } from "@/lib/entities/ReservationStatus"; // Import Entity
import { ReservationStatusName } from "@/lib/entities/ReservationStatusName"; // Import Enum
import { EmailService } from "@/lib/services/email.service";
import jwt from "jsonwebtoken";
import { User } from "@/lib/entities/User";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = await params;
    const reservationId = parseInt(id, 10);
    const reservationRepo = AppDataSource.getRepository(Reservation);
    const reservation = await reservationRepo.findOne({
      where: { reservationId: reservationId },
      relations: ["user", "room", "status"],
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (reservation.user.email !== decoded.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to this reservation" },
        { status: 403 }
      );
    }

    // Check 24h rule
    const checkInDate = new Date(reservation.checkInDate);
    const now = new Date();
    const diffMs = checkInDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reservations can only be cancelled more than 24 hours before check-in.",
        },
        { status: 400 }
      );
    }

    // Find Cancelled Status
    const statusRepo = AppDataSource.getRepository(ReservationStatus);
    const cancelledStatus = await statusRepo.findOne({
      where: { name: ReservationStatusName.CANCELLED },
    });

    if (!cancelledStatus) {
      return NextResponse.json(
        { success: false, message: "Cancelled status not found in database" },
        { status: 500 }
      );
    }

    // Update Reservation
    reservation.status = cancelledStatus;
    reservation.cancellationDate = new Date();
    reservation.cancellationReason = "User cancelled via My Reservations";

    await reservationRepo.save(reservation);

    // Send Email
    // Using user relation loaded earlier
    try {
      await EmailService.sendReservationCancellation(
        reservation.user,
        reservation
      );
    } catch (emailError) {
      console.error("Failed to send cancellation email", emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
