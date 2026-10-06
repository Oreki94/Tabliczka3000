# Super Działania 🦄

Gra edukacyjna dla dzieci do nauki dodawania, odejmowania, mnożenia i dzielenia.

## Funkcje
- runda 5 działań z pomiarem czasu,
- zadanie nie przechodzi dalej, dopóki odpowiedź nie jest poprawna,
- ekranowa klawiatura numeryczna w układzie 7–8–9 / 4–5–6 / 1–2–3 / C–0–⌫ oraz duży przycisk SPRAWDŹ,
- mobilny układ mieszczący grę na jednym ekranie,
- animowane jednorożce przebiegające przez ekran po poprawnej odpowiedzi,
- 1–5 gwiazdek zależnych od czasu,
- wybór aktywnych działań — można ćwiczyć np. tylko odejmowanie,
- ustawienia cyfr osobno dla każdego działania,
- ustawienia chronione PIN-em `0987`,
- ustawienia zapisywane w `localStorage`,
- brak backendu — projekt działa jako statyczna aplikacja Vite.

## Lokalny start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Render

Projekt zawiera `render.yaml`. Dla Static Site:

- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Uwaga o PIN-ie

PIN jest zabezpieczeniem interfejsu ustawień po stronie przeglądarki. Nie jest mechanizmem bezpieczeństwa serwerowego — aplikacja nie ma backendu.
