const pageMap: Record<string, string> = {
  Home: '/',
  Obamacare: '/obamacare',
  MedicareAdvantage: '/medicare-advantage',
  LifeInsurance: '/life-insurance',
  DentalVision: '/dental-vision',
  ForBrokers: '/for-brokers',
  PrivacyPolicy: '/privacy-policy',
  TermsAndConditions: '/terms-and-conditions',
  HipaaNotice: '/hipaa-notice',
  Leads: '/leads'
};

export function createPageUrl(pageName: string) {
  return pageMap[pageName] ?? `/${pageName.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()}`;
}
