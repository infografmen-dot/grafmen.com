export interface UiDictionary {
  nav: {
    homeAria: string;
    mainNavAria: string;
    web: string;
    brand: string;
    work: string;
    about: string;
    blog: string;
    contact: string;
    quote: string;
    menuOpen: string;
    menuClose: string;
    langSwitchAria: string;
    switchToPl: string;
    switchToEn: string;
  };
  footer: {
    tagline: string;
    navLabel: string;
    servicesLabel: string;
    remoteLabel: string;
    remoteSub: string;
    howIWork: string;
    webPricing: string;
    brandPricing: string;
    faq: string;
    blog: string;
    privacy: string;
    cookiesBtn: string;
    webServices: string;
    redesign: string;
    branding: string;
    contact: string;
    backToTop: string;
  };
  cookieBanner: {
    regionAria: string;
    bannerText: string;
    panelTitle: string;
    panelCloseAria: string;
    panelText: string;
    privacyLinkText: string;
    btnPrivacy: string;
    btnClose: string;
  };
  ctaOrange: {
    kicker: string;
    heading: string;
    text: string;
    button: string;
    href: string;
  };
}

export const ui: Record<'pl' | 'en', UiDictionary> = {
  pl: {
    nav: {
      homeAria: 'Grafmen · strona główna',
      mainNavAria: 'Główna nawigacja',
      web: 'Strony WWW',
      brand: 'Branding',
      work: 'Portfolio',
      about: 'O\u00A0mnie',
      blog: 'Blog',
      contact: 'Kontakt',
      quote: 'Kontakt',
      menuOpen: 'Otwórz menu',
      menuClose: 'Zamknij menu',
      langSwitchAria: 'Język / Language',
      switchToPl: 'Wersja polska',
      switchToEn: 'Przełącz na wersję angielską',
    },
    footer: {
      tagline: 'Projektuję od\u00A02005 roku.<br>Strony WWW, branding i\u00A0materiały,<br>które pracują dla\u00A0Twojej firmy.',
      navLabel: 'Nawigacja',
      servicesLabel: 'Usługi',
      remoteLabel: 'Pracuję zdalnie',
      remoteSub: 'Przemyśl / Podkarpacie<br>cała Polska i\u00A0zagranica',
      howIWork: 'Jak pracuję',
      webPricing: 'Ceny stron WWW',
      brandPricing: 'Ceny brandingu',
      faq: 'FAQ',
      blog: 'Blog',
      privacy: 'Polityka prywatności',
      cookiesBtn: 'Informacja o\u00A0prywatności',
      webServices: 'Strony WWW',
      redesign: 'Modernizacja WWW',
      branding: 'Branding',
      contact: 'Kontakt',
      backToTop: 'Wróć na\u00A0górę strony',
    },
    cookieBanner: {
      regionAria: 'Informacja o prywatności',
      bannerText: 'Twoja prywatność: sprawdź, jak przetwarzam dane na\u00A0tej stronie.',
      panelTitle: 'Prywatność na\u00A0stronie',
      panelCloseAria: 'Zamknij panel informacji',
      panelText: 'Dane z\u00A0formularzy wykorzystuję do\u00A0obsługi Twojego zapytania. Osadzone filmy YouTube łączą się z\u00A0usługą Google po\u00A0ich uruchomieniu. Zamknięcie tego komunikatu zapamiętuję w\u00A0Twojej przeglądarce. Szczegóły znajdziesz w\u00A0polityce prywatności.',
      privacyLinkText: 'Polityka prywatności',
      btnPrivacy: 'Dowiedz się więcej',
      btnClose: 'Zamknij',
    },
    ctaOrange: {
      kicker: 'ZACZNIJMY ROZMOWĘ',
      heading: 'Porozmawiajmy<br>o\u00A0projekcie<br>dla\u00A0Twojej firmy.',
      text: 'Napisz, czego potrzebujesz. Po\u00A0zapoznaniu\u00A0się z\u00A0zakresem przygotuję bezpłatną wycenę i\u00A0zaproponuję kolejne kroki.',
      button: 'Napisz po\u00A0bezpłatną wycenę',
      href: '/kontakt/',
    },
  },
  en: {
    nav: {
      homeAria: 'Grafmen · Home',
      mainNavAria: 'Main navigation',
      web: 'Websites',
      brand: 'Branding',
      work: 'Portfolio',
      about: 'About\u00A0me',
      blog: 'Blog',
      contact: 'Contact',
      quote: 'Contact',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      langSwitchAria: 'Language',
      switchToPl: 'Switch to Polish version',
      switchToEn: 'English version',
    },
    footer: {
      tagline: 'Designing since 2005.<br>Websites, branding and materials<br>tailored to work for your business.',
      navLabel: 'Navigation',
      servicesLabel: 'Services',
      remoteLabel: 'Working remotely',
      remoteSub: 'Przemyśl / Poland<br>serving clients worldwide',
      howIWork: 'How I work',
      webPricing: 'Website pricing',
      brandPricing: 'Branding pricing',
      faq: 'FAQ',
      blog: 'Blog',
      privacy: 'Privacy policy',
      cookiesBtn: 'Privacy notice',
      webServices: 'Websites',
      redesign: 'Website redesign',
      branding: 'Branding',
      contact: 'Contact',
      backToTop: 'Back to top',
    },
    cookieBanner: {
      regionAria: 'Privacy notice',
      bannerText: 'Your privacy: see how I process data on this website.',
      panelTitle: 'Website privacy',
      panelCloseAria: 'Close information panel',
      panelText: 'I use form data to handle your enquiry. Embedded YouTube videos connect to Google services once played. Dismissing this notice is saved in your browser. Details can be found in the privacy policy.',
      privacyLinkText: 'Privacy policy',
      btnPrivacy: 'Learn more',
      btnClose: 'Close',
    },
    ctaOrange: {
      kicker: 'START THE CONVERSATION',
      heading: 'Let’s discuss<br>a project<br>for your business.',
      text: 'Tell me what you need. Once I review your project scope, I will prepare a free quotation and suggest the next steps.',
      button: 'Request a free quote',
      href: '/en/contact/',
    },
  },
};
