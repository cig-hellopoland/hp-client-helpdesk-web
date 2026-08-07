import {
  filterOptionsByQuery,
  getLocationFilterOptions,
  matchesCollectionFilter,
  matchesLocationFilters,
  matchesSearchText,
  matchesStatusFilter,
} from './utils';

const items = [
  {
    id: 1,
    name: 'Muzeum Łódzkie',
    location: { voivodeship: 'Łódzkie', county: 'Łódź', city: 'Łódź' },
    published: true,
    blocked: false,
    categories: [{ id: 10, label: 'Muzea' }],
  },
  {
    id: 2,
    name: 'Zamek',
    location: { voivodeship: 'Mazowieckie', county: 'Warszawa', city: 'Warszawa' },
    published: false,
    blocked: false,
    categories: [],
  },
];

describe('listing filter helpers', () => {
  it('builds cascading location options', () => {
    const options = getLocationFilterOptions(items, {
      voivodeship: 'Łódzkie', county: '',
    });

    expect(options.voivodeships.map(option => option.label)).toEqual(['łódzkie', 'mazowieckie']);
    expect(options.counties.map(option => option.label)).toEqual(['Łódź']);
    expect(options.cities.map(option => option.label)).toEqual(['Łódź']);
  });

  it('matches search text without requiring Polish diacritics', () => {
    expect(matchesSearchText([items[0].name], 'lodzkie')).toBe(true);
  });

  it('filters select options by a name fragment without Polish diacritics', () => {
    const options = [
      { label: '\u0141ódź', value: 'lodz' },
      { label: 'Warszawa', value: 'warszawa' },
    ];

    expect(filterOptionsByQuery(options, 'lod')).toEqual([options[0]]);
  });

  it('combines location, status and taxonomy filters', () => {
    expect(matchesLocationFilters(items[0], {
      voivodeship: 'Łódzkie', county: 'Łódź', city: 'Łódź',
    })).toBe(true);
    expect(matchesStatusFilter(items[0], 'published')).toBe(true);
    expect(matchesStatusFilter(items[1], 'unpublished')).toBe(true);
    expect(matchesCollectionFilter(items[0].categories, '10')).toBe(true);
    expect(matchesCollectionFilter(items[1].categories, '10')).toBe(false);
  });
});
