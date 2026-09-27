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

  // 2. Obsługa wysyłki formularza z Web3Forms
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const submitBtn = form.querySelector('button[type="submit"]');
  const statusEl = document.querySelector('#contact-status');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (submitBtn && (submitBtn.disabled || submitBtn.classList.contains('is-submitting'))) {
      return;
    }

    const isEn = document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith('en');
    const values = new FormData(form);
    const accessKey = form.getAttribute('data-access-key') || '';
    const isSimulation = form.getAttribute('data-simulate') === 'true' || !accessKey;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('is-submitting');
    }

    if (statusEl) {
      statusEl.textContent = isEn ? 'Sending enquiry...' : 'Wysyłanie zapytania...';
      statusEl.style.color = '#71717a';
    }

    const subject = 'Grafmen | Kontakt';
    const topic = values.get('topic') || (isEn ? 'General enquiry' : 'Zapytanie ogólne');
    const name = values.get('name') || '';
    const email = values.get('email') || '';
    const message = values.get('message') || '';
    const botcheck = values.get('botcheck') || '';

    try {
      if (window.GrafmenWeb3Forms) {
        const result = await window.GrafmenWeb3Forms.submitForm({
          accessKey,
          subject,
          fromName: 'Grafmen Kontakt',
          name,
          email,
          botcheck,
          lang: isEn ? 'en' : 'pl',
          extraFields: {
            temat_projektu: topic,
            wiadomosc: message
          },
          simulate: isSimulation
        });

        if (result.success) {
          if (statusEl) {
            statusEl.textContent = isEn
              ? 'Enquiry received! Thank you for getting in touch. I will respond to your message shortly.'
              : 'Wiadomość została przyjęta! Dziękuję za kontakt. Odpowiem na Twoją wiadomość najszybciej, jak to możliwe.';
            statusEl.style.color = '#059669';
          }
          form.reset();
        } else {
          if (statusEl) {
            statusEl.innerHTML = isEn
              ? `${result.message || 'Submission could not be completed.'} Your text is preserved. You can also write directly to <a href="mailto:info@grafmen.com">info@grafmen.com</a>.`
              : `${result.message || 'Nie udało się przesłać wiadomości.'} Wpisana treść została zachowana. Możesz też napisać bezpośrednio na <a href="mailto:info@grafmen.com">info@grafmen.com</a> lub zadzwonić pod <a href="tel:+48694179217">+48 694 179 217</a>.`;
            statusEl.style.color = '#dc2626';
          }
        }
      } else {
        // Fallback w razie braku ladowania skryptu: mailto
        const mailSubject = isEn ? `Project enquiry: ${topic}` : `Zapytanie: ${topic}`;
        const mailBody = `Imię: ${name}\nE-mail: ${email}\nTemat: ${topic}\n\n${message}`;
        window.location.href = `mailto:info@grafmen.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
      }
    } catch (err) {
      console.error(err);
      if (statusEl) {
        statusEl.innerHTML = isEn
          ? 'Network error. Your text is preserved. Please email directly at <a href="mailto:info@grafmen.com">info@grafmen.com</a>.'
          : 'Błąd połączenia. Treść wiadomości została zachowana. Napisz bezpośrednio na <a href="mailto:info@grafmen.com">info@grafmen.com</a>.';
        statusEl.style.color = '#dc2626';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-submitting');
      }
    }
  });
})();
