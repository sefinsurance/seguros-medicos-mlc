export const seoLocations = [
  {
    state: 'florida',
    stateName: 'Florida',
    counties: [
      { slug: 'lee-county', name: 'Lee County' },
      { slug: 'collier-county', name: 'Collier County' },
      { slug: 'miami-dade-county', name: 'Miami-Dade County' }
    ]
  },
  {
    state: 'texas',
    stateName: 'Texas',
    counties: [
      { slug: 'harris-county', name: 'Harris County' },
      { slug: 'dallas-county', name: 'Dallas County' },
      { slug: 'bexar-county', name: 'Bexar County' }
    ]
  },
  {
    state: 'north-carolina',
    stateName: 'North Carolina',
    counties: [
      { slug: 'mecklenburg-county', name: 'Mecklenburg County' },
      { slug: 'wake-county', name: 'Wake County' }
    ]
  },
  {
    state: 'south-carolina',
    stateName: 'South Carolina',
    counties: [
      { slug: 'greenville-county', name: 'Greenville County' },
      { slug: 'richland-county', name: 'Richland County' }
    ]
  },
  {
    state: 'tennessee',
    stateName: 'Tennessee',
    counties: [
      { slug: 'shelby-county', name: 'Shelby County' },
      { slug: 'davidson-county', name: 'Davidson County' }
    ]
  }
];

export function getStateBySlug(slug) {
  return seoLocations.find((item) => item.state === slug);
}

export function getCountyBySlugs(stateSlug, countySlug) {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const county = state.counties.find((item) => item.slug === countySlug);
  return county ? { state, county } : null;
}
