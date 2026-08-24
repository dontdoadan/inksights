# Applied social automation migration

The migration `create_social_automation_replacement` was applied to the INKCARE Supabase project on 25 July 2026.

It creates and secures:

- `public.campaign_library`
- `public.social_content_queue`
- `public.publication_log`
- `public.social_automation_settings`
- `public.claim_social_content_queue(text, integer)`

All four tables have row-level security enabled and are restricted to `service_role`. The queue-claim function refuses live claims while `social_automation_settings.dry_run` is true or the migration phase is not explicitly authorised.

The exact applied SQL is stored as a gzip-compressed Base64 snapshot:

```bash
base64 --decode 20260725213000_create_social_automation_replacement.sql.gz.b64 \
  | gzip --decompress \
  > 20260725213000_create_social_automation_replacement.sql
```

The live project currently remains in `parallel_dry_run` with n8n enabled. This is intentional until a controlled post records both an Instagram post ID and a Facebook post ID.
