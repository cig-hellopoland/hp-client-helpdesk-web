# Helpdesk Web — architektura i praca lokalna

Sprawdzono lokalny kod **31.10.2026**. Opis nie potwierdza obrazu ani konfiguracji działającego Helpdesku.

## Rola i mapa kodu

Panel służy zespołowi operacyjnemu do obsługi partnerów, atrakcji, ofert, biletów, raportów, promocji i diagnostyki technicznej. Jest klientem API; sama widoczność przycisku w UI nie zastępuje uprawnień po stronie backendu.

| Miejsce | Odpowiedzialność |
| --- | --- |
| [pages](../pages) | Strony Next.js, m.in. `market`, `helpdesk`, logowanie i konto |
| [views](../views) | Widoki i formularze biznesowe |
| [components](../components) | Komponenty współdzielone, np. pola zamknięcia sezonowego |
| [redux](../redux) | Stan i logika operacji aplikacji |
| [services](../services) | HTTP, autoryzacja i inicjalizacja Redux |
| [server](../server) | Serwer Express, routing, proxy developerskie i nagłówki |
| [next.config.js](../next.config.js) | Wczytanie konfiguracji i przekazanie jej do Next.js |

W zmianie formularza sprawdzamy stronę, widok, przygotowanie payloadu, wywołanie API i wyświetlenie błędu. Zmiana komponentu wspólnego może wpływać na wiele ekranów.

## Narzędzia i zależności

[package.json](../package.json) deklaruje Next.js 7, React 16, Redux, Material-UI 3 i Jest 24. Metadane `engines` wskazują Node `^10` / npm `^6.14`, natomiast `Dockerfile.release` domyślnie wskazuje Node `14-alpine`. To różne deklaracje, wymagające uzgodnienia przy odtwarzaniu środowiska.

Pakiety `@fream/*` i `@hello-poland/*` wymagają dostępu do odpowiedniego rejestru. Przed instalacją ustalamy wersję narzędzi i konfigurację rejestru zgodną z działającym buildem. Nie publikujemy zawartości `.npmrc` ani tokenów.

## Konfiguracja i przepływ żądań

1. `next.config.js` wczytuje plik z `CONFIG_PATH`; domyślnie `./config/develop.config.js`.
2. Sekcja `server` trafia do `serverRuntimeConfig`, a `public` do `publicRuntimeConfig`. Wartości publiczne są dostępne klientowi — nie umieszczamy tam sekretów.
3. [server.js](../server/server.js) ustawia tryb developerski, gdy `NODE_ENV` jest inne niż `production`.
4. W development serwer montuje [proxy](../server/proxy.js) dla `/api`, kierując je do `server.apiURL` i usuwając prefiks `/api`.
5. W production ten middleware nie jest montowany. Trasę API musi obsłużyć infrastruktura lub prawidłowy adres w konfiguracji klienta HTTP.

Host: `server.host`, następnie `NODE_HOST`, następnie `127.0.0.1`. Port: `NODE_PORT`, domyślnie `3000`. Względny `CONFIG_PATH` może być interpretowany z różnych plików (`next.config.js` i `server/proxy.js`), dlatego w zewnętrznej konfiguracji używamy ścieżki bezwzględnej.

Nie zakładamy, że podmiana konfiguracji w działającym procesie odświeży aplikację. Plik jest ładowany przez `require`; konfigurację trzeba uwzględnić w buildzie i podczas startu oraz sprawdzić efekt w przeglądarce.

## Uruchomienie lokalne

Katalog roboczy: `hp-client-helpdesk-web`. Wymagane są uzgodnione Node/npm, dostęp do zależności oraz przygotowane API i konto TST.

```sh
npm ci
npm run dev
```

`npm ci` korzysta z lockfile i odtwarza zależności, zastępując istniejący `node_modules`. Jeśli instalacja zgłosi niezgodność lockfile lub narzędzi, najpierw wyjaśniamy ją; nie regenerujemy lockfile przy okazji dokumentacji.

Dla przygotowanego zewnętrznego pliku TST w PowerShell:

```powershell
$env:CONFIG_PATH = 'D:\config\helpdesk-tst.js'
npm run dev
```

Oczekiwany rezultat: komunikat serwera z hostem i portem, domyślnie `http://127.0.0.1:3000`. Dostępna strona logowania nie potwierdza dostępu do API.

Tryb produkcyjny wymaga wcześniejszego buildu, z właściwą konfiguracją:

```sh
npm run build
npm run start
```

To instrukcje pracy lokalnej, nie polecenia wdrożenia na serwer.

## Testy i kontrola zmiany

```sh
npm test -- --runInBand
npm run lint
```

Jest jest skonfigurowany w [jest.config.js](../jest.config.js). Istnieją m.in. testy pól sezonowych, edycji ofert, raportów sprzedaży, filtrów, Redux i komunikatów błędów partnerów. Dla małej zmiany można uruchomić właściwy plik przez `npm test -- --runInBand <ścieżka-testu>`.

Na TST sprawdzamy logowanie, listę i szczegóły właściwego obiektu, zapis danych testowych, komunikat walidacji oraz zachowanie po odświeżeniu. Przy raportach osobno sprawdzamy filtr i pobrany CSV. Przy zamknięciu sezonowym sprawdzamy flagę i zakres dat oraz informacyjny charakter zmiany w portalu.

## Diagnostyka

| Objaw | Co sprawdzić |
| --- | --- |
| UI działa, API zwraca 404 | `public.axios`, `server.apiURL` i trasę reverse proxy; proxy developerskie nie działa w production |
| Brak ikon/PDF | Adres zasobów i udostępnienie DMS przez backend/infrastrukturę |
| 401 po odświeżeniu | Stan sesji, token i obsługę odświeżenia; nie sam komponent formularza |
| Zmiana config nie daje efektu | Rzeczywisty `CONFIG_PATH`, build i ponowny start procesu |

## Wdrożenie i ograniczenia

Najpierw wdrażamy wymagane zmiany kontraktu/backendu, potem panel. Przed podmianą obrazu zachowujemy poprzedni obraz i konfigurację. Build panelu i poprawny start kontenera nie potwierdzają zgodności z API.

W ramach rozbudowy dokumentacji nie instalowano zależności, nie uruchamiano testów aplikacji i nie wykonywano wdrożenia. Instrukcje oparto na kodzie i deklaracjach repozytorium.
