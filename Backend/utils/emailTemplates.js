exports.bookingConfirmationEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Booking Confirmation</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Your booking has been successfully created!</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #e74c3c;">Booking Details</h4>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Address:</strong> ${property.address}</p>
        <p><strong>Check In:</strong> ${booking.checkin_date}</p>
        <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
        <p><strong>Total Price:</strong> $${booking.total_price}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Thank you for choosing ShortStay!</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

exports.bookingApprovedEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Booking Approved! ✅</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Great news! Your booking has been approved by the host.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #27ae60;">Booking Details</h4>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Address:</strong> ${property.address}</p>
        <p><strong>Check In:</strong> ${booking.checkin_date}</p>
        <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
        <p><strong>Total Price:</strong> $${booking.total_price}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Thank you for choosing ShortStay!</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

exports.bookingCancelledEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Booking Cancelled</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Your booking has been cancelled.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #e74c3c;">Booking Details</h4>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Check In:</strong> ${booking.checkin_date}</p>
        <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">We hope to see you again on ShortStay!</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

exports.paymentSuccessEmail = (guestName, payment, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Payment Successful! 💳</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Your payment has been processed successfully.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #27ae60;">Payment Receipt</h4>
        <p><strong>Payment ID:</strong> ${payment.payment_id}</p>
        <p><strong>Amount:</strong> $${payment.amount}</p>
        <p><strong>Date:</strong> ${payment.payment_date}</p>
        <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Thank you for choosing ShortStay!</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// NEW TEMPLATES BELOW

// Email Verification Template
exports.emailVerificationTemplate = (name, verificationUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Verify Your Email Address</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for registering with ShortStay!</p>
      <p>Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: #2c3e7a; color: white; padding: 15px 30px; 
                  border-radius: 5px; text-decoration: none; font-size: 16px;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666;">This link will expire in <strong>24 hours</strong>.</p>
      <p style="color: #666;">If you did not create an account, please ignore this email.</p>
      <p style="color: #999; font-size: 12px;">
        If the button doesn't work, copy and paste this link:<br/>
        ${verificationUrl}
      </p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Forgot Password Template
exports.forgotPasswordTemplate = (name, resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Reset Your Password</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background: #e74c3c; color: white; padding: 15px 30px;
                  border-radius: 5px; text-decoration: none; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">This link will expire in <strong>1 hour</strong>.</p>
      <p style="color: #666;">If you did not request a password reset, please ignore this email.</p>
      <p style="color: #999; font-size: 12px;">
        If the button doesn't work, copy and paste this link:<br/>
        ${resetUrl}
      </p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Password Reset Success Template
exports.passwordResetSuccessTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Password Reset Successful ✅</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your password has been successfully reset.</p>
      <p>You can now login with your new password.</p>
      <p style="color: #e74c3c;">
        If you did not reset your password, please contact our support immediately.
      </p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Host New Booking Notification Email
exports.hostNewBookingEmail = (hostName, guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>New Booking Request 🏠</h3>
      <p>Dear <strong>${hostName}</strong>,</p>
      <p>You have a new booking request for your property!</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #2c3e7a;">Booking Details</h4>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Guest:</strong> ${guestName}</p>
        <p><strong>Check In:</strong> ${booking.checkin_date}</p>
        <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
        <p><strong>Total Price:</strong> $${booking.total_price}</p>
        <p><strong>Booking ID:</strong> #${booking.booking_id}</p>
      </div>
      <p style="margin-top: 20px; color: #e74c3c; font-weight: bold;">
        ⏰ Please approve or reject this booking within 24 hours, otherwise it will expire automatically.
      </p>
      <p style="color: #666;">Log in to your ShortStay dashboard to take action.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Booking Rejected Email
exports.bookingRejectedEmail = (guestName, property, booking, reason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Booking Rejected ❌</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Unfortunately, the host has declined your booking request.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #e74c3c;">Booking Details</h4>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Check In:</strong> ${booking.checkin_date}</p>
        <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
        <p><strong>Total Price:</strong> $${booking.total_price}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p style="margin-top: 20px; color: #666;">No charges have been made. You can browse other available properties on ShortStay.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Booking Expired Email
exports.bookingExpiredEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #7f8c8d; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Booking Expired ⌛</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Your booking request has expired because the host did not respond within 24 hours.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #7f8c8d;">Booking Details</h4>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Check In:</strong> ${booking.checkin_date}</p>
        <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">No charges have been made. Please try booking another property or contact the host directly.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;