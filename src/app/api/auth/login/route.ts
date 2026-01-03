import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { User } from "@/lib/entities/User";
import { generateToken } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const dataSource = await getDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await userRepository.save(user);

    const token = generateToken({
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phoneNumber: user.phoneNumber,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
