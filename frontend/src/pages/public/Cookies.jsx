import PublicNav from "../../components/PublicNav";
import Footer from "../../components/Footer";

const SECTIONS = [
  {
    title: '1. What Are Cookies',
    body: 'Cookies are small text files stored on your device when you visit a website. ShortStay uses cookies and similar technologies (like localStorage) to keep you signed in, remember your preferences, and understand how the platform is used.',
  },
  {
    title: '2. Essential Cookies',
    body: 'These are required for the platform to function — for example, keeping you logged in during a session and remembering your role (guest, host, admin) as you navigate between pages. The platform cannot function properly without these.',
  },
  {
    title: '3. Preference Cookies',
    body: 'These remember choices you\'ve made, such as your notification preferences, so you don\'t have to set them again on every visit.',
  },
  {
    title: '4. Analytics',
    body: 'We may use basic, privacy-respecting analytics to understand overall usage patterns (e.g. which pages are visited most) so we can improve the platform. This data is aggregated and is not used to individually track you across other websites.',
  },
  {
    title: '5. Managing Cookies',
    body: 'Most browsers let you view, delete, and block cookies through their settings. Note that blocking essential cookies will prevent you from staying logged in to ShortStay.',
  },
];

export default function Cookies() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      <PublicNav />

      <section className="bg-blue-900 text-white pt-32 pb-16 px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Cookie Policy</h1>
        <p className="text-blue-100">Last Updated: September 2026</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full -mt-10 relative z-10 flex-grow">
        <div className="bg-white max-w-3xl mx-auto p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-gray-600 mb-10 leading-relaxed">
            This Cookie Policy explains what cookies are, how ShortStay uses them, and the choices you have.
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
