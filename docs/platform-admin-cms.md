# Platform administration and CMS v1

## Purpose

The platform CMS provides an authenticated INKSIGHTS control plane for maintaining public content without coupling routine editorial work to application code changes.

## Canonical data

Supabase remains the source of truth.

- `platform_admins`: platform roles (`owner`, `admin`, `editor`)
- `cms_pages`: page and landing-page records
- `cms_articles`: editorial/resource content
- `cms_navigation`: header/footer/utility navigation records
- `cms_faqs`: reusable FAQ records
- `cms_site_settings`: structured site-level configuration

## Security model

All tables use RLS.

- Anonymous visitors can read only published/visible/public records.
- Authenticated users receive no write access unless their `auth.uid()` is active in `platform_admins`.
- Platform role checks execute through `private.is_platform_admin(...)`, which is outside the exposed public schema.
- The current single authenticated account is bootstrapped as `owner`; future administrators must be explicitly added.

## Application surface

The existing authenticated dashboard contains the CMS panel. This avoids introducing a second authentication system or a duplicate admin application.

## Publishing rule

Database publication and frontend consumption are separate concerns.

A record with `status = 'published'` is eligible for public read access. A public route must still be wired to consume that CMS record before it replaces hard-coded copy. Migration of existing hard-coded page content should therefore happen incrementally, page by page, with fallback copy retained until each route is verified.

## Change workflow

1. Edit content in the authenticated CMS.
2. Keep work in `draft` until reviewed.
3. Publish the record.
4. Verify the public route consumes the record and renders correctly.
5. Use code changes only for layout, component behavior, schemas, or new content capabilities.
