interface BookingConfirmationData {
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  guestsCount: number;
  totalAmount: number;
  bookingId: string;
  hostName: string;
  hostEmail: string;
  propertyImages?: string[];
}

export const bookingConfirmationEmailTemplate = (
  data: BookingConfirmationData
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0">
    <title>Booking Confirmation - ZeroFeeStays</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .booking-details { background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #495057; }
        .detail-value { color: #212519; }
        .amount-highlight { background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #28a745; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .footer { background: #343a40; color: white; padding: 30px; text-align: center; font-size: 14px; }
        .host-contact { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .property-image { width: 100%; max-width: 300px; border-radius: 8px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your Zero Fee Stays reservation is confirmed</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${data.guestName}</strong>,</p>
            
            <p>Great news! Your booking has been confirmed with zero platform fees. We're excited to welcome you to <strong>${data.propertyTitle}</strong>.</p>
            
            <div class="booking-details">
                <h3 style="margin-top: 0; color: #495057;">📋 Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Property:</span>
                    <span class="detail-force">${data.propertyTitle}</span>
                </div>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${data.propertyAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-in:</span>
                    <span class="detail-value">${data.checkInDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-out:</span>
                    <span class="detail-value">${data.checkOutDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${data.totalNights} night${data.totalNights > 1 ? "s" : ""}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guests:</span>
                    <span class="detail-value">${data.guestsCount} guest${data.guestsCount > 1 ? "s" : ""}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">#${data.bookingId}</span>
                </div>
            </div>
            
            ${
              data.propertyImages && data.propertyImages.length > 0
                ? `
                <div style="text-align: center; margin: 20px 0;">
                    <h3>🏠 Your Property</h3>
                    <img src="${data.propertyImages[0]}" alt="${data.propertyTitle}" class="property-image">
                </div>
            `
                : ""
            }
            
            <div class="amount-highlight">
                <div style="font-size: 24px; font-weight: bold; color: #28a745; text-align: center;">
                    Total: $${data.totalAmount.toFixed(2)}
                </div>
                <div style="text-align: center; font-size: 14px; color: #6c757d; margin-top: 5px;">
                    ✅ Zero platform fees - Direct booking with host
                </div>
            </div>
            
            <div class="host-contact">
                <h3 style="margin-top: 0; color: #856404;">👤 Host Contact</h3>
                <p><strong>Host:</strong> ${data.hostName}</p>
                <p><strong>Email:</strong> ${data.hostEmail}</p>
                <p><strong>Need to ask questions?</strong> Contact your host directly for any special requests or information about your stay.</p>
            </div>
            
            <div style="margin: 30px 0;">
                <h3 style="color: #495057;">📝 What's Next?</h3>
                <ul style="color: #6c757d;">
                    <li>Check your booking details carefully</li>
                    <li>Save your host's contact information</li>
                    <li>Prepare for your amazing stay!</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">View Booking Details</a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
                Need help? Contact us at 
                <a href="mailto:support@zerofeestays.com" style="color: #007bff;">support@zerofeestays.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Zero Fee Stays</strong><br>
            Making travel bookings simple and fee-free</p>
            <p>© 2024 Zero Fee Stays. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export const bookingConfirmationTextTemplate = (
  data: BookingConfirmationData
) => {
  return `
BOOKING CONFIRMED! 🎉

Dear ${data.guestName},

Great news! Your booking has been confirmed with zero platform fees.

BOOKING DETAILS:
Property: ${data.propertyTitle}
Address: ${data.propertyAddress}
Check-in: ${data.checkInDate}
Check-out: ${data.checkOutDate}
Duration: ${data.totalNights} night${data.totalNights > 1 ? "s" : ""}
Guests: ${data.guestsCount} guest${data.guestsCount > 1 ? "s" : ""}
Booking ID: #${data.bookingId}
Total: $${data.totalAmount.toFixed(2)} ✅ Zero platform fees

HOST CONTACT:
Host: ${data.hostName}
Email: ${data.hostEmail}

For any questions about your stay, contact your host directly.

Need help? Contact us at support@zerofeestays.com

Zero Fee Stays - Making travel bookings simple and fee-free
© 2024 Zero Fee Stays. All rights reserved.
  `;
};
