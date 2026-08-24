# Support production release — 1 August 2026

Purpose: validate the current INKCARE public-site source before publishing the customer-support route to production.

Release checks:

- `/support` route exists and uses the canonical URL `https://getinkcare.co.uk/support`.
- Customer support content covers existing-client support, billing and cancellations, technical issues, privacy/data requests and current service rules.
- `/support` is included in the generated sitemap and public navigation/footer source.
- The canonical £249 Visibility Fix checkout is the terms-acceptance-enabled Payment Link.
- No production deployment is considered complete until `https://getinkcare.co.uk/support` is live-smoke-tested after publish.

This file is release evidence only and does not change runtime behaviour.
