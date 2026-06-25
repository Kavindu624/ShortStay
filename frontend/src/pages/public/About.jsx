import PublicNav from "../../components/PublicNav";
import Footer from "../../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      <PublicNav />

      {/* Hero Section */}
      <section className="bg-blue-900 text-white pt-32 pb-20 px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Revolutionizing Short-Term<br className="hidden md:block" /> Rental Management
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
          ShortStay was founded in 2018 with a mission to empower property managers and hosts with enterprise-grade tools that simplify operations and maximize revenue.
        </p>
      </section>

      {/* Mission and Vision Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full -mt-10 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To provide property managers and vacation rental hosts with the most powerful, intuitive, and reliable platform for managing their rental business at scale.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe that managing short-term rentals should be effortless, allowing hosts to focus on creating exceptional guest experiences while our technology handles the rest.
            </p>
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To become the world's leading short-term rental management platform, trusted by millions of hosts and property managers across the globe.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We envision a future where every property manager has access to institutional-grade tools and insights, regardless of the size of their portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">Our Story</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  ShortStay was born from the frustration of managing multiple vacation rental properties using outdated spreadsheets and disconnected tools. Our founders, former property managers themselves, knew there had to be a better way.
                </p>
                <p>
                  In 2018, we launched with a simple goal: create software that we would want to use ourselves. Today, ShortStay powers over 10,000 properties worldwide, processing millions of bookings annually.
                </p>
                <p>
                  What started as a small team of three has grown to over 100 passionate professionals dedicated to building the best rental management platform in the industry. But our commitment to our customers remains the same – we're here to help you succeed.
                </p>
                <p>
                  Every feature we build, every update we ship, and every support interaction we have is driven by one question: "How can we make this better for our users?"
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 w-full h-96 lg:h-[600px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Modern office space"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-[#F9FAFB] py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">Our Core Values</h2>
          <p className="text-gray-500 mb-16 text-lg">The principles that guide everything we do</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer First</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every decision we make starts with understanding our customers' needs and delivering exceptional value.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Security</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We protect your data and your business with enterprise-grade security and transparent practices.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We continuously evolve our platform with cutting-edge features that keep you ahead of the competition.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We operate with honesty, transparency, and accountability in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Our Achievements</h2>
          <p className="text-blue-200 mb-16 text-lg">Milestones we're proud of</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">10,000+</div>
              <div className="text-blue-200 font-medium">Properties Managed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">50,000+</div>
              <div className="text-blue-200 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">2M+</div>
              <div className="text-blue-200 font-medium">Bookings Processed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">$500M+</div>
              <div className="text-blue-200 font-medium">Revenue Managed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">98%</div>
              <div className="text-blue-200 font-medium">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</div>
              <div className="text-blue-200 font-medium">Support Available</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">150+</div>
              <div className="text-blue-200 font-medium">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">99.9%</div>
              <div className="text-blue-200 font-medium">Platform Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
