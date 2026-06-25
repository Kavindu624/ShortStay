// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Field names match what the actual page components expect from the real API.

export const MOCK_USERS = {
  admin:           { _id: 'u1', name: 'Admin User',     email: 'admin@shortstay.com',     role: 'admin',            avatar: null },
  guest:           { _id: 'u2', name: 'Guest User',     email: 'guest@shortstay.com',     role: 'guest',            avatar: null },
  host:            { _id: 'u3', name: 'Host User',      email: 'host@shortstay.com',      role: 'host',             avatar: null },
  field_inspector: { _id: 'u4', name: 'Inspector User', email: 'inspector@shortstay.com', role: 'field_inspector',  avatar: null },
  payment_manager: { _id: 'u5', name: 'PM User',        email: 'pm@shortstay.com',        role: 'payment_manager',  avatar: null },
};

export const MOCK_PROPERTIES = [
  {
    _id: 'p1', property_id: 1,
    title: 'Beachfront Villa', address: 'Galle, Sri Lanka',
    price_per_night: 12000, type: 'Villa',
    is_approved: 1, verification_badge: 1, verification_status: 'approved',
    overall_score: 4.8, review_count: 24, image: null,
    host: { name: 'Host User' }, bedrooms: 3, bathrooms: 2, max_guests: 6,
    amenities: ['WiFi', 'Pool', 'AC', 'Kitchen'],
    status: 'approved', rating: 4.8, reviews: 24,
  },
  {
    _id: 'p2', property_id: 2,
    title: 'City Centre Apartment', address: 'Colombo, Sri Lanka',
    price_per_night: 7500, type: 'Apartment',
    is_approved: 1, verification_badge: 0, verification_status: 'none',
    overall_score: 4.5, review_count: 18, image: null,
    host: { name: 'Host User' }, bedrooms: 2, bathrooms: 1, max_guests: 4,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking'],
    status: 'approved', rating: 4.5, reviews: 18,
  },
  {
    _id: 'p3', property_id: 3,
    title: 'Hill Country Cottage', address: 'Nuwara Eliya, Sri Lanka',
    price_per_night: 9000, type: 'Cottage',
    is_approved: 0, verification_badge: 0, verification_status: 'requested',
    overall_score: 4.7, review_count: 12, image: null,
    host: { name: 'Host User' }, bedrooms: 2, bathrooms: 1, max_guests: 4,
    amenities: ['WiFi', 'Fireplace', 'Garden'],
    status: 'pending', rating: 4.7, reviews: 12,
  },
  {
    _id: 'p4', property_id: 4,
    title: 'Sunset Bungalow', address: 'Mirissa, Sri Lanka',
    price_per_night: 8500, type: 'Bungalow',
    is_approved: 1, verification_badge: 1, verification_status: 'approved',
    overall_score: 4.6, review_count: 31, image: null,
    host: { name: 'Host User' }, bedrooms: 2, bathrooms: 2, max_guests: 5,
    amenities: ['WiFi', 'AC', 'Pool', 'Beach Access'],
    status: 'approved', rating: 4.6, reviews: 31,
  },
];

export const MOCK_BOOKINGS = [
  {
    _id: 'b1', booking_id: 101, property_id: 1, guest_id: 2,
    checkin_date: '2024-07-01', checkout_date: '2024-07-05',
    total_price: 48000, status: 'confirmed',
    Property: { title: 'Beachfront Villa', address: 'Galle, Sri Lanka' },
    User: { name: 'Guest User' },
    checkIn: '2024-07-01', checkOut: '2024-07-05', totalAmount: 48000, nights: 4,
  },
  {
    _id: 'b2', booking_id: 102, property_id: 2, guest_id: 2,
    checkin_date: '2024-08-10', checkout_date: '2024-08-12',
    total_price: 15000, status: 'pending',
    Property: { title: 'City Centre Apartment', address: 'Colombo, Sri Lanka' },
    User: { name: 'Guest User' },
    checkIn: '2024-08-10', checkOut: '2024-08-12', totalAmount: 15000, nights: 2,
  },
  {
    _id: 'b3', booking_id: 103, property_id: 3, guest_id: 6,
    checkin_date: '2024-06-15', checkout_date: '2024-06-18',
    total_price: 27000, status: 'completed',
    Property: { title: 'Hill Country Cottage', address: 'Nuwara Eliya, Sri Lanka' },
    User: { name: 'Alice Smith' },
    checkIn: '2024-06-15', checkOut: '2024-06-18', totalAmount: 27000, nights: 3,
  },
  {
    _id: 'b4', booking_id: 104, property_id: 4, guest_id: 7,
    checkin_date: '2024-09-01', checkout_date: '2024-09-07',
    total_price: 51000, status: 'confirmed',
    Property: { title: 'Sunset Bungalow', address: 'Mirissa, Sri Lanka' },
    User: { name: 'Bob Jones' },
    checkIn: '2024-09-01', checkOut: '2024-09-07', totalAmount: 51000, nights: 6,
  },
];

