import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/services/email.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "luism.desarrollo@gmail.com";

    // Check if API key is loaded
    const apiKey = process.env.BREVO_API_KEY;
    const apiKeyLength = apiKey ? apiKey.length : 0;
    const apiKeyStart = apiKey ? apiKey.substring(0, 5) : "none";

    console.log(
      `Test Email: Key length ${apiKeyLength}, starts with ${apiKeyStart}`
    );

    const result = await EmailService.sendEmail({
      toEmail: email,
      toName: "Test User",
      subject: "Test Email from Request",
      htmlContent: `<h1>It Works!</h1><p>This is a test email sent at ${new Date().toISOString()}</p>`,
      emailType: "test",
    });

    return NextResponse.json({
      success: result.success,
      details: result,
      envCheck: {
        hasKey: !!apiKey,
        keyLength: apiKeyLength,
        sender: process.env.BREVO_SENDER_EMAIL,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
