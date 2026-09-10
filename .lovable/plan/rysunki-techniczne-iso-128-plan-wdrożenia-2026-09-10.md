# Rysunki techniczne ISO 128 — plan wdrożenia

## Cel
Przebudować schematy w modułach DIN 509, DIN 471/472, DIN 6885 i ISO 3601 na spójne, czytelne rysunki warsztatowe oraz powiązać ich wymiary z aktywnymi kontrolkami kalkulatorów.

## Zakres
- Stworzyć wspólny zestaw elementów SVG dla rysunków: grot strzałki, kreskowanie 45°, kontury części, osie kreska–kropka, linie pomocnicze, wymiarowe i etykiety.
- Zachować paletę aplikacji: jasny kontur części, cynowe wymiary, szare osie i kreskowanie, ciemny obramowany kontener.
- Ujednolicić wszystkie płótna do proporcji `320 × 180`, z bezpiecznymi marginesami i czytelnymi etykietami na telefonie.

## Rysunki modułów
- **DIN 509:** narysować osobne geometrie form E i F z promieniem `r`, głębokością `t₁`, kątem wybiegu `15°`, a dla F także `t₂`. Formy G/H zachowają swoją geometrię, ale otrzymają ten sam standard linii i opisów.
- **DIN 471:** przekrój pełnego wałka z rowkiem oraz wymiary `d₁`, `d₂`, `m`, `n`.
- **DIN 472:** przekrój tulei z otworem i rowkiem wewnętrznym oraz wymiary `d₁`, `d₂`, `m`.
- **DIN 6885:** rzut poprzeczny wałka z wyciętym rowkiem oraz wymiary `b`, `t₁`, `d`; dodatkowy szkic piasty pozostanie czytelny i zgodny z tym samym językiem graficznym.
- **ISO 3601:** przekrój rowka z wymiarami `b`, `t` i odnośnikami promieni `r₁`, `r₂`.

## Dynamiczne podświetlanie
- Dodać stan aktywnego wymiaru w każdym kalkulatorze.
- Fokus, wybór lub zmiana właściwego pola ustawi podświetlenie odpowiadającej linii i etykiety; po opuszczeniu kontrolki rysunek wróci do standardowego wyglądu.
- Dla wartości wynikowych bez edytowalnego pola podświetlenie będzie uruchamiane przez fokus lub dotknięcie ich kafelka, z obsługą klawiatury.
- W DIN 509 pola `r` i `t₁` będą mapowane bezpośrednio; `t₂` będzie dostępne na karcie wyniku. W Segerze średnica wejściowa mapuje `d₁`, a karty wyników mapują `d₂` i `m`; wymiar `n` mapuje odpowiedni wiersz wyniku.

## Wersja i historia zmian
- Ustawić wersję `2.7.5` w pakiecie oraz `v2.7.5` w czterech wersjach językowych stopki.
- Dodać wpis `v2.7.5` z trzema podanymi punktami, przetłumaczony na PL/EN/DE/IT.
- Ograniczyć widoczną historię do pięciu wydań: `v2.7.5`–`v2.7.1`.

## Szczegóły techniczne
- Wydzielić niewielki współdzielony moduł rysunkowy, aby identyfikatory markerów/patternów były unikalne dla każdego SVG i nie kolidowały na stronie.
- Używać klas Tailwind zgodnych z istniejącym ciemnym motywem; bez nowych zależności i bez zmian w obliczeniach normowych.
- Nie zmieniać formularzy ani danych tabelarycznych poza dodaniem obsługi fokusu/podświetlenia.

## Weryfikacja
- Sprawdzić kompilację i najnowszy raport błędów.
- Otworzyć każdy z czterech kalkulatorów w podglądzie mobilnym, sprawdzić geometrię, brak kolizji etykiet oraz reakcję rysunku na fokus/dotknięcie wymiaru.
- Zweryfikować przełączanie DIN 471/472 oraz form DIN 509 E/F.
- Otworzyć historię zmian i potwierdzić wersję `v2.7.5` oraz dokładnie pięć wpisów.
