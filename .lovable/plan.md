# Rysunki techniczne DIN 509 E–H

## Zakres
- Zastąpić obrazy ładowane z `public/din509` czterema dedykowanymi komponentami SVG renderowanymi bezpośrednio w module DIN 509.
- Odwzorować kontury i rozmieszczenie wymiarów form E, F, G i H według dostarczonych referencji, z właściwymi kątami i parametrami dla każdej formy.
- Zachować dotychczasowe przełączanie zakładek, kalkulator, tabelę oraz tłumaczenia bez zmian wersji i changelogu.

## Wygląd i dostępność
- Użyć wspólnego `viewBox="0 0 360 200"`, ciemnej ramki oraz spójnych linii konturu, kreskowania, linii odniesienia, grotów i etykiet w palecie aplikacji.
- Zapewnić czytelne skalowanie rysunków na telefonie i komputerze oraz opis dostępności zależny od wybranej formy.

## Weryfikacja
- Sprawdzić przełączanie E–H i czy wszystkie właściwe oznaczenia są widoczne, a niedozwolone parametry nie występują w formie E.
- Sprawdzić widok mobilny i desktopowy oraz aktualny wynik kompilacji.
