export interface EmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  emailType: string;
  reservationId?: number;
}

export class EmailService {
  private static readonly BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

  /**
   * Sends an email via Brevo API
   */
  static async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: any }> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail =
      process.env.BREVO_SENDER_EMAIL || "no-reply@roomreservation.com";
    const senderName = "Room Reservation";

    console.log(
      `[EmailService] Attempting to send email to: ${options.toEmail}`
    );
    console.log(`[EmailService] Sender: ${senderEmail}`);
    console.log(`[EmailService] API Key present: ${!!apiKey}`);

    if (!apiKey) {
      console.error(
        "[EmailService] BREVO_API_KEY is missing from environment variables."
      );
      return { success: false, error: "API Key missing" };
    }

    try {
      const response = await fetch(this.BREVO_API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [
            { email: options.toEmail, name: options.toName || options.toEmail },
          ],
          subject: options.subject,
          htmlContent: options.htmlContent,
        }),
      });

      const data = await response.json();
      console.log(`[EmailService] Brevo Status: ${response.status}`);

      if (response.ok) {
        console.log(
          `[EmailService] Email sent successfully. Message ID: ${data.messageId}`
        );
        return { success: true, messageId: data.messageId };
      } else {
        console.error(
          "[EmailService] Brevo API error details:",
          JSON.stringify(data)
        );
        return { success: false, error: data };
      }
    } catch (error) {
      console.error("[EmailService] Fetch exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Sends a reservation confirmation email
   */
  static async sendConfirmation(reservation: any, user: any): Promise<any> {
    const checkIn = new Date(reservation.checkInDate).toLocaleDateString();
    const checkOut = new Date(reservation.checkOutDate).toLocaleDateString();

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">Reservation confirmed</h1>
        <p>Hello <strong>${user.fullName}</strong>,</p>
        <p>Thank you for choosing <strong>Room Reservation</strong>! Your payment has been processed successfully and your reservation has been confirmed.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <h2 style="font-size: 18px; margin-top: 0;">Reservation details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Reservation ID:</td>
              <td style="padding: 8px 0; font-weight: bold;">#${
                reservation.reservationId
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Room:</td>
              <td style="padding: 8px 0; font-weight: bold;">Room ${
                reservation.roomNumber || "Details in system"
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Check-in:</td>
              <td style="padding: 8px 0; font-weight: bold;">${checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Check-out:</td>
              <td style="padding: 8px 0; font-weight: bold;">${checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Guests:</td>
              <td style="padding: 8px 0; font-weight: bold;">${
                reservation.numberOfGuests
              }</td>
            </tr>
          </table>
        </div>
        
        <p>Thank you for choosing <strong>Room Reservation</strong>! Your payment has been processed successfully and your reservation has been confirmed.</p>
        <p>Looking forward to seeing you soon!</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated email, please do not reply to this message.</p>
      </div>
    `;

    return this.sendEmail({
      toEmail: user.email,
      toName: user.fullName,
      subject: `Reservation confirmation #${reservation.reservationId} - Room Reservation`,
      htmlContent,
      emailType: "confirmation",
      reservationId: reservation.reservationId,
    });
  }

  /**
   * Sends a reservation cancellation email
   */
  static async sendCancellation(user: any): Promise<any> {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
        <h1 style="color: #dc2626; margin-bottom: 24px;">Payment Cancelled</h1>
        <p>Hello <strong>${user.fullName}</strong>,</p>
        <p>We inform you that your payment process in <strong>Room Reservation</strong> has been cancelled or could not be completed correctly.</p>
        
        <p>No charge has been made to your account. If you wish to try to make the reservation again, you can return to our website at any time.</p>
        <p>If you experienced any technical problems during the payment process, please let us know.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Best regards,<br>Room Reservation Team</p>
      </div>
    `;

    return this.sendEmail({
      toEmail: user.email,
      toName: user.fullName,
      subject: "Payment Process Cancelled - Room Reservation",
      htmlContent,
      emailType: "cancellation",
    });
  }

  /**
   * Sends a reservation cancellation email (after payment/confirmation)
   */
  static async sendReservationCancellation(
    user: any,
    reservation: any
  ): Promise<any> {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
        <h1 style="color: #dc2626; margin-bottom: 24px;">Reservation Cancelled</h1>
        <p>Hello <strong>${user.fullName}</strong>,</p>
        <p>We confirm that your reservation <strong>#${
          reservation.reservationId
        }</strong> for <strong>${
      reservation.room?.roomType?.roomTypeName || "Room"
    } ${reservation.room?.roomNumber || ""}</strong> has been cancelled.</p>
        
        <p>If you have any questions, please contact our support team.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Best regards,<br>Room Reservation Team</p>
      </div>
    `;

    return this.sendEmail({
      toEmail: user.email,
      toName: user.fullName,
      subject: `Reservation Cancelled #${reservation.reservationId} - Room Reservation`,
      htmlContent,
      emailType: "reservation_cancellation",
      reservationId: reservation.reservationId,
    });
  }
}
