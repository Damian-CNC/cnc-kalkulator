# Aktualizacja modułu DIN 509 do v2.7.7

## Zakres
- Zastąpić generowane kontury czterema dedykowanymi, statycznymi rysunkami technicznymi E/F/G/H w `public/din509`, przygotowanymi do ciemnego tła i czytelnymi na telefonie.
- Ujednolicić opisy form, kąty, oznaczenia i tolerancje parametrów `r`, `t₁`, `t₂`, `f`, `g`, `d₁` w polach, wynikach, pomocy i tabeli.
- Zachować dobór po `r + t₁`; wyniki pokazać w dwukolumnowej siatce, z ukryciem `t₂` i `g` dla formy E.
- Zmienić rozwijaną sekcję na „Tabela wymiarów DIN 509” i wyróżnić w niej aktualnie dobrany wiersz.
- Podnieść wydanie do v2.7.7 w pakietach, stopce i historii zmian we wszystkich czterech językach, zachowując pięć najnowszych wpisów.

## Szczegóły techniczne
- Rysunki będą niezależnymi plikami SVG, a nie geometrią generowaną w komponencie; obrazy referencyjne posłużą wyłącznie jako wzorzec.
- Dane tabelaryczne pozostaną jednym źródłem dla selektorów, kart wyników i tabeli; `dRange` zostanie nazwane i prezentowane jako `d₁`.
- Po zmianach zostaną sprawdzone kompilacja, błędy uruchomieniowe oraz widok mobilny form E–H.
