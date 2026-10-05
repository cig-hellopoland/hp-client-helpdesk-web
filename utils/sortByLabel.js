const sortByLabel = (items, getLabel = item => item.label || '') => [...items]
  .sort((left, right) => getLabel(left).localeCompare(getLabel(right), 'pl', {
    sensitivity: 'base',
  }));

export default sortByLabel;
