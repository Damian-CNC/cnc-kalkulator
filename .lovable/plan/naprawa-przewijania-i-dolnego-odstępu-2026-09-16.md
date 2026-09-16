# Naprawa przewijania i dolnego odstępu

## Zakres
- Uprościć `PageLayout`, aby dokument miał jeden naturalny obszar przewijania.
- Zastąpić stały duży dolny odstęp responsywnym: miejsce na przycisk mobilny i mały odstęp na desktopie.
- Usunąć pełnoekranowy, wewnętrznie przewijany kontener z Kalkulatora Parametrów.
- Ujednolicić wysokość i przewijanie `html`, `body` oraz `#root`.

## Szczegóły techniczne
- Zachować istniejący nagłówek, przełączniki i bezpieczny odstęp systemowy.
- Użyć `min-h-screen flex flex-col` w głównych kontenerach i `flex-1` dla treści.
- Pozostawić pływający przycisk „Wyczyść”, z miejscem `pb-24` tylko na małych ekranach.
- Sprawdzić aktualny log kompilacji oraz widok desktopowy i mobilny po zmianach.
