import PublicNav from "../../components/PublicNav";
import Footer from "../../components/Footer";

const TIERS = [
  { name: 'Basic', discount: '0%', desc: 'Default tier for every new guest account.' },
  { name: 'Silver', discount: '1%', desc: 'Awarded to returning guests based on booking history.' },
  { name: 'Gold', discount: '2%', desc: 'Our mid-tier membership for frequent guests.' },
  { name: 'Platinum', discount: '3%', desc: 'Our top membership tier, for our most loyal guests.' },
];

const SECTIONS = [
  {
    title: '1. Membership Eligibility',
    body: 'Any guest with a verified ShortStay account is automatically enrolled in the Basic membership tier. Higher tiers are assigned based on booking activity and are reflected automatically on your account — there is nothing to apply for separately.',
  },
  {
    title: '2. Membership Benefits',
    body: 'Each membership tier applies an automatic discount to your booking total at checkout, shown before you confirm payment. Discounts apply to the booking subtotal and are calculated at the time your payment is processed.',
  },
  {
    title: '3. Tier Changes',
    body: 'ShortStay may adjust your membership tier at any time based on your account activity. If your tier changes, the new discount rate applies to bookings made after the change — it does not retroactively apply to bookings already paid for.',
  },
  {
    title: '4. Account Responsibilities',
    body: 'Your membership benefits are tied to your individual account and may not be transferred, shared, or resold. Misuse of membership benefits (e.g. through fraudulent bookings) may result in tier downgrade or account suspension.',
  },
  {
    title: '5. Relationship to Other Terms',
    body: 'These Member Terms apply specifically to guest membership tiers and their benefits. They should be read together with our general Terms & Conditions, which govern use of the platform as a whole.',
  },
];

export default function MemberTerms() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      <PublicNav />

      <section className="bg-blue-900 text-white pt-32 pb-16 px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Member Terms</h1>
        <p className="text-blue-100">Last Updated: September 2026</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full -mt-10 relative z-10 flex-grow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
          {TIERS.map(t => (
            <div key={t.name} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-1">{t.name}</div>
              <div className="text-2xl font-extrabold text-gray-900 mb-2">{t.discount}</div>
              <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white max-w-3xl mx-auto p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
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
