# Hello! Poland – Helpdesk Web

Aplikacja webowa typu **frontend (Next.js)** przeznaczona dla zespołu operacyjnego **Hello! Poland**.  
Helpdesk Web służy do zarządzania ofertami, partnerami, wydarzeniami, biletami oraz do obsługi procesów administracyjnych i integracyjnych w ekosystemie Hello! Poland.

Aplikacja **nie jest standalone** – działa wyłącznie w połączeniu z backendami API oraz statycznymi zasobami udostępnianymi przez infrastrukturę serwerową.

---

## Spis treści
- [Overview](#overview)
- [Środowiska](#środowiska)
- [Zależności zewnętrzne](#zależności-zewnętrzne)
- [Statyczne zasoby / DMS](#statyczne-zasoby--dms)
- [Uruchomienie lokalne](#uruchomienie-lokalne)
- [Konfiguracja aplikacji](#konfiguracja-aplikacji)
- [Stos technologiczny](#stos-technologiczny)
- [Testy](#testy)
- [Uwagi i znane ograniczenia](#uwagi-i-znane-ograniczenia)

---

## Overview

Helpdesk Web jest aplikacją frontendową wykorzystywaną przez:
- administratorów systemu,
- zespół operacyjny Hello! Poland,
- użytkowników wewnętrznych (support, moderacja, backoffice).

Aplikacja komunikuje się z backendami poprzez REST API i zakłada istnienie:
- skonfigurowanego backendu HelloPoland,
- skonfigurowanego backendu HelloTicket,
- poprawnie udostępnionych zasobów statycznych (ikony, pliki, PDF).

---

## Środowiska

Aplikacja działa w co najmniej dwóch środowiskach:

- **PROD** – środowisko produkcyjne
- **TST** – środowisko testowe (wewnętrzne)

Każde środowisko:
- posiada własne backendy API,
- może mieć inną konfigurację proxy i statyk,
- korzysta z oddzielnych zasobów danych.

---

## Zależności zewnętrzne

Helpdesk Web **wymaga** działających komponentów backendowych.

### Wymagane backendy:
- **HelloPoland Backend** – główne API biznesowe
- **HelloTicket Backend** – API biletowe i wydarzeń

Bez dostępnych backendów:
- aplikacja uruchomi się technicznie,
- ale będzie niefunkcjonalna.

---

## Statyczne zasoby / DMS

Aplikacja korzysta z **zewnętrznych statycznych zasobów**, dostarczanych przez backend i infrastrukturę serwerową.

W szczególności:
- ikony SVG,
- pliki graficzne,
- pliki PDF,
- `manifest.json`.

W środowiskach serwerowych wymagane jest:
- poprawne podmontowanie wolumenów DMS,
- poprawna konfiguracja ścieżek statycznych po stronie backendu,
- spójność ścieżek pomiędzy frontendem i backendem.

---

## Uruchomienie lokalne

### Wymagania
- Node.js (LTS)
- npm
- dostęp do backendów API

### Instalacja zależności
```bash
npm install
```

### Uruchomienie
```bash
npm run dev
```

Aplikacja będzie dostępna pod:
```
http://localhost:3000
```

---

## Konfiguracja aplikacji

Domyślna konfiguracja developerska:
```
config/develop.config.js
```

Przykład uruchomienia z inną konfiguracją:
```bash
CONFIG_PATH=/path/to/config.prod.js npm run start
```

---

## Stos technologiczny

- React
- Next.js
- Redux
- Axios
- Material-UI
- Jest

---

## Testy

```bash
npm run test
```

---

## Uwagi i znane ograniczenia

- Aplikacja nie działa poprawnie bez backendów API.
- Brak statyk (DMS) powoduje niekompletne UI.
- Proxy developerskie nie zastępuje konfiguracji produkcyjnej.
