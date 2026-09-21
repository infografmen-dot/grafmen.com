// Compose locally; no message or personal data is sent by this page.
(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const subject = `Zapytanie: ${values.get('topic')}`;
    const body = `Imię: ${values.get('name')}\nE-mail: ${values.get('email')}\n\n${values.get('message')}`;
    const mailto = `mailto:info@grafmen.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('#contact-status').textContent = 'Wiadomość nie została wysłana przez stronę. Sprawdź i wyślij ją w swoim programie pocztowym. Jeśli program się nie otworzył, skopiuj treść i napisz na info@grafmen.com.';
    window.location.href = mailto;
  });
})();
