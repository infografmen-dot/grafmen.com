export interface ProjectEn {
  title: string;
  description: string;
  category: string;
  cover_alt: string;
  brief_title: string;
  brief: string[];
  deliverables: string[];
  gallery?: { caption: string; alt: string }[];
  result_title: string;
  result: string[];
  external_label?: string;
  testimonial?: string;
  testimonial_author?: string;
}

export const portfolioEn: Record<string, ProjectEn> = {
  "drewmax": {
    title: "Drewmax.pro",
    description: "Website for a brush and cleaning accessories manufacturer. Two language versions, Polish and English, present the product catalogue for domestic and international B2B partners.",
    category: "Website",
    cover_alt: "Drewmax.pro English website: Clean Space Starts Here – manufacturer catalogue and company profile",
    brief_title: "10 years of ongoing collaboration.",
    brief: [
      "Drewmax is an established Polish manufacturer of brushes and domestic cleaning accessories with decades of heritage. I have collaborated with the company for approximately 10 years across various graphic design and brand assets. In recent years, this partnership expanded into website design and ongoing web development.",
      "The objective was to create a modern, bilingual digital presence showcasing their comprehensive product catalogue while facilitating direct contact with commercial partners across Europe."
    ],
    deliverables: [
      "Information architecture design and product categorization.",
      "Bespoke UI design in a clean, modern aesthetic.",
      "Implementation of dual language versions: Polish and English.",
      "Full mobile responsiveness and optimized page loading performance."
    ],
    gallery: [
      {
        alt: "Drewmax.pro product categories overview",
        caption: "Product categories overview."
      },
      {
        alt: "Drewmax.pro product catalogue with search and filter",
        caption: "Product catalogue with search and filter capabilities."
      },
      {
        alt: "Section covering FSC-certified timber and Private Label offer",
        caption: "Section covering FSC-certified timber and Private Label capabilities."
      },
      {
        alt: "Drewmax.pro contact subpage with enquiry form",
        caption: "Contact page with structured enquiry form."
      }
    ],
    result_title: "New bilingual website for a manufacturer.",
    result: [
      "The result is a responsive website featuring an organized product catalogue and structured enquiry form, serving B2B partners across Poland and international export markets."
    ],
    external_label: "Open Drewmax.pro website"
  },

  "szkola-best": {
    title: "szkola.best",
    description: "Website for an English language school for children and teenagers. It structures the course offer and guides parents smoothly from first enquiry to enrolment.",
    category: "Website",
    cover_alt: "Best English language school website design presenting course offering",
    brief_title: "English that opens doors.",
    brief: [
      "Best English is a language school specializing in English courses for children, teenagers, and adults in south-eastern Poland.",
      "The school required a clear, welcoming website that presents teaching methodologies, course schedules, and allows fast online enrolment."
    ],
    deliverables: [
      "Information architecture tailored to parental decision-making and easy enrolment.",
      "Bespoke visual design optimized for clarity and trust.",
      "Online enrolment forms and social media integration.",
      "Mobile optimization for quick browsing on smartphones."
    ],
    result_title: "Clear website for a language school.",
    result: [
      "A user-friendly website presenting course proficiency levels, class schedules, and school contact details."
    ],
    external_label: "Open szkola.best website"
  },

  "hiker": {
    title: "Hiker",
    description: "Visual identity and promotional video for an outdoor brand. From geometric logo construction to corporate stationery, logo animation, and outdoor cinematography.",
    category: "Visual identity and video",
    cover_alt: "Hiker brand identity on corporate stationery and gear",
    brief_title: "A brand close to nature.",
    brief: [
      "Hiker is an outdoor apparel and gear brand. It needed a cohesive identity that evokes nature, freedom, and backcountry adventure.",
      "The brief required combining a distinct mark with seamless versatility across print, digital media, and video production."
    ],
    deliverables: [
      "Geometric logo design and proportional system.",
      "Colour palette and mark variants for all mediums.",
      "Identity guidelines applied across stationery and branded gear.",
      "Logo motion graphics produced in After Effects.",
      "Promotional film production shot on mountain location."
    ],
    gallery: [
      {
        alt: "Hiker logo construction and geometry",
        caption: "Logo construction and geometric proportional relationships."
      },
      {
        alt: "Hiker brand colour palette and typography",
        caption: "Colour palette and brand typography system."
      },
      {
        alt: "Hiker logo reveal animation",
        caption: "Short animated logo reveal crafted in After Effects."
      },
      {
        alt: "Hiker outdoor gear and branded merchandise",
        caption: "Identity implementation across apparel and outdoor equipment."
      },
      {
        alt: "Hiker website design proposal",
        caption: "Modern website concept for the Hiker outdoor brand."
      }
    ],
    result_title: "Cohesive brand identity and implementation.",
    result: [
      "A comprehensive suite of brand assets. The logo, typography, animated reveal, and promotional film establish an authentic, memorable brand language in print, web, and video."
    ],
    external_label: "Watch film on YouTube"
  },

  "drew-art": {
    title: "Drew-Art",
    description: "Website concept for a woodworking business. The layout organizes the product range and presents items in a modern commercial setting.",
    category: "Website",
    cover_alt: "Drew-Art website proposal",
    brief_title: "Presenting timber craftsmanship in a modern format.",
    brief: [
      "Drew-Art operates in the woodworking sector, manufacturing high-grade wooden products and household accessories.",
      "The project objective was to organize an extensive product range into a functional, aesthetic layout highlighting natural wood quality."
    ],
    deliverables: [
      "Brief and analysis: brand goals, hero products, and commercial buyer groups.",
      "UX/UI design: homepage, product catalogue, and contact enquiry module.",
      "WordPress implementation with full mobile and desktop responsiveness.",
      "Harmonious typography and graphic accents tailored to the brand character."
    ],
    gallery: [
      {
        alt: "Drew-Art product showcase materials",
        caption: "Showcase of natural wooden household collection."
      }
    ],
    result_title: "Showcasing timber craftsmanship online.",
    result: [
      "A structured website design presenting the product line and handcrafted detailing of wooden homeware."
    ],
    external_label: "Open Drew-Art website"
  },

  "jd-ubezpieczenia": {
    title: "JD Ubezpieczenia",
    description: "Logo and corporate stationery for an insurance advisory brand. The identity combines initials with a shield protection motif to build client confidence.",
    category: "Logo / branding",
    cover_alt: "JD Ubezpieczenia Joanna Dywan logo",
    brief_title: "Trust and security in insurance advisory.",
    brief: [
      "The insurance agency of Joanna Dywan required a professional, trustworthy visual identity for direct client consultation.",
      "The project called for a distinct mark combining the founder's initials with a clear motif of security, stability, and reliable advice."
    ],
    deliverables: [
      "Logo design featuring custom geometry merging letters J and D into a protective shield.",
      "Brand guidelines specifying clear space, colour palettes, and typography.",
      "Full corporate stationery set: premium business cards, presentation folders, and letterheads.",
      "Social media mockups and digital communication assets."
    ],
    gallery: [
      {
        alt: "JD Ubezpieczenia business cards",
        caption: "Corporate business cards on tactile card stock."
      },
      {
        alt: "JD Ubezpieczenia presentation folder",
        caption: "Branded folder for client policy documents."
      }
    ],
    result_title: "Visual identity for an insurance advisor.",
    result: [
      "Delivered a complete logo design alongside corporate stationery and brand materials for an independent insurance consultant."
    ]
  },

  "katalog-drew-art": {
    title: "Katalog Drew-Art",
    description: "Product catalogue structuring the offer and guiding buyers through key collections.",
    category: "Catalogue / print",
    cover_alt: "Drew-Art product catalogue cover",
    brief_title: "Square format, maximum clarity.",
    brief: [
      "Drew-Art required a comprehensive multi-page catalogue for trade fairs and direct wholesale distribution.",
      "The goal was to present hundreds of wooden articles in an orderly, premium editorial format that makes ordering straightforward."
    ],
    deliverables: [
      "Grid layout and typography system for a square catalogue format.",
      "Image colour correction and product photo preparation.",
      "Technical product specification tables and article index.",
      "Print-ready pre-press preparation (DTP) for offset printing."
    ],
    gallery: [
      {
        alt: "Drew-Art catalogue inner spread",
        caption: "Inner editorial spread showcasing brushware range."
      },
      {
        alt: "Drew-Art catalogue cover layout",
        caption: "Square format catalogue cover."
      }
    ],
    result_title: "Multi-page product catalogue.",
    result: [
      "Delivered a print-ready, multi-page publication enabling B2B buyers to quickly navigate the product assortment."
    ]
  },

  "montessori": {
    title: "Montessori.com.pl",
    description: "Website for a Montessori nursery in Przemyśl, featuring essential information for parents and a clear educational programme.",
    category: "Website",
    cover_alt: "Montessori.com.pl website presentation",
    brief_title: "A warm and intuitive educational website.",
    brief: [
      "The private Montessori Nursery required a welcoming digital home where prospective parents could explore the philosophy, daily routines, and admission criteria.",
      "The site needed to feel gentle, clean, and intuitive while projecting pedagogical standards and regulatory compliance."
    ],
    deliverables: [
      "Content organization centered on parents' top questions and admission stages.",
      "Gentle pastel aesthetic and legible typography.",
      "Interactive gallery, timetable, and meal plan displays.",
      "Mobile-first responsive architecture."
    ],
    result_title: "Informative website for the nursery.",
    result: [
      "Delivered an accessible, friendly website serving parents and children, with clear enrollment pathways."
    ],
    external_label: "Open Montessori.com.pl website"
  },

  "piworob": {
    title: "Piworób",
    description: "Brand naming and logo design for a regional craft brewery in south-eastern Poland.",
    category: "Logo / branding",
    cover_alt: "Piworób craft brewery logo and beer branding",
    brief_title: "Local brewing tradition in an original mark.",
    brief: [
      "An artisanal brewery needed a distinctive name and brand identity that honours traditional brewing craft while standing out on competitive craft beer shelves.",
      "The mark had to work effectively embossed on glassware, printed on bottle crowns, and stamped on wooden crates."
    ],
    deliverables: [
      "Brand naming and verbal identity development.",
      "Hand-crafted emblem logo incorporating brewing iconography.",
      "Monochrome and high-contrast versions for stamps and packaging.",
      "Bottle label template concept."
    ],
    gallery: [
      {
        alt: "Piworób logo on beer bottle label",
        caption: "Artisanal beer bottle label presentation."
      },
      {
        alt: "Piworób graphic signet detail",
        caption: "Mark geometry and craft detailing."
      }
    ],
    result_title: "Brand name and graphic mark for a brewery.",
    result: [
      "Crafted an authentic brand name and visual identity celebrating independent brewing passion."
    ]
  },

  "katalog-drewmar": {
    title: "Katalog Drewmar",
    description: "Product catalogue for a cleaning accessories manufacturer, aligned with the brand's visual language.",
    category: "Catalogue / print",
    cover_alt: "Drewmar product catalogue",
    brief_title: "Order and precision in a B2B catalogue.",
    brief: [
      "Drewmar needed an updated B2B wholesale catalogue presenting their growing range of brooms, brushes, and accessories.",
      "Clear categorization and precise technical codes were paramount for trade buyers making bulk purchase decisions."
    ],
    deliverables: [
      "Category architecture and colour-coded section tabs.",
      "Batch processing and clipping of product photography.",
      "Detailed technical dimension and packaging specifications.",
      "Pre-press preparation for large-run offset production."
    ],
    gallery: [
      {
        alt: "Drewmar catalogue spread showing brooms and brushes",
        caption: "Product spread with technical dimensions."
      },
      {
        alt: "Drewmar catalogue cover design",
        caption: "Front cover reflecting the clean brand identity."
      }
    ],
    result_title: "Comprehensive B2B product catalogue.",
    result: [
      "A clean, functional catalogue serving wholesale buyers across retail chains and export partners."
    ]
  },

  "ja-i-moj-biznes": {
    title: "Ja i mój biznes",
    description: "Website structured around business advisory services and establishing immediate client contact.",
    category: "Website",
    cover_alt: "Ja i mój biznes consulting website",
    brief_title: "A clear consulting website.",
    brief: [
      "A business consultancy programme helping entrepreneurs develop their ventures needed a focused digital presence.",
      "The site needed to clearly communicate consultation modules, workshops, and direct booking options."
    ],
    deliverables: [
      "Consulting offer breakdown and module descriptions.",
      "Clear visual hierarchy emphasizing credibility and tangible outcomes.",
      "Consultation enquiry form and schedule overview.",
      "Full mobile and tablet responsiveness."
    ],
    gallery: [
      {
        alt: "Ja i mój biznes homepage layout",
        caption: "Homepage layout featuring advisory modules."
      }
    ],
    result_title: "Functional consulting platform.",
    result: [
      "Delivered an informative, clean website connecting entrepreneurs with professional business advisory."
    ]
  },

  "gazetka-drewmar": {
    title: "Gazetka Drewmar",
    description: "Printed promotional publication presenting seasonal products and manufacturer offers.",
    category: "Print",
    cover_alt: "Drewmar promotional flyer",
    brief_title: "Seasonal momentum and promotional clarity.",
    brief: [
      "Drewmar required high-impact seasonal promotional flyers for distribution at trade fairs and retail partner outlets.",
      "The layout needed to draw immediate attention to featured seasonal articles while maintaining company brand standards."
    ],
    deliverables: [
      "Dynamic promotional editorial layout.",
      "Highlighting hero discounts and bundle packages.",
      "Full DTP preparation for commercial printing."
    ],
    gallery: [
      {
        alt: "Drewmar flyer inner spread with seasonal products",
        caption: "Inner spread featuring seasonal promotional lines."
      },
      {
        alt: "Drewmar flyer cover layout",
        caption: "Cover layout designed for high retail visibility."
      }
    ],
    result_title: "High-impact promotional print collateral.",
    result: [
      "An engaging promotional flyer driving seasonal wholesale and retail orders."
    ]
  },

  "self-invest": {
    title: "Self Invest",
    description: "Visual identity for investment consultancy Self Invest. The brand system and materials project stability and confidence in client relations.",
    category: "Logo / branding",
    cover_alt: "Self Invest logo and corporate branding",
    brief_title: "Prestige and professionalism in investment advisory.",
    brief: [
      "An independent wealth and investment consultancy needed a refined brand identity reflecting discretion, precision, and security.",
      "The identity needed to impress high-net-worth clients across bespoke stationery, confidential proposals, and digital communications."
    ],
    deliverables: [
      "Logo design embodying geometric equilibrium and upward trajectory.",
      "Sophisticated navy and gold colour palette.",
      "Corporate stationery: executive business cards, luxury letterheads, and report covers.",
      "Digital proposal templates and brand guidelines."
    ],
    gallery: [
      {
        alt: "Self Invest corporate stationery mockups",
        caption: "Executive stationery on premium tactile stock."
      },
      {
        alt: "Self Invest logo detail",
        caption: "Mark geometry and symbol construction."
      }
    ],
    result_title: "Visual identity for an advisory firm.",
    result: [
      "A distinguished, timeless visual identity communicating trust and expertise in financial consultancy."
    ]
  },

  "unitrans-katalog": {
    title: "Katalog Uni-Trans",
    description: "Commercial machinery catalogue and corporate overview for transport and earthworks company Uni-Trans.",
    category: "Catalogue / print",
    cover_alt: "Uni-Trans fleet and equipment catalogue",
    brief_title: "A powerful brand presence in transport and earthworks.",
    brief: [
      "Uni-Trans operates heavy plant machinery and specialized transport across major infrastructure contracts. They needed a robust catalogue showcasing their fleet capabilities to general contractors.",
      "The design needed to convey industrial reliability, technical capacity, and safety compliance."
    ],
    deliverables: [
      "Fleet categorization: heavy transport, excavators, and civil engineering machinery.",
      "On-site machine photography retouching and specification tables.",
      "Corporate brochure design highlighting completed infrastructure projects.",
      "Print pre-press preparation for durable spiral-bound manuals."
    ],
    gallery: [
      {
        alt: "Uni-Trans machinery catalogue spread",
        caption: "Fleet specification spread with machine parameters."
      },
      {
        alt: "Uni-Trans catalogue cover",
        caption: "Heavy-duty catalogue cover design."
      }
    ],
    result_title: "Heavy machinery and transport catalogue.",
    result: [
      "A practical, authoritative catalogue establishing corporate credibility with major construction partners."
    ]
  },

  "mpec-przemysl": {
    title: "MPEC Przemyśl",
    description: "Visual identity and corporate stationery suite: letterheads, envelopes, and official administrative collateral for municipal heating utility MPEC Przemyśl.",
    category: "Logo / branding",
    cover_alt: "MPEC Przemyśl corporate identity materials",
    brief_title: "Warmth and modernity in municipal utilities.",
    brief: [
      "The municipal heating provider of Przemyśl required a comprehensive modernization of its corporate stationery and brand communications.",
      "The materials had to maintain official civic dignity while introducing modern clarity and accessible typography."
    ],
    deliverables: [
      "Standardization of corporate mark application across administrative documents.",
      "Design of official letterheads, formal correspondence templates, and window envelopes.",
      "Vehicle livery specifications for service vans.",
      "Clear typographic system for public customer notices."
    ],
    gallery: [
      {
        alt: "MPEC Przemyśl corporate stationery suite",
        caption: "Official letterheads and municipal correspondence collateral."
      },
      {
        alt: "MPEC Przemyśl folder and envelope set",
        caption: "Presentation folders and corporate envelopes."
      }
    ],
    result_title: "Corporate identity for a public utility.",
    result: [
      "Delivered a systematic, orderly brand identity suite serving tens of thousands of local residents and commercial consumers."
    ]
  },

  "te-solutions": {
    title: "TE Solutions",
    description: "Visual identity assets: logotype, corporate stationery, and office collateral crafted for engineering brand TE Solutions.",
    category: "Branding",
    cover_alt: "TE Solutions visual identity",
    brief_title: "Advanced engineering in a minimalist mark.",
    brief: [
      "TE Solutions provides technical engineering and industrial automation solutions. They needed a crisp, technological identity reflecting high precision.",
      "The logo needed to scale seamlessly from circuit-board micro-markings to heavy industrial equipment labels."
    ],
    deliverables: [
      "Minimalist typographic logotype with engineered angular detailing.",
      "Technical blueprint-inspired brand colour palette.",
      "Corporate business cards, letterheads, and documentation folders.",
      "Vector asset suite for digital and mechanical production."
    ],
    gallery: [
      {
        alt: "TE Solutions corporate stationery",
        caption: "Minimalist corporate business cards and stationery."
      },
      {
        alt: "TE Solutions mark detail",
        caption: "Logotype construction and proportional grid."
      }
    ],
    result_title: "Visual identity for an engineering specialist.",
    result: [
      "A sharp, professional identity communicating technological excellence and engineering precision."
    ]
  },

  "kancelaria-lampa": {
    title: "Kancelaria Lampa",
    description: "Logo, business cards, corporate stationery, and legal folders designed for the Law Firm of Legal Counsel Piotr Lampa.",
    category: "Branding",
    cover_alt: "Kancelaria Radcy Prawnego Lampa visual identity",
    brief_title: "Elegance and authority in the legal profession.",
    brief: [
      "Legal Counsel Piotr Lampa required an authoritative, dignified brand identity for his law firm in Przemyśl.",
      "The design needed to convey discretion, legal rigour, and classical elegance without resorting to generic scales-of-justice clichés."
    ],
    deliverables: [
      "Refined logo design uniting typographic dignity with subtle legal symbolism.",
      "Classic corporate palette: deep navy, warm grey, and understated gold.",
      "Luxury stationery suite: business cards with edge-gilding, blind-embossed letterheads, and document folders.",
      "Email signature templates and legal notice formats."
    ],
    gallery: [
      {
        alt: "Kancelaria Lampa business stationery mockup",
        caption: "Premium legal stationery on cotton paper."
      },
      {
        alt: "Kancelaria Lampa folder and business cards",
        caption: "Client document folders and executive cards."
      }
    ],
    result_title: "Visual identity for a legal practice.",
    result: [
      "An elegant, timeless brand identity reinforcing confidence and high professional standing for a law practice."
    ]
  },

  "broszura-pervita24": {
    title: "PerVita24 Brochure",
    description: "Informative healthcare and caregiving brochure for PerVita24, presenting care services with compassion and clarity.",
    category: "Brochure / print",
    cover_alt: "PerVita24 care services brochure",
    brief_title: "Empathy and clarity in home care services.",
    brief: [
      "PerVita24 provides professional caregiving and nursing support. They required a tri-fold informational brochure for families seeking trustworthy care.",
      "The design needed to feel warm, reassuring, and completely legible, particularly for elderly readers and their families."
    ],
    deliverables: [
      "Empathetic layout architecture with prominent, comfortable typography.",
      "Service tiers and care scope clearly segmented for quick comprehension.",
      "Infographic explaining the straightforward qualification process.",
      "Print production pre-press files."
    ],
    gallery: [
      {
        alt: "PerVita24 brochure interior spread",
        caption: "Interior spread detailing caregiver support packages."
      },
      {
        alt: "PerVita24 brochure cover",
        caption: "Reassuring cover design focused on dignity and family."
      }
    ],
    result_title: "Informative healthcare brochure.",
    result: [
      "Delivered a compassionate, highly readable printed brochure connecting families with verified care services."
    ]
  },

  "gearexpert": {
    title: "GearExpert",
    description: "Visual identity spanning logo design, stationery, and corporate collateral for an automotive transmission specialist.",
    category: "Logo / branding",
    cover_alt: "GearExpert logo and corporate materials",
    brief_title: "Mechanical precision in a dynamic mark.",
    brief: [
      "GearExpert specializes in the diagnostic repair and remanufacture of automatic and manual transmissions. They needed a bold, dynamic brand identity.",
      "The mark needed to embody kinetic gear motion and exacting technical competence."
    ],
    deliverables: [
      "Dynamic gear-inspired logo design with high-contrast lettering.",
      "Industrial automotive palette: graphite, silver, and energetic orange.",
      "Stationery suite: workshop service forms, business cards, and invoice folders.",
      "Exterior workshop signage and technician apparel badging."
    ],
    gallery: [
      {
        alt: "GearExpert corporate identity suite",
        caption: "Corporate stationery, presentation folder, and business cards."
      },
      {
        alt: "GearExpert mark detailing",
        caption: "Gear-inspired mark construction and automotive colour accent."
      }
    ],
    result_title: "Visual identity for automotive engineering.",
    result: [
      "A robust, memorable identity establishing GearExpert as a market leader in gearbox engineering."
    ]
  },

  "katalog-targowy-drewmar": {
    title: "Katalog targowy Drewmar",
    description: "International trade fair catalogue produced for the Ambiente Exhibition in Frankfurt am Main.",
    category: "Catalogue / print",
    cover_alt: "Drewmar trade fair catalogue cover for Ambiente Frankfurt",
    brief_title: "Brand showcase at a premier European trade exhibition.",
    brief: [
      "Drewmar exhibited at the world-renowned Ambiente consumer-goods trade fair in Frankfurt. They needed an international exhibition catalogue.",
      "The publication had to captivate European retail buyers, showcasing production capacity, ecological timber sourcing, and bespoke Private Label services."
    ],
    deliverables: [
      "Curated international product selection tailored to Western European trends.",
      "Multilingual specifications and export freight packaging metrics.",
      "Premium cover finish and high-grade editorial photographic layouts.",
      "Pre-press preparation meeting stringent international printing standards."
    ],
    gallery: [
      {
        alt: "Ambiente exhibition catalogue spread",
        caption: "Spread presenting eco-certified brush collections."
      },
      {
        alt: "Trade fair catalogue cover design",
        caption: "Exhibition catalogue cover designed for Ambiente Frankfurt."
      }
    ],
    result_title: "International trade fair catalogue.",
    result: [
      "An impressive, prestigious trade catalogue that successfully attracted international distributors and retail chains."
    ]
  },

  "pobudka": {
    title: "Pobudka",
    description: "Dietary supplement packaging design and realistic 3D product visualization.",
    category: "Packaging",
    cover_alt: "Pobudka supplement packaging design",
    brief_title: "Energy and morning freshness in modern packaging.",
    brief: [
      "Pobudka is an invigorating dietary supplement designed to boost morning mental clarity and physical energy.",
      "The packaging needed to pop instantly on pharmacy and online retail shelves, conveying natural vitality through fresh visual cues."
    ],
    deliverables: [
      "Box packaging design with clean typography and compliant regulatory ingredient panels.",
      "Vibrant energetic gradient and crisp botanical graphic motifs.",
      "Photorealistic 3D bottle and box renders for e-commerce and marketing.",
      "Interactive animated HTML5 display banner for digital ad campaigns."
    ],
    result_title: "Packaging design and 3D visual showcase.",
    result: [
      "A distinctive, modern supplement packaging concept paired with interactive digital advertising assets."
    ]
  }
};
