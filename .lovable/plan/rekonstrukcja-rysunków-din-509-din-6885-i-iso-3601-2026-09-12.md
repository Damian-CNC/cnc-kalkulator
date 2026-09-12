# Rekonstrukcja rysunków DIN 509, DIN 6885 i ISO 3601

## Zakres
- Przebudować profile DIN 509 E/F/G/H jako precyzyjne przekroje CAD bez wybrzuszeń: E bez `t₂`, F/G/H jako podcięcia łączone, z właściwymi promieniami i kątami.
- Skorygować opisy G/H, aby odpowiadały podcięciom pod płytki skrawające i ich zastosowaniom wytrzymałościowym.
- Zastąpić schemat DIN 6885 pojedynczym, czytelnym przekrojem wałka z rowkiem, wymiarami `d`, `b`, `t₁`, kontrolnym `d − t₁` i odnośnikami promieni naroży.
- Zastąpić schemat ISO 3601 czystym przekrojem rowka promieniowego z wymiarami `b`, `t`, promieniami `r₁`, `r₂` i fazą montażową 15°–20°.
- Zachować istniejące podświetlanie wymiarów po wybraniu pól i wyników.
- Podnieść wersję do v2.7.6 oraz dodać przetłumaczony wpis historii zmian, zachowując pięć najnowszych wydań.

## Szczegóły techniczne
- Wszystkie schematy pozostaną w `viewBox="0 0 320 180"` i wykorzystają wspólne prymitywy rysunkowe.
- Kontury, kreskowanie, osie, linie wymiarowe, groty i opisy będą zgodne ze wskazaną paletą zinc/cyan oraz ISO 128.
- Odnośniki promieni otrzymają ostre groty kierujące bezpośrednio na łuki; linia osiowa będzie miała wzór `14 3 3 3`.
- Po zmianach zostaną sprawdzone kompilacja, błędy uruchomieniowe oraz widoki mobilne wszystkich trzech modułów i wariantów DIN 509.
