> [!WARNING]
> **SUPERSEDED AS AN AUTHORITY.** This file is retained for lineage. The current brand authority is [CURRENT.md](./CURRENT.md), and the production website/implementation wins if this document conflicts with production.

# INKSIGHTS Brand System v2.0 — website implementation

Authority: Daniel's supplied brand-board.png, logo-wordmark.png and logo-3-bars.png, recovered from the “Update Website Branding” conversation on 22 September 2026.

## Visual contract

- Primary teal #00E5D1; deep teal #00B3A6; navy #0A0F14; slate #1F2937; cool grey #94A3B8; light #F8FAFC.
- Poppins 400/500/600/700, hosted locally with the SIL Open Font License. Use bold headings and responsive sizing; normal body text starts at 16px.
- Use the supplied horizontal wordmark through the shared Logo component. Its whitespace is trimmed and it is encoded as WebP; artwork is otherwise unchanged. Use the supplied three-bar mark as the decorative signature. The favicon is a simplified three-bar derivative for tiny sizes.
- Alternate dark hero/signature surfaces with spacious white editorial content, tools and forms, following Daniel's supplied intelligence-snapshot-studio-report-template.png. On white, teal text uses #00665F for contrast; primary buttons retain #00E5D1 with navy text. Use restrained teal gradients, fine borders and dot-grid accents. Lucide icons remain in use.
- Visible keyboard focus, reduced-motion support and text contrast take precedence over decorative treatments. Content must be readable before animation scripts run.
- Status badges always include text. Never imply an example is a real measurement. The homepage's static revenue diagram is labelled MODEL. At Daniel's request, the map section is withheld until its design is polished; its component is retained for future work.
- Board examples (78/100, +32%, confidence scores) are illustrative and must not become customer claims. No new studio photos have been introduced; the board is a photography reference, not evidence of a customer relationship.

## Scope and preserved systems

Based on production commit 496328873ec5495e78efbdd748fa4c032a618af5, deployment dpl_AqJjZgLa79PEPW525SQN4tmzjsMA. Vercel project inksight-main / prj_eiuxaOEwD3imsDxsnWnmofP9RAZ7, source dontdoadan/inksights.

Shared styling updates the public website, tools and authenticated surfaces. Shared logos cover public header/footer, sign-in, dashboard and workspace. Public copy, route destinations, offer definitions, API routes, Supabase configuration, authentication handlers, cookie-consent behaviour, analytics and Stripe/payment logic are retained. Dependencies and lockfile are retained.

## Release gate

Build, existing tests, browser interaction checks, responsive inspection, automated accessibility and performance checks must be recorded before a production decision. Authenticated customer actions and real payments are not simulated with live customer data. Keep the previous production deployment as the rollback target. Respect the repository's immediately-before-production approval requirement.
