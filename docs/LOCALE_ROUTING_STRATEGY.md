# Locale Routing Strategy

Last updated: 2026-05-11

The product already supports Russian, Estonian, and English in the client
shell. It does not yet have separate localized routes.

## Current truth

Today the public site is one multilingual URL surface:

- `/`
- `/verify`

Language is selected client-side from:

1. saved user preference
2. browser language
3. English fallback

## Why this matters

Search metadata must describe reality.

If multiple `hreflang` alternates point to the same URL without true localized
routes, we imply a route structure that does not exist. That is avoidable SEO
ambiguity.

## Current rule

Until route-localized pages exist:

- keep canonical URLs only
- do not publish per-language alternates for the same URL
- keep the shell multilingual in-app
- keep Open Graph metadata accurate but conservative

## Future upgrade path

When the team is ready for route-localized pages, the target should be:

- `/en`
- `/et`
- `/ru`
- localized equivalents for high-intent routes such as `/verify`

Only then should the site publish real `hreflang` alternates and route-specific
metadata.

## Definition of done for the future route-localization phase

- each locale has a stable canonical route
- metadata, sitemap, and internal links follow those routes
- server-rendered shell text is locale-aware
- analytics can distinguish locale route usage
- docs and operators treat locale routing as part of release validation
