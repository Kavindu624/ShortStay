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

// Host Responded to Review Email (sent to guest)
exports.hostRespondedToReviewEmail = (guestName, propertyTitle, response) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Host Replied to Your Review 💬</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>The host of <strong>"${propertyTitle}"</strong> has replied to your review:</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; border-left: 4px solid #2c3e7a;">
        <p style="margin: 0; font-style: italic;">"${response}"</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Thank you for sharing your experience on ShortStay!</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Account Suspended Email
exports.accountSuspendedEmail = (name, reason) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Account Suspended 🚫</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your ShortStay account has been suspended by an administrator.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <p><strong>Reason:</strong> ${reason || 'Please contact support for more information.'}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">If you believe this is an error, please contact our support team.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Account Reinstated Email
exports.accountReinstatedEmail = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Account Reinstated ✅</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Great news! Your ShortStay account suspension has been lifted.</p>
      <p>You can now log in and use all ShortStay features again.</p>
      <p style="color: #666; margin-top: 20px;">Thank you for your patience. If you have any questions, please contact our support team.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Complaint Submitted — Admin notification email
exports.complaintSubmittedAdminEmail = (adminName, guestName, bookingId, description, priority) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay — Admin Alert</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>New Complaint Submitted 🚨</h3>
      <p>Dear <strong>${adminName}</strong>,</p>
      <p>A guest has submitted a new complaint that requires your attention.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; border-left: 4px solid #e74c3c;">
        <p><strong>Guest:</strong> ${guestName}</p>
        <p><strong>Booking ID:</strong> #${bookingId}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Description:</strong> ${description}</p>
      </div>
      <p style="margin-top: 20px;">Please log in to the admin dashboard to review and take action.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Complaint Resolved — Guest notification email
exports.complaintResolvedEmail = (guestName, complaintId, resolution_note) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Your Complaint Has Been Resolved ✅</h3>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>We're happy to inform you that your complaint (#${complaintId}) has been resolved.</p>
      ${resolution_note ? `
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; border-left: 4px solid #27ae60;">
        <p><strong>Resolution Note:</strong> ${resolution_note}</p>
      </div>` : ''}
      <p style="margin-top: 20px; color: #666;">Thank you for your patience. We hope you continue enjoying ShortStay!</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Inspection Scheduled — Host notification email
exports.inspectionScheduledEmail = (hostName, propertyTitle, scheduledDate) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Inspection Scheduled 📅</h3>
      <p>Dear <strong>${hostName}</strong>,</p>
      <p>A verifier has been assigned to verify your property.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <p><strong>Property:</strong> ${propertyTitle}</p>
        ${scheduledDate ? `<p><strong>Scheduled Date:</strong> ${scheduledDate}</p>` : '<p><strong>Schedule:</strong> The inspector will contact you to arrange a convenient time.</p>'}
      </div>
      <p style="margin-top: 20px; color: #666;">Please ensure the property is accessible on the scheduled date. Contact us if you need to reschedule.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Welcome Email — sent after registration
exports.welcomeEmail = (name, role) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">Welcome to ShortStay! 🏠</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Welcome aboard, ${name}!</h3>
      <p>We're thrilled to have you join ShortStay as a <strong>${role}</strong>.</p>
      ${role === 'host' ? `
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #2c3e7a;">Getting Started as a Host:</h4>
        <ul>
          <li>List your first property and reach thousands of guests</li>
          <li>Set your availability and pricing</li>
          <li>Request a verification badge to build trust</li>
        </ul>
      </div>` : `
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <h4 style="color: #2c3e7a;">Getting Started as a Guest:</h4>
        <ul>
          <li>Browse thousands of verified properties</li>
          <li>Book your perfect short-stay accommodation</li>
          <li>Earn membership rewards with every booking</li>
        </ul>
      </div>`}
      <p style="margin-top: 20px; color: #666;">If you have any questions, our support team is always here to help.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;

// Account Deletion Confirmation Email
exports.accountDeletionEmail = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #7f8c8d; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Account Deleted</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your ShortStay account has been permanently deleted as requested.</p>
      <p>All your personal data has been removed from our systems.</p>
      <p style="color: #666; margin-top: 20px;">
        If you did not request this deletion or believe it was done in error, 
        please contact our support team immediately at <strong>support@shortstay.com</strong>.
      </p>
      <p style="color: #666;">We're sorry to see you go. You are welcome to create a new account at any time.</p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>
`;
