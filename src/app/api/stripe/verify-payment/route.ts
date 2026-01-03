import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { Reservation } from "@/lib/entities/Reservation";
import { User } from "@/lib/entities/User";
import { ReservationStatus } from "@/lib/entities/ReservationStatus";
import { ReservationStatusName } from "@/lib/entities/ReservationStatusName";
import { withAuth } from "@/lib/utils/auth";
import Stripe from "stripe";
import { EmailService } from "@/lib/services/email.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        return NextResponse.json(
          { success: false, message: "Session ID is required" },
          { status: 400 }
        );
      }

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { success: false, message: "Payment not completed" },
          { status: 400 }
        );
      }

      // Extract metadata
      const {
        roomId,
        roomNumber,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        userEmail,
      } = session.metadata || {};

      if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
        return NextResponse.json(
          { success: false, message: "Invalid session metadata" },
          { status: 400 }
        );
      }

      // Verify the user email matches
      if (userEmail !== context.user.email) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }

      const dataSource = await getDatabase();
      const reservationRepository = dataSource.getRepository(Reservation);
      const userRepository = dataSource.getRepository(User);
      const reservationStatusRepository =
        dataSource.getRepository(ReservationStatus);

      // Get confirmed status
      const confirmedStatus = await reservationStatusRepository.findOne({
        where: { name: ReservationStatusName.CONFIRMED },
      });

      if (!confirmedStatus) {
        return NextResponse.json(
          { success: false, message: "Reservation status not configured" },
          { status: 500 }
        );
      }

      // Create reservation
      const reservationData = {
        email: context.user.email,
        roomId: parseInt(roomId),
        statusId: confirmedStatus.statusId,
        reservationDate: new Date(),
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: parseInt(numberOfGuests),
      };

      const savedReservation = await reservationRepository.save(
        reservationData
      );

      // Send confirmation email (async/non-blocking for the response)
      try {
        // Fetch full user details to get the name
        const user = await userRepository.findOne({
          where: { email: context.user.email },
        });

        if (user) {
          await EmailService.sendConfirmation(
            { ...savedReservation, roomNumber: roomNumber || "" },
            user
          );
        } else {
          console.warn(
            "User not found for email confirmation:",
            context.user.email
          );
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // We don't fail the whole request because the reservation was already saved
      }

      return NextResponse.json({
        success: true,
        data: savedReservation,
        message: "Reservation created successfully",
      });
    } catch (error) {
      console.error("Verify payment error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}
