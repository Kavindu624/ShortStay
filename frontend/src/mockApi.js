// ─── MOCK API ─────────────────────────────────────────────────────────────────
// Returns fake responses matching EXACTLY what each page component expects.
// Activated when import.meta.env.VITE_MOCK_MODE === 'true'.

import {
  MOCK_ADMIN_DASHBOARD,
  MOCK_BOOKINGS,
  MOCK_COMPLAINTS,
  MOCK_INSPECTIONS,
  MOCK_PAYMENTS,
  MOCK_PROPERTIES,
  MOCK_REVIEWS,
  MOCK_USERS,
  MOCK_USERS_LIST,
} from './mockData';

const delay = (ms = 250) => new Promise(res => setTimeout(res, ms));
const ok = (data) => ({ data });

export async function mockRequest(method, url, body) {
  await delay();

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (url === '/auth/login') {
    const user = Object.values(MOCK_USERS).find(u => u.email === body?.email) || MOCK_USERS.admin;
    return ok({ token: 'mock-token', user });
  }
  if (url === '/auth/logout')    return ok({});
  if (url === '/auth/register')  return ok({ token: 'mock-token', user: { ...MOCK_USERS.guest, email: body?.email, name: body?.name } });
  if (url === '/auth/create-staff') return ok({ message: 'Staff created!' });
  if (url === '/auth/membership') return ok({ membership_level: 'silver', bookings_needed: 2, next_level: 'gold' });

  // ── Admin dashboard ───────────────────────────────────────────────────────
  if (url === '/admin/dashboard') return ok(MOCK_ADMIN_DASHBOARD);

  // /admin/users → setUsers(r.data || [])  → need array
  if (url.startsWith('/admin/users')) return ok(MOCK_USERS_LIST);

  // /admin/properties → setProperties(r.data || []) → need array
  if (url.startsWith('/admin/properties')) return ok(MOCK_PROPERTIES);

  // /admin/complaints → NOT used directly (AdminComplaints uses /complaints)
  if (url.startsWith('/admin/complaints')) return ok(MOCK_COMPLAINTS);

  // /admin/payments → NOT used directly (AdminPayments uses /payments)
  if (url.startsWith('/admin/payments')) return ok(MOCK_PAYMENTS);

  if (url === '/admin/reports') return ok({ revenue: 4850000, bookings: 312, users: 128, properties: 47 });

  // ── Complaints — AdminComplaints uses /complaints ─────────────────────────
  if (url.startsWith('/complaints')) return ok(MOCK_COMPLAINTS);

  // ── Properties ────────────────────────────────────────────────────────────
  // HostListings/HostDashboard/HostReviews: r.data || []  → need array
  if (url === '/properties/host/my-properties') return ok(MOCK_PROPERTIES);

  // Single property
  if (url.match(/^\/properties\/[^/]+$/)) {
    const id = url.split('/').pop();
    return ok(MOCK_PROPERTIES.find(p => String(p.property_id) === id || p._id === id) || MOCK_PROPERTIES[0]);
  }

  // BrowseListings: r.data.properties || r.data || []  → either works
  if (url.startsWith('/properties')) return ok({ properties: MOCK_PROPERTIES, total: MOCK_PROPERTIES.length });

  // ── Bookings ──────────────────────────────────────────────────────────────
  // MyBookings / GuestDashboard / GuestReviews: setBookings(r.data || []) → need array
  if (url === '/bookings/my')   return ok(MOCK_BOOKINGS);
  // HostBookings / HostDashboard: setBookings(r.data || []) → need array
  if (url === '/bookings/host') return ok(MOCK_BOOKINGS);
  // Single booking
  if (url.match(/^\/bookings\/[^/]+$/)) {
    const id = url.split('/').pop();
    return ok(MOCK_BOOKINGS.find(b => String(b.booking_id) === id || b._id === id) || MOCK_BOOKINGS[0]);
  }
  if (url.startsWith('/bookings')) return ok({ bookings: MOCK_BOOKINGS, total: MOCK_BOOKINGS.length });

  // ── Payments ──────────────────────────────────────────────────────────────
  // GuestWallet / AdminPayments / PMDashboard: setPayments(r.data || []) → need array
  if (url === '/payments/report') return ok({ message: 'Report generated!' });
  if (url.startsWith('/payments')) return ok(MOCK_PAYMENTS);

  // ── Reviews ───────────────────────────────────────────────────────────────
  // HostReviews: api.get(`/reviews/property/${id}`).then(x => x.data || []) → need array
  if (url.match(/^\/reviews\/property\/\d+$/)) return ok(MOCK_REVIEWS);
  if (url.startsWith('/reviews')) return ok(MOCK_REVIEWS);

  // ── Inspections ───────────────────────────────────────────────────────────
  // InspectorDashboard: setInspections(r.data || []) → need array
  if (url === '/inspector' || url.startsWith('/inspector')) return ok(MOCK_INSPECTIONS);

  // ── Accountant ───────────────────────────────────────────────────────
  if (url === '/pm/dashboard')        return ok({ totalPayments: 312, totalRevenue: 4850000, pendingPayouts: 8, completedPayouts: 45 });
  if (url.startsWith('/pm/payments')) return ok(MOCK_PAYMENTS);
  if (url.startsWith('/pm/payouts'))  return ok([]);
  if (url.startsWith('/pm/reports'))  return ok({});

  // ── Host endpoints ────────────────────────────────────────────────────────
  if (url === '/host/dashboard')              return ok({ totalListings: 4, totalBookings: 12, totalEarnings: 285000, averageRating: 4.65 });
  if (url.startsWith('/host/properties'))     return ok(MOCK_PROPERTIES);
  if (url.startsWith('/host/bookings'))       return ok(MOCK_BOOKINGS);
  if (url.startsWith('/host/reviews'))        return ok(MOCK_REVIEWS);
  if (url.startsWith('/host/earnings'))       return ok({ earnings: 285000, monthly: [] });

  // ── User / profile ────────────────────────────────────────────────────────
  if (url.startsWith('/users/me') || url.startsWith('/guest/profile')) return ok(MOCK_USERS.guest);

  // ── Catch-all ─────────────────────────────────────────────────────────────
  console.warn('[MockAPI] Unhandled:', method.toUpperCase(), url, '→ returning {}');
  return ok({});
}