export const MOCK_PAYMENTS = [
  { _id: 'pay1', payment_id: 201, booking_id: 101, amount: 48000, status: 'completed', method: 'card', payment_date: '2024-06-30' },
  { _id: 'pay2', payment_id: 202, booking_id: 102, amount: 15000, status: 'pending',   method: 'wallet', payment_date: '2024-08-09' },
  { _id: 'pay3', payment_id: 203, booking_id: 103, amount: 27000, status: 'completed', method: 'card', payment_date: '2024-06-14' },
  { _id: 'pay4', payment_id: 204, booking_id: 104, amount: 51000, status: 'completed', method: 'card', payment_date: '2024-08-31' },
];

export const MOCK_INSPECTIONS = [
  { _id: 'i1', inspection_id: 301, property_id: 1, status: 'pending',   scheduled_date: '2024-07-10', overall_score: null, recommendation: '' },
  { _id: 'i2', inspection_id: 302, property_id: 3, status: 'completed', scheduled_date: '2024-06-25', overall_score: 4.5,  recommendation: 'All good, clean and well maintained.' },
  { _id: 'i3', inspection_id: 303, property_id: 2, status: 'pending',   scheduled_date: '2024-07-15', overall_score: null, recommendation: '' },
];

export const MOCK_COMPLAINTS = [
  { _id: 'c1', complaint_id: 401, subject: 'Property not as described', message: 'The pool was not available.', status: 'open',     guest: { name: 'Alice Smith' }, property: { title: 'Beachfront Villa' },       createdAt: '2024-06-20' },
  { _id: 'c2', complaint_id: 402, subject: 'Host unresponsive',         message: 'Could not reach host for check-in.', status: 'resolved', guest: { name: 'Bob Jones' },   property: { title: 'City Centre Apartment' }, createdAt: '2024-06-22' },
  { _id: 'c3', complaint_id: 403, subject: 'Cleanliness issue',         message: 'Property was not clean on arrival.', status: 'open',     guest: { name: 'Guest User' },  property: { title: 'Hill Country Cottage' },  createdAt: '2024-07-01' },
];

export const MOCK_REVIEWS = [
  { _id: 'r1', review_id: 501, property: MOCK_PROPERTIES[0], rating: 5, comment: 'Amazing stay! Loved every moment.',           createdAt: '2024-06-06', guest: { name: 'Alice Smith' } },
  { _id: 'r2', review_id: 502, property: MOCK_PROPERTIES[1], rating: 4, comment: 'Very comfortable and central location.',      createdAt: '2024-06-12', guest: { name: 'Guest User' } },
  { _id: 'r3', review_id: 503, property: MOCK_PROPERTIES[3], rating: 5, comment: 'Perfect sunset views! Highly recommended.',  createdAt: '2024-09-08', guest: { name: 'Bob Jones' } },
];

export const MOCK_USERS_LIST = [
  { _id: 'u1', user_id: 1, name: 'Admin User',     email: 'admin@shortstay.com',     role: 'admin',            createdAt: '2024-01-01', status: 'active' },
  { _id: 'u2', user_id: 2, name: 'Guest User',     email: 'guest@shortstay.com',     role: 'guest',            createdAt: '2024-02-15', status: 'active' },
  { _id: 'u3', user_id: 3, name: 'Host User',      email: 'host@shortstay.com',      role: 'host',             createdAt: '2024-03-10', status: 'active' },
  { _id: 'u4', user_id: 4, name: 'Inspector User', email: 'inspector@shortstay.com', role: 'field_inspector',  createdAt: '2024-04-01', status: 'active' },
  { _id: 'u5', user_id: 5, name: 'PM User',        email: 'pm@shortstay.com',        role: 'payment_manager',  createdAt: '2024-04-05', status: 'active' },
  { _id: 'u6', user_id: 6, name: 'Alice Smith',    email: 'alice@example.com',       role: 'guest',            createdAt: '2024-05-01', status: 'active' },
  { _id: 'u7', user_id: 7, name: 'Bob Jones',      email: 'bob@example.com',         role: 'host',             createdAt: '2024-05-15', status: 'suspended' },
];

export const MOCK_ADMIN_DASHBOARD = {
  totalUsers: 128,
  totalProperties: 47,
  totalBookings: 312,
  totalRevenue: 4850000,
};

export const MOCK_HOST_DASHBOARD = {
  totalListings: 4,
  totalBookings: 12,
  totalEarnings: 285000,
  averageRating: 4.65,
};

export const MOCK_PM_DASHBOARD = {
  totalPayments: 312,
  totalRevenue: 4850000,
  pendingPayouts: 8,
  completedPayouts: 45,
};

export const MOCK_WALLET = {
  balance: 25000,
  transactions: [
    { _id: 't1', type: 'credit', amount: 30000, description: 'Refund for booking B-123', date: '2024-06-01' },
    { _id: 't2', type: 'debit',  amount: 5000,  description: 'Payment for Booking B-124', date: '2024-06-10' },
  ],
};
