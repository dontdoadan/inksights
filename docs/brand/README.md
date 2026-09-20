# INKSIGHTS Brand System — technical implementation

This directory documents how the canonical INKSIGHTS Brand System is consumed by the production repository.

## Authority

The human-readable business authority lives in Google Drive:

`INKSIGHTS / 06 Marketing & Brand / Brand System / 01 Canonical / INKSIGHTS — Brand System — ACTIVE`

Detailed visual specification:

`INKSIGHTS / 06 Marketing & Brand / Brand System / 01 Canonical / INKSIGHTS — Visual Identity Master — ACTIVE — v1.0`

Google Drive owns positioning, verbal identity, visual identity, application rules, brand governance and approved business assets. The Brand System is the written authority; the Visual Identity Master is its subordinate detailed visual specification. GitHub owns the technical implementation of those rules.

Do not create a competing brand authority in the repository. This document is an implementation handoff, not a second brand manual.

## Active repository surfaces

- `src/styles.css` — CSS/Tailwind-facing colour, typography, spacing and radius tokens plus existing compatibility aliases.
- `src/lib/brand-tokens.ts` — machine-readable constants for product code, automation and validation.
- `src/routes/__root.tsx` — loads Poppins and Inter for the web application.
- `AGENTS.md` — tells Codex/engineering agents which brand authority to use and which rules require approval.

## Core identity

- Descriptor: **Growth Intelligence for UK Tattoo Studios**
- Primary brand line: **Clearer data. Smarter decisions. Stronger studios.**
- Deep Navy: `#0B1F3B`
- Signal Mint: `#2ED3A6`
- Clean White: `#F8FAFC`
- Cool Grey: `#CBD5E1`
- Ink Black: `#0F172A`
- Display typography: **Poppins**
- Body/UI typography: **Inter**

Signal Mint is a signal/action colour. It must not be used as small text on white because the contrast is insufficient.

## Evidence language

These labels are semantic contracts, not decoration:

- `VERIFIED`
- `OBSERVED`
- `CALCULATED`
- `MODELLED`
- `HYPOTHESIS`

Do not rename or reinterpret them locally.

## Logo status

The final INKSIGHTS logo symbol is **not yet canonical**. The current approved identity is a text-only uppercase INKSIGHTS wordmark in the bold rounded typography system. The rising-signal/three-bar motif may be used as supporting graphic language and as an interim favicon/icon treatment, but is not the approved final logo mark.

Do not restore legacy feather, pen, tattoo-machine or ink-drop marks and do not invent a public-facing mark without explicit approval.

## Change control

A repository implementation change may refine components while preserving the system. Changes to positioning, core palette, typography families, evidence taxonomy or logo status are material brand changes and require deliberate founder approval plus an update to the canonical Drive authority.

## Verification expectation

Brand changes should be made on a feature branch, built and visually checked in a protected preview, then merged through the normal PR workflow. Production security and deployment protections must not be weakened for branding work.


## Pack assets

The Brand Asset Pack v1 has been mirrored into the repository for product/web consumption where appropriate:

- `public/brand/wordmark-primary.svg` — transparent Deep Navy + Signal Mint interim wordmark for light surfaces.
- `public/brand/wordmark-reverse.svg` — transparent White + Signal Mint interim wordmark for dark surfaces.
- `public/brand/signal-motif.svg` — supporting rising-signal motif only; it is not the approved final logo mark.

The complete production pack (including Canva-importable social, report and presentation masters) remains governed in Google Drive under `06 Marketing & Brand / Brand System`. GitHub should only carry assets required by the product or technical workflows, not duplicate the whole Drive library.
