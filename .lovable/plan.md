# Uniwersalne ulubione na wszystkich stronach i zakładkach

## Zakres
- Utrzymać gwiazdkę wyłącznie w jednym wspólnym nagłówku `PageLayout`, widoczną na desktopie bez pustej luki na mobile.
- Zmienić identyfikację skrótu na pełny bieżący adres: ścieżka wraz z parametrami zapytania, z jednoznacznym identyfikatorem i właściwym stanem dodania/usunięcia.
- Dodać czytelne tytuły i podpowiedzi „Dodaj do ulubionych (max 4)” / „Usuń z ulubionych”.

## Pokrycie stron
- Przenieść kalkulatory z własnymi nagłówkami (Parametry, Gwinty metryczne i Stożki) do wspólnego `PageLayout`, zachowując ich obecną zawartość i przyciski czyszczenia.
- Sprawdzić wszystkie trasy narzędzi: Parametry, Chropowatość, oba moduły tolerancji, Waga, Twardość, wszystkie gwinty, Seger, DIN 509, O-ring, Wpusty, Stożki, PCD, otwory liniowe i pozycję rzeczywistą.
- Nie dodawać skrótów do ekranu głównego, polityki prywatności ani strony błędu, ponieważ nie są kalkulatorami.

## Głębokie linki do zakładek
- Synchronizować aktywne zakładki i tryby kalkulatorów z parametrami adresu, m.in. zewnętrzny/wewnętrzny, typ DIN 509 E–H oraz pozostałe przełączane widoki.
- Przy otwarciu zapisanego skrótu odtworzyć właściwą zakładkę, a przy jej zmianie od razu aktualizować adres bez przeładowania strony.
- Budować nazwę ulubionego skrótu z tytułu strony i aktywnej zakładki, aby pozycje były rozróżnialne.

## Weryfikacja
- Sprawdzić na desktopie obecność dokładnie jednej gwiazdki na każdym kalkulatorze.
- Sprawdzić dodawanie, usuwanie, limit czterech pozycji oraz powrót ze skrótu do właściwej zakładki.
- Zweryfikować kompilację oraz brak zmian wersji i changelogu.
