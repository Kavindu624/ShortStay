import PublicNav from "../../components/PublicNav";
import Footer from "../../components/Footer";

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'When you register, book a property, or list a property with us, we collect information such as your name, email address, phone number, payment details, and — for hosts — bank/payout details. We also automatically collect device and usage information (IP address, browser type, pages visited) to help us operate and improve the platform.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to create and manage your account, process bookings and payments, communicate booking-related updates, verify host properties, prevent fraud, and improve our services. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Sharing Your Information',
    body: 'Booking details are shared between the guest and host as needed to complete a stay (e.g. contact details, check-in dates). Payment processing is handled by our payment provider (Stripe); we do not store your full card details on our own servers. We may share information with service providers who help us operate the platform, and where required by law.',
  },
  {
    title: '4. Data Retention',
    body: 'We retain your account and booking information for as long as your account is active, and for a reasonable period afterward to comply with legal, tax, and dispute-resolution obligations.',
  },
  {
    title: '5. Your Rights',
    body: 'You can view and update most of your account information from your profile settings at any time. You may request a copy of your data or request account deletion by contacting support — we will process such requests in line with applicable data protection law.',
  },
  {
    title: '6. Security',
    body: 'We use industry-standard measures — including encrypted password storage, JWT-based authentication, and role-based access controls — to protect your information. No method of transmission or storage is 100% secure, and we encourage you to use a strong, unique password for your account.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will post the updated version on this page with a revised "Last Updated" date.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      <PublicNav />

      <section className="bg-blue-900 text-white pt-32 pb-16 px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-blue-100">Last Updated: September 2026</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full -mt-10 relative z-10 flex-grow">
        <div className="bg-white max-w-3xl mx-auto p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-gray-600 mb-10 leading-relaxed">
            This Privacy Policy explains how ShortStay collects, uses, and protects your personal information when you use our platform as a guest, host, or visitor.
          </p>
          <div className="flex flex-col gap-8">
            {SECTIONS.map(s => (
              <div key={s.title}>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
