# INKSIGHTS controlled production proof — 14 September 2026

Purpose: prove the existing production machine without rebuilding it.

Canonical stack under test:

`dontdoadan/inksights` → `main` → Vercel `inksight-main` → `getinksights.co.uk` → Supabase `ukaxsqwnkoqbbsufpzga` → visibility intelligence pipeline → evidence-graded report.

Controlled studio: Moth & Flame Tattoo (`https://www.mothandflametattoo.com/`).

Current production evidence:

- Canonical source parity/security repair merged via PR #23.
- Evidence-safe search/report parity merged via PR #30.
- PR #30 and the resulting `main` push passed the repaired CI gate.
- Canonical Supabase project contains Moth & Flame report run `16aaef31-1f6f-498c-8929-68749d65dcf1` in `qa`.
- The run contains 7 SSU rows, 18 provider-specific web observations, 5 competitor-domain observations and 1 observed studio-domain appearance.
- Absolute monthly demand is not measured, Google rankings are not claimed, LSOS is not scored, and commercial/revenue opportunity is not calculated.
- Human QA is complete.
- The public report RPC was transactionally verified to return the expected evidence payload without leaking contact email or public-token material.
- Vercel was still serving production deployment `dpl_4AEwfDUJ785hz3iayQozDgZ6TVUS` from SHA `2e37d71cd17b6859857ac06cdf2ba24e6fb78925` after the two merge commits. This documentation-only direct push is an explicit diagnostic of the Git → Vercel deployment trigger boundary.

Publication remains gated until the canonical Vercel deployment is confirmed on the repaired `main` source and the public report rendering is verified.

This file records evidence only. It does not declare the production-integrity gate passed.
