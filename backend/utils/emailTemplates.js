exports.bookingConfirmationEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #e74c3c;">ShortStay Booking Confirmation</h2>
    <p>Dear <strong>${guestName}</strong>,</p>
    <p>Your booking has been successfully created!</p>
    
    <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
      <h3>Booking Details</h3>
      <p><strong>Property:</strong> ${property.title}</p>
      <p><strong>Address:</strong> ${property.address}</p>
      <p><strong>Check In:</strong> ${booking.checkin_date}</p>
      <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
      <p><strong>Total Price:</strong> $${booking.total_price}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
    </div>

    <p style="margin-top: 20px;">Thank you for choosing ShortStay!</p>
  </div>
`;

exports.bookingApprovedEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #27ae60;">Booking Approved!</h2>
    <p>Dear <strong>${guestName}</strong>,</p>
    <p>Great news! Your booking has been approved by the host.</p>
    
    <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
      <h3>Booking Details</h3>
      <p><strong>Property:</strong> ${property.title}</p>
      <p><strong>Address:</strong> ${property.address}</p>
      <p><strong>Check In:</strong> ${booking.checkin_date}</p>
      <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
      <p><strong>Total Price:</strong> $${booking.total_price}</p>
    </div>

    <p style="margin-top: 20px;">Thank you for choosing ShortStay!</p>
  </div>
`;

exports.bookingCancelledEmail = (guestName, property, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #e74c3c;">Booking Cancelled</h2>
    <p>Dear <strong>${guestName}</strong>,</p>
    <p>Your booking has been cancelled.</p>
    
    <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
      <h3>Booking Details</h3>
      <p><strong>Property:</strong> ${property.title}</p>
      <p><strong>Check In:</strong> ${booking.checkin_date}</p>
      <p><strong>Check Out:</strong> ${booking.checkout_date}</p>
    </div>

    <p style="margin-top: 20px;">We hope to see you again on ShortStay!</p>
  </div>
`;

exports.paymentSuccessEmail = (guestName, payment, booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #27ae60;">Payment Successful!</h2>
    <p>Dear <strong>${guestName}</strong>,</p>
    <p>Your payment has been processed successfully.</p>
    
    <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
      <h3>Payment Receipt</h3>
      <p><strong>Payment ID:</strong> ${payment.payment_id}</p>
      <p><strong>Amount:</strong> $${payment.amount}</p>
      <p><strong>Date:</strong> ${payment.payment_date}</p>
      <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
    </div>

    <p style="margin-top: 20px;">Thank you for choosing ShortStay!</p>
  </div>
`;