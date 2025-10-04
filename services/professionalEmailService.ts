import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface UserData {
  name: string;
  email: string;
  userId?: string;
  joinDate?: string;
  totalBookings?: number;
  membershipTier?: 'explorer' | 'frequent' | 'elite';
}

export interface BookingEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  propertyAddress?: string;
  hostPhone?: string;
  hostInstructions?: string;
  propertyImages?: string[];
  amenities?: string[];
  savingsAmount?: number;
}

export interface HostData {
  name: string;
  email: string;
  propertyCount?: number;
  totalEarnings?: number;
  averageRating?: number;
  joinDate?: string;
}

class ProfessionalEmailService {
  private readonly brandColors = {
    primary: '#1a5f4a', // Deep Sage Green
    secondary: '#d4a574', // Warm Sand
    accent: '#e07a5f', // Terracotta
    dark: '#292524', // Warm Charcoal
    light: '#f5f5f4', // Warm Cream
  };

  private getEmailStyles(): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f8fafc;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, ${this.brandColors.primary} 0%, #22715e 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        
        .header-content { position: relative; z-index: 1; }
        
        .logo { 
          font-size: 32px; 
          font-weight: 700; 
          margin-bottom: 10px; 
          letter-spacing: -0.5px;
        }
        
        .tagline { 
          font-size: 16px; 
          opacity: 0.9; 
          font-weight: 400;
        }
        
        .content { 
          padding: 40px 30px; 
          background: white; 
        }
        
        .greeting { 
          font-size: 18px; 
          font-weight: 600; 
          color: #1f2937; 
          margin-bottom: 20px; 
        }
        
        .message { 
          font-size: 16px; 
          line-height: 1.8; 
          color: #4b5563; 
          margin-bottom: 30px; 
        }
        
