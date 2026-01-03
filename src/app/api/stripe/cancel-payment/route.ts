import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth";
import { getDatabase } from "@/lib/config/database";
import { User } from "@/lib/entities/User";
import { EmailService } from "@/lib/services/email.service";

export async function POST(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      // Send cancellation email
      try {
        const dataSource = await getDatabase();
        const userRepository = dataSource.getRepository(User);

        const user = await userRepository.findOne({
          where: { email: context.user.email },
        });

        if (user) {
          await EmailService.sendCancellation(user);
        } else {
          console.warn(
            "User not found for cancellation email:",
            context.user.email
          );
        }
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: "Cancellation notification processed",
      });
    } catch (error) {
      console.error("Cancel payment error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}
