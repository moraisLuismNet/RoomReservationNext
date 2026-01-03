import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { User } from "@/lib/entities/User";
import { withAuth } from "@/lib/utils/auth";
import bcrypt from "bcryptjs";

// GET - Get current user profile
export async function GET(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const dataSource = await getDatabase();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { email: context.user.email },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get user profile error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const { fullName, phoneNumber, currentPassword, newPassword } = body;

      const dataSource = await getDatabase();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { email: context.user.email },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Update basic info
      if (fullName) user.fullName = fullName;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      // Update password if provided
      if (currentPassword && newPassword) {
        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );
        if (!isPasswordValid) {
          return NextResponse.json(
            { success: false, message: "Current password is incorrect" },
            { status: 400 }
          );
        }
        user.passwordHash = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await userRepository.save(user);

      return NextResponse.json({
        success: true,
        data: {
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phoneNumber: updatedUser.phoneNumber,
          createdAt: updatedUser.createdAt,
        },
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update user profile error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}
