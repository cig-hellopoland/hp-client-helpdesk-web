# React Web App Changelog

## Unreleased

* Discourage saved-login autofill in the partner usher form and add a show/hide password button that resets when the dialog closes.
* Add a CSV column chooser with browser-saved preferences and keep exports in report column order; require at least one selected column.
* Use exact booking IDs, inclusive event date and price ranges, and the existing purchase date controls in sales filters; validate ranges and apply them to CSV exports.
* Reduce sales column filter text to 12px and keep column widths stable when filtering, including empty results.
* Add a separate refresh button, combined column filters (also applied to CSV), and a bordered footer with row counts to the "Ostatnia sprzedaż" report.
* Improve the user editor layout by grouping technical access and hiding irrelevant scope fields for global roles.
* Add CSV download for the "Ostatnia sprzedaż" report and show its loading state.
* Show readable Polish validation and API error messages when saving a partner.

## 1.0.6
* Replace `enzyme` with `react-testing-library` [#40](https://git.fream.pl/fream/web/react-web-app/merge_requests/40)
* Update `jest` [#40](https://git.fream.pl/fream/web/react-web-app/merge_requests/40)

## 1.0.5
* Update `next` to 7.0.2, which [fixes XSS vulnerability](https://github.com/zeit/next.js/releases/tag/7.0.2) [#38](https://git.fream.pl/fream/web/react-web-app/merge_requests/38)
* Update `@material-ui/core` to 3.2.2 [#39](https://git.fream.pl/fream/web/react-web-app/merge_requests/39)

## 1.0.4
* Update `movies` duck to export logic as object map instead of array [#36](https://git.fream.pl/fream/web/react-web-app/merge_requests/36)
* Use `parseReduxLogic` util function to convert logic maps into single array [#36](https://git.fream.pl/fream/web/react-web-app/merge_requests/36)

## 1.0.3
* Add `postinstall` script with NPM packages audit [#34](https://git.fream.pl/fream/web/react-web-app/merge_requests/34)

## 1.0.2
* Allow to set server host in runtime config [#32](https://git.fream.pl/fream/web/react-web-app/merge_requests/32)

## 1.0.1

* Update pages layout [#26](https://git.fream.pl/fream/web/react-web-app/merge_requests/26)
* Move `title` tag from `_document` to `_app` to allow dynamic title [#27](https://git.fream.pl/fream/web/react-web-app/merge_requests/27)
* Remove `view` duck [#28](https://git.fream.pl/fream/web/react-web-app/merge_requests/28)
* Remove `profile` duck [#29](https://git.fream.pl/fream/web/react-web-app/merge_requests/29)
* Update `next` to 7.0.1 [#30](https://git.fream.pl/fream/web/react-web-app/merge_requests/30)
* Update `@material-ui/core` to 3.1.2 and `@material-ui/docs` to 3.0.0-alpha.6 [#31](https://git.fream.pl/fream/web/react-web-app/merge_requests/31)

## 1.0.0

First version of React Web App