        .card { 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          padding: 30px; 
          margin: 30px 0; 
          position: relative;
          overflow: hidden;
        }
        
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, ${this.brandColors.primary}, ${this.brandColors.secondary});
        }
        
        .card-header { 
          font-size: 20px; 
          font-weight: 600; 
          color: #1f2937; 
          margin-bottom: 20px; 
          display: flex;
          align-items: center;
        }
        
        .card-icon { 
          margin-right: 10px; 
          font-size: 24px; 
        }
        
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #e2e8f0; 
        }
        
        .detail-row:last-child { border-bottom: none; }
        
        .detail-label { 
          font-weight: 500; 
          color: #6b7280; 
        }
        
        .detail-value { 
          font-weight: 600; 
          color: #1f2937; 
        }
        
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, ${this.brandColors.primary} 0%, #22715e 100%); 
          color: white; 
          text-decoration: none; 
          padding: 16px 32px; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(26, 95, 74, 0.3);
        }
        
        .cta-button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(26, 95, 74, 0.4);
        }
        
        .secondary-button {
          display: inline-block; 
          background: white; 
          color: ${this.brandColors.primary}; 
          text-decoration: none; 
          padding: 14px 28px; 
          border: 2px solid ${this.brandColors.primary}; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 14px;
          margin-left: 15px;
        }
        
        .highlight-box { 
          background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%); 
          border: 1px solid #fdba74; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 25px 0; 
          text-align: center;
        }
        
        .savings-badge { 
          background: linear-gradient(135deg, #065f46 0%, #047857 100%); 
          color: white; 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 14px; 
          font-weight: 600; 
          display: inline-block;
          margin: 10px 0;
        }
        
        .footer { 
          background: #f1f5f9; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-content { 
          color: #64748b; 
          font-size: 14px; 
          line-height: 1.6;
        }
        
        .social-links { 
          margin: 20px 0; 
        }
        
        .social-link { 
          display: inline-block; 
          margin: 0 10px; 
          color: ${this.brandColors.primary}; 
          text-decoration: none;
        }
        
        .unsubscribe { 
          font-size: 12px; 
          color: #9ca3af; 
          margin-top: 20px;
        }
        
        .trust-indicators { 
          display: flex; 
          justify-content: space-around; 
          margin: 30px 0; 
          text-align: center;
        }
        
        .trust-item { 
          flex: 1; 
          padding: 15px;
        }
        
        .trust-icon { 
          font-size: 24px; 
          margin-bottom: 8px; 
          color: ${this.brandColors.primary};
        }
        
        .trust-text { 
          font-size: 12px; 
          color: #6b7280; 
          font-weight: 500;
        }
        
        @media (max-width: 600px) {
          .email-container { margin: 0; border-radius: 0; }
          .header, .content, .footer { padding: 25px 20px; }
          .card { padding: 20px; }
          .trust-indicators { flex-direction: column; }
          .trust-item { margin-bottom: 15px; }
          .cta-button { display: block; margin: 10px 0; }
          .secondary-button { display: block; margin: 10px 0 0 0; }
        }
      </style>
    `;
  }

  private getEmailHeader(title: string, subtitle?: string): string {
    return `
      <div class="header">
        <div class="header-content">
          <div class="logo">🏡 Hiddystays</div>
          <div class="tagline">${subtitle || 'Stay Direct. Save More. Experience Authentic.'}</div>
          <h1 style="margin: 25px 0 10px 0; font-size: 28px; font-weight: 700; line-height: 1.2;">${title}</h1>
        </div>
      </div>
    `;
  }

  private getEmailFooter(recipientEmail: string): string {
    return `
      <div class="footer">
        <div class="footer-content">
          <div class="trust-indicators">
            <div class="trust-item">
              <div class="trust-icon">🔒</div>
              <div class="trust-text">Secure & Safe</div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">💰</div>
              <div class="trust-text">Zero Platform Fees</div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">⭐</div>
              <div class="trust-text">5-Star Experience</div>
            </div>
            <div class="trust-item">
              <div class="trust-icon">🌍</div>
              <div class="trust-text">Authentic Stays</div>
            </div>
          </div>
          
          <div class="social-links">
            <a href="#" class="social-link">📘 Facebook</a>
            <a href="#" class="social-link">📸 Instagram</a>
            <a href="#" class="social-link">🐦 Twitter</a>
          </div>
          
          <p><strong>Hiddystays</strong><br>
          Connecting travelers with authentic accommodations<br>
          📧 hello@hiddystays.com | 📞 1-800-HIDDY-STAY</p>
          
          <div class="unsubscribe">
            <p>You're receiving this email because you're part of the Hiddystays community.</p>
            <p>📧 Sent to: ${recipientEmail}</p>
            <p><a href="#" style="color: #9ca3af;">Update preferences</a> | <a href="#" style="color: #9ca3af;">Unsubscribe</a></p>
            <p>© ${new Date().getFullYear()} Hiddystays. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  }

  // Welcome Email Series - Email 1
  async sendWelcomeEmail(userData: UserData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: "🎉 Welcome to Hiddystays - Your Journey to Authentic Travel Begins!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Hiddystays</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Welcome to the Hiddystays Family!", "Where authentic travel meets zero fees")}
            
            <div class="content">
              <div class="greeting">Hello ${userData.name}! 👋</div>
              
              <div class="message">
                <p>Welcome to <strong>Hiddystays</strong> - where we believe travel should be about authentic connections, not platform fees!</p>
                
                <p>You've just joined thousands of smart travelers who are <strong>saving money</strong> and <strong>experiencing authentic hospitality</strong> through direct bookings.</p>
              </div>

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 Here's what makes Hiddystays special:</h3>
                <ul style="text-align: left; margin: 0; padding-left: 20px; color: #92400e;">
                  <li><strong>Zero Platform Fees</strong> - Keep 100% of your savings</li>
                  <li><strong>Direct Host Connection</strong> - Authentic, personal service</li>
                  <li><strong>Curated Properties</strong> - Hand-picked unique stays</li>
                  <li><strong>24/7 Support</strong> - We're here when you need us</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/properties" class="cta-button">🏡 Explore Amazing Properties</a>
                <a href="/how-it-works" class="secondary-button">Learn How It Works</a>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🎁</span>
                  Special Welcome Offer
                </div>
                <p style="margin: 0; font-size: 16px; color: #4b5563;">
                  <strong>Save an extra $50 on your first booking!</strong> Use code <strong style="color: ${this.brandColors.primary};">WELCOME50</strong> when you book your first stay with us.
                </p>
                <div class="savings-badge">Valid for 30 days - Don't miss out!</div>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Over the next few days, I'll share some insider tips on finding the perfect authentic stay and getting the most value from direct bookings.
              </p>

              <p style="font-size: 16px; color: #4b5563;">
                Questions? Just reply to this email - I read every message personally! 😊
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Welcome aboard!<br>
                Sarah Chen<br>
                <span style="font-weight: 400; color: #6b7280;">Community Manager, Hiddystays</span>
              </p>
            </div>
            
            ${this.getEmailFooter(userData.email)}
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Hiddystays - Your Journey to Authentic Travel Begins!
        
        Hello ${userData.name}!
        
        Welcome to Hiddystays - where we believe travel should be about authentic connections, not platform fees!
        
        You've just joined thousands of smart travelers who are saving money and experiencing authentic hospitality through direct bookings.
        
        Here's what makes Hiddystays special:
        • Zero Platform Fees - Keep 100% of your savings
        • Direct Host Connection - Authentic, personal service  
        • Curated Properties - Hand-picked unique stays
        • 24/7 Support - We're here when you need us
        
        SPECIAL WELCOME OFFER:
        Save an extra $50 on your first booking! Use code WELCOME50 when you book your first stay with us.
        Valid for 30 days - Don't miss out!
        
        Explore amazing properties: /properties
        Learn how it works: /how-it-works
        
        Over the next few days, I'll share some insider tips on finding the perfect authentic stay and getting the most value from direct bookings.
        
        Questions? Just reply to this email - I read every message personally!
        
        Welcome aboard!
        Sarah Chen
        Community Manager, Hiddystays
      `,
    };

    return this.sendEmail(userData.email, template);
  }

  // Enhanced Booking Confirmation with Sales Psychology
  async sendBookingConfirmationToGuest(data: BookingEmailData): Promise<boolean> {
    const savingsAmount = data.savingsAmount || Math.floor(data.totalAmount * 0.15);
    
    const template: EmailTemplate = {
      subject: `🎉 Confirmed! Your Amazing Stay at ${data.propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Your Booking is Confirmed!", "Get ready for an amazing authentic experience")}
            
            <div class="content">
              <div class="greeting">Fantastic news, ${data.guestName}! 🎊</div>
              
              <div class="message">
                <p>Your booking at <strong>${data.propertyTitle}</strong> is officially confirmed! You're about to experience authentic hospitality that you simply can't get through traditional booking platforms.</p>
                
                <div class="savings-badge">🎯 You saved ${this.formatCurrency(savingsAmount)} by booking direct!</div>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🏡</span>
                  Your Booking Details
                </div>
                <div class="detail-row">
                  <span class="detail-label">Property</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Location</span>
                  <span class="detail-value">${data.propertyLocation}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in</span>
                  <span class="detail-value">${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests</span>
                  <span class="detail-value">${data.guestsCount} ${data.guestsCount === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total</span>
                  <span class="detail-value" style="font-size: 18px; color: ${this.brandColors.primary};">${this.formatCurrency(data.totalAmount)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID</span>
                  <span class="detail-value" style="font-family: monospace;">#${data.bookingId}</span>
                </div>
              </div>

              ${data.hostInstructions ? `
              <div class="card">
                <div class="card-header">
                  <span class="card-icon">📋</span>
                  Special Instructions from ${data.hostName}
                </div>
                <p style="margin: 0; font-style: italic; color: #4b5563;">"${data.hostInstructions}"</p>
              </div>
              ` : ''}

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 What happens next?</h3>
                <ul style="text-align: left; margin: 0; padding-left: 20px; color: #92400e;">
                  <li><strong>3 days before:</strong> We'll send check-in details & local tips</li>
                  <li><strong>Day before:</strong> Final reminder with weather & recommendations</li>
                  <li><strong>During stay:</strong> 24/7 support if you need anything</li>
                  <li><strong>After stay:</strong> Share your experience & earn rewards</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/bookings/${data.bookingId}" class="cta-button">📱 View Booking Details</a>
                <a href="/properties" class="secondary-button">Book Another Stay</a>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Need to make changes or have questions? Your host ${data.hostName} and our support team are here to help!
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Can't wait for your authentic stay experience!<br>
                The Hiddystays Team
              </p>
            </div>
            
            ${this.getEmailFooter(data.guestEmail)}
          </div>
        </body>
        </html>
      `,
      text: `
        Confirmed! Your Amazing Stay at ${data.propertyTitle}
        
        Fantastic news, ${data.guestName}!
        
        Your booking at ${data.propertyTitle} is officially confirmed! You're about to experience authentic hospitality that you simply can't get through traditional booking platforms.
        
        🎯 You saved ${this.formatCurrency(savingsAmount)} by booking direct!
        
        BOOKING DETAILS:
        Property: ${data.propertyTitle}
        Location: ${data.propertyLocation}
        Check-in: ${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}
        Check-out: ${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}
        Guests: ${data.guestsCount} ${data.guestsCount === 1 ? 'guest' : 'guests'}
        Total: ${this.formatCurrency(data.totalAmount)}
        Booking ID: #${data.bookingId}
        
        ${data.hostInstructions ? `Special Instructions from ${data.hostName}: "${data.hostInstructions}"` : ''}
        
        What happens next?
        • 3 days before: We'll send check-in details & local tips
        • Day before: Final reminder with weather & recommendations  
        • During stay: 24/7 support if you need anything
        • After stay: Share your experience & earn rewards
        
        View booking details: /bookings/${data.bookingId}
        Book another stay: /properties
        
        Need to make changes or have questions? Your host ${data.hostName} and our support team are here to help!
        
        Can't wait for your authentic stay experience!
        The Hiddystays Team
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }

  // Pre-Arrival Excitement Email (2 days before check-in)
  async sendPreArrivalEmail(data: BookingEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `🎒 Almost There! Your ${data.propertyTitle} Adventure Begins in 2 Days`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Adventure Begins Soon</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Your Adventure Starts Soon!", "Final preparations for your amazing stay")}
            
            <div class="content">
              <div class="greeting">Hey ${data.guestName}! The countdown begins! ⏰</div>
              
              <div class="message">
                <p>Can you feel the excitement? In just <strong>2 days</strong>, you'll be experiencing the authentic hospitality at <strong>${data.propertyTitle}</strong>!</p>
                
                <p>Here's everything you need to make your arrival smooth and your stay unforgettable:</p>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">📅</span>
                  Quick Arrival Reminder
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Day</span>
                  <span class="detail-value">${this.formatDate(data.checkInDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Time</span>
                  <span class="detail-value">${data.checkInTime || "3:00 PM"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Property</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                ${data.propertyAddress ? `
                <div class="detail-row">
                  <span class="detail-label">Address</span>
                  <span class="detail-value">${data.propertyAddress}</span>
                </div>
                ` : ''}
              </div>

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">📝 Pre-Arrival Checklist:</h3>
                <ul style="text-align: left; margin: 0; padding-left: 20px; color: #92400e;">
                  <li><strong>Weather Check</strong> - Pack accordingly for ${data.propertyLocation}</li>
                  <li><strong>Contact Info</strong> - Save ${data.hostName}'s contact details</li>
                  <li><strong>Travel Documents</strong> - Bring your booking confirmation</li>
                  <li><strong>Local Currency</strong> - Have some cash for tips and local markets</li>
                  <li><strong>Travel Insurance</strong> - Double-check your coverage</li>
                </ul>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🏞️</span>
                  Local Insider Tips for ${data.propertyLocation}
                </div>
                <p style="margin: 0; color: #4b5563; line-height: 1.8;">
                  <strong>Must-try local experience:</strong> Ask ${data.hostName} about their favorite hidden gem in the area - hosts often know the best spots that aren't in guidebooks!<br><br>
                  <strong>Pro tip:</strong> Download offline maps before you arrive, and don't forget to try the local specialty dish!
                </p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/bookings/${data.bookingId}" class="cta-button">📱 View Full Booking Details</a>
                <a href="/contact-host/${data.bookingId}" class="secondary-button">💬 Message ${data.hostName}</a>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Running late or need to adjust arrival time? Just message ${data.hostName} directly - they're excited to welcome you!
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Have an amazing trip!<br>
                Your Hiddystays Travel Concierge Team 🌟
              </p>
            </div>
            
            ${this.getEmailFooter(data.guestEmail)}
          </div>
        </body>
        </html>
      `,
      text: `
        🎒 Almost There! Your ${data.propertyTitle} Adventure Begins in 2 Days
        
        Hey ${data.guestName}! The countdown begins!
        
        Can you feel the excitement? In just 2 days, you'll be experiencing the authentic hospitality at ${data.propertyTitle}!
        
        ARRIVAL DETAILS:
        Check-in Day: ${this.formatDate(data.checkInDate)}
        Check-in Time: ${data.checkInTime || "3:00 PM"}
        Property: ${data.propertyTitle}
        ${data.propertyAddress ? `Address: ${data.propertyAddress}` : ''}
        
        PRE-ARRIVAL CHECKLIST:
        • Weather Check - Pack accordingly for ${data.propertyLocation}
        • Contact Info - Save ${data.hostName}'s contact details
        • Travel Documents - Bring your booking confirmation
        • Local Currency - Have some cash for tips and local markets
        • Travel Insurance - Double-check your coverage
        
        LOCAL INSIDER TIPS:
        Must-try local experience: Ask ${data.hostName} about their favorite hidden gem in the area - hosts often know the best spots that aren't in guidebooks!
        
        Pro tip: Download offline maps before you arrive, and don't forget to try the local specialty dish!
        
        View full booking details: /bookings/${data.bookingId}
        Message ${data.hostName}: /contact-host/${data.bookingId}
        
        Running late or need to adjust arrival time? Just message ${data.hostName} directly - they're excited to welcome you!
        
        Have an amazing trip!
        Your Hiddystays Travel Concierge Team
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }

  // Post-Stay Follow-up with Upselling (sent 1 day after checkout)
  async sendPostStayFollowupEmail(data: BookingEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `🌟 How was your stay at ${data.propertyTitle}? (Plus a special surprise!)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>How Was Your Stay?</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Hope You Had an Amazing Stay!", "Share your experience & get rewarded")}
            
            <div class="content">
              <div class="greeting">Hi ${data.guestName}! 👋</div>
              
              <div class="message">
                <p>I hope your recent stay at <strong>${data.propertyTitle}</strong> exceeded your expectations! There's nothing quite like the authentic experience you get with direct bookings.</p>
                
                <p>Your experience matters to our community, and I'd love to hear about your stay...</p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/review/${data.bookingId}" class="cta-button">⭐ Share Your Experience (2 mins)</a>
              </div>

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">🎁 Thank You Gift!</h3>
                <p style="margin: 0; color: #92400e;">
                  As a token of appreciation, here's <strong>$25 off your next booking</strong> with code <strong style="font-size: 18px;">LOYAL25</strong>
                </p>
                <div class="savings-badge">Valid for 60 days - Use on any property!</div>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🎯</span>
                  More Amazing Stays Await
                </div>
                <p style="margin: 0 0 15px 0; color: #4b5563;">
                  Based on your love for <strong>${data.propertyLocation}</strong>, here are some similar amazing properties you might enjoy:
                </p>
                <div style="text-align: center;">
                  <a href="/properties?similar=${data.bookingId}" class="secondary-button">🏡 View Similar Properties</a>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🤝</span>
                  Refer Friends & Earn Together
                </div>
                <p style="margin: 0 0 15px 0; color: #4b5563;">
                  Know someone who'd love authentic stays like this? <strong>You both get $50 off</strong> when they book their first stay!
                </p>
                <div style="text-align: center;">
                  <a href="/refer" class="secondary-button">💰 Share & Earn $50</a>
                </div>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Questions about your stay or need help with anything? I'm here to help - just reply to this email!
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Thank you for choosing authentic travel!<br>
                Sarah Chen<br>
                <span style="font-weight: 400; color: #6b7280;">Your Personal Travel Concierge, Hiddystays</span>
              </p>
            </div>
            
            ${this.getEmailFooter(data.guestEmail)}
          </div>
        </body>
        </html>
      `,
      text: `
        🌟 How was your stay at ${data.propertyTitle}? (Plus a special surprise!)
        
        Hi ${data.guestName}!
        
        I hope your recent stay at ${data.propertyTitle} exceeded your expectations! There's nothing quite like the authentic experience you get with direct bookings.
        
        Your experience matters to our community, and I'd love to hear about your stay...
        
        Share your experience (2 mins): /review/${data.bookingId}
        
        THANK YOU GIFT:
        As a token of appreciation, here's $25 off your next booking with code LOYAL25
        Valid for 60 days - Use on any property!
        
        MORE AMAZING STAYS:
        Based on your love for ${data.propertyLocation}, here are some similar amazing properties you might enjoy:
        View similar properties: /properties?similar=${data.bookingId}
        
        REFER FRIENDS & EARN:
        Know someone who'd love authentic stays like this? You both get $50 off when they book their first stay!
        Share & earn $50: /refer
        
        Questions about your stay or need help with anything? I'm here to help - just reply to this email!
        
        Thank you for choosing authentic travel!
        Sarah Chen
        Your Personal Travel Concierge, Hiddystays
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }

  // Abandoned Booking Recovery Email (sent 24 hours after abandonment)
  async sendAbandonedBookingEmail(data: BookingEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `🏡 ${data.guestName}, your ${data.propertyTitle} is waiting...`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Booking</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Your Perfect Stay Awaits!", "Complete your booking in just one click")}
            
            <div class="content">
              <div class="greeting">Hi ${data.guestName}, 👋</div>
              
              <div class="message">
                <p>I noticed you were interested in <strong>${data.propertyTitle}</strong> in ${data.propertyLocation}. Great choice! This property has been getting a lot of attention lately.</p>
                
                <p>Don't let this authentic experience slip away...</p>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">⚡</span>
                  Your Booking Details
                </div>
                <div class="detail-row">
                  <span class="detail-label">Property</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Dates</span>
                  <span class="detail-value">${this.formatDate(data.checkInDate)} - ${this.formatDate(data.checkOutDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests</span>
                  <span class="detail-value">${data.guestsCount} ${data.guestsCount === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total</span>
                  <span class="detail-value" style="font-size: 18px; color: ${this.brandColors.primary};">${this.formatCurrency(data.totalAmount)}</span>
                </div>
              </div>

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 Limited Time: Extra $30 Off!</h3>
                <p style="margin: 0; color: #92400e;">
                  Complete your booking in the next <strong>24 hours</strong> and save an extra $30 with code <strong style="font-size: 18px;">SAVE30NOW</strong>
                </p>
                <div class="savings-badge">This offer expires in 24 hours!</div>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/complete-booking/${data.bookingId}" class="cta-button">🔒 Complete My Booking Now</a>
              </div>

              <div class="card" style="background: #fef2f2; border-color: #fca5a5;">
                <div class="card-header" style="color: #dc2626;">
                  <span class="card-icon">⚠️</span>
                  Booking Alert
                </div>
                <p style="margin: 0; color: #dc2626; font-weight: 500;">
                  <strong>3 other travelers</strong> are also viewing this property for similar dates. Book now to secure your authentic stay!
                </p>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Need help or have questions? I'm here to assist you personally - just reply to this email or call our concierge team at <strong>1-800-HIDDY-STAY</strong>.
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Don't miss out on this authentic experience!<br>
                The Hiddystays Booking Team
              </p>
            </div>
            
            ${this.getEmailFooter(data.guestEmail)}
          </div>
        </body>
        </html>
      `,
      text: `
        🏡 ${data.guestName}, your ${data.propertyTitle} is waiting...
        
        Hi ${data.guestName},
        
        I noticed you were interested in ${data.propertyTitle} in ${data.propertyLocation}. Great choice! This property has been getting a lot of attention lately.
        
        Don't let this authentic experience slip away...
        
        YOUR BOOKING DETAILS:
        Property: ${data.propertyTitle}
        Dates: ${this.formatDate(data.checkInDate)} - ${this.formatDate(data.checkOutDate)}
        Guests: ${data.guestsCount} ${data.guestsCount === 1 ? 'guest' : 'guests'}
        Total: ${this.formatCurrency(data.totalAmount)}
        
        LIMITED TIME: EXTRA $30 OFF!
        Complete your booking in the next 24 hours and save an extra $30 with code SAVE30NOW
        This offer expires in 24 hours!
        
        Complete my booking now: /complete-booking/${data.bookingId}
        
        BOOKING ALERT:
        3 other travelers are also viewing this property for similar dates. Book now to secure your authentic stay!
        
        Need help or have questions? I'm here to assist you personally - just reply to this email or call our concierge team at 1-800-HIDDY-STAY.
        
        Don't miss out on this authentic experience!
        The Hiddystays Booking Team
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }

  // Host New Booking Notification (Enhanced)
  async sendBookingNotificationToHost(data: BookingEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `🎉 New Booking! ${data.guestName} chose your ${data.propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Received</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Congratulations! New Booking Received", "Another guest chose your authentic hospitality")}
            
            <div class="content">
              <div class="greeting">Fantastic news, ${data.hostName}! 🎊</div>
              
              <div class="message">
                <p>You've received a new booking for <strong>${data.propertyTitle}</strong>! Another traveler has chosen your authentic hospitality over corporate chains.</p>
                
                <p>Here are the details for your upcoming guest:</p>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">📋</span>
                  Guest & Booking Information
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guest Name</span>
                  <span class="detail-value">${data.guestName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">${data.guestEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in</span>
                  <span class="detail-value">${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests</span>
                  <span class="detail-value">${data.guestsCount} ${data.guestsCount === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Earnings</span>
                  <span class="detail-value" style="font-size: 18px; color: ${this.brandColors.primary}; font-weight: 700;">${this.formatCurrency(data.totalAmount)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID</span>
                  <span class="detail-value" style="font-family: monospace;">#${data.bookingId}</span>
                </div>
                ${data.specialRequests ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <strong style="color: #1f2937;">Special Requests:</strong>
                  <p style="margin: 10px 0 0 0; font-style: italic; color: #4b5563;">"${data.specialRequests}"</p>
                </div>
                ` : ''}
              </div>

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">🏆 Next Steps for Success:</h3>
                <ul style="text-align: left; margin: 0; padding-left: 20px; color: #92400e;">
                  <li><strong>Send a Welcome Message</strong> - Personal touch goes a long way</li>
                  <li><strong>Share Local Tips</strong> - Your insider knowledge is valuable</li>
                  <li><strong>Confirm Details</strong> - Address, check-in process, amenities</li>
                  <li><strong>Prepare the Space</strong> - Fresh linens, stocked essentials</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/host/bookings/${data.bookingId}" class="cta-button">📱 View Full Booking Details</a>
                <a href="/host/message/${data.bookingId}" class="secondary-button">💬 Message ${data.guestName}</a>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">💡</span>
                  Host Success Tip
                </div>
                <p style="margin: 0; color: #4b5563; line-height: 1.8; font-style: italic;">
                  <strong>Pro tip:</strong> Send a personal welcome message within 24 hours! Guests who receive a warm welcome message are 73% more likely to leave 5-star reviews and become repeat customers.
                </p>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Need help preparing for your guest? Our Host Success team is here to support you every step of the way!
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Here's to another amazing authentic experience!<br>
                Your Host Success Team at Hiddystays 🌟
              </p>
            </div>
            
            ${this.getEmailFooter(data.hostEmail)}
          </div>
        </body>
        </html>
      `,
      text: `
        🎉 New Booking! ${data.guestName} chose your ${data.propertyTitle}
        
        Fantastic news, ${data.hostName}!
        
        You've received a new booking for ${data.propertyTitle}! Another traveler has chosen your authentic hospitality over corporate chains.
        
        GUEST & BOOKING INFORMATION:
        Guest Name: ${data.guestName}
        Email: ${data.guestEmail}
        Check-in: ${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}
        Check-out: ${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}
        Guests: ${data.guestsCount} ${data.guestsCount === 1 ? 'guest' : 'guests'}
        Earnings: ${this.formatCurrency(data.totalAmount)}
        Booking ID: #${data.bookingId}
        
        ${data.specialRequests ? `Special Requests: "${data.specialRequests}"` : ''}
        
        NEXT STEPS FOR SUCCESS:
        • Send a Welcome Message - Personal touch goes a long way
        • Share Local Tips - Your insider knowledge is valuable
        • Confirm Details - Address, check-in process, amenities
        • Prepare the Space - Fresh linens, stocked essentials
        
        View full booking details: /host/bookings/${data.bookingId}
        Message ${data.guestName}: /host/message/${data.bookingId}
        
        HOST SUCCESS TIP:
        Send a personal welcome message within 24 hours! Guests who receive a warm welcome message are 73% more likely to leave 5-star reviews and become repeat customers.
        
        Need help preparing for your guest? Our Host Success team is here to support you every step of the way!
        
        Here's to another amazing authentic experience!
        Your Host Success Team at Hiddystays
      `,
    };

    return this.sendEmail(data.hostEmail, template);
  }

  // Host Welcome Series - Email 1 (Onboarding)
  async sendHostWelcomeEmail(hostData: HostData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: "🏡 Welcome to Hiddystays - Let's Get Your Property Earning!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome Host</title>
          ${this.getEmailStyles()}
        </head>
        <body>
          <div class="email-container">
            ${this.getEmailHeader("Welcome to the Hiddystays Host Family!", "Your journey to hosting success starts here")}
            
            <div class="content">
              <div class="greeting">Welcome aboard, ${hostData.name}! 🎉</div>
              
              <div class="message">
                <p>Congratulations on joining <strong>Hiddystays</strong> - the platform where authentic hospitality meets smart business!</p>
                
                <p>You're now part of an exclusive community of hosts who believe in <strong>direct connections</strong>, <strong>zero platform fees</strong>, and <strong>authentic travel experiences</strong>.</p>
              </div>

              <div class="highlight-box">
                <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 Why You Made the Smart Choice:</h3>
                <ul style="text-align: left; margin: 0; padding-left: 20px; color: #92400e;">
                  <li><strong>Keep 100% of Your Earnings</strong> - No commission fees ever</li>
                  <li><strong>Direct Guest Communication</strong> - Build lasting relationships</li>
                  <li><strong>Premium Guests</strong> - Travelers who value authentic experiences</li>
                  <li><strong>Personal Support</strong> - Dedicated host success manager</li>
                </ul>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🚀</span>
                  Your Quick Start Checklist
                </div>
                <div style="color: #4b5563; line-height: 1.8;">
                  <p style="margin: 0 0 15px 0;"><strong>✅ Account Created</strong> - You're here!</p>
                  <p style="margin: 0 0 15px 0;"><strong>📸 Add Photos</strong> - Professional photos increase bookings by 40%</p>
                  <p style="margin: 0 0 15px 0;"><strong>📝 Write Description</strong> - Share your property's unique story</p>
                  <p style="margin: 0 0 15px 0;"><strong>💰 Set Pricing</strong> - Our smart pricing tool helps optimize rates</p>
                  <p style="margin: 0;"><strong>🎯 Go Live</strong> - Start accepting bookings!</p>
                </div>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="/host/setup" class="cta-button">🏡 Complete Property Setup</a>
                <a href="/host/guide" class="secondary-button">📚 Host Success Guide</a>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">💎</span>
                  Host Success Guarantee
                </div>
                <p style="margin: 0; color: #4b5563; line-height: 1.8;">
                  <strong>Our commitment to you:</strong> Within your first 90 days, we guarantee you'll receive at least 3 booking inquiries, or we'll personally help optimize your listing for free. That's our promise to your success!
                </p>
              </div>

              <p style="font-size: 16px; color: #4b5563;">
                Questions? I'm here to help you succeed! Reply to this email or schedule a free 15-minute success call with me.
              </p>

              <p style="font-size: 16px; color: #1f2937; font-weight: 600;">
                Excited to see your hosting success story unfold!<br>
                Mike Rodriguez<br>
                <span style="font-weight: 400; color: #6b7280;">Host Success Manager, Hiddystays</span><br>
                <span style="font-weight: 400; color: #6b7280;">📞 1-800-HIDDY-HOST | 📧 mike@hiddystays.com</span>
              </p>
            </div>
            
            ${this.getEmailFooter(hostData.email)}
          </div>
        </body>
        </html>
      `,
      text: `
        🏡 Welcome to Hiddystays - Let's Get Your Property Earning!
        
        Welcome aboard, ${hostData.name}!
        
        Congratulations on joining Hiddystays - the platform where authentic hospitality meets smart business!
        
        You're now part of an exclusive community of hosts who believe in direct connections, zero platform fees, and authentic travel experiences.
        
        WHY YOU MADE THE SMART CHOICE:
        • Keep 100% of Your Earnings - No commission fees ever
        • Direct Guest Communication - Build lasting relationships
        • Premium Guests - Travelers who value authentic experiences
        • Personal Support - Dedicated host success manager
        
        YOUR QUICK START CHECKLIST:
        ✅ Account Created - You're here!
        📸 Add Photos - Professional photos increase bookings by 40%
        📝 Write Description - Share your property's unique story
        💰 Set Pricing - Our smart pricing tool helps optimize rates
        🎯 Go Live - Start accepting bookings!
        
        Complete property setup: /host/setup
        Host success guide: /host/guide
        
        HOST SUCCESS GUARANTEE:
        Our commitment to you: Within your first 90 days, we guarantee you'll receive at least 3 booking inquiries, or we'll personally help optimize your listing for free. That's our promise to your success!
        
        Questions? I'm here to help you succeed! Reply to this email or schedule a free 15-minute success call with me.
        
        Excited to see your hosting success story unfold!
        Mike Rodriguez
        Host Success Manager, Hiddystays
        1-800-HIDDY-HOST | mike@hiddystays.com
      `,
    };

    return this.sendEmail(hostData.email, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const response = await fetch("/api/send-email-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}

export const professionalEmailService = new ProfessionalEmailService();