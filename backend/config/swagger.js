const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShortStay API',
      version: '1.0.0',
      description: `
## ShortStay Backend API

A full-featured short-term property rental platform API.

### Authentication
Most endpoints require a JWT Bearer token. Include it in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

### Roles
- **guest** — Can search properties, make bookings, write reviews, raise complaints
- **host** — Can list/manage properties, manage bookings, receive payouts
- **admin** — Full system access: user management, property approval, reports
- **payment_manager** — Manages payments, refunds, disputes, payouts
- **field_inspector** — Conducts property inspections and submits reports

### Google OAuth Flow
1. Frontend redirects browser to \`GET /api/auth/google\`
2. After Google login, backend redirects to \`{FRONTEND_URL}/auth/callback?token=...&role=...&user_id=...\`
3. Frontend stores the token from the URL query parameter
      `,
      contact: {
        name: 'ShortStay Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name:     { type: 'string', example: 'John Doe' },
            email:    { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'Secret@123' },
            role:     { type: 'string', enum: ['guest', 'host'], example: 'guest' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'Secret@123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful' },
            token:   { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                user_id: { type: 'integer', example: 1 },
                name:    { type: 'string', example: 'John Doe' },
                email:   { type: 'string', example: 'john@example.com' },
                role:    { type: 'string', example: 'guest' },
              },
            },
          },
        },
        // ── Property ──────────────────────────────────────────────────────────
        Property: {
          type: 'object',
          properties: {
            property_id:   { type: 'integer', example: 1 },
            title:         { type: 'string', example: 'Cozy Apartment in Colombo' },
            description:   { type: 'string', example: 'A lovely 2-bedroom apartment...' },
            location:      { type: 'string', example: 'Colombo 03, Sri Lanka' },
            price_per_night: { type: 'number', example: 75.00 },
            max_guests:    { type: 'integer', example: 4 },
            status:        { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            is_verified:   { type: 'boolean', example: true },
            images:        { type: 'array', items: { type: 'string' }, example: ['http://localhost:5000/uploads/img1.jpg'] },
          },
        },
        CreatePropertyRequest: {
          type: 'object',
          required: ['title', 'description', 'location', 'price_per_night', 'max_guests'],
          properties: {
            title:           { type: 'string', example: 'Cozy Apartment in Colombo' },
            description:     { type: 'string', example: 'A lovely 2-bedroom apartment...' },
            location:        { type: 'string', example: 'Colombo 03, Sri Lanka' },
            price_per_night: { type: 'number', example: 75.00 },
            max_guests:      { type: 'integer', example: 4 },
          },
        },
        // ── Booking ───────────────────────────────────────────────────────────
        Booking: {
          type: 'object',
          properties: {
            booking_id:          { type: 'integer', example: 1 },
            property_id:         { type: 'integer', example: 5 },
            guest_id:            { type: 'integer', example: 2 },
            checkin_date:        { type: 'string', format: 'date', example: '2026-07-01' },
            checkout_date:       { type: 'string', format: 'date', example: '2026-07-05' },
            total_price:         { type: 'number', example: 300.00 },
            status:              { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'rejected', 'expired'], example: 'pending' },
            cancellation_reason: { type: 'string', example: 'Change of plans' },
          },
        },
        CreateBookingRequest: {
          type: 'object',
          required: ['property_id', 'checkin_date', 'checkout_date'],
          properties: {
            property_id:  { type: 'integer', example: 5 },
            checkin_date: { type: 'string', format: 'date', example: '2026-07-01' },
            checkout_date:{ type: 'string', format: 'date', example: '2026-07-05' },
          },
        },
        // ── Review ────────────────────────────────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            review_id:   { type: 'integer', example: 1 },
            property_id: { type: 'integer', example: 5 },
            guest_id:    { type: 'integer', example: 2 },
            rating:      { type: 'integer', minimum: 1, maximum: 5, example: 4 },
            comment:     { type: 'string', example: 'Great place, very clean!' },
          },
        },
        // ── Error ─────────────────────────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Unauthorized' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',           description: 'Authentication — register, login, logout, password reset' },
      { name: 'OAuth',          description: 'Google OAuth 2.0 login flow' },
      { name: 'Profile',        description: 'User profile management' },
      { name: 'Properties',     description: 'Property listings — browse, create, manage' },
      { name: 'Availability',   description: 'Property availability and calendar management' },
      { name: 'Bookings',       description: 'Booking management for guests and hosts' },
      { name: 'Reviews',        description: 'Property reviews and ratings' },
      { name: 'Payments',       description: 'Stripe payments, refunds, and disputes' },
      { name: 'Payouts',        description: 'Host payout management' },
      { name: 'Notifications',  description: 'In-app notification system' },
      { name: 'Complaints',     description: 'Guest complaint submission and admin resolution' },
      { name: 'Inspector',      description: 'Field inspector — property inspection workflow' },
      { name: 'Admin',          description: 'Admin panel — user, property, and report management' },
      { name: 'Dashboard',      description: 'Role-specific dashboards' },
    ],
  },
  // Tell swagger-jsdoc where to find your JSDoc comments
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
