import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    blog: collection({
      label: 'Artykuły Bloga',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Tytuł artykułu',
            description: 'Główny tytuł wyświetlany na stronie i liście bloga',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Adres wpisu (slug)',
            description: 'Unikalny adres URL artykułu (np. samo-logo-czy-identyfikacja-wizualna)',
          },
        }),
        description: fields.text({
          label: 'Krótki opis na liście (zajawka / lead)',
          description: 'Zwięzłe streszczenie artykułu wyświetlane na liście bloga oraz w nagłówku wpisu',
          multiline: true,
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Kategoria',
          options: [
            { label: 'Identyfikacja wizualna', value: 'Identyfikacja wizualna' },
            { label: 'Strony internetowe', value: 'Strony internetowe' },
            { label: 'Wskazówki i wiedza', value: 'Wskazówki i wiedza' },
            { label: 'Case study', value: 'Case study' },
            { label: 'Visual identity (EN)', value: 'Visual identity' },
            { label: 'Websites (EN)', value: 'Websites' },
          ],
          defaultValue: 'Identyfikacja wizualna',
        }),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'Krzysztof Krawczyk',
          validation: { isRequired: true },
        }),
        pubDate: fields.date({
          label: 'Data publikacji',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        cover: fields.image({
          label: 'Zdjęcie główne (okładka)',
          description: 'Główna grafika artykułu (zapisywana w public/assets/blog)',
          directory: 'public/assets/blog',
          publicPath: '/assets/blog/',
          validation: { isRequired: true },
        }),
        coverAlt: fields.text({
          label: 'Tekst alternatywny zdjęcia (ALT)',
          description: 'Opis grafiki dla dostępności (a11y) i robotów wyszukiwarek',
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: 'Szkic (ukryj przed publikacją produkcyjną)',
          description: 'Zaznaczone: artykuł jest szkicem dostępnym tylko w lokalnym podglądzie',
          defaultValue: true,
        }),
        lang: fields.select({
          label: 'Język wpisu',
          options: [
            { label: 'Polski (PL)', value: 'pl' },
            { label: 'English (EN)', value: 'en' },
          ],
          defaultValue: 'pl',
        }),
        seoTitle: fields.text({
          label: 'Tytuł SEO (opcjonalny)',
          description: 'Niestandardowy tytuł do tagu <title>. Jeśli pusty, użyty zostanie tytuł artykułu + | Blog Grafmen',
        }),
        seoDescription: fields.text({
          label: 'Opis SEO / meta description (opcjonalny)',
          description: 'Niestandardowy opis do meta tagu description. Jeśli pusty, użyty zostanie krótki opis',
          multiline: true,
        }),
        ogImage: fields.image({
          label: 'Grafika do udostępniania (opcjonalna)',
          description: 'Niestandardowa grafika dla mediów społecznościowych (og:image). Przy pustym polu wykorzystywane jest zdjęcie główne artykułu',
          directory: 'public/assets/blog',
          publicPath: '/assets/blog/',
        }),
        translationSlug: fields.text({
          label: 'Slug powiązanego tłumaczenia (opcjonalnie)',
          description: 'Podaj slug artykułu w drugim języku tylko jeśli tłumaczenie rzeczywiście istnieje',
        }),
        content: fields.markdoc({
          label: 'Treść artykułu',
          description: 'Główne sekcje artykułu oznaczaj jako H2, podsekcje jako H3. Tytuł H1 jest dodawany automatycznie',
          extension: 'md',
          options: {
            heading: [2, 3, 4],
            bold: true,
            italic: true,
            strikethrough: true,
            link: true,
            orderedList: true,
            unorderedList: true,
            blockquote: true,
            code: true,
            divider: true,
            image: {
              directory: 'public/assets/blog',
              publicPath: '/assets/blog/',
            },
          },
        }),
      },
    }),
  },
});
