import type { Pattern } from "../types.js";

export const coreWebVitals: Pattern = {
  "slug": "core-web-vitals",
  "version": "1.0.0",
  "name": "Core Web Vitals",
  "tagline": "Hit LCP under 2.5 seconds, INP under 200 milliseconds, and CLS under 0.1 on real traffic.",
  "description": "The three thresholds have not moved: LCP 2.5 seconds, INP 200 milliseconds, CLS 0.1, all measured at the 75th percentile of real visits rather than in a lab run on your laptop. What changes is which mistakes cost you them, and assistants reliably make the same ones: a hero image that is lazy-loaded, a click handler that blocks the main thread for half a second, and content that jumps because nothing reserved space. This bundle covers the fixes per metric, how to measure the number that actually counts, and the review gate that keeps a fast page fast.",
  "category": "Frontend",
  "icon": "zap",
  "color": "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/15 dark:text-yellow-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Core Web Vitals pattern for AI coding agents",
  "metaDescription": "Core Web Vitals pattern for AI coding agents: fix LCP with image and font priority, keep INP under 200ms by splitting long tasks, and eliminate layout shift.",
  "problem": "AI agents lazy-load the hero image, ship blocking scripts and unbounded client bundles, run expensive work inside event handlers, and render content with no reserved space.",
  "audience": "Frontend teams whose search ranking and conversion depend on real-user performance",
  "prevents": [
    "Lazy-loading or deferring the largest above-the-fold image, delaying LCP",
    "Blocking the main thread inside a click or input handler so INP exceeds 200ms",
    "Inserting banners, ads, or late-loading fonts that push content down",
    "Chasing a Lighthouse score while field data at the 75th percentile stays red"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/src/app",
      "/"
    ],
    "stacks": [
      "web",
      "performance",
      "react",
      "nextjs",
      "seo"
    ],
    "packages": [
      "web-vitals",
      "lighthouse"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Give the LCP element priority and remove what blocks it",
      "summary": "The largest above-the-fold element loads eagerly with high priority, its origin is preconnected, fonts are preloaded, and nothing render-blocking sits in front of it.",
      "body": "LCP is a race between the browser discovering the largest element and everything else you asked it to do first. Most bad LCP is self-inflicted ordering.\n\n- Identify the LCP element (usually a hero image, sometimes a heading or video poster) and load it eagerly with a high fetch priority. Never `loading=\"lazy\"` above the fold, and never behind a client-side component that must hydrate before the image is requested.\n- Serve it at the size it renders, in a modern format, with explicit dimensions, and with a responsive `srcset`. An oversized hero is the single most common LCP regression.\n- Preconnect to the origins the critical path needs (image CDN, font host) and preload the fonts used above the fold. Self-host fonts where you can, use `font-display: swap`, and subset them.\n- Keep render-blocking work out of the head: inline the critical CSS, defer the rest, and load non-essential scripts with `defer` or after interaction. A third-party tag manager in the head delays every metric.\n- Server-render the above-the-fold content. If the first meaningful paint waits for a client fetch, LCP includes that round trip, and no image optimisation will save it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Keep the main thread free so interactions stay under 200ms",
      "summary": "Split long tasks, keep handlers cheap, ship less JavaScript, and let the browser paint feedback before doing the work.",
      "body": "INP measures the worst realistic interaction: from the input to the next paint. Anything occupying the main thread at that moment is added to the number.\n\n- Do the minimum inside the handler: update the state that renders feedback, yield to the browser, then do the expensive part. Breaking a long task into chunks (yielding with `scheduler.yield` where available, or a task boundary) turns one blocking second into responsive frames.\n- Move genuinely heavy computation off the main thread (a web worker) or to the server. Parsing a large payload, sorting thousands of rows, or running a diff in a click handler is what makes an app feel broken.\n- Ship less JavaScript: split by route, load below-the-fold and rarely used components on demand, and audit the bundle for a dependency that costs more than the feature. Hydration cost is proportional to what you sent.\n- Keep third-party scripts off the critical path and out of the interaction path. Load them after interaction or in a worker-based sandbox, and measure their main-thread time before accepting them.\n- Prefer CSS transitions and transforms over JavaScript animation, and avoid layout thrashing (reading a layout property, writing, then reading again inside a loop).",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Layout shift comes from unreserved space",
      "summary": "Every element whose size arrives late needs its space reserved up front: images, embeds, fonts, banners, and anything inserted above existing content.",
      "body": "CLS is not a mystery metric. It is the sum of content moving after the user could already see it, and each source has a mechanical fix.\n\n- Set explicit `width` and `height` (or `aspect-ratio`) on every image, video, iframe, and embed so the box exists before the resource arrives.\n- Reserve space for anything that loads late: ads, consent banners, promotional bars, dynamically injected components. Render a placeholder of the final size rather than letting the element appear and push the page down.\n- Never insert content above existing content after paint. If a notification or banner must appear, either reserve its slot in the initial render or overlay it without affecting layout.\n- Match fallback and web font metrics (size-adjust and the local fallback descriptors) so the swap does not reflow text, and preload fonts used above the fold.\n- Animate with `transform` and `opacity`, which do not trigger layout. Animating `top`, `height`, or `margin` moves everything after the element.\n\nSee /src/app for the LCP rule and / for how these are measured."
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Measure the field number, not the lab number",
      "summary": "The score that counts is real-user data at the 75th percentile per page type; Lighthouse is a diagnostic, and single-page apps need soft navigation awareness.",
      "body": "Lab and field metrics answer different questions, and optimising the wrong one is how teams stay red while their scores go green.\n\n- The thresholds are LCP 2.5s, INP 200ms, CLS 0.1, evaluated at the 75th percentile of real visits. That means a quarter of your users can be slower and you still pass, and it also means your fast laptop tells you almost nothing.\n- Collect field data continuously: the `web-vitals` library reporting to your own analytics, plus public field data for context. Segment by page template, device class, and country, because one slow template can drag a whole property.\n- Use Lighthouse and traces to diagnose a specific regression, not as the target. A lab score can improve while the field regresses (and vice versa) because the lab has no real network, no real CPU throttling, and no real interactions.\n- In a single-page app, a route change is not a document load. Instrument soft navigations so the metrics reflect what the user experienced, and remember that a slow client transition never shows up in a naive document-level measurement.\n- Treat TTFB as a diagnostic for LCP rather than a goal in itself: it explains where LCP time went (server, redirect chain, cache miss) even though it is not a Core Web Vital.\n\nSee /src for the INP rule and /src/app for the LCP rule these numbers grade."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "web-vitals-triage",
      "summary": "Diagnostic procedure for a failing metric: identify which one, find the cause, then fix in the order that pays.",
      "body": "---\nname: web-vitals-triage\ndescription: Triage procedure for a failing Core Web Vital. Start from field data, identify the metric and page template, find the specific cause, and fix in order of impact. Use when LCP, INP, or CLS is failing or has regressed.\n---\n\n# Web Vitals triage\n\n## 0. Start from the field\n1. Which metric fails, on which page template, on which device class, at the 75th percentile?\n2. Is it a regression (compare to last week) or a long-standing failure? A regression means bisecting recent deploys.\n3. Only then open a lab tool, and reproduce with CPU and network throttling matching the failing segment.\n\n## LCP failing\n- [ ] Identify the LCP element in a trace. Is it the element you expected?\n- [ ] When is it discovered? Late discovery means it is behind JavaScript, a client fetch, or a lazy attribute.\n- [ ] Break down the time: TTFB, resource load delay, resource load time, render delay. Fix the largest slice first.\n- [ ] Check size and format against rendered dimensions; check preconnect and font preload; check for render-blocking head resources.\n\n## INP failing\n- [ ] Which interaction is worst, and on which element? Field data should name it.\n- [ ] Record a performance profile of that interaction; find the long task and its script.\n- [ ] Split the handler: paint feedback first, yield, then do the work; move computation to a worker or the server.\n- [ ] Audit third-party scripts and hydration cost on that route.\n\n## CLS failing\n- [ ] Find the shifting element in a trace, with its shift score and timing.\n- [ ] Missing dimensions, late-loading embed, injected banner, or font swap? Each has its own fix.\n- [ ] Verify no animation touches layout properties.\n\n## Close the loop\n- [ ] Ship the fix, then confirm in field data (allow for the reporting window) rather than in the lab.\n- [ ] Add a budget or check so the same regression fails CI next time.\n",
      "skillTags": [
        "performance",
        "core-web-vitals",
        "debugging",
        "frontend"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "performance-budget-review",
      "summary": "Pre-merge check that a change does not spend the page's performance budget.",
      "body": "---\nname: performance-budget-review\ndescription: Pre-merge performance review for frontend changes: bundle and dependency cost, image and font handling, third-party additions, and layout stability. Run on any change that adds JavaScript, images, or third-party scripts.\n---\n\n# Performance budget review\n\n## JavaScript\n- [ ] Bundle size delta is known and justified; no dependency added for a one-line utility.\n- [ ] New code is route-split; below-the-fold and rarely used components load on demand.\n- [ ] No new synchronous work in an interaction path; long tasks are chunked.\n- [ ] No new client component doing what the server could render.\n\n## Media and fonts\n- [ ] Images have explicit dimensions, a modern format, and a correct responsive set.\n- [ ] Above-the-fold images are eager and high priority; below-the-fold are lazy.\n- [ ] No new font family or weight without measuring the cost; fonts preloaded and subset.\n\n## Third parties\n- [ ] Every added script has an owner, a purpose, and a measured main-thread cost.\n- [ ] It loads after interaction or off the critical path, and failure to load degrades gracefully.\n\n## Stability\n- [ ] Anything that loads late reserves its space.\n- [ ] Nothing is inserted above existing content after paint.\n- [ ] Animations use transform and opacity only.\n\n## Gate\n- [ ] The CI performance budget (bundle size, Lighthouse assertions) still passes.\n- [ ] For a risky change, field metrics are checked after release rather than assumed.\n",
      "skillTags": [
        "performance",
        "code-review",
        "bundle-size",
        "frontend"
      ]
    }
  ]
};
