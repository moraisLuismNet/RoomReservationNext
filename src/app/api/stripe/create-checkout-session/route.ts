import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const {
        roomId,
        roomNumber,
        roomTypeName,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        pricePerNight,
      } = body;

      if (
        !roomId ||
        !checkInDate ||
        !checkOutDate ||
        !numberOfGuests ||
        !pricePerNight
      ) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }

      // Calculate number of nights and total price
      const nights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const pricePerNightNum = parseFloat(pricePerNight.toString());
      if (isNaN(pricePerNightNum)) {
        return NextResponse.json(
          { success: false, message: "Invalid price per night" },
          { status: 400 }
        );
      }

      const totalPrice = nights * pricePerNightNum;

      // Determine the base URL dynamically from the request
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("host") || "localhost:3000";
      const baseUrl = `${protocol}://${host}`;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${roomTypeName} - Room ${roomNumber}`,
                description: `${nights} night(s) | ${numberOfGuests} guest(s) | ${new Date(
                  checkInDate
                ).toLocaleDateString()} - ${new Date(
                  checkOutDate
                ).toLocaleDateString()}`,
              },
              unit_amount: Math.round(totalPrice * 100), // Stripe expects amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        locale: "en",
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`,
        metadata: {
          roomId: roomId.toString(),
          roomNumber: roomNumber.toString(),
          checkInDate,
          checkOutDate,
          numberOfGuests: numberOfGuests.toString(),
          userEmail: context.user.email,
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create checkout session" },
        { status: 500 }
      );
    }
  })(request, {});
}
