// Central list of supported states + their priority counties.
// Used for Astro getStaticPaths() to generate /[lang]/[state]/ and /[lang]/[state]/[county]/ pages.

export const coverage: Record<string, string[]> = {
  // Priority: Florida
  florida: [
    'miami-dade',
    'broward',
    'palm-beach',
    'orange',
    'osceola',
    'hillsborough',
    'pinellas',
    'polk',
    'duval',
    'lee',
    'seminole',
    'brevard',
    'volusia',
    'sarasota',
    'collier',
  ],

  // Priority: Texas
  texas: [
    'harris',
    'dallas',
    'tarrant',
    'bexar',
    'travis',
    'el-paso',
    'hidalgo',
    'fort-bend',
    'collin',
    'denton',
    'williamson',
    'galveston',
    'nueces',
    'cameron',
    'montgomery',
  ],

  // Priority: North Carolina
  'north-carolina': [
    'mecklenburg',
    'wake',
    'guilford',
    'durham',
    'cumberland',
  ],

  // Priority: South Carolina
  'south-carolina': [
    'greenville',
    'richland',
    'charleston',
    'horry',
    'spartanburg',
  ],

  // Priority: Alabama
  alabama: [
    'jefferson',
    'mobile',
    'madison',
    'montgomery',
  ],

  // Priority: Arizona
  arizona: [
    'maricopa',
    'pima',
    'pinal',
    'yuma',
  ],

  // Priority: Michigan
  michigan: [
    'wayne',
    'oakland',
    'macomb',
    'kent',
  ],

  // Priority: Indiana
  indiana: [
    'marion',
    'lake',
    'allen',
  ],

  // Priority: Ohio
  ohio: [
    'franklin',
    'cuyahoga',
    'hamilton',
    'lucas',
  ],

  // Priority: Tennessee
  tennessee: [
    'shelby',
    'davidson',
    'knox',
    'hamilton',
  ],

  // Priority: Georgia
  georgia: [
    'fulton',
    'gwinnett',
    'cobb',
    'dekalb',
    'clayton',
    'chatham',
  ],

  // Priority: Missouri
  missouri: [
    'st-louis',
    'jackson',
    'st-charles',
  ],

  // Priority: Mississippi
  mississippi: [
    'hinds',
    'desoto',
    'harrison',
  ],
};

export default coverage;
