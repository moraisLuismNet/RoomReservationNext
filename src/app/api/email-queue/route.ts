import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/config/database";
import { EmailQueue } from "@/lib/entities/EmailQueue";
import { withAuth } from "@/lib/utils/auth";

// GET - Get email queue (admin only)
export async function GET(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      // Check if user is admin
      if (context.user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      const dataSource = await getDatabase();
      const emailQueueRepository = dataSource.getRepository(EmailQueue);

      const emails = await emailQueueRepository.find({
        order: { createdAt: "DESC" },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        data: emails,
      });
    } catch (error) {
      console.error("Get email queue error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}

// POST - Add email to queue
export async function POST(request: NextRequest) {
  return withAuth(async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const { to, subject, content } = body;

      if (!to || !subject || !content) {
        return NextResponse.json(
          { success: false, message: "To, subject, and content are required" },
          { status: 400 }
        );
      }

      const dataSource = await getDatabase();
      const emailQueueRepository = dataSource.getRepository(EmailQueue);

      const email = emailQueueRepository.create({
        toEmail: to,
        subject,
        body: content,
        emailType: "general",
        scheduledSendTime: new Date(),
        status: "pending",
        createdAt: new Date(),
      });

      const savedEmail = await emailQueueRepository.save(email);

      return NextResponse.json({
        success: true,
        data: savedEmail,
        message: "Email added to queue successfully",
      });
    } catch (error) {
      console.error("Add email to queue error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  })(request, {});
}
