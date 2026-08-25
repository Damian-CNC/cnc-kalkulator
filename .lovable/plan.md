# Naprawa ładowania produkcyjnego na GitHub Pages

## Zakres
- Ustawić relatywną bazę Vite (`./`) i pozostawić build bez ręcznego podziału chunków.
- Dodać niezależne usuwanie preloadera: po zamontowaniu Reacta, po zdarzeniu DOM oraz awaryjnie po maksymalnie 3 sekundach.
- Wzmocnić aktualizację Service Workera: nowa wersja cache, natychmiastowa aktywacja, czyszczenie starych cache i bezpieczne przejęcie klientów bez pętli przeładowań.
- Zastąpić surowe `React.lazy` wspólnym `lazyWithRetry`, który po błędzie chunka wykona tylko jedno wymuszone odświeżenie, a po sukcesie wyczyści znacznik.
- Zweryfikować produkcyjny build i uruchomienie aplikacji pod ścieżką GitHub Pages.

## Szczegóły techniczne
- Zachować `HashRouter`, obecny wygląd, animacje i logikę kalkulatorów.
- Ścieżki manifestu, ikon, skryptu startowego i Service Workera będą zgodne z relatywnym `BASE_URL`.
- Mechanizm retry będzie odporny na niedostępne `localStorage` i nie dopuści do nieskończonego reloadu.
