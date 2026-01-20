
export const home = {
  nav: { home: "Home", services: "Coverage", faq: "FAQ" },
  hero: {
    eyebrow: "Health coverage",
    title: "Do you qualify for subsidized health coverage?",
    body: "Checking is free and takes under 2 minutes. We can help in English or Spanish—no pressure."
  },
  cta: { qualify: "See if I qualify", viewOptions: "View options" },
  services: {
    title: "Coverage options",
    subtitle: "Choose a category and get clear answers to the most common questions.",
    cards: [
      { slug: "aca", title: "ACA (Obamacare)", desc: "Subsidized plans based on income and household size." },
      { slug: "medicare", title: "Medicare", desc: "Turning 65, enrolling, or switching plans—explained clearly." },
      { slug: "life", title: "Life insurance", desc: "Protect your family with simple, flexible options." },
      { slug: "losing-medicaid", title: "Losing Medicaid", desc: "Alternatives so you don’t end up uninsured." },
      { slug: "compare", title: "Compare plans", desc: "How to compare networks, costs, and benefits without confusion." }
    ]
  },
  faq: {
    title: "Frequently asked questions",
    subtitle: "Fast, straightforward answers. If you want, we’ll review it with you by phone or WhatsApp.",
    items: [
      { q: "How much does it cost?", a: "It depends on income, age, county, and the plan. Many people qualify for very low premiums—or even $0—with subsidies." },
      { q: "Do I need to speak English?", a: "No. We can help in English or Spanish." },
      { q: "What do I need to start?", a: "Name, date of birth, address, and a phone number. If applicable: estimated income and household members." },
      { q: "Will this affect immigration status?", a: "Eligibility depends on the program and status. We’ll explain options clearly and respectfully." }
    ]
  }
};
