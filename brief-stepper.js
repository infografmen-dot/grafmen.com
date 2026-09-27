/**
 * Grafmen Brief Stepper Logic
 * Wielokrokowy, dostępny formularz briefu z cofaniem bez utraty danych,
 * dynamicznym podsumowaniem i integracją z Web3Forms.
 */

(() => {
  const form = document.querySelector('#brief-form');
  if (!form) return;

  const isEn = document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith('en');
  const briefType = form.getAttribute('data-brief-type') || 'web'; // 'web' | 'branding'
  const accessKey = form.getAttribute('data-access-key') || (window.GrafmenWeb3Forms?.DEFAULT_ACCESS_KEY) || '';
  const isSimulation = form.getAttribute('data-simulate') === 'true';

  const steps = Array.from(form.querySelectorAll('.brief-step'));
  const totalInteractiveSteps = 3; // Kroki 1, 2, 3 (krok 4 to podsumowanie)

  const stepIndicator = document.querySelector('#stepper-step-indicator');
  const stepTitle = document.querySelector('#stepper-step-title');
  const progressBar = document.querySelector('#stepper-progress-bar');

  const btnPrev = document.querySelector('#brief-btn-prev');
  const btnNext = document.querySelector('#brief-btn-next');
  const btnSubmit = document.querySelector('#brief-btn-submit');
  const statusBox = document.querySelector('#brief-status-box');
  const cardBox = document.querySelector('.brief-card-box');

  // Phone toggle button
  const phoneToggleBtn = document.querySelector('#toggle-phone-btn');
  const phoneFieldBox = document.querySelector('#phone-field-box');
  const phoneInput = document.querySelector('#field-phone');

  let currentStepIndex = 0; // 0: Krok 1, 1: Krok 2, 2: Krok 3, 3: Podsumowanie

  const stepTitles = isEn ? {
    web: ['Project & Business', 'Features & Materials', 'Timeline, Budget & Contact', 'Review & Submit'],
    branding: ['Brand & Scope', 'Applications & Style', 'Timeline, Budget & Contact', 'Review & Submit']
  } : {
    web: ['Projekt i firma', 'Funkcje i materiały', 'Harmonogram, budżet i kontakt', 'Podsumowanie briefu'],
    branding: ['Marka i zakres', 'Zastosowania i styl', 'Harmonogram, budżet i kontakt', 'Podsumowanie briefu']
  };

  const currentTitles = stepTitles[briefType] || stepTitles.web;

  // Toggle phone input
  if (phoneToggleBtn && phoneFieldBox) {
    phoneToggleBtn.addEventListener('click', () => {
      const isHidden = phoneFieldBox.hasAttribute('hidden');
      if (isHidden) {
        phoneFieldBox.removeAttribute('hidden');
        phoneToggleBtn.setAttribute('aria-expanded', 'true');
        phoneToggleBtn.style.display = 'none';
        phoneInput?.focus();
      }
    });
  }

  // Update UI for active step
  function showStep(index) {
    if (index < 0 || index >= steps.length) return;

    steps.forEach((step, idx) => {
      const isActive = idx === index;
      step.classList.toggle('is-active', isActive);
      step.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    currentStepIndex = index;

    // Update Stepper Bar
    if (index < totalInteractiveSteps) {
      if (stepIndicator) {
        stepIndicator.textContent = isEn
          ? `Step ${index + 1} of ${totalInteractiveSteps}`
          : `Krok ${index + 1} z ${totalInteractiveSteps}`;
      }
      if (stepTitle) {
        stepTitle.textContent = currentTitles[index];
      }
      if (progressBar) {
        const pct = Math.round(((index + 1) / totalInteractiveSteps) * 100);
        progressBar.style.width = `${pct}%`;
        progressBar.setAttribute('aria-valuenow', `${pct}`);
      }
    } else {
      // Summary step
      if (stepIndicator) {
        stepIndicator.textContent = isEn ? 'Summary' : 'Podsumowanie';
      }
      if (stepTitle) {
        stepTitle.textContent = currentTitles[index] || (isEn ? 'Review & Submit' : 'Podsumowanie briefu');
      }
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.setAttribute('aria-valuenow', '100');
      }
      renderSummary();
    }

    // Buttons visibility & dynamic labels
    if (btnPrev) {
      btnPrev.style.display = index === 0 ? 'none' : 'inline-flex';
    }

    if (index === steps.length - 1) {
      // Na ekranie podsumowania: ukryj przycisk "Dalej", pokaż przycisk wysyłki
      if (btnNext) btnNext.style.display = 'none';
      if (btnSubmit) btnSubmit.style.display = 'inline-flex';
    } else {
      if (btnNext) {
        btnNext.style.display = 'inline-flex';
        const nextTextSpan = btnNext.querySelector('span:not([aria-hidden])') || btnNext.firstElementChild;
        if (nextTextSpan) {
          if (index === 2) {
            nextTextSpan.textContent = isEn ? 'Review your answers' : 'Przejdź do podsumowania';
          } else {
            nextTextSpan.textContent = isEn ? 'Next' : 'Dalej';
          }
        }
      }
      if (btnSubmit) btnSubmit.style.display = 'none';
    }

    clearStatus();

    // Scroll smoothly to top of brief container on step change
    const container = document.querySelector('.brief-stepper');
    if (container && window.scrollY > container.offsetTop - 80) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Clear feedback notices
  function clearStatus() {
    if (statusBox) {
      statusBox.setAttribute('hidden', '');
      statusBox.className = 'brief-status-box';
      statusBox.textContent = '';
    }
  }

  // Show error notice
  function showError(msg) {
    if (statusBox) {
      statusBox.removeAttribute('hidden');
      statusBox.className = 'brief-status-box is-error';
      statusBox.innerHTML = msg;
      statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Validation before proceeding to next step
  function validateStep(index) {
    clearStatus();
    const activeStep = steps[index];
    if (!activeStep) return true;

    // Krok 1 walidacja
    if (index === 0) {
      if (briefType === 'web') {
        const typeSelected = activeStep.querySelector('input[name="project_type"]:checked');
        if (!typeSelected) {
          showError(isEn ? 'Please choose the project type.' : 'Wybierz rodzaj projektu.');
          activeStep.querySelector('input[name="project_type"]')?.focus();
          return false;
        }
        const descField = activeStep.querySelector('textarea[name="company_overview"]');
        if (descField && !descField.value.trim()) {
          showError(isEn ? 'Please describe what your business does.' : 'Napisz krótko, czym zajmuje się Twoja firma.');
          descField.focus();
          return false;
        }
      } else if (briefType === 'branding') {
        const scopeSelected = activeStep.querySelector('input[name="brand_scope"]:checked');
        if (!scopeSelected) {
          showError(isEn ? 'Please select the branding scope.' : 'Wybierz zakres projektu.');
          activeStep.querySelector('input[name="brand_scope"]')?.focus();
          return false;
        }
        const descField = activeStep.querySelector('textarea[name="brand_overview"]');
        if (descField && !descField.value.trim()) {
          showError(isEn ? 'Please describe what your brand offers.' : 'Napisz krótko, czym zajmuje się marka.');
          descField.focus();
          return false;
        }
      }
    }

    // Krok 3 walidacja (dane kontaktowe)
    if (index === 2) {
      const nameField = activeStep.querySelector('input[name="contact_name"]');
      if (nameField && !nameField.value.trim()) {
        showError(isEn ? 'Please provide your name or contact person.' : 'Podaj imię lub osobę kontaktową.');
        nameField.focus();
        return false;
      }
      const emailField = activeStep.querySelector('input[name="contact_email"]');
      if (emailField) {
        const val = emailField.value.trim();
        if (!val) {
          showError(isEn ? 'Please enter your email address.' : 'Podaj swój adres e-mail.');
          emailField.focus();
          return false;
        }
        if (!emailField.checkValidity() || !val.includes('@')) {
          showError(isEn ? 'Please provide a valid email address.' : 'Wpisz poprawny adres e-mail.');
          emailField.focus();
          return false;
        }
      }
    }

    return true;
  }

  // Render dynamic summary in step 4
  function renderSummary() {
    const summaryTarget = document.querySelector('#brief-summary-target');
    if (!summaryTarget) return;

    const data = new FormData(form);

    const val = (name, fallback) => {
      const v = data.get(name);
      return v && v.toString().trim() !== '' ? v.toString().trim() : (fallback || (isEn ? 'Not specified' : 'Nie podano'));
    };

    const multiVals = (name, fallback) => {
      const all = data.getAll(name);
      return all.length > 0 ? all.join(', ') : (fallback || (isEn ? 'None selected' : 'Nie wybrano'));
    };

    let html = '<div class="summary-container">';

    if (briefType === 'web') {
      html += `
        <div class="summary-card">
          <div class="summary-card-head">
            <h3 class="summary-card-title">${isEn ? '1. Project & Business' : '1. Projekt i firma'}</h3>
            <button type="button" class="summary-edit-btn" data-goto="0">${isEn ? 'Edit' : 'Edytuj'}</button>
          </div>
          <ul class="summary-list">
            <li class="summary-item"><span class="summary-key">${isEn ? 'Project type' : 'Rodzaj projektu'}</span><span class="summary-val">${val('project_type')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'About business' : 'O firmie i klientach'}</span><span class="summary-val">${val('company_overview')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'Main goal' : 'Główny cel strony'}</span><span class="summary-val">${val('primary_goal')}</span></li>
          </ul>
        </div>

        <div class="summary-card">
          <div class="summary-card-head">
            <h3 class="summary-card-title">${isEn ? '2. Features & Materials' : '2. Funkcje i materiały'}</h3>
            <button type="button" class="summary-edit-btn" data-goto="1">${isEn ? 'Edit' : 'Edytuj'}</button>
          </div>
          <ul class="summary-list">
            <li class="summary-item"><span class="summary-key">${isEn ? 'Key features' : 'Potrzebne funkcje'}</span><span class="summary-val">${multiVals('features')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'Assets available' : 'Posiadane materiały'}</span><span class="summary-val">${multiVals('assets')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'Current site / Links' : 'Obecna strona / inspiracje'}</span><span class="summary-val">${val('references', isEn ? 'None' : 'Brak')}</span></li>
          </ul>
        </div>
      `;
    } else {
      html += `
        <div class="summary-card">
          <div class="summary-card-head">
            <h3 class="summary-card-title">${isEn ? '1. Brand & Scope' : '1. Marka i zakres'}</h3>
            <button type="button" class="summary-edit-btn" data-goto="0">${isEn ? 'Edit' : 'Edytuj'}</button>
          </div>
          <ul class="summary-list">
            <li class="summary-item"><span class="summary-key">${isEn ? 'Brand name' : 'Nazwa marki'}</span><span class="summary-val">${val('brand_name')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'About brand' : 'O marce i ofercie'}</span><span class="summary-val">${val('brand_overview')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'Project scope' : 'Zakres projektu'}</span><span class="summary-val">${val('brand_scope')}</span></li>
          </ul>
        </div>

        <div class="summary-card">
          <div class="summary-card-head">
            <h3 class="summary-card-title">${isEn ? '2. Applications & Style' : '2. Zastosowania i styl'}</h3>
            <button type="button" class="summary-edit-btn" data-goto="1">${isEn ? 'Edit' : 'Edytuj'}</button>
          </div>
          <ul class="summary-list">
            <li class="summary-item"><span class="summary-key">${isEn ? 'Applications' : 'Główne zastosowania'}</span><span class="summary-val">${multiVals('applications')}</span></li>
            <li class="summary-item"><span class="summary-key">${isEn ? 'Preferences & Avoid' : 'Inspiracje i preferencje'}</span><span class="summary-val">${val('preferences', isEn ? 'None' : 'Brak')}</span></li>
          </ul>
        </div>
      `;
    }

    // Wspólny krok 3
    html += `
      <div class="summary-card">
        <div class="summary-card-head">
          <h3 class="summary-card-title">${isEn ? '3. Timeline, Budget & Contact' : '3. Harmonogram, budżet i kontakt'}</h3>
          <button type="button" class="summary-edit-btn" data-goto="2">${isEn ? 'Edit' : 'Edytuj'}</button>
        </div>
        <ul class="summary-list">
          <li class="summary-item"><span class="summary-key">${isEn ? 'Estimated timeline' : 'Orientacyjny termin'}</span><span class="summary-val">${val('timeline')}</span></li>
          <li class="summary-item"><span class="summary-key">${isEn ? 'Estimated budget' : 'Orientacyjny budżet'}</span><span class="summary-val">${val('budget')}</span></li>
          <li class="summary-item"><span class="summary-key">${isEn ? 'Contact person' : 'Osoba kontaktowa'}</span><span class="summary-val">${val('contact_name')}</span></li>
          <li class="summary-item"><span class="summary-key">${isEn ? 'Email' : 'E-mail'}</span><span class="summary-val">${val('contact_email')}</span></li>
          <li class="summary-item"><span class="summary-key">${isEn ? 'Phone' : 'Telefon'}</span><span class="summary-val">${val('contact_phone', isEn ? 'Not provided' : 'Nie podano')}</span></li>
        </ul>
      </div>
    </div>`;

    summaryTarget.innerHTML = html;

    // Attach edit button listeners
    summaryTarget.querySelectorAll('.summary-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gotoIndex = parseInt(btn.getAttribute('data-goto') || '0', 10);
        showStep(gotoIndex);
      });
    });
  }

  // Navigation click handlers
  btnNext?.addEventListener('click', (e) => {
    e.preventDefault();
    if (validateStep(currentStepIndex)) {
      showStep(currentStepIndex + 1);
    }
  });

  btnPrev?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentStepIndex > 0) {
      showStep(currentStepIndex - 1);
    }
  });

  // Submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    // Anti-double-submit
    if (btnSubmit.disabled || btnSubmit.classList.contains('is-submitting')) {
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.classList.add('is-submitting');
    btnPrev && (btnPrev.disabled = true);

    const formData = new FormData(form);
    const subject = briefType === 'branding' ? 'Grafmen | Brief branding' : 'Grafmen | Brief WWW';

    const extraFields = {};
    for (const [key, value] of formData.entries()) {
      if (['access_key', 'botcheck', 'contact_name', 'contact_email', 'contact_phone'].includes(key)) {
        continue;
      }
      if (extraFields[key]) {
        extraFields[key] += `, ${value}`;
      } else {
        extraFields[key] = value;
      }
    }

    const payloadOptions = {
      accessKey,
      subject,
      fromName: 'Grafmen Brief',
      name: formData.get('contact_name') || '',
      email: formData.get('contact_email') || '',
      phone: formData.get('contact_phone') || '',
      botcheck: formData.get('botcheck') || '',
      lang: isEn ? 'en' : 'pl',
      extraFields,
      simulate: isSimulation
    };

    try {
      const result = await window.GrafmenWeb3Forms.submitForm(payloadOptions);

      if (result.success) {
        // Pomyślne przyjęcie przez API
        cardBox.innerHTML = `
          <div class="brief-success-screen" role="region" aria-live="polite">
            <div class="brief-success-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>${isEn ? 'Brief received!' : 'Brief został przyjęty!'}</h2>
            <p>${isEn
              ? 'Thank you for providing the project details. I will review your requirements and respond with initial insights and pricing, usually within 24–48 hours.'
              : 'Dziękuję za przesłanie założeń projektu. Zapoznam się z nimi i przygotuję wstępną propozycję oraz wycenę, zwykle w ciągu 24–48 godzin.'}</p>
            <div>
              <a class="btn-primary" href="${isEn ? '/en/' : '/'}">
                <span>${isEn ? 'Return to homepage' : 'Wróć do strony głównej'}</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        `;
        // Ukryj pasek steppera i dolne akcje
        const stepperHeader = document.querySelector('.brief-stepper');
        if (stepperHeader) stepperHeader.style.display = 'none';
        const actionsBar = document.querySelector('.brief-actions');
        if (actionsBar) actionsBar.style.display = 'none';
      } else {
        // Odrzucenie lub błąd
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('is-submitting');
        btnPrev && (btnPrev.disabled = false);

        const errorNotice = isEn
          ? `${result.message || 'Submission could not be completed.'}<br>Your answers are preserved. You can try again or email me directly at <a href="mailto:info@grafmen.com">info@grafmen.com</a>.`
          : `${result.message || 'Nie udało się przesłać briefu.'}<br>Twoje odpowiedzi zostały zachowane. Możesz spróbować ponownie lub napisać bezpośrednio na <a href="mailto:info@grafmen.com">info@grafmen.com</a> lub zadzwonić pod <a href="tel:+48694179217">+48 694 179 217</a>.`;

        showError(errorNotice);
      }
    } catch (err) {
      console.error(err);
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('is-submitting');
      btnPrev && (btnPrev.disabled = false);

      const errorNotice = isEn
        ? `A network error occurred. Your answers are safe. Please try again or reach out directly at <a href="mailto:info@grafmen.com">info@grafmen.com</a>.`
        : `Wystąpił błąd połączenia. Twoje odpowiedzi są bezpieczne. Spróbuj ponownie lub skontaktuj się bezpośrednio pod adresem <a href="mailto:info@grafmen.com">info@grafmen.com</a>.`;

      showError(errorNotice);
    }
  });

  // Inicjalizacja pierwszego kroku
  showStep(0);
})();
