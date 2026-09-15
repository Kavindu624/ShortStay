import PublicNav from "../../components/PublicNav";
import Footer from "../../components/Footer";

const OPEN_ROLES = [
  { title: 'Backend Engineer (Node.js)', team: 'Engineering', location: 'Colombo / Remote', type: 'Full-time' },
  { title: 'Frontend Engineer (React)', team: 'Engineering', location: 'Colombo / Remote', type: 'Full-time' },
  { title: 'Customer Support Specialist', team: 'Support', location: 'Colombo', type: 'Full-time' },
  { title: 'Property Verification Officer', team: 'Trust & Safety', location: 'Multiple cities', type: 'Part-time' },
];

const BENEFITS = [
  { title: 'Flexible Hours', desc: 'Work when you\'re most productive, with core hours for team collaboration.' },
  { title: 'Remote-Friendly', desc: 'Most roles support hybrid or fully remote work across Sri Lanka.' },
  { title: 'Health Cover', desc: 'Comprehensive medical insurance for you and your immediate family.' },
  { title: 'Learning Budget', desc: 'Annual allowance for courses, conferences, and certifications.' },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      <PublicNav />

      <section className="bg-blue-900 text-white pt-32 pb-20 px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Join the ShortStay Team
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
          We're building the platform that makes short-term rentals simple for guests and hosts across Sri Lanka. Come help us do it.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {BENEFITS.map(b => (
            <div key={b.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Open Positions</h2>
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {OPEN_ROLES.map(role => (
            <div key={role.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{role.title}</h3>
                <p className="text-gray-500 text-sm">{role.team} &middot; {role.location} &middot; {role.type}</p>
              </div>
              <a
                href="mailto:careers@shortstay.com?subject=Application%3A%20"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
              >
                Apply
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-12">
          Don't see a role that fits? Send us your resume at{' '}
          <a href="mailto:careers@shortstay.com" className="text-blue-700 font-semibold hover:underline">careers@shortstay.com</a>.
        </p>
      </section>

      <Footer />
    </div>
  );
}
