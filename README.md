# Super Działania 🚀

Kolorowa, responsywna gra dla dzieci do nauki dodawania, odejmowania, mnożenia i dzielenia.

## Co jest w środku?

- runda składa się z **5 działań**,
- timer mierzy czas całej rundy,
- zadanie nie przechodzi dalej, dopóki dziecko nie poda poprawnej odpowiedzi,
- ekranowa klawiatura z dużym przyciskiem **SPRAWDŹ**,
- działa również zwykła klawiatura komputera,
- po rundzie pojawia się czas, liczba pomyłek i wynik **1–5 gwiazdek**,
- progi czasu dla gwiazdek można zmienić w ustawieniach,
- w ustawieniach można osobno wybrać cyfry używane przez każde działanie,
- ustawienia są zapisywane w `localStorage` przeglądarki,
- zmiana ustawień wymaga PIN-u `0987`,
- błędny PIN nie odblokowuje edycji ani nie zapisuje zmian.

## Ważne o PIN-ie

To jest blokada interfejsu po stronie przeglądarki, a nie zabezpieczenie serwerowe. Ponieważ aplikacja jest w całości frontendowa i działa jako statyczna strona, osoba techniczna może podejrzeć kod aplikacji. PIN ma służyć do uniemożliwienia dziecku przypadkowej zmiany ustawień, nie do ochrony tajnych danych.

## Uruchomienie lokalnie

Wymagany Node.js **20.19+**.

```bash
npm install
npm run dev
```

Następnie otwórz adres podany przez Vite, zwykle `http://localhost:5173`.

## Test buildu produkcyjnego

```bash
npm run build
npm run preview
```

## GitHub + Render

1. Utwórz nowe repozytorium na GitHub.
2. Wgraj zawartość tego katalogu.
3. Na Render wybierz **New → Static Site**.
4. Podłącz repozytorium GitHub.
5. Ustaw:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
6. Utwórz Static Site.

Render będzie później automatycznie wdrażał kolejne commity, jeśli pozostawisz Auto-Deploy włączone.

Plik `render.yaml` jest dołączony jako pomocnicza konfiguracja dla Render Blueprint.

## Domyślne progi gwiazdek

- 5★: do 20 s
- 4★: do 35 s
- 3★: do 55 s
- 2★: do 80 s
- 1★: powyżej 80 s

Wynik zależy wyłącznie od czasu ukończenia 5 poprawnych działań; błędne odpowiedzi nie kończą zadania, ale są liczone jako pomyłki.
