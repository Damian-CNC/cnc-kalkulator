# Changelog

Wszystkie istotne zmiany w projekcie CNC Kalkulator (CNC Hub) są dokumentowane w tym pliku.
Format bazuje na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/), a wersjonowanie na [Semantic Versioning](https://semver.org/).

---

## [3.1.0] - 2026-10-28

### Dodano
- **Kalkulator kąta linii śrubowej & doboru płytki podporowej** (`/kat-linii-srubowej`, `/helix-angle`, `/plytka-podporowa`):
  - Dokładne obliczenia kąta wzniosu linii śrubowej: $\tan(\lambda) = \frac{L}{\pi d_2} = \frac{P \cdot z}{\pi d_2}$.
  - Obsługa gwintów jedno- i wielozwojnych ($z = 1, 2, 3, 4$).
  - Obsługa zarysów $60^\circ$ (M / UN), $30^\circ$ (Tr ISO), $29^\circ$ (ACME), $55^\circ$ (Whitworth/G) oraz kąta dowolnego.
  - Automatyczny dobór uniwersalnej płytki podporowej (anvil shim) od $-2.0^\circ$ do $+4.5^\circ$ z ostrzeżeniem o konieczności wymiany płytki standardowej $+1.5^\circ$.
  - Weryfikacja kątów przyłożenia krawędzi (Leading & Trailing Flank Clearance) w celu zapobiegania tarciu płytki o profil gwintu.
  - Interaktywny wektorowy schemat SVG rozwinięcia walca podziałowego.
- **Kalkulator średnicy podziałowej (PCD) na podstawie pomiaru suwmiarką** (`/linear-holes`):
  - Formuła obliczeniowa: $D = \frac{C + d_1}{\sin(180^\circ / N)}$.
  - Wyskakujące okno z interaktywną instrukcją pomiarową krok po kroku (zerowanie suwmiarki na otworze, pomiar krawędzi).
  - Bezpośredni przycisk przekierowania do kalkulatora podziałki otworów / współrzędnych.
- **Wielojęzyczność - 4 nowe wersje językowe**:
  - 🇪🇸 Hiszpański (`es` - Español)
  - 🇯🇵 Japoński (`ja` - 日本語)
  - 🇨🇿 Czeski (`cs` - Čeština)
  - 🇸🇰 Słowacki (`sk` - Slovenčina)
  - Dedykowane tłumaczenia terminologii obróbki skrawaniem, metrologii warsztatowej oraz tolerancji ISO.

### Zmieniono / Poprawiono
- **Siatka Bento na PC (Menu główne)**:
  - Ujednolicono układ kafelków do 11-kolumnowego podziału (Wiersz 1: Podstawowe [3], Gwinty [4], Materiały [4] = 11; Wiersz 2: Geometria [6], Części znormalizowane [5] = 11).
  - Znormalizowano rozmiary ikon we wszystkich kafelkach (stały rozmiar 44 px).
  - Usunięto pustą przestrzeń nad kalkulatorami na komputerach PC, zachowując bezpieczny margines (Dynamic Island) na urządzeniach mobilnych.
  - Wycentrowano elementy i przyciski w stopce aplikacji.
  - Wprowadzono horyzontalny podział Split View (kontrole po lewej, wyniki i schematy po prawej) dla kalkulatora Pozycji Rzeczywistej (True Position).

---

## [3.0.0] - 2026-10-26

### Dodano
- **Nowy interfejs desktopowy PC (1080p)**: Bento Master Grid w menu głównym oraz układ Split View (lewa kolumna: wybory i kontrolki, prawa kolumna: wyniki i rysunki) dla wszystkich kalkulatorów.
- Dedykowane proporcje i optymalizacja skalowania pod monitory warsztatowe 1080p.
- Nowy kalkulator gwintów metrycznych HeliCoil (EG M) z pełnymi wymiarami wierteł, tolerancji i długości wkładek.
- Wymiary wierteł pod wygniataki bezwiórowe (Roll Taps) dla gwintów metrycznych oraz calowych G.
- Rozbudowane podmenu gwintów z 5 kolumnami i powiększonymi odznakami na komputerach PC.

---

## [2.9.2] - 2026-10-20
- Baza materiałów rozszerzona o tabelę z katalogu Ceratizit: ponad 650 gatunków z odpowiednikami w normach DIN, AFNOR, UNI, ČSN, BS, SIS, UNE, JIS, GOST, UNS i USA oraz kodami grup CMC.
- Kolory grup materiałowych (P, M, K, N, S, H, O).

## [2.9.1] - 2026-10-18
- Baza materiałów: polskie oznaczenia PN (np. NC11LV, WCL, WCLV, SW7M, PA4, PA6, PA9, ŁH15), stale narzędziowe, nierdzewne, stopy aluminium, mosiądze i tworzywa.

## [2.9.0] - 2026-10-15
- Nowe kalkulatory: Baza materiałów (oznaczenia EN, odpowiedniki USA, gęstość i rozszerzalność) oraz Korekcja temperaturowa (detal i przyrząd).
