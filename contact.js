// Compose locally; no message or personal data is sent by this page.
(() => {
  // 1. Inicjalizacja dostępnego Custom Select
  const selectWrap = document.querySelector('#topic-select-wrap');
  if (selectWrap) {
    const nativeSelect = selectWrap.querySelector('#contact-topic');
    const trigger = selectWrap.querySelector('#topic-trigger');
    const valueDisplay = selectWrap.querySelector('#topic-value-display');
    const menu = selectWrap.querySelector('#topic-listbox');
    const options = Array.from(selectWrap.querySelectorAll('.custom-select-opt'));

    if (nativeSelect && trigger && menu && options.length > 0) {
      // Uruchomienie trybu JS — ukrycie natywnego selecta dla wzroku, pokazanie custom triggera
      selectWrap.classList.add('js-select');

      let isOpen = false;
      let highlightedIndex = options.findIndex(opt => opt.classList.contains('is-selected'));
      if (highlightedIndex < 0) highlightedIndex = 0;

      function openMenu() {
        if (isOpen) return;
        isOpen = true;
        trigger.setAttribute('aria-expanded', 'true');
        menu.removeAttribute('hidden');
        menu.classList.add('is-open');
        highlightOption(highlightedIndex);
        options[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
      }

      function closeMenu(focusTrigger) {
        if (!isOpen) return;
        isOpen = false;
        trigger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('hidden', '');
        menu.classList.remove('is-open');
        if (focusTrigger) {
          trigger.focus();
        }
      }

      function selectOption(index) {
        if (index < 0 || index >= options.length) return;
        options.forEach((opt, i) => {
          const isSelected = i === index;
          opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          opt.classList.toggle('is-selected', isSelected);
        });

        const selectedOpt = options[index];
        const val = selectedOpt.getAttribute('data-value');
        const text = selectedOpt.querySelector('.opt-text')?.textContent || val;

        if (valueDisplay) {
          valueDisplay.textContent = text;
        }

        // Synchronizacja z ukrytym natywnym selectem
        if (nativeSelect.value !== val) {
          nativeSelect.value = val;
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        highlightedIndex = index;
        closeMenu(true);
      }

      function highlightOption(index) {
        if (index < 0 || index >= options.length) return;
        options.forEach((opt, i) => {
          opt.classList.toggle('is-highlighted', i === index);
        });
        highlightedIndex = index;
        options[index]?.scrollIntoView({ block: 'nearest' });
      }

      // Kliknięcie w trigger przełącza menu
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (isOpen) {
          closeMenu(false);
        } else {
          openMenu();
        }
      });

      // Wybór opcji przez kliknięcie
      options.forEach((opt, index) => {
        opt.addEventListener('click', (e) => {
          e.preventDefault();
          selectOption(index);
        });
        opt.addEventListener('mouseenter', () => {
          highlightOption(index);
        });
      });

      // Obsługa klawiatury
      trigger.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              openMenu();
            } else {
              highlightOption(Math.min(highlightedIndex + 1, options.length - 1));
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (!isOpen) {
              openMenu();
            } else {
              highlightOption(Math.max(highlightedIndex - 1, 0));
            }
            break;
          case 'Home':
            if (isOpen) {
              e.preventDefault();
              highlightOption(0);
            }
            break;
          case 'End':
            if (isOpen) {
              e.preventDefault();
              highlightOption(options.length - 1);
            }
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (!isOpen) {
              openMenu();
            } else {
              selectOption(highlightedIndex);
            }
            break;
          case 'Escape':
            if (isOpen) {
              e.preventDefault();
              closeMenu(true);
            }
            break;
          case 'Tab':
            if (isOpen) {
              closeMenu(false);
            }
            break;
        }
      });

      // Zamknięcie po kliknięciu poza komponentem
      document.addEventListener('click', (e) => {
        if (!isOpen) return;
        if (!selectWrap.contains(e.target)) {
          closeMenu(false);
        }
      });
    }
  }

  // 2. Obsługa wysyłki formularza
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
