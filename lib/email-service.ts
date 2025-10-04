import { supabase } from "@/integrations/supabase/client";

export interface BookingEmailData {
  booking: {
    id: string;
    checkIn: string;
    checkOut: string;
    numGuests: number;
    totalAmount: number;
    checkInTime?: string;
    checkInInstructions?: string;
    specialRequests?: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    host?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  guest?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentEmailData {
  payment: {
    id: string;
    amount: number;
    createdAt: string;
  };
  host: {
    name: string;
    email: string;
  };
}

export interface MessageEmailData {
  message: {
    id: string;
    content: string;
    createdAt: string;
    conversationId: string;
  };
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
}

export interface WelcomeEmailData {
  host: {
    name: string;
    email: string;
  };
}

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail(type: string, to: string, data: any): Promise<{ success: boolean; error?: string; emailId?: string }> {
    try {
      console.log(`📧 Sending ${type} email to ${to}`);
      
      const { data: result, error } = await supabase.functions.invoke('email-service', {
        body: {
          type,
          to,
          data
        }
      });

      if (error) {
        console.error(`❌ Error sending ${type} email:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${type} email sent successfully:`, result?.emailId);
      return { success: true, emailId: result?.emailId };
    } catch (error) {
      console.error(`❌ Exception sending ${type} email:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('booking_confirmation', data.booking.guestEmail, data);
  }

  async sendHostNotification(data: BookingEmailData, hostEmail: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('host_notification', hostEmail, data);
  }

  async sendPaymentNotification(data: PaymentEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('payment_notification', data.host.email, data);
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('welcome_host', data.host.email, data);
  }

  async sendCheckInReminder(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('check_in_reminder', data.booking.guestEmail, data);
  }

  async sendMessageNotification(data: MessageEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('message_notification', data.recipient.email, data);
  }

  // Bulk operations for booking flow
  async sendBookingEmails(bookingData: BookingEmailData, adminEmail: string): Promise<{
    guestEmail: { success: boolean; error?: string };
    adminEmail: { success: boolean; error?: string };
  }> {
    const [guestResult, adminResult] = await Promise.allSettled([
      this.sendBookingConfirmation(bookingData),
      this.sendHostNotification(bookingData, adminEmail)
    ]);

    return {
      guestEmail: guestResult.status === 'fulfilled' ? guestResult.value : { success: false, error: 'Failed to send guest confirmation' },
      adminEmail: adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: 'Failed to send admin notification' }
    };
  }

  // Schedule reminder emails (would typically be called by a cron job or scheduled function)
  async scheduleCheckInReminders(): Promise<void> {
    try {
      console.log('📅 Checking for check-in reminders to send...');
      
      // This would typically query the database for bookings with check-in tomorrow
      // For now, this is a placeholder for the scheduling logic
      
      // Example query (you would implement this based on your booking table structure):
      // const tomorrow = new Date();
      // tomorrow.setDate(tomorrow.getDate() + 1);
      // 
      // const { data: bookings } = await supabase
      //   .from('bookings')
      //   .select('*, properties(*, profiles(*))')
      //   .eq('check_in_date', tomorrow.toISOString().split('T')[0])
      //   .eq('status', 'confirmed');
      //
      // for (const booking of bookings || []) {
      //   await this.sendCheckInReminder({
      //     booking: {
      //       id: booking.id,
      //       checkIn: booking.check_in_date,
      //       checkOut: booking.check_out_date,
      //       numGuests: booking.num_guests,
      //       totalAmount: booking.total_amount,
      //       guestName: booking.guest_name,
      //       guestEmail: booking.guest_email,
      //       checkInInstructions: booking.check_in_instructions
      //     },
      //     property: {
      //       id: booking.properties.id,
      //       name: booking.properties.name,
      //       address: booking.properties.address,
      //       host: {
      //         name: booking.properties.profiles.first_name + ' ' + booking.properties.profiles.last_name,
      //         email: booking.properties.profiles.email
      //       }
      //     }
      //   });
      // }

      console.log('✅ Check-in reminder scheduling completed');
    } catch (error) {
      console.error('❌ Error scheduling check-in reminders:', error);
    }
  }
}

// Singleton instance export
export const emailService = EmailService.getInstance();

// Utility functions for common email operations
export const sendBookingNotifications = async (
  bookingData: BookingEmailData, 
  adminEmail: string = 'admin@bookdirect.ca'
) => {
  return emailService.sendBookingEmails(bookingData, adminEmail);
};

export const sendPaymentConfirmation = async (paymentData: PaymentEmailData) => {
  return emailService.sendPaymentNotification(paymentData);
};

export const sendWelcomeToHost = async (hostData: WelcomeEmailData) => {
  return emailService.sendWelcomeEmail(hostData);
};

export const sendMessageAlert = async (messageData: MessageEmailData) => {
  return emailService.sendMessageNotification(messageData);
};

// Error handling utilities
export const handleEmailError = (error: any, context: string) => {
  console.error(`📧 Email error in ${context}:`, error);
  
  // You could integrate with error tracking services here
  // e.g., Sentry, LogRocket, etc.
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Email sending failed',
    context
  };
};

// Test function for development
export const testEmailService = async () => {
  console.log('🧪 Testing email service...');
  
  const testBookingData: BookingEmailData = {
    booking: {
      id: 'test-booking-123',
      checkIn: '2024-08-15',
      checkOut: '2024-08-18',
      numGuests: 2,
      totalAmount: 450,
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      specialRequests: 'Late check-in requested'
    },
    property: {
      id: 'test-property-456',
      name: 'Beautiful Lake House',
      address: '123 Lake Shore Drive, Muskoka, ON',
      host: {
        name: 'Admin User',
        email: 'admin@bookdirect.ca',
        phone: '+1-416-555-0123'
      }
    }
  };

  const result = await sendBookingNotifications(testBookingData);
  console.log('🧪 Test email results:', result);
  
  return result;
};