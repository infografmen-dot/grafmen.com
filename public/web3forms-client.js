/**
 * Grafmen Web3Forms Client
 * Uniwersalna, bezpieczna obsługa wysyłki formularzy z ochroną antyspamową (honeypot)
 * oraz obsługą stanów: ładowanie, sukces, błędy sieci i alternatywny kontakt.
 */

window.GrafmenWeb3Forms = (() => {
  // Skonfigurowany klucz klienta Web3Forms dla serwisu Grafmen
  const DEFAULT_ACCESS_KEY = '07f7fba2-8887-4403-903a-35ebd0631fa5';

  /**
   * Wysyłka danych formularza do Web3Forms API
   * @param {Object} options
   * @param {string} options.accessKey - Klucz dostępu Web3Forms
   * @param {string} options.subject - Temat wiadomości (np. 'Grafmen | Kontakt')
   * @param {string} options.fromName - Nazwa nadawcy (np. 'Grafmen Formularz')
   * @param {string} options.name - Imię / osoba kontaktowa
   * @param {string} options.email - E-mail klienta (ustawiany jako Reply-To)
   * @param {string} [options.phone] - Opcjonalny telefon
   * @param {string} [options.botcheck] - Wartość pola honeypot
   * @param {string} [options.lang] - Język formularza ('pl' | 'en')
   * @param {Object} [options.extraFields] - Dodatkowe ustrukturyzowane pola briefu
   * @param {boolean} [options.simulate] - Wymuszenie trybu symulacji lokalnej (bez wysyłki)
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async function submitForm(options) {
    const {
      accessKey,
      subject,
      fromName = 'Grafmen Strona',
      name,
      email,
      phone,
      botcheck,
      lang = 'pl',
      extraFields = {},
      simulate = false
    } = options;

    const isEn = lang === 'en';

    // 1. Zabezpieczenie antyspamowe: sprawdzenie pola Honeypot po stronie klienta
    if (botcheck && botcheck.trim() !== '') {
      console.warn('[Web3Forms] Honeypot triggered. Request rejected silently.');
      return {
        success: false,
        message: isEn ? 'Spam detected.' : 'Wykryto spam.'
      };
    }

    const finalAccessKey = accessKey || DEFAULT_ACCESS_KEY;

    // 2. Przygotowanie payloadu zgodnego z dokumentacją Web3Forms
    const payload = {
      access_key: finalAccessKey,
      subject: subject || 'Grafmen | Wiadomość',
      from_name: fromName,
      name: name || '',
      email: email || '',
      replyto: email || '',
      phone: phone || (isEn ? 'Not provided' : 'Nie podano'),
      lang: lang.toUpperCase(),
      ...extraFields
    };

    // 3. Sprawdzenie, czy klucz jest skonfigurowany, czy pracujemy w trybie symulacji
    const isMockMode = simulate || !finalAccessKey || finalAccessKey === 'YOUR_ACCESS_KEY_HERE';

    if (isMockMode) {
      console.info('[Web3Forms Mock] Symulacja wysyłki lokalnej (brak rzeczywistego połączenia sieciowego):', payload);
      // Symulacja opóźnienia sieciowego dla weryfikacji stanu UI
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        message: isEn
          ? 'Form received in local test mode (no live email sent).'
          : 'Formularz przyjęty w lokalnym trybie testowym (wiadomość nie została wysłana).'
      };
    }

    // 4. Rzeczywiste żądanie do API Web3Forms
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          message: result.message || (isEn ? 'Form submitted successfully.' : 'Formularz został pomyślnie przyjęty.')
        };
      } else {
        return {
          success: false,
          message: result.message || (isEn ? 'Submission failed on server.' : 'Serwer odrzucił zgłoszenie.')
        };
      }
    } catch (networkError) {
      console.error('[Web3Forms Network Error]', networkError);
      return {
        success: false,
        message: isEn
          ? 'Network error. Please check your connection or contact directly via email.'
          : 'Błąd połączenia sieciowego. Sprawdź łącze lub skontaktuj się bezpośrednio przez e-mail.'
      };
    }
  }

  return {
    submitForm,
    DEFAULT_ACCESS_KEY
  };
})();
