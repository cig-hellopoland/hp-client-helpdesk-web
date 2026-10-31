# Referencja frontendu

Inwentaryzacja lokalnych źródeł: **2026-10-31**. Ostatni commit spoza dokumentacji: `f585c3f`; uwzględniono również bieżące pliki robocze.

Plik generowany przez `hellopoland-docs/scripts/build-technical-reference.py`. Opis architektury i ograniczeń: [technical.md](technical.md). Wykaz nie potwierdza wdrożenia ani wykonania testów.

## Skrypty npm

| Nazwa | Polecenie z package.json |
| --- | --- |
| `analyze` | `cross-env BUNDLE_ANALYZE=browser next build` |
| `audit` | `npm audit --registry=https://registry.npmjs.org/` |
| `build` | `next build` |
| `dev` | `node ./server/server.js` |
| `jsdoc` | `rimraf ./jsdoc && jsdoc -r -c ./jsdoc.json -d ./jsdoc ./` |
| `jsdoc2md` | `jsdoc2md -c ./jsdoc.json -f **/*.js **/*.jsx  > jsdoc/app-spec.md` |
| `lint` | `eslint . --ext .js,.jsx --ignore-path .gitignore --cache` |
| `lint-fix` | `npm run lint -- --fix` |
| `server-mock` | `node ./__mocks__/mock-server.js` |
| `start` | `cross-env NODE_ENV=production node ./server/server.js` |
| `test` | `jest` |
| `test-watch` | `npm test -- --watch` |

## Zależności deklarowane

Zakresy wersji pochodzą z manifestu; rozstrzygnięte wersje instalacji zapisuje lockfile. Nie podano tokenów ani konfiguracji rejestru.

| Pakiet | Zakres | Grupa |
| --- | --- | --- |
| `@date-io/date-fns` | `^1.3.11` | dependencies |
| `@fream/axios-commons` | `^2.0.0` | dependencies |
| `@hello-poland/commons` | `^2.0.1` | dependencies |
| `@material-ui/core` | `^3.9.2` | dependencies |
| `@material-ui/docs` | `3.0.0-alpha.9` | dependencies |
| `@material-ui/icons` | `^3.0.2` | dependencies |
| `@material-ui/styles` | `^3.0.0-alpha.10` | dependencies |
| `@zeit/next-bundle-analyzer` | `^0.1.2` | dependencies |
| `axios` | `^0.18.1` | dependencies |
| `classnames` | `^2.2.6` | dependencies |
| `cross-env` | `^5.2.0` | dependencies |
| `date-fns` | `^2.0.0-alpha.27` | dependencies |
| `express` | `^4.16.4` | dependencies |
| `formik` | `^1.5.0` | dependencies |
| `formik-material-ui` | `0.0.16` | dependencies |
| `helmet` | `^3.15.1` | dependencies |
| `http-proxy-middleware` | `^0.19.1` | dependencies |
| `i` | `^0.3.6` | dependencies |
| `jss` | `^9.8.7` | dependencies |
| `lodash` | `^4.17.15` | dependencies |
| `material-ui-pickers` | `^2.2.1` | dependencies |
| `nanoid` | `^2.0.1` | dependencies |
| `next` | `^7.0.3` | dependencies |
| `next-compose-plugins` | `^2.1.1` | dependencies |
| `npm` | `^6.9.0` | dependencies |
| `nprogress` | `^0.2.0` | dependencies |
| `prop-types` | `^15.7.2` | dependencies |
| `react` | `^16.8.3` | dependencies |
| `react-dom` | `^16.8.1` | dependencies |
| `react-dropzone` | `^7.0.1` | dependencies |
| `react-jss` | `^8.6.1` | dependencies |
| `react-redux` | `^6.0.1` | dependencies |
| `redux` | `^4.0.1` | dependencies |
| `redux-devtools-extension` | `^2.13.8` | dependencies |
| `redux-logic` | `^2.1.1` | dependencies |
| `rxjs` | `^6.4.0` | dependencies |
| `styled-jsx` | `^3.2.1` | dependencies |
| `yup` | `^0.26.10` | dependencies |
| `babel-eslint` | `^10.0.1` | devDependencies |
| `babel-plugin-module-resolver` | `^3.1.3` | devDependencies |
| `eslint` | `^5.12.1` | devDependencies |
| `eslint-config-airbnb` | `^17.1.0` | devDependencies |
| `eslint-import-resolver-babel-module` | `^5.0.1` | devDependencies |
| `eslint-plugin-import` | `^2.16.0` | devDependencies |
| `eslint-plugin-jsx-a11y` | `^6.2.0` | devDependencies |
| `eslint-plugin-react` | `^7.12.4` | devDependencies |
| `jest` | `^24.1.0` | devDependencies |
| `jest-dom` | `^3.1.0` | devDependencies |
| `jsdoc` | `^3.6.3` | devDependencies |
| `jsdoc-to-markdown` | `^5.0.0` | devDependencies |
| `json-server` | `^0.14.2` | devDependencies |
| `react-testing-library` | `^5.6.0` | devDependencies |
| `rimraf` | `^2.6.3` | devDependencies |

