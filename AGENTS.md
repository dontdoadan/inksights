<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## INKSIGHTS information architecture — core rule

Treat the Google Drive folder `01 INKSIGHTS` as the canonical business-asset workspace for INKSIGHTS. Keep it clean, predictable, and separated from Daniel Hughes Tattoos, INKCARE, and unrelated projects.

### Canonical top-level structure

```text
01 INKSIGHTS/
├── 00 - Control Centre
├── 01 - Strategy & Commercial Model
├── 02 - Product & Methodology
├── 03 - Research & Market Intelligence
├── 04 - Sales & CRM
├── 05 - Data & Intelligence
├── 06 - Brand & Marketing
├── 07 - Client Delivery
├── 08 - Case Studies & Proof
├── 09 - Templates & Playbooks
└── 90 - Archive
```

Do not create additional top-level folders casually. Extend the appropriate functional area with a clearly named subfolder instead. A new top-level category requires a deliberate architecture decision.

### Storage rules

1. **No loose INKSIGHTS assets.** New business assets must be stored in the correct canonical folder when they are created or imported.
2. **Separate by function, not file type alone.** Strategy belongs in Strategy, prospect data in Sales & CRM, product IP in Product & Methodology, operational datasets in Data & Intelligence, brand assets in Brand & Marketing, and client-specific delivery material in Client Delivery.
3. **Keep research separate from canonical IP.** External/Perplexity/source research belongs in `03 - Research & Market Intelligence`; validated product definitions, schemas, constraint logic, KPI definitions, and methodologies belong in `02 - Product & Methodology`.
4. **Preserve machine contracts.** Do not rename machine-readable files if code, imports, automations, schemas, or integrations may reference the filename. Prefer stable `snake_case_vN.ext` names for these assets.
5. **Human-facing naming convention.** Prefer `INKSIGHTS - Subject - Descriptor.ext` for reports, plans, guides, briefs, and other human-readable assets. Use ISO dates (`YYYY-MM-DD`) when a date materially identifies the version or event.
6. **Folder naming convention.** Use numbered functional folders such as `02 - Product & Methodology` and numbered subfolders where ordering matters.
7. **Archive instead of destructive cleanup.** When an item is stale, duplicated, superseded, or its deletion is uncertain, move it to `90 - Archive` and label it clearly. Known duplicates belong in `90 - Archive/01 - Duplicates` unless there is a documented reason to delete them.
8. **One canonical copy.** Avoid keeping multiple active copies of the same schema, methodology, report, or dataset. Identify one canonical copy and archive the others.
9. **Do not mix brands.** INKSIGHTS storage must not contain Daniel Hughes Tattoos, INKCARE, or other business assets unless an INKSIGHTS document explicitly references them as external evidence or case-study material.
10. **Repository vs Drive boundary.** GitHub is canonical for source code, migrations, version-controlled technical specifications, tests, and engineering documentation. Google Drive is canonical for business documents, research, commercial assets, brand material, client-delivery assets, and working datasets unless the asset must be version-controlled for the product to function.
11. **Preserve links and IDs where possible.** Prefer moving/renaming existing Drive items over recreating them so sharing, references, and file IDs remain intact.
12. **Clean as you go.** Any workflow that creates or imports an INKSIGHTS asset is responsible for placing and naming it correctly before the task is considered complete.

This structure is a standing operating constraint. Future agents, scripts, automations, and manual workflows should follow it by default rather than inventing a new filing system.
