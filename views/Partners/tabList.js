export function getURLByTabType(tabType = '', tabList = [], URLOptions) {
  const tab = tabList.filter(({ type }) => type === tabType)[0];
  let result = {};

  if (tab) {
    const { URL, URLAs } = tab;

    if (Object.keys(URLOptions).length) {
      let parsedURL = URL;
      let parsedURLAs = URLAs;

      Object.entries(URLOptions).forEach((option) => {
        const [key, value] = option;

        if (key && value != null) {
          parsedURL = parsedURL.replace(`:${key}`, value);
          parsedURLAs = parsedURLAs.replace(`:${key}`, value);
        }
      });

      result = { URL: parsedURL, URLAs: parsedURLAs };
    } else {
      result = { URL, URLAs };
    }
  }

  return result;
}

export const types = {
  PARTNER_CREATE: 'PARTNER_CREATE',
  PARTNER_DETAILS: 'PARTNER_DETAILS',
  PARTNER_LIST: 'PARTNER_LIST',
};

export default [
  {
    disabled: true,
    label: 'Lista partnerów',
    type: types.PARTNER_LIST,
    URL: '/partners',
    URLAs: '/partners',
  },
  {
    disabled: true,
    label: 'Szczegóły partnera',
    type: types.PARTNER_DETAILS,
    URL: '/partners?partnerId=:partnerId',
    URLAs: '/partners/:partnerId',
  },
  {
    label: 'Dodaj partnera',
    type: types.PARTNER_CREATE,
    URL: '/partners/create',
    URLAs: '/partners/create',
  },
];