## Strony Next.js

Pliki poniżej wskazują wejścia stron. `_app` i `_document` są elementami infrastruktury, a trasy parametryczne mogą być przepisywane przez Express.

| Plik strony | Ścieżka plikowa |
| --- | --- |
| [_app.jsx](../pages/_app.jsx) | `/_app` |
| [_document.jsx](../pages/_document.jsx) | `/_document` |
| [account.jsx](../pages/account.jsx) | `/account` |
| [forgot-password.jsx](../pages/forgot-password.jsx) | `/forgot-password` |
| [index.jsx](../pages/helpdesk/promotions/index.jsx) | `/helpdesk/promotions/index` |
| [index.jsx](../pages/helpdesk/technical/index.jsx) | `/helpdesk/technical/index` |
| [index.jsx](../pages/helpdesk/users/index.jsx) | `/helpdesk/users/index` |
| [index.jsx](../pages/index.jsx) | `/index` |
| [create.jsx](../pages/market/categories/create.jsx) | `/market/categories/create` |
| [edit.jsx](../pages/market/categories/edit.jsx) | `/market/categories/edit` |
| [index.jsx](../pages/market/categories/index.jsx) | `/market/categories/index` |
| [create.jsx](../pages/market/partners/create.jsx) | `/market/partners/create` |
| [edit.jsx](../pages/market/partners/edit.jsx) | `/market/partners/edit` |
| [index.jsx](../pages/market/partners/index.jsx) | `/market/partners/index` |
| [create.jsx](../pages/market/sight-events/create.jsx) | `/market/sight-events/create` |
| [edit.jsx](../pages/market/sight-events/edit.jsx) | `/market/sight-events/edit` |
| [index.jsx](../pages/market/sight-events/index.jsx) | `/market/sight-events/index` |
| [create.jsx](../pages/market/sights/create.jsx) | `/market/sights/create` |
| [edit.jsx](../pages/market/sights/edit.jsx) | `/market/sights/edit` |
| [index.jsx](../pages/market/sights/index.jsx) | `/market/sights/index` |
| [create.jsx](../pages/market/tags/create.jsx) | `/market/tags/create` |
| [edit.jsx](../pages/market/tags/edit.jsx) | `/market/tags/edit` |
| [index.jsx](../pages/market/tags/index.jsx) | `/market/tags/index` |
| [edit.js](../pages/market/tickets/edit.js) | `/market/tickets/edit` |
| [reset-password.jsx](../pages/reset-password.jsx) | `/reset-password` |
| [sign-in.jsx](../pages/sign-in.jsx) | `/sign-in` |

## Jawne przepisania Express

| Ścieżka HTTP | Strona Next.js |
| --- | --- |
| `/market/categories/:itemId/edit` | `/market/categories/edit` |
| `/market/partners/:itemId/edit` | `/market/partners/edit` |
| `/market/sights/:itemId/edit` | `/market/sights/edit` |
| `/market/sight-events/:itemId/edit` | `/market/sight-events/edit` |
| `/market/tags/:itemId/edit` | `/market/tags/edit` |
| `/market/tickets/:itemId/edit` | `/market/tickets/edit` |

## Testy w kodzie projektu

Wykaz lokalnych testów; nie oznacza ich wykonania. Zależności i `.next` pominięto.

| Plik testu |
| --- |
| [utils.test.js](../components/ListingFilters/utils.test.js) |
| [SeasonalClosureFields.test.jsx](../components/SeasonalClosureFields/SeasonalClosureFields.test.jsx) |
| [VoivodeshipSelect.test.js](../components/VoivodeshipSelect/VoivodeshipSelect.test.js) |
| [partners.test.js](../redux/partners.test.js) |
| [profile.test.js](../redux/profile.test.js) |
| [ticketDefinitions.test.js](../redux/ticketDefinitions.test.js) |
| [PromotedSightEvents.test.js](../views/Home/components/PromotedSightEvents/PromotedSightEvents.test.js) |
| [salesCsv.test.js](../views/Home/components/SalesReport/salesCsv.test.js) |
| [salesFilters.test.js](../views/Home/components/SalesReport/salesFilters.test.js) |
| [SalesReport.test.js](../views/Home/components/SalesReport/SalesReport.test.js) |
| [partnerErrorMessage.test.js](../views/Market/Partners/utils/partnerErrorMessage.test.js) |
| [SightEventEdit.test.jsx](../views/Market/SightEvents/SightEventEdit.test.jsx) |
| [sightPages.test.js](../views/Market/Sights/sightPages.test.js) |
