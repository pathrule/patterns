import type { Pattern } from "../types.js";

export const technicalSeoStructuredData: Pattern = {
  "slug": "technical-seo-structured-data",
  "version": "1.0.0",
  "name": "Technical SEO and Structured Data",
  "tagline": "Make crawlability, canonical identity, metadata, structured data, and rendering testable per page.",
  "description": "Search visibility fails when crawlers discover duplicate URLs, receive blocked or empty rendering, follow contradictory canonical and redirect signals, or parse structured data that does not match visible page content. This pattern constrains indexable responses and canonical identity while recording metadata and structured-data ownership across templates and generated pages. It complements Next.js, Astro, and Core Web Vitals patterns without depending on a framework; the focus is what a crawler and search result receive, not how the application component tree is authored.",
  "category": "Frontend",
  "icon": "search-code",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Technical SEO pattern for AI coding agents",
  "metaDescription": "Technical SEO crawlability, canonical URLs, redirects, robots directives, metadata, sitemaps, structured data, rendering, and validation. In production.",
  "problem": "AI agents often add a canonical tag to the wrong URL, emit noindex and a sitemap entry together, generate schema markup unrelated to visible content, or hide essential text behind client-only rendering.",
  "audience": "Web teams operating public documentation, product, editorial, marketplace, or landing pages",
  "prevents": [
    "Splitting ranking signals across duplicate parameterized URLs",
    "Publishing indexable error or empty pages",
    "Contradicting robots, canonical, redirect, and sitemap signals",
    "Claiming structured data the page does not visibly support"
  ],
  "appliesTo": {
    "paths": [
      "/src/pages",
      "/src/seo",
      "/public"
    ],
    "stacks": [
      "seo",
      "structured-data",
      "schema-org",
      "web",
      "sitemap"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/pages",
      "title": "Return a complete indexable response for public pages",
      "summary": "Serve meaningful title, description, headings, links, and primary content without requiring a successful client-only data fetch.",
      "body": "A crawler or unfurl client may not execute the application like a long-lived browser session. An indexable URL that initially returns an empty shell, generic metadata, or an error hidden behind status 200 sends weak or misleading signals.\n\n- Render the page's unique primary content and metadata in the initial response or a crawler-accessible server-rendered path.\n- Return accurate HTTP status for missing, removed, redirected, unauthorized, and temporarily unavailable content instead of rendering every state as a successful page.\n- Keep essential navigation and discovery links as real URLs in the document; do not require pointer events or client state to reveal every crawl path.\n- Ensure robots directives, authentication gates, and bot protection do not block assets or content required to understand an intentionally public page.\n\nSee /src/seo for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/seo",
      "title": "Emit one consistent canonical identity",
      "summary": "Align redirects, canonical link, internal links, sitemap entries, locale alternates, and sharing metadata on the chosen public URL.",
      "body": "Canonicalization is a cluster of signals, not a single tag. If the page redirects one way, links another, and names a third canonical, crawlers must guess which URL owns the content.\n\n- Choose policy for scheme, host, path casing, trailing slash, default locale, and removable query parameters, then generate URLs from one canonical builder.\n- Redirect permanent duplicates to the canonical URL where possible and make internal links point directly at it.\n- Include only canonical, indexable URLs in sitemaps and update modification signals from meaningful content change rather than every build.\n- Make locale alternates reciprocal and self-referential where used, and do not label machine-translated or unrelated pages as equivalent regional versions.\n\nSee /public for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/seo",
      "title": "Structured data mirrors visible, attributable content",
      "summary": "Generate schema from the same page model the user sees and omit properties the product cannot support truthfully.",
      "body": "Structured data is not a place to add keywords or claims that are absent from the page. Divergence between visible content and machine markup makes maintenance harder and can invalidate enhanced-result eligibility.\n\n- Choose the most specific supported type that describes the page's primary entity rather than attaching several unrelated top-level entities.\n- Generate names, descriptions, authorship, dates, prices, availability, ratings, and breadcrumbs from the same authoritative data used in the rendered page.\n- Use stable absolute identifiers and URLs and keep organization or product identity consistent across pages.\n- Validate generated JSON syntax and semantic requirements on real routes, then monitor deployed pages because template-valid markup can still contain missing production data.\n\nSee /src/pages for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/pages",
      "title": "Metadata is owned by the route's primary entity",
      "summary": "Build title, description, sharing image, and robots policy from route data with explicit fallbacks and uniqueness checks.",
      "body": "A global template cannot express every page, while arbitrary component-level mutation creates duplicate or race-prone tags. The route that resolves the primary entity has the information and lifecycle to own metadata.\n\n- Compose a concise unique title and description from authoritative fields and fall back to a truthful section-level page, never empty strings or copied placeholder text.\n- Use one metadata owner so nested components cannot emit competing canonical, robots, or social tags.\n- Keep social image, title, description, and canonical URL aligned with the page users reach when the preview is opened.\n- Exclude search, filter, preview, error, and private states from indexing according to product policy instead of letting generic metadata make them look canonical.\n\nSee /src/seo for the rule or workflow that puts this decision into practice."
    }
  ]
};
