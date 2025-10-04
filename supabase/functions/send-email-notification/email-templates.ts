export const getEmailTemplate = (template: string, data: Record<string, any>) => {
  switch (template) {
    case 'booking_confirmation_guest':
      return {
        subject: `Booking Confirmation - ${data.propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">HiddyStays</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Booking Confirmed!</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                Great news! Your booking has been confirmed. Here are your booking details:
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">${data.propertyTitle}</h3>
                <p style="margin: 5px 0;"><strong>Guest:</strong> ${data.guestName}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${data.checkInDate}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${data.checkOutDate}</p>
                <p style="margin: 5px 0;"><strong>Guests:</strong> ${data.guestsCount}</p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${data.totalAmount} CAD</p>
              </div>
              
              <h3 style="color: #1e293b;">What's Next?</h3>
              <ul style="color: #64748b; line-height: 1.6;">
                <li>You'll receive check-in instructions 24 hours before arrival</li>
                <li>Your host may contact you with additional information</li>
                <li>Feel free to message your host if you have any questions</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.propertyUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Booking Details
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Need help? Contact us at support@hiddystays.com</p>
            </div>
          </div>
        `
      };

    case 'new_booking_host':
      return {
        subject: `New Booking Request - ${data.propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">HiddyStays</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">New Booking Request</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                You have a new booking request for your property. Please review and respond promptly.
              </p>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #1e293b; margin-top: 0;">${data.propertyTitle}</h3>
                <p style="margin: 5px 0;"><strong>Guest:</strong> ${data.guestName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${data.guestEmail}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.guestPhone || 'Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${data.checkInDate}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${data.checkOutDate}</p>
                <p style="margin: 5px 0;"><strong>Guests:</strong> ${data.guestsCount}</p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${data.totalAmount} CAD</p>
              </div>
              
              ${data.specialRequests ? `
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong>Special Requests:</strong>
                  <p style="margin: 5px 0 0 0;">${data.specialRequests}</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  Approve Booking
                </a>
                <a href="${data.dashboardUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Decline Booking
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Manage all your bookings at your host dashboard</p>
            </div>
          </div>
        `
      };

    case 'check_in_reminder':
      return {
        subject: `Check-in Tomorrow - ${data.propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">HiddyStays</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Check-in Tomorrow!</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                Your stay at <strong>${data.propertyTitle}</strong> begins tomorrow. Here are your check-in details:
              </p>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e293b; margin-top: 0;">Check-in Information</h3>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${data.checkInDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${data.checkInTime || '3:00 PM'}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${data.propertyAddress}</p>
              </div>
              
              <h3 style="color: #1e293b;">Check-in Instructions</h3>
              <div style="color: #64748b; line-height: 1.6;">
                ${data.checkInInstructions || `
                  <p>1. Arrive at the specified check-in time</p>
                  <p>2. Contact your host upon arrival</p>
                  <p>3. Complete the check-in process</p>
                  <p>4. Enjoy your stay!</p>
                `}
              </div>
              
              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Host Contact:</strong>
                <p style="margin: 5px 0 0 0;">Name: ${data.hostName}</p>
                <p style="margin: 5px 0 0 0;">Phone: ${data.hostPhone || 'Available through platform'}</p>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Have questions? Message your host directly through the platform</p>
            </div>
          </div>
        `
      };

    case 'new_message_notification':
      return {
        subject: `New Message from ${data.senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">HiddyStays</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">New Message</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                You have a new message from <strong>${data.senderName}</strong> regarding your booking at <strong>${data.propertyTitle}</strong>.
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-style: italic;">"${data.messageContent}"</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.conversationUrl}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reply to Message
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Keep the conversation going on HiddyStays</p>
            </div>
          </div>
        `
      };

    case 'welcome':
      return {
        subject: `Welcome to HiddyStays, ${data.name}! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to HiddyStays!</h1>
            </div>

            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${data.name}! 👋</h2>

              <p style="color: #64748b; line-height: 1.8; font-size: 16px;">
                We're thrilled to have you join the HiddyStays community! You're now part of Canada's premier zero-fee property rental platform where hosts keep 100% of their earnings.
              </p>

              <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #1e293b; margin-top: 0; font-size: 20px;">What's Next?</h3>
                <ul style="color: #64748b; line-height: 1.8; padding-left: 20px;">
                  <li>Browse our amazing properties across Canada</li>
                  <li>Book your perfect stay with zero platform fees</li>
                  <li>List your own property and keep 100% of your earnings</li>
                  <li>Connect with verified hosts and guests</li>
                </ul>
              </div>

              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 0; color: #1e293b;"><strong>💡 Pro Tip:</strong> Complete your profile to build trust with the community and unlock all features!</p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="https://hiddystays.com/properties" style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Start Exploring
                </a>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 30px; text-align: center; color: #64748b; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">Questions? We're here to help!</p>
              <p style="margin: 0;">Email us at <a href="mailto:support@hiddystays.com" style="color: #3b82f6; text-decoration: none;">support@hiddystays.com</a></p>
            </div>
          </div>
        `
      };

    case 'password_reset':
      return {
        subject: '🔒 Reset Your HiddyStays Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">HiddyStays</h1>
            </div>

            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Password Reset Request</h2>

              <p style="color: #64748b; line-height: 1.6;">
                Hi ${data.name},
              </p>

              <p style="color: #64748b; line-height: 1.6;">
                We received a request to reset your password for your HiddyStays account. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Reset Password
                </a>
              </div>

              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>

              <p style="color: #64748b; line-height: 1.6; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #3b82f6; word-break: break-all; font-size: 12px;">
                ${data.resetUrl}
              </p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Need help? Contact us at support@hiddystays.com</p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'HiddyStays Notification',
        html: '<p>Default email template</p>'
      };
  }
};
