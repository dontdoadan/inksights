# INKSIGHTS Document Design System v1.0

**Status:** DERIVED — print/PDF layout specification (not an independent brand authority)
**Scope:** Five Studio Growth Toolkit documents and subsequent INKSIGHTS PDF reports, worksheets, diagnostics, calculators and lead magnets.
**Updated:** 22 October 2026

## Authority

The live website, [CURRENT brand authority](../CURRENT.md), [brand manifest](../brand-manifest.json) and `src/styles.css` determine colours, logo assets and Poppins typography. These documents define **PDF page composition** only. Production wins if they disagree.

## Files

- [design-tokens.json](./design-tokens.json) — shared geometry, colour references and component spacing.
- [DESIGN-GUIDE.md](./DESIGN-GUIDE.md) — master page rules, layout conventions, reuse SOP, governance.
- [qa_document_layout.py](./qa_document_layout.py) — repeatable PDF geometry and AcroForm validation.

## Approved five-resource template family

| ID | Resource | Pages | Fillable inputs |
| --- | --- | ---: | ---: |
| 01 | Studio Growth Constraint Diagnostic | 7 | 27 |
| 02 | 90-Day Revenue Lift Assessment | 5 | 26 |
| 03 | Studio Revenue Scenario Calculator | 6 | 30 |
| 04 | 27-Point Revenue Leakage Audit | 7 | 42 |
| 05 | Studio Partnership Opportunity Planner | 6 | 29 |

The October 22 2026 source PDFs were checked geometrically: **31 A4 pages, 154 fields, zero detected text-field collisions or page-boundary defects**. Three narrow inner form annotations in Resource 03 are documented exceptions; they have taller visual containers. Scoring and calculation are manual.

## Use

Choose one of the six approved page templates; apply central tokens; render all pages; run PDF QA; visually inspect full page images; test field persistence and hyperlinks; publish a versioned deliverable. Do not fork a separate design template for each product.

```bash
python qa_document_layout.py /path/to/five-pdfs --strict --out qa.json
```

GitHub owns this **versioned technical specification**. Google Drive `INKSIGHTS/11 Templates` owns approved reusable business PDF files; log durable business assets in the INKSIGHTS Master File Register. Do not merge this branch to main without approval under repository governance.
