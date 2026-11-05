# Cloudflare Worker — CNC HUB Public Analytics API

Ten skrypt odpowiada za bezpieczne pobieranie statystyk z Twojego oficjalnego konta **Cloudflare Web Analytics (GraphQL API)** i serwowanie ich do podstrony `https://cnchub.app/#/stats`.

Dzięki niemu Twój prywatny klucz API nigdy nie wycieka do przeglądarki, a dane są cachowane na krawędzi sieci Cloudflare (odpowiedź w ~20ms).

---

## 🚀 Instrukcja wdrożenia w Cloudflare (zajmuje 2 minuty):

### Krok 1: Utworzenie Workera
1. Zaloguj się na [dash.cloudflare.com](https://dash.cloudflare.com).
2. W lewym menu wejdź w **Compute (Workers) > Workers & Pages**.
3. Kliknij niebieski przycisk **Create application** (lub *Create Worker*).
4. Nazwij go np. `cnchub-stats` i kliknij **Deploy**.

### Krok 2: Wklejenie kodu
1. Kliknij **Edit code** (Szybka edycja w przeglądarce).
2. Zastąp cały kod zawartością pliku `stats-worker.js`.
3. Kliknij **Deploy**.

### Krok 3: Dodanie zmiennych środowiskowych (Environment Variables)
1. Wróć do ustawień tego Workera (**Settings > Variables and Secrets**).
2. Dodaj 2 zmienne:
   * **`ACCOUNT_ID`** – Twój identyfikator konta Cloudflare (znajdziesz go w pasku adresu przeglądarki, np. `dash.cloudflare.com/02a5c48b...` lub po prawej stronie w widoku domeny).
   * **`CLOUDFLARE_API_TOKEN`** – Twój klucz API:
     * Wejdź w swój profil: ikona profilu w prawym górnym rogu > **My Profile** > **API Tokens** > **Create Token**.
     * Użyj szablonu **"Read analytics and logs"** (lub utwórz własny z uprawnieniem `Account.Analytics: Read`).
     * Zapisz ten token jako **Secret** w zmiennych Workera.

### Krok 4: Podpięcie domeny (Opcjonalnie lub domyślny workers.dev)
Worker ma domyślny adres, np. `https://cnchub-stats.<twoj-alias>.workers.dev`.
Możesz też w zakładce **Settings > Domains & Routes** podpiąć trasę `cnchub.app/api/stats*`.

Gotowe! Podstrona `https://cnchub.app/#/stats` będzie automatycznie wyświetlać statystyki z tego endpointu!
