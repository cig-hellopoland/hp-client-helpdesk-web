export const normalizeFilterValue = value => (value == null ? '' : String(value))
  .toLocaleLowerCase('pl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ł/g, 'l')
  .trim();

const compareFilterValues = (left, right) => (
  normalizeFilterValue(left) === normalizeFilterValue(right)
);

const toOptions = values => Array.from(new Set(values.filter(Boolean)))
  .sort((left, right) => left.localeCompare(right, 'pl', { sensitivity: 'base' }))
  .map(value => ({ label: value, value }));

export const getLocationFilterOptions = (items, values) => {
  const withVoivodeship = items.filter((item) => {
    const location = item.location || {};
    return !values.voivodeship
      || compareFilterValues(location.voivodeship, values.voivodeship);
  });
  const withCounty = withVoivodeship.filter((item) => {
    const location = item.location || {};
    return !values.county || compareFilterValues(location.county, values.county);
  });

  return {
    voivodeships: toOptions(items
      .map(item => (item.location || {}).voivodeship)
      .filter(Boolean)
      .map(value => value.toLocaleLowerCase('pl'))),
    counties: toOptions(withVoivodeship.map(item => (item.location || {}).county)),
    cities: toOptions(withCounty.map(item => (item.location || {}).city)),
  };
};

export const matchesLocationFilters = (item, values) => {
  const location = item.location || {};

  return (!values.voivodeship
      || compareFilterValues(location.voivodeship, values.voivodeship))
    && (!values.county || compareFilterValues(location.county, values.county))
    && (!values.city || compareFilterValues(location.city, values.city));
};

export const matchesSearchText = (values, query) => {
  const normalizedQuery = normalizeFilterValue(query);
  if (!normalizedQuery) {
    return true;
  }

  return values.some(value => normalizeFilterValue(value).includes(normalizedQuery));
};

export const filterOptionsByQuery = (options, query) => {
  const normalizedQuery = normalizeFilterValue(query);
  if (!normalizedQuery) {
    return options;
  }
  return options.filter(option => (
    normalizeFilterValue(option.label).includes(normalizedQuery)
  ));
};

export const matchesStatusFilter = (item, status) => {
  switch (status) {
    case 'active':
      return !item.blocked;
    case 'blocked':
      return Boolean(item.blocked);
    case 'published':
      return Boolean(item.published) && !item.blocked;
    case 'unpublished':
      return !item.published && !item.blocked;
    default:
      return true;
  }
};

export const matchesIdFilter = (itemValue, filterValue) => (
  !filterValue || String(itemValue) === String(filterValue)
);

export const matchesCollectionFilter = (collection, filterValue) => (
  !filterValue || (collection || []).some(item => String(item.id) === String(filterValue))
);

export const getEntityOptions = (items, idKey, labelKey) => {
  const byId = {};
  items.forEach((item) => {
    const id = item[idKey];
    const label = item[labelKey];
    if (id != null && label) {
      byId[String(id)] = { label, value: id };
    }
  });

  return Object.keys(byId).map(key => byId[key])
    .sort((left, right) => left.label.localeCompare(right.label, 'pl', { sensitivity: 'base' }));
};

export const getCollectionOptions = (items, property) => {
  const byId = {};
  items.forEach(item => (item[property] || []).forEach((entry) => {
    if (entry && entry.id != null && entry.label) {
      byId[String(entry.id)] = { label: entry.label, value: entry.id };
    }
  }));

  return Object.keys(byId).map(key => byId[key])
    .sort((left, right) => left.label.localeCompare(right.label, 'pl', { sensitivity: 'base' }));
};
