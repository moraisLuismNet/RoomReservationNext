import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { User } from "@/lib/entities/User";
import { UserRole } from "@/lib/entities/UserRole";
import { generateToken } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, password, phoneNumber } = await request.json();

    if (!email || !fullName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, full name, and password are required",
        },
        { status: 400 }
      );
    }

    const dataSource = await getDatabase();
    const userRepository = dataSource.getRepository(User);

    // Check if email is already taken
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 409 }
      );
    }

    // Create new user with hashed password
    const user = new User();
    user.email = email;
    user.fullName = fullName;
    user.phoneNumber = phoneNumber;
    user.role = UserRole.USER;
    user.isActive = true;

    // Hash password before saving
    user.passwordHash = password;
    await user.hashPassword();

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
