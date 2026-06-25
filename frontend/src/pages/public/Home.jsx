import { useState, useEffect } from "react";
import PublicNav from "../../components/PublicNav";
import Footer from "../../components/Footer";

/* ─────────────────────────────────────────────────────────────
   Testimonials Section
   TODO: replace PLACEHOLDER_TESTIMONIALS with a real API call:
         GET /api/public/testimonials  → [{ id, name, role, company, quote, rating }]
───────────────────────────────────────────────────────────────*/
const PLACEHOLDER_TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Property Manager",
    company: "Coastal Rentals LLC",
    quote:
      "ShortStay transformed how we manage our 50+ properties. The automation features alone saved us countless hours every week.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Vacation Rental Owner",
    company: "Mountain View Properties",
    quote:
      "The analytics dashboard gives us insights we never had before. Our revenue increased by 35% in the first quarter.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Operations Director",
    company: "Urban Stays Group",
    quote:
      "Best rental management platform we've used. The verification system ensures quality guests, and the reporting is outstanding.",
    rating: 5,
  },
];

function StarRating({ count = 5 }) {
  return (
    <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="#F59E0B"
          style={{ flexShrink: 0 }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ── Backend integration point ──────────────────────────────
    // Replace with real fetch when endpoint is ready:
    //   fetch("/api/public/testimonials")
    //     .then(r => r.json())
    //     .then(data => setTestimonials(data))
    //     .catch(err => setError(err.message))
    //     .finally(() => setLoading(false));
    // ──────────────────────────────────────────────────────────
    const timer = setTimeout(() => {
      setTestimonials(PLACEHOLDER_TESTIMONIALS);
      setLoading(false);
    }, 400); // simulated network delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      style={{
        background: "#fff",
        padding: "64px 24px",
        borderTop: "1px solid #F3F4F6",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Trusted by Property Managers Worldwide
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#6B7280", maxWidth: "520px", margin: "0 auto" }}>
            See what our customers have to say about ShortStay
          </p>
        </div>

        {/* Cards grid */}
        {loading ? (
          // Skeleton placeholders
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  background: "#F9FAFB",
                  borderRadius: "20px",
                  padding: "32px",
                  border: "1px solid #E5E7EB",
                  minHeight: "220px",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : error ? (
          <p style={{ textAlign: "center", color: "#EF4444" }}>
            Failed to load testimonials. Please try again later.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "#F9FAFB",
                  borderRadius: "20px",
                  padding: "32px",
                  border: "1px solid #E5E7EB",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <StarRating count={t.rating} />
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.7",
                    color: "#374151",
                    flex: 1,
                    marginBottom: "24px",
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Avatar initials */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e4db7, #10b981)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "2px" }}>
                      {t.role}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CTA Section
   TODO: wire "Start Free Trial" → POST /api/auth/register
         wire "Schedule Demo"   → POST /api/public/demo-request
         (or simply navigate to the respective pages)
───────────────────────────────────────────────────────────────*/
function CTASection() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #0f2554 0%, #1a3a8f 60%, #1e4db7 100%)",
        padding: "64px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "340px",
          height: "340px",
          background:
            "radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50px",
          left: "5%",
          width: "280px",
          height: "280px",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: "800",
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
            lineHeight: "1.15",
          }}
        >
          Ready to Transform Your Rental Business?
        </h2>
        <p
          style={{
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "520px",
            margin: "0 auto 40px",
            lineHeight: "1.7",
          }}
        >
          Join thousands of property managers who trust ShortStay for their rental operations
        </p>

        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Primary CTA — navigates to registration */}
          <a
            href="/register"
            id="cta-start-free-trial"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.95rem",
              padding: "14px 30px",
              borderRadius: "12px",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(16,185,129,0.45)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(16,185,129,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.45)";
            }}
          >
            Start Free Trial
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* Secondary CTA — navigates to contact/demo page */}
          <a
            href="/contact"
            id="cta-schedule-demo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.28)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "0.95rem",
              padding: "14px 30px",
              borderRadius: "12px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Schedule Demo
          </a>
        </div>

        {/* Trust micro-copy */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          No credit card required &nbsp;·&nbsp; 14-day free trial &nbsp;·&nbsp; Cancel anytime
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      <PublicNav />

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2554 0%, #1a3a8f 45%, #1e4db7 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,179,237,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '10%',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8" style={{ paddingTop: '96px', paddingBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap' }}>

            {/* Left — Text */}
            <div style={{ flex: '1 1 380px', color: '#fff' }}>


              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: '800',
                lineHeight: '1.12',
                marginBottom: '24px',
                letterSpacing: '-0.02em',
              }}>
                Professional<br />
                Short-Term Rental<br />
                <span style={{
                  background: 'linear-gradient(90deg, #60a5fa, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Management</span>
              </h1>

              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.7',
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '460px',
                marginBottom: '40px',
              }}>
                Enterprise-grade platform for managing vacation rentals, bookings,
                and guest experiences with powerful analytics and seamless operations.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '56px' }}>
                <a href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontWeight: '700', fontSize: '0.95rem',
                  padding: '14px 28px', borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                  transition: 'all 0.2s ease',
                }}>
                  Get Started
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a href="#demo" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff', fontWeight: '600', fontSize: '0.95rem',
                  padding: '14px 28px', borderRadius: '12px',
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}>
                  Watch Demo
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              </div>

              {/* Divider */}
              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '32px' }} />

              {/* Stats */}
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {[
                  { value: '10K+', label: 'Properties' },
                  { value: '50K+', label: 'Active Hosts' },
                  { value: '2M+', label: 'Bookings' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Property Image Card */}
            <div style={{ flex: '1 1 340px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'visible',
                width: '100%',
                maxWidth: '480px',
              }}>
                {/* Main image */}
                <div style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <img
                    src="/hero-property.png"
                    alt="Luxury rental property"
                    style={{ width: '100%', display: 'block', objectFit: 'cover', height: '340px' }}
                  />
                </div>

                {/* Floating badge — top left */}
                <div style={{
                  position: 'absolute', top: '20px', left: '-20px',
                  background: '#fff', borderRadius: '14px',
                  padding: '10px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  zIndex: 10,
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Occupancy Rate</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>94.2%</div>
                  </div>
                </div>

                {/* Floating badge — bottom right */}
                <div style={{
                  position: 'absolute', bottom: '20px', right: '-20px',
                  background: '#fff', borderRadius: '14px',
                  padding: '10px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  zIndex: 10,
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Avg. Revenue</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>$3,240/mo</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="py-14 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Everything You Need to Manage Your Rentals
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Powerful features designed for property managers, hosts, and enterprises
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Property Management</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Manage unlimited properties with detailed listings, pricing rules, and availability calendars.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Verification System</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Built-in verification workflows for hosts, properties, and guests ensuring trust and safety.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Revenue Analytics</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Real-time dashboards with comprehensive analytics, revenue tracking, and performance insights.</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Multi-Role Access</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Role-based access for admins, verifiers, accountants, hosts, and guests with custom permissions.</p>
          </div>
        </div>
      </div>

      {/* Built for Scale Section */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">
                Built for Scale, Designed for Simplicity
              </h2>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-gray-900">Automated Workflows</h4>
                    <p className="text-gray-500 leading-relaxed">Streamline operations with automated booking confirmations, payment processing, and guest communications.</p>
                  </div>
                </div>
                {/* Feature 2 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-gray-900">Advanced Reporting</h4>
                    <p className="text-gray-500 leading-relaxed">Generate detailed financial reports, occupancy analytics, and performance metrics with a single click.</p>
                  </div>
                </div>
                {/* Feature 3 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-gray-900">Secure Payments</h4>
                    <p className="text-gray-500 leading-relaxed">Integrated payment processing with automatic payouts, transaction tracking, and reconciliation.</p>
                  </div>
                </div>
                {/* Feature 4 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-gray-900">Mobile Optimized</h4>
                    <p className="text-gray-500 leading-relaxed">Access your dashboard, manage bookings, and communicate with guests from any device.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-[#F9FAFB]">
                {/* Row 1 */}
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Revenue Growth</h4>
                    <p className="text-gray-500 text-sm mt-0.5">Average increase in revenue for hosts using ShortStay</p>
                  </div>
                  <div className="text-2xl font-extrabold text-[#10B981] ml-4 whitespace-nowrap">+42%</div>
                </div>
                {/* Row 2 */}
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Time Saved</h4>
                    <p className="text-gray-500 text-sm mt-0.5">Automated workflows reduce manual tasks significantly</p>
                  </div>
                  <div className="text-2xl font-extrabold text-[#3B82F6] ml-4 whitespace-nowrap">15 hrs/week</div>
                </div>
                {/* Row 3 */}
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">Guest Satisfaction</h4>
                    <p className="text-gray-500 text-sm mt-0.5">Average guest rating across all properties</p>
                  </div>
                  <div className="text-2xl font-extrabold text-[#8B5CF6] ml-4 whitespace-nowrap">4.8/5</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* ── Trusted by Property Managers Worldwide ── */}
      <TestimonialsSection />

      {/* ── Ready to Transform Your Rental Business? ── */}
      <CTASection />

      <Footer />
    </div>
  );
}
