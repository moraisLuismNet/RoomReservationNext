import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { User } from "@/lib/entities/User";
import { UserRole } from "@/lib/entities/UserRole";
import { withAuth } from "@/lib/utils/auth";

// GET - Get all users (Admin only)
export async function GET(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "5");
      const skip = (page - 1) * limit;

      const dataSource = await getDatabase();
      const userRepository = dataSource.getRepository(User);

      const [users, total] = await userRepository.findAndCount({
        select: [
          "email",
          "fullName",
          "phoneNumber",
          "role",
          "isActive",
          "createdAt",
        ],
        order: { createdAt: "DESC" },
        take: limit,
        skip: skip,
      });

      return NextResponse.json({
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get admin users error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }, UserRole.ADMIN)(request, {});
}
