import React, { useState } from 'react';
import ContactBar from '@/components/home/ContactBar';
import Footer from '@/components/home/Footer';
import QuoteModal from '@/components/quote/QuoteModal';
import { CheckCircle, MapPin, Phone, MessageCircle } from 'lucide-react';

export default function LocationLandingPage({ stateName, countyName = null }) {
  const [lang, setLang] = useState('en');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const place = countyName ? `${countyName}, ${stateName}` : stateName;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #ebf5ff 0%, #dae8f6 50%, #d4e3f4 100%)' }}>
      <ContactBar lang={lang} setLang={setLang} />
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <MapPin className="w-3.5 h-3.5" /> Local Coverage Help
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e3a5f] leading-tight mb-5">
              Health Insurance Help in {place}
            </h1>
            <p className="text-slate-600 text-lg mb-6 max-w-2xl">
              Compare ACA, Medicare Advantage, Life, and Dental & Vision plans with a licensed local team that helps families understand options without pressure.
            </p>
            <div className="space-y-3 mb-8">
              {[
                `Guidance for residents in ${place}`,
                'English and Spanish support available',
                'Fast quote request and follow-up from a licensed agent',
                'Help reviewing eligibility, doctors, prescriptions, and budget'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setQuoteOpen(true)}
                className="bg-[#1e3a5f] hover:bg-[#163059] text-white font-bold px-8 py-4 rounded-full transition-colors"
              >
                Get a Free Quote
              </button>
              <a
                href="https://wa.me/18774582557"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#22c55e] text-white font-bold px-8 py-4 rounded-full hover:bg-[#16a34a] transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">How we help</h2>
            <div className="space-y-4 text-slate-600">
              <p>
                We built these state and county pages so you can expand SEO coverage without cloning your whole site design over and over. This Astro template keeps one maintainable design while letting you publish localized service-area pages.
              </p>
              <p>
                For production, you can expand the county list, customize the intro text, add state-specific FAQs, and connect each page to the same quote modal and CRM flow already used on the rest of the site.
              </p>
              <a href="tel:8774582557" className="inline-flex items-center gap-2 text-[#1e3a5f] font-semibold hover:underline">
                <Phone className="w-4 h-4" /> 877-458-2557
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer lang={lang} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} ctaSource="local_seo" lang={lang} />
    </div>
  );
}
