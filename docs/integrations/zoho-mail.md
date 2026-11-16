# INKSIGHTS — Zoho Mail + Supabase (isolated)

## Deployment
- Existing production Supabase project: `ukaxsqwnkoqbbsufpzga` (London, `eu-west-2`).
- Edge Function: `inksights-zoho-mail`; deployed as version 1, with `verify_jwt=true`.
- Existing admin identity source: `public.platform_admins` (`active=true`).
- Sender: `daniel@getinksights.co.uk`; Zoho EU endpoints `https://mail.zoho.eu` and `https://accounts.zoho.eu`.
- Scoped Zoho mailbox account ID (non-secret): `410903000000002002`.
- Tables created: `inksights_mail_outbox`, `inksights_mail_inbox`, `inksights_mail_suppressions`, `inksights_mail_events`, `inksights_mail_sync_state`.
- No second database or CRM; optional `studio_id` FK and `hubspot_contact_id` preserve existing entities.

## User-only OAuth setup (required before any live Zoho test)
1. Sign into the EU Zoho API Console at https://api-console.zoho.eu/ with the INKSIGHTS Zoho account.
2. Register a **Self Client** for this single owned mailbox, or a server-based OAuth application. Generate a refresh token covering `ZohoMail.accounts.READ`, `ZohoMail.folders.READ`, `ZohoMail.messages.READ` and `ZohoMail.messages.CREATE`. Follow https://www.zoho.com/mail/help/api/using-oauth-2.html.
3. Configure Supabase Edge Function secrets through the Supabase Dashboard > project > Edge Functions > Secrets: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`. **Never paste credentials into source code, GitHub, user chat or public browser code.** These credentials cannot be reused from the Make connection.
4. Keep `ZOHO_EXTERNAL_SEND_ENABLED` unset / `false` until an internal end-to-end test has passed and outreach is approved. Sending will otherwise refuse any non-test recipient.

## Admin API contract
`POST https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/inksights-zoho-mail` with `Authorization: Bearer <Supabase authenticated active platform-admin user JWT>` and JSON `Content-Type`. A publishable key alone is not an admin token.

- `{"action":"health"}` — status and credential readiness (no secret values).
- `{"action":"create","recipient":"daniel@getinksights.co.uk","subject":"INKSIGHTS mail QA","body":"Internal verification only.","is_test":true}` — creates a **database outbox row only**, not a Zoho draft or send.
- `{"action":"draft","id":"<UUID>"}` — creates a real Zoho draft (does **not** send).
- `{"action":"approve","id":"<UUID>","recipient":"daniel@getinksights.co.uk","subject":"INKSIGHTS mail QA","body":"Internal verification only.","confirmation":"I_APPROVE_THIS_EXACT_EMAIL","suppression_clear":true}` — binds exact recipient/subject/body to the approving admin; live prospects additionally require `eligibility:verified_corporate|consent_verified` and at least 12 characters of `eligibility_evidence`.
- `{"action":"send","id":"<UUID>","confirmation":"SEND_THIS_APPROVED_MESSAGE"}` — sends the single approved record. Only `is_test:true` to the INKSIGHTS sender is allowed until external sending explicitly enabled; no automatic retry for uncertain delivery.
- `{"action":"poll"}` — checks recent Zoho Inbox mail, associates sender to prior sent outreach where possible, imports metadata/preview (not full email body). **First call only sets a starting baseline** and never backfills old mail; call it before a self-send test.
- `{"action":"list","box":"outbox"}`, `{"action":"list","box":"inbox"}` — latest 50.
- `{"action":"suppress","email":"address@studio.co.uk","reason":"opt_out","confirmation":"SUPPRESS_THIS_ADDRESS"}` — persists opt-out and blocks later sends.

## Safety
- All five new tables have RLS enabled and no `anon` or `authenticated` privileges/policies; Edge Function is the only authorised user-facing gateway.
- The send state has a once-only optimistic claim and its approval is SHA-256 bound to the original exact email; `unknown` is terminal until manual reconciliation.
- No unsolicited bulk sending, no bypass of suppressions, no auto-HubSpot mutations.
- No cron is active: recurring inbox polls require a separately authenticated Supabase Cron/pg_net configuration after OAuth test and a secured scheduled-job identity. Do not create public unauthenticated poll endpoints.
- Zoho Mail Free-tier API functionality is **not yet confirmed** on this mailbox; first successful OAuth API call proves this.

## Acceptance testing (pending OAuth secrets)
1. `health` reports `zoho_credentials_configured:true` with active admin JWT.
2. Run `poll` once to initialise the inbox cursor before self-send.
3. Create internal `is_test:true` record → actual Zoho draft → confirm draft in Zoho Drafts and event in DB.
4. Approve exact message using active platform-admin user and `suppression_clear:true` → send explicitly to `daniel@getinksights.co.uk` → verify Zoho Sent and Inbox.
5. Poll again → validate inbox correlation, unique message ID and no historical imports.
6. Validate suppression blocks, second send returns refusal, external studio address blocked until explicit flag and eligibility.
7. Add a secure scheduled trigger and verify successful runs before calling reply-monitoring automated.
